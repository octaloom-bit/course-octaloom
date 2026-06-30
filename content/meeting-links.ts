// Content for the "לינק לפגישה" tool: three step-by-step guides for creating a
// shareable booking link (Calendly, Google Appointment Schedule, Notion Calendar).
// Written fresh in Hanita's voice. Steps verified against each product's current flow
// (June 2026). All three have a free tier that covers a single one-on-one booking link.

export const MEETING_LINKS_INTRO =
  "אחרי שמישהו מתחמם אליכם בלינקדאין, השלב הבא הוא שיחה. ובמקום עשרה הודעות של ׳מתי לך נוח?׳, שולחים לינק אחד שבו הצד השני בוחר שעה פנויה והפגישה נכנסת ליומן לבד. כאן שלושה כלים חינמיים שעושים בדיוק את זה. בחרו אחד, הוא מספיק.";

export const MEETING_LINKS_HOWTO_NOTE =
  "כל השלושה חינמיים לרמה של לינק פגישה אחד, וכולם מתחברים ליומן שלכם כדי לא לקבוע על שעה תפוסה. אם אין לכם העדפה, קלנדלי הוא הכי מהיר להתחלה.";

export interface GuideStep {
  text: string;
  // optional literal to copy/click, shown in a mono frame
  code?: string;
}

export interface MeetingGuide {
  id: string;
  label: string; // tab label
  tagline: string; // one line under the tab
  steps: GuideStep[];
  tip?: string;
}

export const GUIDES: MeetingGuide[] = [
  {
    id: "calendly",
    label: "Calendly",
    tagline: "הכי מהיר להתחלה. נרשמים, מחברים יומן, מקבלים לינק.",
    steps: [
      { text: "נכנסים ל-calendly.com ונרשמים בחינם (אפשר עם חשבון Google, חוסך זמן)." },
      { text: "בתהליך ההרשמה מחברים את היומן שלכם (Google או Outlook). זה מה שמונע קביעה על שעה שכבר תפוסה." },
      { text: "מגדירים זמינות: אילו ימים ושעות אתם פתוחים לפגישות. אפשר לשנות את זה מתי שרוצים." },
      { text: "יוצרים Event Type חדש מסוג One-on-One. נותנים שם (למשל ׳שיחת היכרות 30 דקות׳), בוחרים משך, ובוחרים איפה הפגישה מתקיימת (Google Meet, Zoom או טלפון)." },
      { text: "מסיימים, ואז עוברים עם העכבר על כרטיס ה-Event ולוחצים Copy link. זה הלינק שלכם, נראה ככה:", code: "calendly.com/your-name/30min" },
      { text: "מדביקים אותו ב-Featured של הפרופיל, בהודעת DM, או באודות. כל מי שלוחץ בוחר שעה והפגישה נכנסת לשניכם ליומן." },
    ],
    tip: "הגרסה החינמית נותנת Event Type אחד פעיל. זה מספיק לחלוטין כדי להתחיל לקבוע שיחות.",
  },
  {
    id: "google",
    label: "Google Appointments",
    tagline: "בתוך Google Calendar שכבר יש לכם. בלי כלי נוסף.",
    steps: [
      { text: "פותחים את Google Calendar במחשב (calendar.google.com). זה עובד גם בחשבון Google פרטי חינמי, לא צריך Workspace." },
      { text: "לוחצים Create (יצירה) למעלה משמאל, ובוחרים Appointment schedule (לוח זמנים לפגישות)." },
      { text: "ממלאים: כותרת, משך הפגישה, ובאיזה ימים ושעות אתם זמינים. אפשר גם להגדיר חלון התראה מראש." },
      { text: "לוחצים Next, ובוחרים את אופן הפגישה: Google Meet, טלפון או פרונטלי. אפשר להוסיף תיאור קצר ושאלות לטופס ההזמנה." },
      { text: "לוחצים Save. עכשיו לוחצים על האירוע ביומן ובוחרים Open booking page או Share, ואז Copy link." },
      { text: "שולחים את הלינק. הצד השני רואה רק את השעות הפנויות שלכם, בוחר אחת, וזה נכנס ליומן של שניכם אוטומטית." },
    ],
    tip: "בחשבון Google פרטי חינמי יש לוח פגישות אחד. חלק מהפיצ׳רים המתקדמים דורשים Workspace, אבל לינק פגישה בסיסי עובד חינם.",
  },
  {
    id: "notion",
    label: "Notion Calendar",
    tagline: "אם אתם כבר בעולם של נושן. חינמי לגמרי.",
    steps: [
      { text: "מורידים את Notion Calendar (calendar.notion.so) ומתחברים עם חשבון Google. הוא מתחבר ליומן שלכם אוטומטית." },
      { text: "בתפריט הצד פותחים את ה-Scheduling ולוחצים Share availability (שיתוף זמינות)." },
      { text: "על היומן עצמו מסמנים בגרירה את משבצות הזמן שאתם פנויים בהן. אפשר לסמן כמה משבצות, גם לאורך כמה ימים." },
      { text: "לוחצים Create. רוצים להתאים? דרך Customize link אפשר לשנות את הכתובת, להוסיף לינק וידאו, תיאור או תאריך תפוגה." },
      { text: "לוחצים על ה-••• ובוחרים Copy scheduling link. זה הלינק לשליחה." },
      { text: "הצד השני נכנס, בוחר משבצת, והפגישה נכנסת ליומן שלכם. הלינק נשאר פעיל כל עוד יש משבצות פנויות, אז כמה אנשים יכולים לקבוע מאותו לינק." },
    ],
    tip: "השיטה של נושן עובדת לפי משבצות שאתם מסמנים ידנית, אז היא מצוינת לתקופה עמוסה שבה אתם פותחים רק כמה חלונות ספציפיים.",
  },
];
