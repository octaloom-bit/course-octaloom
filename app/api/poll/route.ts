import { auth } from "@clerk/nextjs/server";
import {
  buildPollPrompt,
  parsePolls,
  POLL_CATEGORIES,
  type Lang,
  type Tone,
} from "@/lib/polls";
import { checkAndIncrement, MAX_GEN } from "@/lib/ratelimit";

const MODEL = "gemini-2.5-flash";
const TONES: Tone[] = ["צינית", "חמה", "פרובוקטיבית"];

interface Body {
  category: string;
  tone: Tone;
  niche?: string;
  audience?: string;
  lang: Lang;
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

  const tone: Tone = TONES.includes(body.tone) ? body.tone : "חמה";
  const lang: Lang = body.lang === "אנגלית" ? "אנגלית" : "עברית";
  const prompt = buildPollPrompt(
    body.category,
    tone,
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

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({ error: "missing GEMINI_API_KEY on server" }, { status: 500 });
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.8 },
        }),
      }
    );
    if (!r.ok) {
      const t = await r.text();
      return Response.json({ error: `gemini ${r.status}: ${t.slice(0, 150)}` }, { status: 502 });
    }
    const d = await r.json();
    const text: string = d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
      return Response.json({ error: "תשובה ריקה מ-Gemini" }, { status: 502 });
    }
    const polls = parsePolls(text);
    if (!polls.length) {
      return Response.json({ error: "לא הצלחנו לפענח את התשובה, נסי שוב" }, { status: 502 });
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
