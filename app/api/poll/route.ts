import { auth } from "@clerk/nextjs/server";
import {
  buildPollPrompt,
  parsePolls,
  POLL_CATEGORIES,
  type Lang,
  type Tone,
  type Poll,
} from "@/lib/polls";
import { checkAndIncrement, MAX_GEN } from "@/lib/ratelimit";

const GEMINI_MODEL = "gemini-2.5-flash";
const KIMI_MODEL = process.env.KIMI_MODEL || "kimi-k2.5";
const TONES: Tone[] = ["ציני", "חם", "פרובוקטיבי"];

interface Body {
  category: string;
  tone: Tone;
  topic?: string;
  niche?: string;
  audience?: string;
  lang: Lang;
}

interface GenResult {
  polls: Poll[];
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
    return { polls: [], overloaded: r?.status === 503 || r?.status === 429, detail: `gemini ${r?.status}: ${t.slice(0, 120)}` };
  }
  const d = await r.json();
  const parts: Array<{ text?: string }> = d?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p?.text || "").join("").trim();
  return { polls: parsePolls(text), overloaded: false, detail: text ? "" : "gemini empty" };
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
    return { polls: [], overloaded: r.status === 503 || r.status === 429, detail: `kimi ${r.status}: ${t.slice(0, 120)}` };
  }
  const d = await r.json();
  const text: string = d?.choices?.[0]?.message?.content || "";
  return { polls: parsePolls(text), overloaded: false, detail: text ? "" : "kimi empty" };
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
  if (!body?.category || !POLL_CATEGORIES[body.category]) {
    return Response.json({ error: "missing fields" }, { status: 400 });
  }

  const tone: Tone = TONES.includes(body.tone) ? body.tone : "חם";
  const lang: Lang = body.lang === "אנגלית" ? "אנגלית" : "עברית";
  const prompt = buildPollPrompt(
    body.category,
    tone,
    body.topic || "",
    body.niche || "",
    body.audience || "",
    lang
  );

  const today = new Date().toISOString().slice(0, 10);
  const { allowed, count } = checkAndIncrement(userId, today);

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
    let polls: Poll[] = [];
    let overloaded = false;
    let detail = "";

    // 1) Primary: Gemini.
    if (geminiKey) {
      const res = await generateWithGemini(prompt, geminiKey);
      polls = res.polls;
      overloaded = res.overloaded;
      detail = res.detail;
    }

    // 2) Fallback: Kimi, when Gemini produced nothing (overload / unparseable) and a key exists.
    if (!polls.length && kimiKey) {
      const res = await generateWithKimi(prompt, kimiKey);
      if (res.polls.length) {
        polls = res.polls;
        overloaded = false;
        detail = "";
      } else {
        detail = detail || res.detail;
        overloaded = overloaded || res.overloaded;
      }
    }

    if (!polls.length) {
      const msg = overloaded
        ? "המודלים עמוסים כרגע (עומס זמני). נסי שוב בעוד רגע."
        : "לא הצלחנו לייצר סקרים, נסי שוב.";
      return Response.json({ error: msg, detail }, { status: 502 });
    }

    // Include the prompt on the last free attempt so the UI can offer the handoff next.
    return Response.json({
      polls,
      count,
      remaining: MAX_GEN - count,
      lastFree: count >= MAX_GEN,
      prompt: count >= MAX_GEN ? prompt : undefined,
    });
  } catch (e) {
    return Response.json({ error: String((e as Error)?.message || e) }, { status: 500 });
  }
}
