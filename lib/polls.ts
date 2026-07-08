// 8 poll categories mapped to course concepts + prompt builder + JSON parser.
// Shared by the client UI (category grid) and the server API route (prompt + parsing).
// Mirrors lib/formulas.ts, but the output is structured JSON (question + options +
// opener + "why it works"), so we parse JSON like the carousel tool instead of a list.

export type Lang = "עברית" | "אנגלית";
export type Tone = "ציני" | "חם" | "פרובוקטיבי";

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
    icon: "🌶️",
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
    name: "הטעות שכולן עושות בנישה שלך",
    chapter: "פרק 5",
    angle:
      "Confession poll. הטעות הנפוצה בנישה, בניסוח שמאפשר לקורא להתוודות בשקט דרך ההצבעה. רלוונטי, לא שיפוטי.",
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
    icon: "🌉",
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
    name: "טרנד בנישה שלך",
    chapter: "פרק 3",
    angle:
      "Is-X-dead / prediction. 'האם X מת ב-2026?' או 'מה ינצח?'. פרובוקציה + סימון שאת יודעת לאן הדברים הולכים.",
    icon: "📈",
    tag: "פרובוקציה + insider",
  },
};

const TONE_HINT: Record<Tone, string> = {
  ציני: "טון ציני ויבש עם חוש הומור. אמת שכולן מכירות ואף אחת לא אומרת בקול.",
  חם: "טון חם ואנושי בגובה העיניים, שמזמין שיתוף אישי בתגובות.",
  פרובוקטיבי: "טון פרובוקטיבי שמכריח לבחור צד. מתח אמיתי, בלי rage-bait זול.",
};

// One strong, concrete example poll per category, in Hanita's voice. Fed to the
// model as a quality/specificity anchor: mimic the sharpness, not the content.
const CATEGORY_EXAMPLES: Record<string, string> = {
  uncommon:
    'שאלה: "רוב הפוסטים על AI בלינקדאין נכתבו על ידי AI. מזהות?" · אופציות: תוך 3 שניות / רק כשזה ממש גרוע / לא, וזה מפחיד / גם אני עושה את זה',
  aireality:
    'שאלה: "הבטיחו שסוכני AI יחליפו צוות שלם. אחרי שנה בשטח?" · אופציות: חסכו לי שעות אמת / הוסיפו לי עבודה / החליפו משימות קטנות / עוד לא נגעתי ברצינות',
  thisorthat:
    'שאלה: "בונות נוכחות בלינקדאין מאפס. מאיפה מתחילים?" · אופציות: לתקן את הפרופיל / פשוט לפרסם / לבנות lead magnet / לשלוח DMs חכמים',
  mistake:
    'שאלה: "הטעות שעלתה לכן הכי הרבה לקוחות השנה?" · אופציות: פרסמתן יותר מדי / חיכיתן לפרופיל מושלם / דיברתן לכולם / מדדתן לייקים',
  icp:
    'שאלה: "יש לכן רעיון תוכן טוב. איפה הוא נתקע?" · אופציות: להפוך אותו לפוסט / למצוא זמן / לדעת אם יעבוד / פשוט ללחוץ פרסם',
  leadmagnet:
    'שאלה: "בניתן lead magnet. איזה חלק הכי תקוע?" · אופציות: להחליט על הנושא / לעצב אותו / לכתוב את הפוסט / להביא הורדות',
  howi:
    'שאלה: "כשאתן מתחילות לכתוב פוסט, מה קורה קודם?" · אופציות: כותבות הוק / שופכות הכל וחותכות / מדברות למישהי / נתקעות על השורה הראשונה',
  trend:
    'שאלה: "האם קולד אאוטריץ׳ מת ב-2026?" · אופציות: כן, warm intros ניצחו / לא, רק צריך חוכמה / תלוי בתעשייה / אף פעם לא עבד לי',
};

// Full standalone prompt (used both to call the model and, after the 3rd use, as
// the handoff prompt the user pastes into her own ChatGPT/Claude/Gemini).
export function buildPollPrompt(
  categoryKey: string,
  tone: Tone,
  topic: string,
  niche: string,
  audience: string,
  lang: Lang
): string {
  const c = POLL_CATEGORIES[categoryKey];
  const example = CATEGORY_EXAMPLES[categoryKey] || "";
  const topicLine = topic.trim()
    ? `הנושא/הזווית שהמשתמשת רוצה: "${topic.trim()}". בססי את שלושת הסקרים ישירות על הנושא הזה, כל אחד מזווית אחרת. אל תסטי לנושא אחר.`
    : "לא ניתן נושא ספציפי. בחרי נושא קונקרטי אחד שרלוונטי לקטגוריה ולנישה, ובני סביבו. בלי נושא כללי ומעורפל.";
  const nicheLine = niche.trim()
    ? `הנישה/התחום של המשתמשת: ${niche.trim()}.`
    : "הנישה לא צוינה. הישארי רלוונטית לקהל B2B / נשות AI / יוצרות תוכן.";
  const audienceLine = audience.trim()
    ? `הקהל שאליו מכוונים (ICP): ${audience.trim()}. השתמשי בזה רק כדי לכוון זווית וטון. אסור לכתוב את שם הקהל, את המילה ICP, או תיאור של הקהל בתוך השאלה או האופציות. הסקר צריך להישמע כאילו בן אדם כתב אותו, לא כלי שיווק.`
    : "הקהל לא צוין. כווני לאשת מקצוע B2B ישראלית.";

  const langRules =
    lang === "אנגלית"
      ? "- כתבי את כל הסקרים באנגלית תקנית וטבעית של לינקדאין."
      : `כללי עברית (קריטי — Gemini נוטה לעברית מתורגמת, הקפידי מאוד):
- חשבי בעברית. עברית ישראלית מדוברת של לינקדאין, לא תרגום מאנגלית.
- פנייה בלשון נקבה יחיד לאורך כל הטקסט.
- אסור מקף ארוך (— או –). השתמשי בפסיק, נקודה, או מקף קצר.
- אל תכתבי "זה לא X, אלא Y" ואל תפתחי משפט בשלילה. נסחי בחיוב, ישר לעניין.
- שלבי מונחי אנגלית טבעיים במידה (lead magnet, DM, reach, engagement), בלי להגזים.
- בלי באזוורדים שיווקיים ובלי קלישאות לינקדאין.
- בלי אימוג'ים בכלל, לא בשאלה, לא באופציות ולא בפתיח.`;

  return `את מומחית לסקרים בלינקדאין שמייצרים דיון אמיתי ולידים. את בונה 3 רעיונות סקר מצוינים, שונים באמת זה מזה.

הקטגוריה: "${c.name}" (${c.chapter}). הזווית: ${c.angle}
${topicLine}
הטון: ${tone}. ${TONE_HINT[tone]}
${nicheLine}
${audienceLine}
שפה: ${lang}

דוגמה לסקר מצוין בקטגוריה הזו (חקי את החדות, הספציפיות והקול. אל תעתיקי את התוכן):
${example}

חוקי סקר (אכפי על כל אחד מ-3 הרעיונות):
- שאלה עד 140 תווים. חדה, קונקרטית, עם מתח או trade-off אמיתי. בלי תשובה "נכונה" שכולם יבחרו.
- אסור סקרים גנריים. אסור שאלות כמו "מה דעתך על AI?" או "איך AI משנה את השיווק?". כל שאלה חייבת מצב ספציפי, מספר, כלי, או רגע אמיתי מהעבודה.
- 3-4 אופציות, כל אחת עד 30 תווים, שונות ולא חופפות, כל אחת בחירה שאפשר להגן עליה.
- אופציה אחת מניעת-תגובות בסגנון "אחר, ספרי בתגובות".
- פתיח לפוסט: 1-2 שורות עם עמדה שלך, שמסתיימות בשאלה שמזמינה תגובה.
- למה זה עובד: משפט אחד קצר מאוד (עד 12 מילים) שמסביר את המנגנון ומזכיר את ${c.chapter}. בלי "כמפורט בפרק", בלי ניסוח רשמי. לדוגמה: "דעה לא פופולרית יוצרת מתח, ומתח מביא תגובות. ${c.chapter}".

${langRules}

גיוון: 3 זוויות שונות באמת, לא 3 ניסוחים של אותה שאלה.

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
