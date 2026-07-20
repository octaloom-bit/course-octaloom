// Case-study post generator (chapter 7): four-part structure + prompt builder.
// Shared by the client UI (form fields) and the server API route, same split as formulas.ts.
//
// Design note: the fields demand raw material, not a topic. The whole point of this
// post is that the story is specific and real; a "give me a topic" form would produce
// exactly the generic content the chapter warns about, and that LinkedIn demotes.

export type PostLang = "עברית" | "אנגלית";

export interface StoryField {
  id: string;
  label: string;
  ph: string;
  /** Long fields get a taller textarea. */
  big?: boolean;
  optional?: boolean;
}

export const STORY_FIELDS: StoryField[] = [
  {
    id: "situation",
    label: "מה היה המצב בהתחלה?",
    ph: "בלי לייפות. מה היה שבור, תקוע או מסוכן. למשל: לקוח גדול הפסיק להיכנס למערכת ואף אחד לא שם לב במשך חודשיים.",
    big: true,
  },
  {
    id: "actions",
    label: "מה עשיתם, שלב אחרי שלב?",
    ph: "כולל מה שניסיתם ולא עבד. זה החלק שאנשים הכי זוכרים, ובלעדיו הפוסט נשמע כמו הצלחה מלוטשת.",
    big: true,
  },
  {
    id: "result",
    label: "מה יצא מזה?",
    ph: "מספר אם יש לכם. אם אין מספר מדויק, תנו היקף או טווח. אל תמציאו.",
  },
  {
    id: "differently",
    label: "מה הייתם עושים אחרת היום?",
    ph: "זה מה שמבדיל בין מי שבאמת עשה את זה לבין מי שקרא על זה.",
  },
  {
    id: "role",
    label: "איזה תפקיד אתם מחפשים, ובאיזה סוג חברות?",
    ph: "למשל: Customer Success Manager בחברות SaaS בצמיחה. משמש רק למשפט האחרון בפוסט.",
  },
  {
    id: "voice",
    label: "משהו על הקול שלכם (רשות)",
    ph: "למשל: אני כותבת קצר וישיר, בלי אימוג'ים. או: אני נוטה לצחוק על עצמי.",
    optional: true,
  },
];

export interface StoryInput {
  answers: Record<string, string>;
  lang: PostLang;
}

/** Two full posts, separated by a line of three dashes. */
export function parsePosts(txt: string): string[] {
  return txt
    .split(/^\s*-{3,}\s*$/m)
    .map((p) => p.replace(/^\s*(גרסה|וריאציה|Version)\s*\d+\s*[:.）)]?\s*/i, "").trim())
    .filter((p) => p.length > 40)
    .slice(0, 2);
}

export function buildCaseStudyPrompt(input: StoryInput): string {
  const a = input.answers;
  const get = (id: string) => (a[id] || "").trim() || "—";

  const langRules =
    input.lang === "אנגלית"
      ? `- Write in natural, direct English. Short sentences. No corporate tone, no buzzwords.`
      : `כללי עברית (קריטי):
- חשוב בעברית. עברית ישראלית מדוברת, לא תרגום מאנגלית.
- אסור מקף ארוך (— או –). פסיק, נקודה או סוגריים.
- אסור "זה לא X אלא Y", ואסור לפתוח משפט בשלילה.
- אסור סופרלטיבים: מדהים, מטורף, פורץ דרך, משנה חיים, קסם.
- מונחי אנגלית טבעיים בתוך עברית זה בסדר (CRM, SaaS, onboarding, churn).
- אורך משפטים משתנה. אסור רצף של משפטים קצרים באותו אורך, זה נשמע כמו מכונה.`;

  return `אתה עורך תוכן שמתמחה בפוסטים מקצועיים בלינקדאין. אתה לא ממציא, אתה עורך.

המשימה: לקחת סיפור אמיתי אחד מהעבודה של המשתמש ולהפוך אותו לפוסט.

== חומר הגלם (זה כל מה שיש. אסור להוסיף עליו) ==
- המצב בהתחלה: ${get("situation")}
- מה נעשה, שלב אחרי שלב: ${get("actions")}
- התוצאה: ${get("result")}
- מה היה נעשה אחרת: ${get("differently")}
- התפקיד שהמשתמש מחפש: ${get("role")}
- הערה על הקול של המשתמש: ${get("voice")}

== מבנה הפוסט (בסדר הזה) ==
1. **המצב**, במשפט או שניים. ישר לתוך הסיטואציה, בלי הקדמה כללית על התחום.
2. **מה עשיתי**, בגוף ראשון, שלב אחרי שלב, כולל מה שלא עבד.
3. **מה יצא**, עם המספר או ההיקף שנמסר.
4. **מה הייתי עושה אחרת**, משפט או שניים של כנות.
5. **סגירה**: משפט אחד ענייני על התפקיד שהמשתמש מחפש. למשל: "אגב, אני בדיוק מחפשת תפקיד X בחברות Y. אם עולה משהו אצלכם, אשמח שתחשבו עליי."

== כללים קשיחים ==
- זה "ככה אני עשיתי", לא "ככה עושים". אסור רשימת טיפים, אסור הכללות, אסור ללמד את הקורא. סיפור אחד, של המשתמש.
- **אסור להמציא פרט, מספר, ציטוט או תוצאה שלא מופיעים בחומר הגלם.** אם חסר משהו, פשוט אל תכתוב אותו. אל תמלא בהשערות.
- הסגירה היא משפט אחד. אסור סימני קריאה, אסור "אשמח לשיתוף", ואסור להפוך את הפוסט לבקשה.
- בלי אימוג'ים בגוף הפוסט.
- בלי האשטאגים.
- אורך: 120 עד 200 מילים לכל פוסט.
${langRules}

== פלט ==
כתוב **שתי גרסאות** של הפוסט. שתיהן מאותו חומר גלם, ושונות בפתיחה ובקצב:
- גרסה 1: נפתחת ישר בתוך הסצנה, במשפט קצר וחד.
- גרסה 2: נפתחת במשפט שמנסח את התובנה, ואז חוזרת לסיפור.

הפרד בין שתי הגרסאות בשורה שמכילה שלושה מקפים בלבד: ---
בלי כותרות, בלי מספור, בלי טקסט לפני או אחרי. רק שני הפוסטים והמפריד ביניהם.`;
}
