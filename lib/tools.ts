// Registry of course helper tools shown on the dashboard.
// Two independent axes slice this list:
//   - `audience` drives the tab filter (הכל / לעצמאים / מחפשי עבודה)
//   - `group` drives the side nav sections on /tools
// Both apply at once: picking "מחפשי עבודה" narrows the list, and the groups
// that end up empty are hidden along with their nav entries.

export type ToolType = "ai" | "static" | "gem";
export type ToolStatus = "live" | "soon";
export type ToolGroup = "profile" | "content" | "outreach" | "plan";

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
  /** Section on the /tools dashboard. */
  group: ToolGroup;
}

export type ToolFilter = "all" | "business" | "jobseeker";

export const TOOL_FILTERS: { id: ToolFilter; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "business", label: "לעצמאים ובעלי עסק" },
  { id: "jobseeker", label: "למחפשי עבודה" },
];

/** Section order on the dashboard, and the side-nav labels. */
export const TOOL_GROUPS: { id: ToolGroup; label: string; blurb: string }[] = [
  {
    id: "profile",
    label: "אופטימיזציה של הפרופיל",
    blurb: "הנכסים שמקימים פעם אחת ומתחזקים: כותרת, About, באנר, תמונה, כישורים.",
  },
  {
    id: "content",
    label: "תוכן",
    blurb: "מה שמייצרים שוב ושוב: פוסטים, קרוסלות, סקרים ותגובות.",
  },
  {
    id: "outreach",
    label: "נטוורקינג ופניות",
    blurb: "למצוא את האדם הנכון, לפתוח שיחה, ולנהל אותה.",
  },
  {
    id: "plan",
    label: "תוכנית 30 יום",
    blurb: "הסדר שבו עושים את כל זה.",
  },
];

/** A tool with no audience serves everyone, so it shows under every filter. */
export function toolsForAudience(filter: ToolFilter): Tool[] {
  if (filter === "all") return TOOLS;
  return TOOLS.filter((t) => !t.audience || t.audience === filter);
}

/** Tools grouped for the dashboard, in TOOL_GROUPS order. Empty groups are dropped. */
export function groupedTools(
  filter: ToolFilter,
): { group: (typeof TOOL_GROUPS)[number]; tools: Tool[] }[] {
  const visible = toolsForAudience(filter);
  return TOOL_GROUPS.map((group) => ({
    group,
    tools: visible.filter((t) => t.group === group.id),
  })).filter((s) => s.tools.length > 0);
}

// Order matters: this is the display order within each group on /tools.
export const TOOLS: Tool[] = [
  // ---------- אופטימיזציה של הפרופיל ----------
  {
    id: "presence-score",
    title: "LinkedIn Presence Score",
    desc: "סריקת פרופיל של 3 דקות. ציון מתוך 100 ותובנות לפי מה שלמדתן בפרק 2: כותרת, About, באנר, תוכן ורשת.",
    href: "https://www.octagoodies.com/linkedin-presence-score",
    external: true,
    type: "static",
    status: "live",
    chapters: ["chapter-0", "chapter-1", "chapter-2"],
    group: "profile",
  },
  {
    id: "profile-photo",
    title: "פרומפטים לתמונה ראשית",
    desc: "פרומפטים מוכנים ליצירת תמונה ראשית מקצועית מתמונה רגילה שלכם, עם מדריך לפי ChatGPT ו-Gemini.",
    href: "/tools/profile-photo",
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
    group: "profile",
  },
  {
    id: "headline",
    title: "מחולל כותרות (Headline)",
    desc: "כותרת פרופיל לפי 3 הנוסחאות מפרק 2. ממלאים שאלון, מקבלים 5 וריאציות.",
    href: "/tools/headline",
    type: "ai",
    status: "live",
    chapters: ["chapter-2"],
    group: "profile",
  },
  {
    id: "about",
    title: "כתיבת אודות (About)",
    desc: "פרומפט שמלווה אתכם שלב אחרי שלב לבנות About במבנה דף נחיתה, מוכן להעתקה.",
    href: "/tools/about",
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
    group: "profile",
  },
  {
    id: "cover-text",
    title: "טקסט לבאנר",
    desc: "פרומפט שבונה את הטקסט, הפריסה ופרומפט התמונה לבאנר, עם מדריך מהיר ודוגמאות.",
    href: "/tools/cover-text",
    type: "static",
    status: "live",
    chapters: ["chapter-2"],
    group: "profile",
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
    group: "profile",
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
    group: "profile",
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
    group: "profile",
  },

  // ---------- תוכן ----------
  {
    id: "carousel",
    title: "מחולל קרוסלות ללינקדאין",
    desc: "מזינים נושא, ה-AI כותב קרוסלה מלאה לפי שיטת הסירקולציה, ואתם עורכים, ממתגים, בוחרים צבעים ומורידים PDF מוכן לפוסט מסמך.",
    href: "/tools/carousel",
    type: "ai",
    status: "live",
    chapters: ["chapter-3"],
    group: "content",
  },
  {
    id: "poll",
    title: "מחולל סקרים ללינקדאין",
    desc: "בחרו קטגוריה וטון, קבלו 3 רעיונות סקר מוכנים עם אופציות, פתיח לפוסט ולמה זה עובד. לפי פרק 3.",
    href: "/tools/poll",
    type: "ai",
    status: "live",
    chapters: ["chapter-3"],
    group: "content",
  },
  {
    id: "posts",
    title: "תבניות פוסטים",
    desc: "תבניות פוסט מוכנות עם מקומות למילוי, לפי מטרת התוכן.",
    type: "static",
    status: "soon",
    chapters: ["chapter-3"],
    group: "content",
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
    group: "content",
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
    group: "content",
  },
  {
    id: "identity-audit",
    title: "Identity Audit",
    desc: "3 שאלות מפרק 5 שמוצאות את הזווית שרק אתם מביאים. נוסחת הבידול שלכם בתוכן.",
    href: "/tools/identity-audit",
    type: "static",
    status: "live",
    chapters: ["chapter-5"],
    group: "content",
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
    group: "content",
  },
  {
    id: "content-partner",
    title: "שותף תוכן AI",
    desc: "Gem ייעודי שעוזר לבנות voice, לוח תוכן 30 יום, ופוסטים.",
    type: "gem",
    status: "soon",
    chapters: ["chapter-5"],
    group: "content",
  },

  // ---------- נטוורקינג ופניות ----------
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
    group: "outreach",
  },
  {
    id: "connections",
    title: "מחולל הודעות חיבור",
    desc: "מדביקים פוסט של הפרוספקט, בוחרים תרחיש, ומקבלים 3 הודעות אישיות לפי שיטת הקורס. כולל ספריית התבניות המלאה.",
    href: "/tools/connections",
    type: "ai",
    status: "live",
    chapters: ["chapter-4"],
    audience: "business",
    group: "outreach",
  },
  {
    id: "connections-jobs",
    title: "הודעות חיבור למחפשי עבודה",
    desc: "ארבעה תרחישים לפי הרצף מפרק 7: מתחברים למישהו מהצוות, פותחים שיחה אמיתית, ורק אז מבקשים הפניה למשרה.",
    href: "/tools/connections-jobs",
    type: "ai",
    status: "live",
    chapters: ["chapter-7"],
    audience: "jobseeker",
    group: "outreach",
  },
  {
    id: "coffee-chat",
    title: "קפה זום",
    desc: "בקשת החיבור אושרה, נקבעה שיחה, ואין לכם מושג מה לשאול. מקבלים פתיח של 30 שניות, 5 שאלות מדורגות, שאלה אחת שאסור לשאול, והודעת המשך ליום שאחרי.",
    href: "/tools/coffee-chat",
    type: "ai",
    status: "live",
    audience: "jobseeker",
    group: "outreach",
  },

  // ---------- תוכנית 30 יום ----------
  {
    id: "weekly-plan",
    title: "תוכנית 30 יום",
    desc: "צ'ק-ליסט שבועי מפרק 5: שבוע אחר שבוע + שגרה יומית. סמנו, עקבו, שלחו למייל.",
    href: "/tools/weekly-plan",
    type: "static",
    status: "live",
    chapters: ["chapter-5"],
    group: "plan",
  },
];

/** Live tools attached to a chapter, in the dashboard display order. */
export function toolsForChapter(chapterId: string): Tool[] {
  return TOOLS.filter(
    (t) => t.status === "live" && t.href && t.chapters?.includes(chapterId),
  );
}
