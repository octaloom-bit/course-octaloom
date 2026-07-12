// 30-day action plan from Chapter 5. Content follows the actual chapter transcript
// (VEED subtitles, Jun 10 2026), not the polished pre-script. Hebrew reviewed with
// hebrew-writer: no em-dashes, pro-drop, English terms only where Hanita used them.

// A clickable (or pending) link inside an item's text. `match` is the exact substring
// to turn into a link. `pending` renders a colored marker instead of a real link
// (the target tool is not built yet).
export interface PlanLink {
  match: string;
  href: string;
  external?: boolean;
  pending?: boolean;
}

export interface PlanItem {
  id: string;
  text: string;
  links?: PlanLink[];
  /** How long the task actually takes. Drives the calendar export (.ics) event length. */
  minutes?: number;
}

export interface PlanSection {
  id: string;
  title: string;
  meta: string;
  items: PlanItem[];
}

export const PLAN: PlanSection[] = [
  {
    id: "week1",
    title: "שבוע 1: הנחת היסודות",
    meta: "עושים אותו פעם אחת ועוברים הלאה.",
    items: [
      { id: "w1-audit", minutes: 10, text: "עושים Identity Audit, 10 דקות. יש לזה כלי כאן באתר.", links: [{ match: "Identity Audit", href: "/tools/identity-audit" }] },
      { id: "w1-profile", minutes: 30, text: "מעדכנים את הפרופיל במהלך השבוע: תמונה ובאנר.", links: [{ match: "תמונה", href: "/tools/profile-photo" }, { match: "באנר", href: "/tools/cover-text" }] },
      { id: "w1-headline", minutes: 20, text: "כותבים Headline (כותרת) לפי אחת משלוש הנוסחאות מפרק 2.", links: [{ match: "Headline", href: "/tools/headline" }] },
      { id: "w1-about", minutes: 30, text: "מסדרים את ה-About ואת ה-Featured.", links: [{ match: "About", href: "/tools/about" }] },
      { id: "w1-connect", minutes: 20, text: "מוסיפים כ-50 חיבורים רלוונטיים: אנשים שהם ICP או IFP שלכם. מחפשים לפי טייטל וחברה. לא יותר מ-20 בקשות ביום, אחרת לינקדאין עלול לחשוב שאתם בוט.", links: [{ match: "טייטל וחברה", href: "https://www.octagoodies.com/b2b-cluster", external: true }] },
      { id: "w1-post", minutes: 30, text: "כותבים פוסט היכרות אחד בשיטת SLAA: סיפור אמיתי, לקח, עצה, שאלה. \"ככה אני עשיתי\", לא \"5 טיפים\".", links: [{ match: "בשיטת SLAA", href: "https://www.octagoodies.com/circulation-post-guide", external: true }] },
    ],
  },
  {
    id: "week2",
    title: "שבוע 2: מגבירים את הקצב",
    meta: "מתחילים את גישת הסירקולציה.",
    items: [
      { id: "w2-posts", minutes: 45, text: "מפרסמים 3 פוסטים השבוע: סקרנות, פגיעות, אוטוריטה. לפי ה-Identity Audit שלכם.", links: [{ match: "מפרסמים 3 פוסטים", href: "https://www.octagoodies.com/circulation-post-guide", external: true }, { match: "Identity Audit", href: "/tools/identity-audit" }] },
      { id: "w2-dm", minutes: 20, text: "שולחים 10 הודעות לאנשים שהתוכן שלהם עזר לכם, בלי אג'נדה. פשוט הודעה.", links: [{ match: "שולחים 10 הודעות", href: "/tools/connections" }] },
    ],
  },
  {
    id: "week34",
    title: "שבועות 3 ו-4: ניתוח ובניית lead magnet",
    meta: "אחרי שבועיים של תוכן עוצרים ומסתכלים מה עבד.",
    items: [
      { id: "w34-analytics", minutes: 30, text: "נכנסים לאנליטיקס ושואלים איזה פוסט הכי עבד. מסתכלים על מעורבות, לא לייקים: מי הגיב, האם ICP או IFP, האם הגיעו הודעות פרטיות בעקבות פוסט.", links: [{ match: "נכנסים לאנליטיקס", href: "https://www.linkedin.com/analytics/creator/content/", external: true }] },
      { id: "w34-double", minutes: 20, text: "מבינים מזה איזה סוג תוכן שווה להשקיע בו עוד, ועושים ממנו יותר." },
      { id: "w34-magnet", minutes: 60, text: "בונים lead magnet, ואז בודקים אם אנשים הורידו והשתמשו, ואם זה ייצר שיחות." },
    ],
  },
  {
    id: "daily",
    title: "שגרה יומית: 30 דקות",
    meta: "עבודת התחזוקה שמניעה את המנוע. חשובה בדיוק כמו התוכן.",
    items: [
      { id: "d-comments", minutes: 15, text: "15 דקות: מגיבים לפוסטים בפיד ולפוסטים של ה-ICP שלכם. תגובה עניינית מעל 15 מילים מכפילה את החשיפה שלכם. בלי \"יא אלופה\".", links: [{ match: "מגיבים לפוסטים", href: "https://www.octagoodies.com/linkedin-commenter-pro", external: true }] },
      { id: "d-dm", minutes: 5, text: "5 דקות: שולחים 2 עד 3 הודעות פרטיות ל-ICP שזיהיתם.", links: [{ match: "הודעות פרטיות", href: "/tools/connections" }] },
      { id: "d-connect", minutes: 5, text: "5 דקות: מוסיפים 2 עד 3 חיבורים חדשים רלוונטיים.", links: [{ match: "חיבורים חדשים רלוונטיים", href: "https://www.octagoodies.com/b2b-cluster", external: true }] },
      { id: "d-reply", minutes: 5, text: "5 דקות: עונים על תגובות שקיבלתם על הפוסט שלכם." },
    ],
  },
  {
    id: "measure",
    title: "מדדים: מה למדוד בסוף החודש",
    meta: "לייקים לא משלמים על הקפה של הבוקר. אלה המספרים שכן.",
    items: [
      { id: "m-dm", minutes: 15, text: "כמה DM נפתחו מתוך התוכן שלכם, ומאיזה פוסט." },
      { id: "m-connect", minutes: 10, text: "כמה אנשים שהם ICP שלכם הצטרפו לרשת." },
      { id: "m-leads", minutes: 15, text: "כמה הורידו את ה-lead magnet, נרשמו לניוזלטר, או הגיעו לאתר." },
      { id: "m-ssi", minutes: 5, text: "SSI: מציצים מדי פעם אם הציון עלה. זה vanity metric, אז לא להתאבסס עליו.", links: [{ match: "SSI", href: "https://www.linkedin.com/sales/ssi", external: true }] },
    ],
  },
];

// The 3 Identity Audit questions from Chapter 5 (חלק 1), verbatim from the transcript.
export const AUDIT_QUESTIONS: { id: string; q: string; ph: string }[] = [
  {
    id: "belief",
    q: "אילו אמונות על התחום שלכם אתם מחזיקים שרוב האנשים בתחום לא מסכימים איתן?",
    ph: "אני מאמין ש... למרות שרוב האנשים בתחום חושבים ש...",
  },
  {
    id: "mistake",
    q: "איזו טעות עשיתם שלימדה אתכם משהו שאף אחד לא מדבר עליו בקול?",
    ph: "פעם עשיתי... ומה שלמדתי ואף אחד לא אומר זה ש...",
  },
  {
    id: "process",
    q: "איזה תהליך פיתחתם שנותן תוצאות טובות יותר מהגישה הסטנדרטית בתחום שלכם?",
    ph: "במקום הדרך הרגילה, אני... וזה עובד יותר טוב כי...",
  },
];
