// Personalized connection-message generator: scenarios + prompt builder.
// Shared by the client UI (form fields) and the server API route, same split as formulas.ts.
// The course templates in content/connections.ts stay as the manual fallback; here they
// serve as style anchors so Gemini writes in the course method, not a generic DM.

export type MsgLang = "עברית" | "אנגלית";
export type Gender = "זכר" | "נקבה";

export interface Scenario {
  id: string;
  title: string;
  when: string;
  kind: "request" | "message"; // request = connection request (hard 300-char cap)
  anchor: string; // course template used as a style example in the prompt
  materialLabel: string;
  materialPh: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "icp-content",
    title: "בקשת חיבור ל-ICP",
    when: "מצאתם לקוח אידיאלי ורוצים להיכנס לרשת שלו דרך התוכן שלו.",
    kind: "request",
    anchor:
      "היי [שם], ראיתי את הפוסט שלך על [נושא הפוסט]. זה בדיוק עניין שאני עוסקת בו. אשמח לראות עוד מהתוכן שלך בפיד שלי.",
    materialLabel: "הדביקו את הפוסט האחרון שלו (או כמה שורות ממנו)",
    materialPh: "העתיקו לכאן את הטקסט של הפוסט. ככל שיש יותר חומר, ההודעה פחות גנרית.",
  },
  {
    id: "peer",
    title: "בקשת חיבור לעמית / נותן שירות מקביל",
    when: "נטוורקינג עם מי שמקביל לכם בתעשייה, לשת\"פים והמלצות הדדיות.",
    kind: "request",
    anchor:
      "היי [שם], אנחנו שנינו ב[תחום] ואני עוקבת אחרי מה שאת משתפת. בא לי שנהיה מחוברים, יש מצב שנמצא נקודות לשת\"פ.",
    materialLabel: "מי האדם ומה משותף לכם",
    materialPh: "למשל: יועץ שיווק לסטארטאפים, כותב הרבה על ABM, שנינו עובדים עם חברות SaaS ישראליות",
  },
  {
    id: "shared-context",
    title: "בקשת חיבור אחרי הקשר משותף",
    when: "אחרי וובינר, קבוצה, אירוע או חיבור משותף.",
    kind: "request",
    anchor:
      "היי [שם], נתקלתי בך ב[שם האירוע]. [משפט על משהו שאמר]. שמחה שנהיה מחוברים, מסקרן אותי לעקוב אחרי מה שאת עושה.",
    materialLabel: "איפה נתקלתם בו ומה קרה שם",
    materialPh: "למשל: וובינר של Gong על discovery calls, הוא שאל בצ'אט שאלה חכמה על כמה שאלות מותר לשאול בשיחה ראשונה",
  },
  {
    id: "opener",
    title: "הודעת פתיחה אחרי אישור חיבור",
    when: "כמה ימים אחרי שאישרו. שאלה אמיתית שפותחת שיחה, לא מכירתית.",
    kind: "message",
    anchor:
      "היי [שם], ראיתי לאחרונה שכתבת על [נושא]. אני בדיוק מתמודדת עם זה אצל לקוח. איך הגעת לגישה הזאת?",
    materialLabel: "הדביקו פוסט שלו או תארו על מה הוא כותב",
    materialPh: "פוסט אחרון, או: כותב על מעבר מ-outbound ל-inbound, טוען שקול קורא יותר חשוב מכמות פניות",
  },
  {
    id: "ifp",
    title: "הודעת goodwill ל-IFP",
    when: "למי שהתוכן שלו נתן לכם ערך אמיתי. תודה בלי אג'נדה, בלי שאלה, בלי המשך.",
    kind: "message",
    anchor:
      "היי [שם], ראיתי את הפוסט שלך על [נושא], זה עשה לי סדר בראש. תודה.",
    materialLabel: "הדביקו את הפוסט שנתן לכם ערך",
    materialPh: "העתיקו את הפוסט, או תארו מה בדיוק הוא אמר שעזר לכם",
  },
  {
    id: "pre-post",
    title: "הודעה לפני פוסט חשוב",
    when: "יום לפני פוסט שיעזור ל-ICP. שאלה שמחממת את הנושא ויוצרת אינטראקציה מוקדמת.",
    kind: "message",
    anchor:
      "היי [שם], בא לי לשמוע את הזווית שלך על [נושא] לפני שאני מעלה משהו בנושא. איך את רואה את זה?",
    materialLabel: "על מה הפוסט שלכם, ומה אתם יודעים על האדם",
    materialPh: "למשל: פוסט על טעויות בפתיחת שיחות מכירה. הוא סמנכ\"ל מכירות שכתב פעם שהוא שונא סקריפטים",
  },
];

export interface GenInput {
  scenarioId: string;
  prospectName: string;
  prospectGender: Gender;
  writerGender: Gender;
  writerLine: string; // one line: who the sender is
  material: string; // pasted post / context
  lang: MsgLang;
}

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

// Strict parser for the 3-variation output. Unlike the shared parseVariations,
// this NEVER falls back to raw lines: it only returns numbered lines, so a model
// preamble like "הנה 3 וריאציות:" can't leak in as a fake variation.
export function parseConnectionVariations(txt: string): string[] {
  return txt
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d+[.)]/.test(l))
    .map((l) => l.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function buildConnectionPrompt(input: GenInput): string {
  const s = getScenario(input.scenarioId);
  if (!s) return "";

  const lengthRule =
    s.kind === "request"
      ? `- זו בקשת חיבור: מקסימום 300 תווים כולל רווחים. זה מגבלה קשיחה של לינקדאין, חריגה פוסלת את הוריאציה.
- עדיף 150-250 תווים. קצר ואנושי מנצח ארוך ומנומק.`
      : `- זו הודעה אחרי חיבור: 2-4 משפטים קצרים. בלי פסקאות, בלי הקדמות.`;

  const agendaRule =
    s.id === "ifp"
      ? "- הודעת goodwill בלבד: בלי שאלה בסוף, בלי הצעה להמשך, בלי \"נדבר\". תודה ספציפית ונקודה."
      : "- אסור pitch, אסור להציע פגישה או שירות, אסור לינק. המטרה: שיחה, לא מכירה.";

  const langRules =
    input.lang === "אנגלית"
      ? `- Write in natural, direct English. Short sentences, like a real DM typed on a phone. No corporate tone.`
      : `כללי עברית (קריטי):
- חשבי בעברית, עברית ישראלית מדוברת. לא תרגום מאנגלית.
- אסור מקף ארוך (— או –). פסיק או נקודה בלבד.
- אסור "זה לא X אלא Y" ואסור לפתוח משפט בשלילה.
- מונחי אנגלית טבעיים בתוך עברית זה בסדר (B2B, פיד, שת"פ, discovery).
- בלי סופרלטיבים ריקים: "מדהים", "מרתק", "תוכן מטורף". מחמאה חייבת להיות ספציפית לתוכן.`;

  return `את כותבת הודעות לינקדאין קצרות בשיטת קורס פנייה שקטה: אנושי, ספציפי, אף פעם לא מכירתי. המטרה היא לא למכור אלא להיות מוכרים.

התרחיש: "${s.title}" — ${s.when}

דוגמת סגנון מהקורס (חקי את הטון והמבנה, אל תעתיקי את הניסוח):
"${s.anchor}"

הנתונים:
- שם האדם: ${input.prospectName.trim() || "—"}
- פנייה אליו בלשון: ${input.prospectGender}
- השולח/ת כותב/ת בלשון: ${input.writerGender} (גוף ראשון)
- מי השולח/ת: ${input.writerLine.trim() || "—"}
- החומר על האדם (פוסט שלו / הקשר):
"""
${input.material.trim().slice(0, 2500) || "—"}
"""

הכלל שהופך את זה ללא-גנרי (הכי חשוב):
- כל וריאציה חייבת להיאחז בפרט קונקרטי אחד מהחומר למעלה: טענה שהוא כתב, מספר שהוא ציין, דוגמה שהוא נתן. אסור "ראיתי את הפוסט שלך על שיווק" בלי הפרט עצמו.
- אם החומר דל, תיאחזי במה שיש, אבל אסור להמציא פרטים או ציטוטים שלא מופיעים בחומר.

כללים:
${lengthRule}
${agendaRule}
- לשון מגדר מדויקת לשני הצדדים, בלי לוכסנים (עוסק/ת אסור).
- בלי אימוג'ים, בלי "אשמח להתחבר" ובלי "אשמח להצטרף לרשת שלך".
- שההודעה תרגיש כאילו הוקלדה בטלפון על ידי אדם אמיתי, לא נוסחה.
${langRules}

גיוון: 3 וריאציות ששונות באמת. אחת שנפתחת בפרט מהחומר, אחת עם זווית אישית של השולח/ת, אחת קצרה במיוחד.

החזירי בדיוק 3 וריאציות, כל אחת בשורה אחת, ממוספרות 1-3, בלי שום טקסט לפני או אחרי.`;
}
