import { auth } from "@clerk/nextjs/server";
import {
  buildCoffeeChatPrompt,
  parseCoffeeChat,
  COFFEE_GOALS,
  type Lang,
  type Gender,
  type CoffeeChatResult,
} from "@/lib/coffee-chat";
import { checkAndIncrement, MAX_GEN } from "@/lib/ratelimit";

const GEMINI_MODEL = "gemini-2.5-flash";
const KIMI_MODEL = process.env.KIMI_MODEL || "kimi-k2.5";

interface Body {
  goalId: string;
  contactName?: string;
  contactRole?: string;
  contactGender?: Gender;
  writerGender?: Gender;
  userContext: string;
  lang: Lang;
}

interface GenResult {
  result: CoffeeChatResult | null;
  overloaded: boolean;
  detail: string;
}

// Primary provider: Google Gemini. Retries 503/429 (transient overload) with backoff.
async function generateWithGemini(prompt: string, key: string): Promise<GenResult> {
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.8,
      responseMimeType: "application/json",
      // gemini-2.5-flash is a thinking model; thinking tokens eat the output budget.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  let r: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: requestBody }
    );
    if (r.ok || (r.status !== 503 && r.status !== 429)) break;
    if (attempt < 2) await new Promise((res) => setTimeout(res, 900 * (attempt + 1)));
  }
  if (!r || !r.ok) {
    const t = r ? await r.text() : "";
    return {
      result: null,
      overloaded: r?.status === 503 || r?.status === 429,
      detail: `gemini ${r?.status}: ${t.slice(0, 120)}`,
    };
  }
  const d = await r.json();
  const parts: Array<{ text?: string }> = d?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p?.text || "").join("").trim();
  return { result: parseCoffeeChat(text), overloaded: false, detail: text ? "" : "gemini empty" };
}

// Fallback provider: Moonshot Kimi (OpenAI-compatible). Used when Gemini is
// overloaded or unparseable, and only if KIMI_API_KEY is configured.
async function generateWithKimi(prompt: string, key: string): Promise<GenResult> {
  const r = await fetch("https://api.moonshot.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [{ role: "user", content: prompt }],
      // kimi-k2.5 / k2.6 only accept temperature 1.
      temperature: 1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    return {
      result: null,
      overloaded: r.status === 503 || r.status === 429,
      detail: `kimi ${r.status}: ${t.slice(0, 120)}`,
    };
  }
  const d = await r.json();
  const text: string = d?.choices?.[0]?.message?.content || "";
  return { result: parseCoffeeChat(text), overloaded: false, detail: text ? "" : "kimi empty" };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (!body?.goalId || !COFFEE_GOALS[body.goalId] || !body?.userContext?.trim()) {
    return Response.json({ error: "missing fields" }, { status: 400 });
  }

  const lang: Lang = body.lang === "אנגלית" ? "אנגלית" : "עברית";
  const contactGender: Gender = body.contactGender === "נקבה" ? "נקבה" : "זכר";
  const writerGender: Gender = body.writerGender === "זכר" ? "זכר" : "נקבה";

  const prompt = buildCoffeeChatPrompt({
    goalId: body.goalId,
    contactName: body.contactName || "",
    contactRole: body.contactRole || "",
    contactGender,
    writerGender,
    userContext: body.userContext,
    lang,
  });

  const today = new Date().toISOString().slice(0, 10);
  // Namespaced so this tool doesn't eat the other generators' daily 3.
  const { allowed, count } = checkAndIncrement(`coffee:${userId}`, today);

  // 3+prompt mechanic: once the daily cap is hit, hand the prompt over instead of generating.
  if (!allowed) {
    return Response.json({ handoff: true, prompt, count });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const kimiKey = process.env.KIMI_API_KEY;
  if (!geminiKey && !kimiKey) {
    return Response.json({ error: "missing GEMINI_API_KEY / KIMI_API_KEY on server" }, { status: 500 });
  }

  try {
    let result: CoffeeChatResult | null = null;
    let overloaded = false;
    let detail = "";

    // 1) Primary: Gemini.
    if (geminiKey) {
      const res = await generateWithGemini(prompt, geminiKey);
      result = res.result;
      overloaded = res.overloaded;
      detail = res.detail;
    }

    // 2) Fallback: Kimi, when Gemini produced nothing (overload / unparseable) and a key exists.
    if (!result && kimiKey) {
      const res = await generateWithKimi(prompt, kimiKey);
      if (res.result) {
        result = res.result;
        overloaded = false;
        detail = "";
      } else {
        detail = detail || res.detail;
        overloaded = overloaded || res.overloaded;
      }
    }

    if (!result) {
      const msg = overloaded
        ? "המודלים עמוסים כרגע (עומס זמני). נסו שוב בעוד רגע."
        : "לא הצלחנו לייצר את ההכנה, נסו שוב.";
      return Response.json({ error: msg, detail }, { status: 502 });
    }

    // Include the prompt on the last free attempt so the UI can offer the handoff next.
    return Response.json({
      result,
      count,
      remaining: MAX_GEN - count,
      lastFree: count >= MAX_GEN,
      prompt: count >= MAX_GEN ? prompt : undefined,
    });
  } catch (e) {
    return Response.json({ error: String((e as Error)?.message || e) }, { status: 500 });
  }
}
