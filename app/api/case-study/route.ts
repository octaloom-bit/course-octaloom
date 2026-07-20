import { auth } from "@clerk/nextjs/server";
import { buildCaseStudyPrompt, parsePosts, type PostLang } from "@/lib/case-study-gen";
import { checkAndIncrement, MAX_GEN } from "@/lib/ratelimit";
import { recordTool } from "@/lib/progress-server";

const MODEL = "gemini-2.5-flash";

interface Body {
  answers: Record<string, string>;
  lang: PostLang;
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
  if (!body?.answers) {
    return Response.json({ error: "missing fields" }, { status: 400 });
  }

  const prompt = buildCaseStudyPrompt({ answers: body.answers, lang: body.lang });
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
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
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
    const posts = parsePosts(text);
    recordTool({ id: userId, email: "" }, "case-study", "use").catch(() => {});
    return Response.json({
      posts,
      count,
      remaining: MAX_GEN - count,
      lastFree: count >= MAX_GEN,
      prompt: count >= MAX_GEN ? prompt : undefined,
    });
  } catch (e) {
    return Response.json({ error: String((e as Error)?.message || e) }, { status: 500 });
  }
}
