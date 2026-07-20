// 4 conversation goals + a curated question bank + prompt builder + JSON parser.
// Shared by the client UI (goal grid) and the server API route (prompt + parsing).
// Mirrors lib/polls.ts: structured JSON output, defensive parser, same route skeleton.
//
// What this tool does NOT do: write the referral ask. That belongs to the
// "referral-ask" scenario in lib/connections-gen.ts, which only fires after a real
// conversation already happened. This tool prepares that conversation. The boundary
// is enforced in the prompt (see NO_ASK_RULE) and surfaced in the UI as a link.
//
// The bank below is the IP. It is fed to the model as a sharpness anchor, never
// returned as-is — otherwise every user would get the same five questions.
// Bank questions are written addressing a male contact; the prompt overrides gender
// per request, so edit the bank freely without worrying about gender agreement.

export type Lang = "עברית" | "אנגלית";
export type Gender = "זכר" | "נקבה";
export type Depth = "קליל" | "בינוני" | "עמוק";

export interface LadderQuestion {
  depth: Depth;
  q: string;
  /** One line: what this question actually surfaces. */
  reveals: string;
}

export interface AvoidQuestion {
  q: string;
  why: string;
}

export interface CoffeeGoal {
  id: string;
  title: string;
  /** When to pick this goal. Shown on the goal card. */
  when: string;
  /** Short label on the card. */
  tag: string;
  /** Model-facing: what makes this goal's questions non-generic. */
  angle: string;
  bank: LadderQuestion[];
  avoidExample: AvoidQuestion;
}

// Order matters: this is the display order of the goal grid.
export const COFFEE_GOALS: Record<string, CoffeeGoal> = {
  "industry-pivot": {
    id: "industry-pivot",
    title: "לפני מעבר לתחום או תפקיד חדש",
    when: "אתם שוקלים לעבור תעשייה, תפקיד, או מביצוע לניהול, ורוצים תמונה אמיתית לפני שמתחייבים.",
    tag: "תמונה אמיתית לפני מעבר",
    angle:
      "השאלות חייבות לחשוף את הפער בין איך התפקיד נראה מבחוץ לאיך הוא מרגיש מבפנים, ואת מה שמבדיל בין מי שהמעבר הצליח לו למי שחזר אחורה. שאלות בסגנון יתרונות וחסרונות פוסלות את התוצאה.",
    bank: [
      { depth: "קליל", q: "מה תפס לך את רוב היום אתמול?", reveals: "איך התפקיד נראה ביום רגיל" },
      { depth: "קליל", q: "מה הכי הפתיע אותך בשנה הראשונה בתפקיד?", reveals: "הפער בין הציפייה למציאות" },
      { depth: "בינוני", q: "אילו כישורים מהתפקיד הקודם שלך עברו איתך, ואילו נשארו מאחור?", reveals: "מה באמת עובר במעבר כזה" },
      { depth: "בינוני", q: "מה ההבדל בקצב העבודה בין המקום שבאת ממנו לפה?", reveals: "פער תרבות שקורות חיים מסתירים" },
      { depth: "בינוני", q: "אם היית מגייס מישהו שעושה מעבר כמו שלי, מה היית בודק קודם כל?", reveals: "איפה יבדקו אותי" },
      { depth: "עמוק", q: "יש החלטה מהשנה הראשונה שהיום היית מקבל אחרת?", reveals: "טעויות אמיתיות, מעבר לסיפור ההצלחה" },
      { depth: "עמוק", q: "מבין מי שעברו לתחום מבחוץ, מה הבדיל בין מי שנשאר למי שחזר אחורה?", reveals: "דפוס ההצלחה בפועל" },
      { depth: "עמוק", q: "מה שווה לברר לפני מעבר כזה, ורוב האנשים מגלים רק אחרי?", reveals: "השאלה שאני עוד לא יודעת לשאול" },
    ],
    avoidExample: {
      q: "יש אצלכם משרה פתוחה? אפשר להעביר קורות חיים?",
      why: "השיחה הופכת לראיון ברגע שיש בקשה. הפניה עובדת אחרי שנבנה אמון, וכאן הוא עוד לא קיים.",
    },
  },

  "target-company": {
    id: "target-company",
    title: "לפני כניסה לחברה מסוימת",
    when: "יש חברה שאתם רוצים להיכנס אליה, ואתם מדברים עם מישהו שכבר עובד שם.",
    tag: "מידע מבפנים על החברה",
    angle:
      "השאלות חייבות להוציא מידע שאי אפשר למצוא באתר החברה או בעמוד הלינקדאין שלה: תרבות בפועל, מה משתנה שם עכשיו, ומי מצליח שם. שאלות על המוצר או על הגודל של החברה פוסלות את התוצאה.",
    bank: [
      { depth: "קליל", q: "מה בעבודה שם הפתיע אותך אחרי שנכנסת, בהשוואה למה שראית מבחוץ?", reveals: "הפער בין המיתוג המעסיקי למציאות" },
      { depth: "קליל", q: "איך נראה תהליך הקבלה שלך, מהצד שלך?", reveals: "הכנה לתהליך, בלי לבקש כלום" },
      { depth: "בינוני", q: "על מה הצוות שלך הכי גאה השנה?", reveals: "נקודות שיחה פנימיות לשימוש בהמשך" },
      { depth: "בינוני", q: "מה היית רוצה לדעת על התרבות שם לפני שהתחלת?", reveals: "סימני התאמה שאף אחד לא מפרסם" },
      { depth: "בינוני", q: "איזה סוג אנשים פורח שם, ואיזה סוג מתקשה?", reveals: "קריטריון ההתאמה מעבר לכישורים" },
      { depth: "עמוק", q: "יש שינוי כיוון שהחברה עשתה לאחרונה ששינה לכם את העבודה?", reveals: "סיגנל על הכיוון הנוכחי" },
      { depth: "עמוק", q: "מה היית רוצה שמועמד ישאל אותך בראיון?", reveals: "חומר הכנה ממקור ראשון" },
      { depth: "עמוק", q: "מי שעזב בשנה האחרונה, מה בדרך כלל הסיבה?", reveals: "סיכון. לשאול רק אם השיחה זרמה" },
    ],
    avoidExample: {
      q: "אפשר שתעביר את קורות החיים שלי למגייסת?",
      why: "הבקשה הזאת הופכת שיחת היכרות לראיון סמוי, והיא שייכת לשיחה הבאה.",
    },
  },

  "positioning-feedback": {
    id: "positioning-feedback",
    title: "פידבק על איך אני נראה מבחוץ",
    when: "אתם רוצים לדעת איך המסר שלכם נקלט אצל מישהו מנוסה שרואה אתכם בפעם הראשונה.",
    tag: "איך אני נקלט אצל זרים",
    angle:
      "השאלות חייבות לבקש ממנו לתאר מה הוא רואה, ולא מהמשתמש להסביר את עצמו. כל שאלה מכוונת לפער בין מה שהמשתמש חושב שהוא משדר למה שבאמת נקלט.",
    bank: [
      { depth: "קליל", q: "מהמשפט שאמרתי על מה שאני עושה, מה נשמע לך ברור ומה נשאר מעורפל?", reveals: "האם המיצוב נקלט אצל מי שרואה אותי בפעם הראשונה" },
      { depth: "קליל", q: "איך היית מתאר למישהו אחר מה אני עושה?", reveals: "האם המסר שורד העברה הלאה" },
      { depth: "בינוני", q: "יש כיוון שלדעתך מתאים לי יותר מזה שאני רודף אחריו?", reveals: "פרספקטיבה שאין לי על עצמי" },
      { depth: "בינוני", q: "מה חסר לי כדי להיראות מוכן לתפקיד הזה, בצורת ההצגה שלי?", reveals: "פער במיצוב, בנפרד מפער בכישורים" },
      { depth: "בינוני", q: "אם היית נתקל בפרופיל שלי בלי להכיר אותי, מה היית מניח עליי?", reveals: "איזה סיגנל אני משדר בפועל" },
      { depth: "עמוק", q: "עם מי שווה לי לדבר בעקבות השיחה הזאת?", reveals: "גשר לרשת שלו, בלי לבקש טובה" },
      { depth: "עמוק", q: "אני מתמקד בדבר הנכון עכשיו?", reveals: "קריאה אסטרטגית כנה" },
      { depth: "עמוק", q: "אם היית ממליץ עליי למישהו מחר, מה היית צריך לדעת עליי קודם?", reveals: "מה חסר כדי שירצה לתמוך" },
    ],
    avoidExample: {
      q: "תהיה הממליץ שלי? אתה מכיר מישהו שמגייס עכשיו?",
      why: "תמיכה של אדם מנוסה נבנית מהוכחה לאורך זמן. בקשה בפגישה ראשונה שורפת אותה.",
    },
  },

  "long-term-sponsor": {
    id: "long-term-sponsor",
    title: "קשר ארוך טווח עם מישהו מנוסה",
    when: "המטרה היא קשר שנמשך, עם מישהו שיום אחד ידבר בשמכם בחדר שאתם לא נמצאים בו.",
    tag: "קשר שנמשך מעבר לשיחה",
    angle:
      "השאלות חייבות לבנות הדדיות ולתת לו מקום לדבר על מה שמעניין אותו, במקום לחלץ ממנו מידע. כל שאלה שמריחה כמו ראיון עם מומחה פוסלת את התוצאה.",
    bank: [
      { depth: "קליל", q: "מה מעניין אותך בתחום עכשיו, מעבר לתפקיד עצמו?", reveals: "פתח לקשר במקום חילוץ מידע" },
      { depth: "קליל", q: "מה שינה לך השנה את הדרך שאתה חושב על התחום?", reveals: "נקודת עניין לחזור אליה בעוד חודש" },
      { depth: "בינוני", q: "איך נראית בעיניך רשת מקצועית ששווה משהו?", reveals: "מה הוא מעריך בקשר" },
      { depth: "בינוני", q: "יש משהו בתחום שהיית רוצה לעשות ואין לך זמן אליו?", reveals: "פתח אמיתי לתת ערך בעתיד" },
      { depth: "בינוני", q: "מי עושה עבודה מעניינת בתחום ועדיין מתחת לרדאר?", reveals: "גישור לרשת שלו" },
      { depth: "עמוק", q: "מתי מישהו צעיר ממך עשה עליך רושם, ומה הוא עשה?", reveals: "מה מרוויח אצלו אמון" },
      { depth: "עמוק", q: "יש החלטה בקריירה שהיית רוצה לקבל עליה עצה בזמן אמת?", reveals: "פגיעות שמעמיקה קשר" },
      { depth: "עמוק", q: "אם נישאר בקשר לאורך זמן, מה יהפוך את זה לשווה גם מהצד שלך?", reveals: "הדדיות מפורשת" },
    ],
    avoidExample: {
      q: "תהיה המנטור שלי?",
      why: "הבקשה הופכת יחס פוטנציאלי להתחייבות כבר בפגישה הראשונה, ורוב האנשים נרתעים.",
    },
  },
};

export interface CoffeeChatInput {
  goalId: string;
  contactName: string;
  /** Role, company, how you found them — free text. */
  contactRole: string;
  contactGender: Gender;
  writerGender: Gender;
  /** Who the user is, what they're after, why this person specifically. */
  userContext: string;
  lang: Lang;
}

export interface CoffeeChatResult {
  opener: string;
  questions: LadderQuestion[];
  avoid: AvoidQuestion;
  followUp: string;
}

export function getGoal(id: string): CoffeeGoal | undefined {
  return COFFEE_GOALS[id];
}

// The boundary that keeps this tool out of connections' referral-ask territory.
const NO_ASK_RULE = `הגבול הכי חשוב בכלי הזה:
- אסור שיופיע בפלט, בשום חלק מארבעת החלקים, משפט שמבקש הפניה למשרה, המלצה, קורות חיים, חיבור לאדם מגייס, או עבודה.
- גם רמז מרוכך אסור: "אם יש משהו מתאים", "אשמח לשמוע על הזדמנויות", "אם תיתקל במשהו". זה שלב נפרד בתהליך שקורה אחרי השיחה הזאת.
- החריג היחיד הוא חלק ה-avoid, שבו כן מנסחים בדיוק את הבקשה האסורה כדי להזהיר ממנה.`;

export function buildCoffeeChatPrompt(input: CoffeeChatInput): string {
  const g = getGoal(input.goalId);
  if (!g) return "";

  const bankLines = g.bank
    .map((b) => `- [${b.depth}] "${b.q}" (חושף: ${b.reveals})`)
    .join("\n");

  const langRules =
    input.lang === "אנגלית"
      ? `- Write everything in natural, direct English, the way a real person prepares for a real conversation. No listicle tone, no corporate phrasing.
- Keep the depth values in Hebrew exactly as specified in the JSON contract below, even though the rest is English.`
      : `כללי עברית (קריטי):
- חשבי בעברית, עברית ישראלית מדוברת. לא תרגום מאנגלית.
- אסור מקף ארוך (— או –). פסיק או נקודה בלבד.
- אסור "זה לא X אלא Y" ואסור לפתוח משפט בשלילה.
- בלי באזוורדים שיווקיים ובלי סופרלטיבים ריקים ("מדהים", "מרתק", "לייצר ערך").
- מונחי אנגלית טבעיים בתוך עברית זה בסדר (לינקדאין, DM, פידבק).`;

  return `את מכינה אדם שמחפש עבודה לשיחת נטוורקינג אמיתית, אחרי שבקשת החיבור שלו בלינקדאין כבר אושרה ונקבעה שיחה. השיטה: שאלה אמיתית שפותחת שיחה, במקום שאלה שמובילה לבקשה. המטרה בשיחה היא להיות מוכרים, לא למכור.

המטרה בשיחה הזו: "${g.title}" — ${g.when}

מה הופך את השאלות פה ללא-גנריות (הכי חשוב): ${g.angle}

בנק דוגמאות למטרה הזו. חקי את החדות והספציפיות שלהן, ואל תעתיקי אף שאלה כמו שהיא. הדוגמאות כתובות בפנייה לגבר, והפלט שלך חייב להתאים למגדר שצוין למטה:
${bankLines}

הנתונים:
- מי האדם שאיתו השיחה: ${input.contactName.trim() || "—"} (${input.contactRole.trim() || "—"})
- פנייה אליו בלשון: ${input.contactGender}
- המשתמש/ת כותב/ת בגוף ראשון בלשון: ${input.writerGender}
- מי המשתמש/ת ומה הוא/היא מחפש/ת:
"""
${input.userContext.trim().slice(0, 1500) || "—"}
"""

מה עלייך לייצר, בדיוק ארבעה חלקים:

1. opener: פתיח של 30 שניות בגוף ראשון של המשתמש/ת, שממצב בלי לבקש שום דבר. נשען על פרט קונקרטי מהנתונים למעלה. 2-3 משפטים. אסור "נעים להכיר" ואסור הצגה עצמית גנרית.

2. questions: בדיוק 5 שאלות מדורגות מקליל לעמוק, בהשראת הבנק אבל מותאמות לנתונים למעלה. הסדר: שתיים קליל, שתיים בינוני, אחת עמוק. לכל שאלה: depth (קליל / בינוני / עמוק), q (השאלה), reveals (שורה אחת, מה זה חושף). אסור שאלה שאפשר לענות עליה כן או לא. אסור שאלה שאפשר לענות עליה מקריאת עמוד הלינקדאין שלו.

3. avoid: שאלה אחת ספציפית שאסור לשאול בשיחה הזאת, מדויקת למקרה של המשתמש/ת, ומשפט אחד למה. תמיד קשורה לבקשת עבודה, הפניה או המלצה מוקדמת מדי, אף פעם לא נושא אחר.

4. followUp: הודעה שנשלחת 24 שעות אחרי השיחה. מבנה קבוע: מה למדתי מהשיחה (פרט קונקרטי אחד ששמעתי ממנו) ומה עשיתי איתו (צעד קטן ומוחשי שכבר עשיתי). 2-3 משפטים. בלי לבקש כלום, בלי "נשמח לדבר שוב", בלי קריאה לפעולה.

${NO_ASK_RULE}

${langRules}

החזירי JSON תקין בלבד, בלי markdown ובלי טקסט נוסף, במבנה המדויק הזה:
{"opener":"...","questions":[{"depth":"קליל","q":"...","reveals":"..."},{"depth":"קליל","q":"...","reveals":"..."},{"depth":"בינוני","q":"...","reveals":"..."},{"depth":"בינוני","q":"...","reveals":"..."},{"depth":"עמוק","q":"...","reveals":"..."}],"avoid":{"q":"...","why":"..."},"followUp":"..."}`;
}

interface RawQuestion {
  depth?: unknown;
  q?: unknown;
  reveals?: unknown;
}

interface RawResult {
  opener?: unknown;
  questions?: unknown;
  avoid?: unknown;
  followUp?: unknown;
}

const DEPTHS: Depth[] = ["קליל", "בינוני", "עמוק"];

// Defensive JSON extraction (mirrors parsePolls): raw parse, then strip code fences,
// then grab the first {...} block. Returns null since the contract is one object.
export function parseCoffeeChat(text: string): CoffeeChatResult | null {
  const t = text.trim();
  let parsed: RawResult | null = null;
  const tries = [
    t,
    t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/m, "").trim(),
    (t.match(/\{[\s\S]*\}/) || [""])[0],
  ];
  for (const candidate of tries) {
    if (!candidate) continue;
    try {
      const p = JSON.parse(candidate);
      if (p && typeof p === "object") {
        parsed = p as RawResult;
        break;
      }
    } catch {}
  }
  if (!parsed) return null;

  const opener = String(parsed.opener ?? "").trim();
  const followUp = String(parsed.followUp ?? "").trim();

  const questions: LadderQuestion[] = Array.isArray(parsed.questions)
    ? (parsed.questions as RawQuestion[])
        .filter((q): q is RawQuestion => !!q && typeof q === "object")
        .map((q) => ({
          // The model sometimes translates the depth label when lang is English.
          depth: DEPTHS.includes(q.depth as Depth) ? (q.depth as Depth) : "בינוני",
          q: String(q.q ?? "").trim(),
          reveals: String(q.reveals ?? "").trim(),
        }))
        .filter((q) => q.q)
        .slice(0, 5)
    : [];

  const rawAvoid = (parsed.avoid && typeof parsed.avoid === "object" ? parsed.avoid : {}) as {
    q?: unknown;
    why?: unknown;
  };
  const avoid: AvoidQuestion = {
    q: String(rawAvoid.q ?? "").trim(),
    why: String(rawAvoid.why ?? "").trim(),
  };

  // A partial result is worse than none: the four parts are the whole product.
  if (!opener || !followUp || !avoid.q || questions.length < 4) return null;

  return { opener, questions, avoid, followUp };
}

// Format the question ladder for the copy button.
export function formatQuestions(qs: LadderQuestion[]): string {
  return qs
    .map((q, i) => `${i + 1}. [${q.depth}] ${q.q}\n   (חושף: ${q.reveals})`)
    .join("\n\n");
}
