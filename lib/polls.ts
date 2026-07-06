// 8 poll categories mapped to course concepts + prompt builder + JSON parser.
// Shared by the client UI (category grid) and the server API route (prompt + parsing).
// Mirrors lib/formulas.ts, but the output is structured JSON (question + options +
// opener + "why it works"), so we parse JSON like the carousel tool instead of a list.

export type Lang = "עברית" | "אנגלית";
export type Tone = "צינית" | "חמה" | "פרובוקטיבית";

export interface PollCategory {
  name: string;
  chapter: string; // e.g. "פרק 3" — grounds the "למה זה עובד" line
  angle: string; // the structural angle Gemini should apply
  icon: string;
  tag: string; // short label shown on the card
}

export interface Poll {
  question: string;
  options: string[];
  opener: string;
  why: string;
}

// Order matters: this is the display order of the category grid.
export const POLL_CATEGORIES: Record<string, PollCategory> = {
  uncommon: {
    name: "דעה לא פופולרית",
    chapter: "פרק 3",
    angle:
      "Uncommon Opinion. פתחי במתח: אמירה שכולם חושבים אבל אף אחת לא מעלה בפוסט. האופציות מייצגות עמדות שונות באמת, בלי תשובה 'נכונה' מובנת מאליה.",
    icon: "🔥",
    tag: "מתח יוצר engagement",
  },
  aireality: {
    name: "AI בשטח: מה עובד מול ההייפ",
    chapter: "פרק 3",
    angle:
      "Strategic Arbitrage. טרנד או כלי AI מול מה שקורה בפועל בשטח. האופציות מפרקות את הפער בין ההבטחה למציאות היומיומית.",
    icon: "🤖",
    tag: "ההייפ מול המציאות",
  },
  thisorthat: {
    name: "הבחירה של המקצוענית",
    chapter: "פרק 4",
    angle:
      "This-or-that. trade-off אמיתי בין כלים או שיטות, בלי אופציה נוחה. כל בחירה דורשת הגנה, וזה מזין שיחת DM.",
    icon: "⚖️",
    tag: "trade-off שמזין DM",
  },
  mistake: {
    name: "הטעות שכולן עושות בניש שלך",
    chapter: "פרק 5",
    angle:
      "Confession poll. הטעות הנפוצה בניש, בניסוח שמאפשר לקורא להתוודות בשקט דרך ההצבעה. רלוונטי, לא שיפוטי.",
    icon: "💥",
    tag: "וידוי מתוך ה-Identity Audit",
  },
  icp: {
    name: "שאלת ICP ממוקדת",
    chapter: "פרק 4",
    angle:
      "כאב ספציפי של הלקוחה המשלמת (ICP). השאלה מסננת בדיוק את מי שיכולה להפוך ללקוחה, ובונה רשימה חמה ל-social selling.",
    icon: "🎯",
    tag: "בסיס ל-social selling",
  },
  leadmagnet: {
    name: "גשר ל-lead magnet",
    chapter: "פרק 4",
    angle:
      "Poll שמחמם קרקע לפוסט lead magnet של אותו שבוע. השאלה חושפת את נקודת התקיעות שה-lead magnet פותר.",
    icon: "🧲",
    tag: "מחמם את פוסט ה-lead magnet",
  },
  howi: {
    name: "מאחורי הקלעים של התהליך שלך",
    chapter: "פרק 3",
    angle:
      "how-I (experiential authority), לא how-to. שאלה על איך את עובדת בפועל, שמזמינה את הקהל להשוות לתהליך שלו.",
    icon: "🛠️",
    tag: "אוטוריטה מהניסיון",
  },
  trend: {
    name: "טרנד בניש שלך",
    chapter: "פרק 3",
    angle:
      "Is-X-dead / prediction. 'האם X מת ב-2026?' או 'מה ינצח?'. פרובוקציה + סימון שאת יודעת לאן הדברים הולכים.",
    icon: "📈",
    tag: "פרובוקציה + insider",
  },
};

const TONE_HINT: Record<Tone, string> = {
  צינית: "טון ציני ויבש, עם חוש הומור. אמת שכולן מכירות ואף אחת לא אומרת.",
  חמה: "טון חם ואנושי, בגובה העיניים, מזמין שיתוף אישי בתגובות.",
  פרובוקטיבית: "טון פרובוקטיבי שמכריח לבחור צד. בלי rage-bait זול, מתח אמיתי.",
};

// Full standalone prompt (used both to call Gemini and, after the 3rd use, as the
// handoff prompt the user pastes into her own ChatGPT/Claude/Gemini).
export function buildPollPrompt(
  categoryKey: string,
  tone: Tone,
  niche: string,
  audience: string,
  lang: Lang
): string {
  const c = POLL_CATEGORIES[categoryKey];
  const nicheLine = niche.trim() ? `הניש/התחום של המשתמשת: ${niche.trim()}` : "הניש לא צוין. הישארי כללית ורלוונטית לקהל B2B / נשות AI / יוצרות תוכן.";
  const audienceLine = audience.trim()
    ? `קהל היעד של הפוסט (ICP — הלקוחה האידיאלית שמשלמת, לא כלל העוקבים): ${audience.trim()}`
    : "קהל היעד לא צוין. כווני לאשת מקצוע B2B ישראלית שבונה נוכחות בלינקדאין.";

  const langRules =
    lang === "אנגלית"
      ? "- כתבי את כל הפולסים באנגלית תקנית וטבעית של לינקדאין."
      : `כללי עברית (קריטי — Gemini נוטה לעברית מתורגמת, הקפידי מאוד):
- חשבי בעברית. עברית ישראלית מדוברת של לינקדאין, לא תרגום מאנגלית.
- פנייה בלשון נקבה יחיד לאורך כל הטקסט.
- אסור מקף ארוך (— או –). השתמשי בפסיק, נקודה, או מקף קצר.
- אל תכתבי "זה לא X, אלא Y" ואל תפתחי משפט בשלילה. נסחי בחיוב, ישר לעניין.
- שלבי מונחי אנגלית טבעיים במידה (lead magnet, DM, ICP, reach, engagement), בלי להגזים.
- בלי באזוורדים שיווקיים ובלי קלישאות לינקדאין.`;

  return `את מומחית לפולסים בלינקדאין שמייצרים דיון ולידים. את בונה 3 רעיונות פולס מצוינים, שונים באמת זה מזה.

הקטגוריה: "${c.name}" (${c.chapter}).
הזווית של הקטגוריה: ${c.angle}
הטון המבוקש: ${tone}. ${TONE_HINT[tone]}
${nicheLine}
${audienceLine}
שפת הפולסים: ${lang}

חוקי פולס (קריטי, אכפי על כל אחד מ-3 הרעיונות):
- שאלה: עד 140 תווים. חדה, יוצרת מתח או trade-off, בלי תשובה "נכונה" ברורה שכולם יבחרו (זה מה שהורג פולס).
- 3 עד 4 אופציות. כל אופציה עד 30 תווים. שונות זו מזו, לא חופפות, וכל אחת בחירה שאפשר להגן עליה.
- אופציה אחת חייבת להיות מניעת-תגובות בסגנון "אחר, ספרי בתגובות 👇" (תגובות שוות יותר מהצבעה באלגוריתם).
- פתיח לפוסט (opener): 1-2 שורות שמציגות עמדה משלך ומסתיימות בשאלה שמזמינה תגובה, למשל "מה בחרת? ולמה?".
- למה זה עובד (why): שורה אחת קצרה שמסבירה את המנגנון ומקשרת ל-${c.chapter}. לדוגמה: "דעה לא פופולרית יוצרת tension, ו-tension יוצר engagement. ${c.chapter}."

${langRules}

גיוון: 3 הרעיונות בזוויות שונות באמת (לא 3 ניסוחים של אותה שאלה).

החזירי JSON תקין בלבד, בלי markdown ובלי טקסט נוסף, במבנה המדויק הזה:
{"polls":[{"question":"...","options":["...","...","..."],"opener":"...","why":"..."},{"question":"...","options":["...","...","..."],"opener":"...","why":"..."},{"question":"...","options":["...","...","..."],"opener":"...","why":"..."}]}`;
}

interface RawPoll {
  question?: unknown;
  options?: unknown;
  opener?: unknown;
  why?: unknown;
}

// Defensive JSON extraction (mirrors carousel's extractJson): raw parse, then strip
// code fences, then grab the first {...} block.
export function parsePolls(text: string): Poll[] {
  const t = text.trim();
  let parsed: { polls?: RawPoll[] } | null = null;
  const tries = [
    t,
    t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/m, "").trim(),
    (t.match(/\{[\s\S]*\}/) || [""])[0],
  ];
  for (const candidate of tries) {
    if (!candidate) continue;
    try {
      parsed = JSON.parse(candidate);
      if (parsed && Array.isArray(parsed.polls)) break;
    } catch {}
  }
  if (!parsed || !Array.isArray(parsed.polls)) return [];

  return parsed.polls
    .filter((p): p is RawPoll => !!p && typeof p === "object")
    .map((p) => ({
      question: String(p.question ?? "").trim(),
      options: Array.isArray(p.options)
        ? p.options.map((o) => String(o ?? "").trim()).filter(Boolean).slice(0, 4)
        : [],
      opener: String(p.opener ?? "").trim(),
      why: String(p.why ?? "").trim(),
    }))
    .filter((p) => p.question && p.options.length >= 2)
    .slice(0, 3);
}

// Format a single poll for the copy button.
export function formatPoll(p: Poll): string {
  const opts = p.options.map((o, i) => `${i + 1}. ${o}`).join("\n");
  return `${p.opener}\n\n${p.question}\n${opts}\n\n(למה זה עובד: ${p.why})`;
}
