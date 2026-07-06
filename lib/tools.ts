// Registry of course helper tools shown on the dashboard.
// The headline generator is live; the rest are placeholders for upcoming phases.

export type ToolType = "ai" | "static" | "gem";
export type ToolStatus = "live" | "soon";

export interface Tool {
  id: string;
  title: string;
  desc: string;
  href?: string;
  external?: boolean; // href points to another site; open in a new tab
  type: ToolType;
  status: ToolStatus;
}

// Order matters: this is the display order on the /tools dashboard.
export const TOOLS: Tool[] = [
  {
    id: "carousel",
    title: "מחולל קרוסלות ללינקדאין",
    desc: "מזינים נושא, ה-AI כותב קרוסלה מלאה לפי שיטת הסירקולציה, ואתם עורכים, ממתגים, בוחרים צבעים ומורידים PDF מוכן לפוסט מסמך.",
    href: "/tools/carousel",
    type: "ai",
    status: "live",
  },
  {
    id: "identity-audit",
    title: "Identity Audit",
    desc: "3 שאלות מפרק 5 שמוצאות את הזווית שרק אתם מביאים. נוסחת הבידול שלכם בתוכן.",
    href: "/tools/identity-audit",
    type: "static",
    status: "live",
  },
  {
    id: "profile-photo",
    title: "פרומפטים לתמונה ראשית",
    desc: "פרומפטים מוכנים ליצירת תמונה ראשית מקצועית מתמונה רגילה שלכם, עם מדריך לפי ChatGPT ו-Gemini.",
    href: "/tools/profile-photo",
    type: "static",
    status: "live",
  },
  {
    id: "headline",
    title: "מחולל כותרות (Headline)",
    desc: "כותרת פרופיל לפי 3 הנוסחאות מפרק 2. ממלאים שאלון, מקבלים 5 וריאציות.",
    href: "/tools/headline",
    type: "ai",
    status: "live",
  },
  {
    id: "poll",
    title: "מחולל סקרים ללינקדאין",
    desc: "בחרו קטגוריה וטון, קבלו 3 רעיונות סקר מוכנים עם אופציות, פתיח לפוסט ולמה זה עובד. לפי פרק 3.",
    href: "/tools/poll",
    type: "ai",
    status: "live",
  },
  {
    id: "cover-text",
    title: "טקסט לבאנר",
    desc: "פרומפט שבונה את הטקסט, הפריסה ופרומפט התמונה לבאנר, עם מדריך מהיר ודוגמאות.",
    href: "/tools/cover-text",
    type: "static",
    status: "live",
  },
  {
    id: "about",
    title: "כתיבת אודות (About)",
    desc: "פרומפט שמלווה אתכם שלב אחרי שלב לבנות About במבנה דף נחיתה, מוכן להעתקה.",
    href: "/tools/about",
    type: "static",
    status: "live",
  },
  {
    id: "connections",
    title: "תבניות הודעות חיבור",
    desc: "ספריית תבניות מוכנות להעתקה לבקשות חיבור ולהודעות, לפי סוג הקשר ומתי להשתמש.",
    href: "/tools/connections",
    type: "static",
    status: "live",
  },
  {
    id: "posts",
    title: "תבניות פוסטים",
    desc: "תבניות פוסט מוכנות עם מקומות למילוי, לפי מטרת התוכן.",
    type: "static",
    status: "soon",
  },
  {
    id: "circulation-guide",
    title: "סקיל \"הסירקולציה\" להורדה",
    desc: "המבנה שפירקתי בקורס, עכשיו בסקיל להורדה: סקרנות → פגיעות → אוטוריטה. שלושה סוגי פוסטים. פרומפטים וסקיל מוכן להורדה.",
    href: "https://www.octagoodies.com/circulation-post-guide",
    external: true,
    type: "static",
    status: "live",
  },
  {
    id: "linkedin-commenter",
    title: "LinkedIn Commenter Pro",
    desc: "תוסף כרום חינמי שמנסח לכם תגובות בלינקדאין בקול שלכם ובשפת הפוסט.",
    href: "https://www.octagoodies.com/linkedin-commenter-pro",
    external: true,
    type: "static",
    status: "live",
  },
  {
    id: "b2b-outreach",
    title: "עוזר חיפוש הלקוח האידיאלי",
    desc: "כלי שעוזר לאתר ולמפות את הלקוחות האידיאליים (ICP) שלכם לפנייה ממוקדת.",
    href: "https://www.octagoodies.com/b2b-cluster",
    external: true,
    type: "static",
    status: "live",
  },
  {
    id: "meeting-links",
    title: "לינק לפגישה",
    desc: "מדריך שלב-אחר-שלב ליצירת לינק שבו אנשים קובעים איתכם פגישה. 3 דרכים: Calendly, Google Appointments, Notion Calendar.",
    href: "https://www.octagoodies.com/meeting-links",
    external: true,
    type: "static",
    status: "live",
  },
  {
    id: "presence-score",
    title: "LinkedIn Presence Score",
    desc: "סריקת פרופיל של 3 דקות. ציון מתוך 100 ותובנות לפי מה שלמדתן בפרק 2: כותרת, About, באנר, תוכן ורשת.",
    href: "https://www.octagoodies.com/linkedin-presence-score",
    external: true,
    type: "static",
    status: "live",
  },
  {
    id: "content-partner",
    title: "שותף תוכן AI",
    desc: "Gem ייעודי שעוזר לבנות voice, לוח תוכן 30 יום, ופוסטים.",
    type: "gem",
    status: "soon",
  },
  {
    id: "weekly-plan",
    title: "תוכנית 30 יום",
    desc: "צ'ק-ליסט שבועי מפרק 5: שבוע אחר שבוע + שגרה יומית. סמנו, עקבו, שלחו למייל.",
    href: "/tools/weekly-plan",
    type: "static",
    status: "live",
  },
];
