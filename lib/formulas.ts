// 3 headline formulas from course chapter 2 + prompt builder.
// Shared by the client UI (form fields) and the server API route (prompt + parsing).

export type Lang = "עברית" | "אנגלית";

export interface Field {
  id: string;
  label: string;
  ph: string;
}

export interface Formula {
  name: string;
  structure: string;
  when: string;
  example: string;
  fields: Field[];
}

const ROLE_FIELD = (ph: string): Field => ({
  id: "role",
  label: "מה אתם עושים (התפקיד / השירות)",
  ph,
});

export const FORMULAS: Record<string, Formula> = {
  objection: {
    name: "ניטרול ההתנגדות",
    structure: "קהל יעד + ההתנגדות שלו + הפתרון — בחמש המילים הראשונות",
    when: "כשיש לקהל שלך התנגדות ספציפית שחוזרת",
    example: "HR consultant who sides with the business, not the process. 50+ companies.",
    fields: [
      ROLE_FIELD("למשל: יועצת שיווק B2B, סוכנות לינקדאין, מאמנת מכירות"),
      { id: "audience", label: "קהל היעד שלכם", ph: 'למשל: מנכ"לים של חברות B2B' },
      { id: "objection", label: "ההתנגדות הכי נפוצה שאתם שומעים מלקוחות", ph: "למשל: 'יועצים רק מדברים, לא מבצעים'" },
      { id: "solution", label: "הפתרון / האמירה שמנטרלת אותה", ph: "למשל: יד על הדופק, מבצעת בעצמי" },
      { id: "proof", label: "הוכחה (מספר לקוחות / שנים)", ph: "למשל: 50+ חברות" },
    ],
  },
  positioning: {
    name: "מיצוב",
    structure: "מיצוב ייחודי שיוצר סקרנות + הוכחה + קריאה לפעולה",
    when: "כשיש לך זווית שמבדילה אותך מכולם",
    example: "The consultant who tells founders what they don't want to hear. 30 companies. Honest results.",
    fields: [
      ROLE_FIELD("למשל: יועצת עסקית, סוכנות לינקדאין, מאמנת"),
      { id: "angle", label: "הזווית הייחודית / מה אתם אומרים שאחרים לא", ph: "למשל: אומרים למייסדים מה שהם לא רוצים לשמוע" },
      { id: "audience", label: "קהל היעד שלכם", ph: "למשל: מייסדי סטארטאפים" },
      { id: "proof", label: "הוכחה", ph: "למשל: 30 חברות, תוצאות אמיתיות" },
      { id: "cta", label: "קריאה לפעולה (אופציונלי)", ph: "למשל: בואו נדבר" },
    ],
  },
  offer: {
    name: "ההצעה",
    structure: "טרנספורמציה מדויקת + ציר זמן ריאלי + עבור מי",
    when: "כשיש לך תהליך ברור עם תוצאה מוגדרת",
    example: "Mindset coach for founders in burnout. One session → tools you use tomorrow.",
    fields: [
      ROLE_FIELD("למשל: מאמנת מנטלית, יועצת, מומחית תהליך"),
      { id: "transformation", label: "הטרנספורמציה / התוצאה המדויקת", ph: "למשל: כלים שמשתמשים בהם כבר מחר" },
      { id: "timeframe", label: "ציר זמן ריאלי", ph: "למשל: פגישה אחת" },
      { id: "audience", label: "עבור מי", ph: "למשל: מייסדים בשחיקה" },
      { id: "proof", label: "הוכחה (אופציונלי)", ph: "למשל: 100+ פגישות" },
    ],
  },
  jobseeker: {
    name: "מחפשי עבודה",
    structure: "תפקיד היעד + התחום או ההתמחות + נקודת הוכחה אחת",
    when: "כשאתם מחפשים עבודה, והכותרת צריכה לדבר למגייסת ולא ללקוח",
    example: "Customer Success Manager | B2B SaaS | 94% retention across 60 accounts",
    fields: [
      {
        id: "target",
        label: "התפקיד שאתם מכוונים אליו, בשפה שהשוק מכיר",
        ph: "למשל: Customer Success Manager, מנהלת קמפיינים, בקר מלאי. לא שם פנימי כמו Growth Ninja",
      },
      { id: "domain", label: "התחום או ההתמחות", ph: "למשל: B2B SaaS, קמעונאות, מוסדות בריאות, פינטק" },
      {
        id: "proof",
        label: "נקודת הוכחה אחת שאי אפשר להמציא",
        ph: "למשל: שימור 94% בתיק של 60 לקוחות. אם אין מספר: 4 שנים בחברות SaaS בצמיחה",
      },
    ],
  },
};

export function buildPrompt(formulaKey: string, answers: Record<string, string>, lang: Lang): string {
  const f = FORMULAS[formulaKey];
  const details = f.fields
    .map((fld) => `- ${fld.label}: ${(answers[fld.id] || "").trim() || "—"}`)
    .join("\n");

  const langRules =
    lang === "אנגלית"
      ? "- כתבי באנגלית תקנית וטבעית."
      : `כללי עברית (קריטי — Gemini נוטה לעברית מתורגמת ולחזרתיות, הקפידי מאוד):
- חשבי בעברית. עברית ישראלית מדוברת של לינקדאין, לא תרגום מאנגלית.
- להפרדה בתוך הכותרת השתמשי בפסיק או נקודה בלבד. אסור מקף ארוך (— או –).
- אל תכתבי "זה לא X, אלא Y". נסחי בחיוב, ישר לעניין.
- שלבי מונחי אנגלית טבעיים כמו שישראלים כותבים (B2B, leads, pipeline, founders, SaaS). שם התפקיד יכול להישאר באנגלית.
- חובה: לכל וריאציה ביטוי מרכזי אחר. אם השתמשת ב"מנוע צמיחה" באחת, אל תחזרי עליו באף אחת מהשאר. גווני: לידים, סגירת עסקאות, מכירות, pipeline, נוכחות שמביאה לקוחות, ערוץ מכירה.

שתי דוגמאות לקול עברי טבעי וחד (חקי את הסגנון והאיכות, לא את התוכן):
"יועצת מיסוי לעצמאים שמדברת בגובה העיניים. בלי ז'רגון, בלי הפתעות בסוף השנה. 200+ עצמאים."
"בונה חנויות Shopify שמוכרות. עיצוב נקי, צ'קאאוט שלא נוטשים. 80+ מותגים."`;

  // Job seekers write to a recruiter, not a client. Different reader, different rules.
  const audienceRules =
    formulaKey === "jobseeker"
      ? `
הקורא (קריטי — זה שונה משאר הנוסחאות):
- הקורא הוא **מגייסת**, לא לקוח. היא לא קונה שירות, היא מחפשת מישהו שכבר עשה את העבודה.
- אסור לנסח הצעת שירות, אסור "אני עוזר ל", ואסור קריאה לפעולה מכירתית.
- **שדה התפקיד שהמשתמש נתן חייב להופיע כלשונו**, כי מגייסות מקלידות אותו בחיפוש. אל תחליפי אותו בניסוח יצירתי.
- אסור בהחלט: passionate, results-driven, thought leader, motivated, hard worker, team player. אף מגייסת לא מחפשת את המילים האלה.
- אם המשתמש נתן הוכחה בלי מספר (שנות ניסיון, סוג חברות), זה לגיטימי לגמרי. אל תמציאי מספר שלא נתן.
- מבנה מומלץ: תפקיד, ואז התחום, ואז ההוכחה. מפרידים בקו אנכי או בנקודה מרכזית.`
      : "";

  return `את קופירייטרית מומחית לכותרות פרופיל בלינקדאין. את כותבת כותרת אחת מצוינת ב-5 וריאציות.
${audienceRules}

הנוסחה: "${f.name}" — ${f.structure}.

דוגמה לכותרת מצוינת בנוסחה הזו (חקי את המבנה והאיכות, לא את התוכן):
"${f.example}"
שימי לב: הדוגמה פותחת ב**תפקיד** ("HR consultant", "Mindset coach") ואז מוסיפה את הזווית. זה קריטי — הקורא צריך להבין מי האדם, לא לקרוא סיסמה מופשטת. זו כותרת שלמה וזורמת, לא רשימת מילים קטועה.

חומר הגלם של המשתמשת (נסחי אותו מחדש בצורה טבעית, אל תשרשרי אותו כמו שהוא):
${details}

שפת הכותרת: ${lang}

כללי אורך (קריטי):
- כותרת לינקדאין יכולה להגיע עד 220 תווים סה"כ.
- 45-50 התווים הראשונים הם החזקים ביותר — שם חייב להיות התפקיד + הפאנץ', כי רק הם נראים במובייל, בחיפוש ובתגובות. אל תתחילי בהקדמה משעממת. מי את + הברק, מיד.
- את שאר התווים (עד 220) אפשר לנצל להוכחה קונקרטית או מיצוב ממשי — אבל זה רשות. אם אין לך מה להגיד שמוסיף ערך, אל תוסיפי. אסור למלא בזנב מילולי ריק כמו "founders agree", "now know", "proved wrong". עדיף כותרת קצרה וחדה מאשר ארוכה עם פלאף.

טון (קריטי):
- בלי באזוורדים שיווקיים. אסור בהחלט: transformed, empowered, leverage, unlock, activated, elevate, supercharge, game-changer, drive growth, next level, וכל קלישאת לינקדאין דומה.
- חד, ספציפי, אנושי — כמו שאדם חכם מנסח, לא כמו פרסומת.
- בלי "אני עוזר ל-X לעשות Y". בלי שם חברה לא מוכרת ככותרת.
${langRules}

גיוון (קריטי):
- 5 וריאציות ששונות באמת זו מזו, לא 5 ניסוחים של אותו משפט.
- גוון את הזווית: אחת ישירה, אחת עם ניגוד חד, אחת שפותחת במספר/הוכחה, אחת עם אמירה פרובוקטיבית או שאלה.

החזירי בדיוק 5 וריאציות. כל אחת בשורה נפרדת, ממוספרת 1-5, בלי שום טקסט נוסף לפני או אחרי.`;
}

export function parseVariations(txt: string): string[] {
  const lines = txt.split("\n").map((l) => l.trim()).filter(Boolean);
  const numbered = lines
    .filter((l) => /^\d+[.)]/.test(l))
    .map((l) => l.replace(/^\d+[.)]\s*/, "").trim());
  const out = numbered.length >= 3 ? numbered : lines.map((l) => l.replace(/^\s*\d+[.)]\s*/, "").trim());
  return out.slice(0, 5);
}
