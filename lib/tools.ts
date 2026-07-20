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
  /** Chapter ids (from lib/chapters.ts) this tool belongs to.
   *  Drives the tool list shown on each lesson page. */
  chapters?: string[];
  /** Which track the tool serves. Omit when it serves both,
   *  which is the case for most of them. Drives the filter on /tools. */
  audience?: "business" | "jobseeker";
}

export type ToolFilter = "all" | "business" | "jobseeker";

export const TOOL_FILTERS: { id: ToolFilter; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "business", label: "לעצמאים ובעלי עסק" },
  { id: "jobseeker", label: "למחפשי עבודה" },
];

/** A tool with no audience serves everyone, so it shows under every filter. */
export function toolsForAudience(filter: ToolFilter): Tool[] {
  if (filter === "all") return TOOLS;
  return TOOLS.filter((t) => !t.audience || t.audience === filter);
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
    chapters: ["chapter-3"],
  },
  {
    id: "identity-audit",
    title: "Identity Audit",
    desc: "3 שאלות מפרק 5 שמוצאות את הזווית שרק אתם מביאים. נוסחת הבידול שלכם בתוכן.",
    href: "/tools/identity-audit",
    type: "static",
    status: "live",
    chapters: ["chapter-5"],
  },
  {
    id: "profile-photo",
    title: "פרומפטים לתמונה ראשית",
    desc: "פרומפטים מוכנים ליצירת תמונה ראשית מקצועית מתמונה רגילה שלכם, עם מדריך לפי ChatGPT ו-Gemini.",
    href: "/tools/profile-photo",
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
  },
  {
    id: "headline",
    title: "מחולל כותרות (Headline)",
    desc: "כותרת פרופיל לפי 3 הנוסחאות מפרק 2. ממלאים שאלון, מקבלים 5 וריאציות.",
    href: "/tools/headline",
    type: "ai",
    status: "live",
    chapters: ["chapter-2"],
  },
  {
    id: "skills",
    title: "סורק הכישורים (Skills)",
    desc: "מדביקים את סעיף הניסיון, וסורקים אילו כישורים נופלים בין הכיסאות. שתי דקות, וזה הדבר הכי משתלם בפרק 6 ליחידת זמן.",
    href: "/tools/skills",
    type: "static",
    status: "live",
    chapters: ["chapter-1", "chapter-6"],
    audience: "jobseeker",
  },
  {
    id: "case-study",
    title: "פוסט קייס סטאדי",
    desc: "סיפור אחד מהעבודה שלכם הופך לפוסט בארבעה חלקים, עם סגירה שאומרת שאתם מחפשים בלי להתחנן. לפי פרק 7.",
    href: "/tools/case-study",
    type: "static",
    status: "live",
    chapters: ["chapter-3", "chapter-7"],
    audience: "jobseeker",
  },
  {
    id: "poll",
    title: "מחולל סקרים ללינקדאין",
    desc: "בחרו קטגוריה וטון, קבלו 3 רעיונות סקר מוכנים עם אופציות, פתיח לפוסט ולמה זה עובד. לפי פרק 3.",
    href: "/tools/poll",
    type: "ai",
    status: "live",
    chapters: ["chapter-3"],
  },
  {
    id: "cover-text",
    title: "טקסט לבאנר",
    desc: "פרומפט שבונה את הטקסט, הפריסה ופרומפט התמונה לבאנר, עם מדריך מהיר ודוגמאות.",
    href: "/tools/cover-text",
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
  },
  {
    id: "about",
    title: "כתיבת אודות (About)",
    desc: "פרומפט שמלווה אתכם שלב אחרי שלב לבנות About במבנה דף נחיתה, מוכן להעתקה.",
    href: "/tools/about",
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
  },
  {
    id: "connections",
    title: "מחולל הודעות חיבור",
    desc: "מדביקים פוסט של הפרוספקט, בוחרים תרחיש, ומקבלים 3 הודעות אישיות לפי שיטת הקורס. כולל ספריית התבניות המלאה.",
    href: "/tools/connections",
    type: "ai",
    status: "live",
    chapters: ["chapter-4"],
  },
  {
    id: "posts",
    title: "תבניות פוסטים",
    desc: "תבניות פוסט מוכנות עם מקומות למילוי, לפי מטרת התוכן.",
    type: "static",
    status: "soon",
    chapters: ["chapter-3"],
  },
  {
    id: "circulation-guide",
    title: "סקיל \"הסירקולציה\" להורדה",
    desc: "המבנה שפירקתי בקורס, עכשיו בסקיל להורדה: סקרנות → פגיעות → אוטוריטה. שלושה סוגי פוסטים. פרומפטים וסקיל מוכן להורדה.",
    href: "https://www.octagoodies.com/circulation-post-guide",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-3"],
  },
  {
    id: "linkedin-commenter",
    title: "LinkedIn Commenter Pro",
    desc: "תוסף כרום חינמי שמנסח לכם תגובות בלינקדאין בקול שלכם ובשפת הפוסט.",
    href: "https://www.octagoodies.com/linkedin-commenter-pro",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-3", "chapter-4"],
  },
  {
    id: "linkedin-formatter",
    title: "מעצב טקסט ללינקדאין",
    desc: "הופכים טקסט רגיל לבולד, איטליק, קו תחתון וחצים בעזרת יוניקוד, טקסט אמיתי שמדביקים בכל שדה: פוסט, כותרת, About או תגובה.",
    href: "https://www.octagoodies.com/linkedin-formatter",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
  },
  {
    id: "b2b-outreach",
    title: "עוזר חיפוש הלקוח האידיאלי",
    desc: "כלי שעוזר לאתר ולמפות את הלקוחות האידיאליים (ICP) שלכם לפנייה ממוקדת.",
    href: "https://www.octagoodies.com/b2b-cluster",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-3", "chapter-4"],
    audience: "business",
  },
  {
    id: "meeting-links",
    title: "לינק לפגישה",
    desc: "מדריך שלב-אחר-שלב ליצירת לינק שבו אנשים קובעים איתכם פגישה. 3 דרכים: Calendly, Google Appointments, Notion Calendar.",
    href: "https://www.octagoodies.com/meeting-links",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-2", "chapter-4"],
  },
  {
    id: "presence-score",
    title: "LinkedIn Presence Score",
    desc: "סריקת פרופיל של 3 דקות. ציון מתוך 100 ותובנות לפי מה שלמדתן בפרק 2: כותרת, About, באנר, תוכן ורשת.",
    href: "https://www.octagoodies.com/linkedin-presence-score",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-0", "chapter-1", "chapter-2"],
  },
  {
    id: "content-partner",
    title: "שותף תוכן AI",
    desc: "Gem ייעודי שעוזר לבנות voice, לוח תוכן 30 יום, ופוסטים.",
    type: "gem",
    status: "soon",
    chapters: ["chapter-5"],
  },
  {
    id: "weekly-plan",
    title: "תוכנית 30 יום",
    desc: "צ'ק-ליסט שבועי מפרק 5: שבוע אחר שבוע + שגרה יומית. סמנו, עקבו, שלחו למייל.",
    href: "/tools/weekly-plan",
    type: "static",
    status: "live",
    chapters: ["chapter-5"],
  },
];

/** Live tools attached to a chapter, in the dashboard display order. */
export function toolsForChapter(chapterId: string): Tool[] {
  return TOOLS.filter(
    (t) => t.status === "live" && t.href && t.chapters?.includes(chapterId),
  );
}
