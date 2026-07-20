// Static copy for the "שיחת הקפה" tool (jobseeker track, standalone — no chapter).
// The page opens with the argument for why a job seeker should talk to people at all,
// and only then shows the generator. Every number here is tied to a named source with
// a live link; the research files this was pulled from live at research/07, /10, /11.
//
// Rule for editing this file: no claim without a named source. Two widely repeated
// numbers ("80% hidden job market", "75% auto-rejected") are listed as debunked on
// purpose — the research files trace both to vendors with no methodology.

export interface Citation {
  /** Author / org, year — rendered as the source line. */
  source: string;
  url: string;
  /** Where in the workspace research this was pulled from, for future editing. */
  ref: string;
}

export interface BackgroundBlock {
  heading: string;
  /** Paragraphs of the argument. The number lives inside the text, not separated from it. */
  body: string[];
  cite?: Citation;
}

export const COFFEE_CHAT_INTRO =
  "בקשת החיבור אושרה, נקבעה שיחה, ועכשיו יש 20 דקות עם מישהו שאתם רוצים ללמוד ממנו. הכלי הזה בונה לכם את השיחה: פתיח של 30 שניות שממצב אתכם בלי לבקש כלום, חמש שאלות שמדרגות מקליל לעמוק, שאלה אחת שאסור לשאול, והודעת המשך ליום שאחרי.";

/** Why bother reaching out to people at all. Rendered before the generator. */
export const WHY_BLOCKS: BackgroundBlock[] = [
  {
    heading: "ההגשה הקרה נכנסת לתחרות שקשה לנצח בה",
    body: [
      "88% מהמעסיקים הסכימו שמועמדים מיומנים מסוננים החוצה, כי הם לא תואמים לקריטריונים המדויקים של המשרה. הסינון קורה לפני שמישהו קרא משפט שכתבתם.",
    ],
    cite: {
      source: 'HBS ו-Accenture, "Hidden Workers", 2021',
      url: "https://www.hbs.edu/ris/Publication%20Files/hiddenworkers09032021_Fuller_white_paper_33a2047f-41dd-47b1-9a8d-bd08cf3bfa94.pdf",
      ref: "research/11:57-60",
    },
  },
  {
    heading: "והשוק מתכווץ בזמן שזה קורה",
    body: [
      "מדד קצב הגיוס בארה\"ב התכווץ ב-1.4% בחודש, הירידה החדה מאז נובמבר 2023. בהייטק המספר עומד על מינוס 3.1%.",
    ],
    cite: {
      source: "LinkedIn Economic Graph Labor Market Report, ינואר 2026",
      url: "https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/linkedIn-labor-market-report-building-a-future-of-work-that-works-jan-2026.pdf",
      ref: "research/10:23-24",
    },
  },
  {
    heading: "מה שכן עובד: הפניה",
    body: [
      "רפרלים הם כאחוז אחד מכלל ההגשות. מתוך המועמדים המופנים, 40% עוברים מהגשה לראיון, ו-16% מגיעים לשלב ההצעה. הניתוח נשען על 38 מיליון הגשות ל-93,000 משרות.",
      "בין 2021 ל-2024 חלקם של הרפרלים בהגשות ירד משני אחוזים לפחות מאחוז, ויתרון ההמרה שלהם נשמר. ככל שההגשות הקרות מוצפות, הערך של הפניה עולה. והפניה מגיעה מאדם.",
    ],
    cite: {
      source: "Ashby Talent Trends Report, 2021-2024",
      url: "https://www.ashbyhq.com/talent-trends-report/reports/referrals",
      ref: "research/10:12-18",
    },
  },
  {
    heading: "ומאיזה סוג אדם",
    body: [
      "מחקר על 20 מיליון משתמשי לינקדאין לאורך חמש שנים עקב אחרי שני מיליארד קשרים חדשים ו-600,000 משרות חדשות. הקשרים שהניבו הכי הרבה מעברי עבודה היו הקשרים החלשים-בינוניים, בערך עשרה מכרים משותפים. החברים הקרובים הניבו פחות.",
      "ההיגיון פשוט: מי שקרוב אליכם יודע מה שאתם יודעים. מי שרחוק במידה הנכונה מחזיק מידע והזדמנויות שעוד לא הגיעו אליכם.",
    ],
    cite: {
      source: "Rajkumar, Saint-Jacques, Bojinov, Brynjolfsson, Aral. Science, ספטמבר 2022",
      url: "https://www.science.org/doi/10.1126/science.abl4476",
      ref: "research/07:14-17",
    },
  },
  {
    heading: "גישור בין קבוצות מנותקות משתלם",
    body: [
      "מי שמגשר בין קבוצות שאינן מכירות זו את זו מרוויח יותר, מקבל הערכות טובות יותר ומקודם יותר. השיחה עם מישהו מחוץ למעגל הנוכחי שלכם היא בדיוק הגשר הזה.",
    ],
    cite: {
      source: 'Burt, "Structural Holes and Good Ideas", American Journal of Sociology, 2004',
      url: "http://www.ronaldsburt.com/research/files/SHGI.pdf",
      ref: "research/07:20-22",
    },
  },
  {
    heading: "למה השיחה עצמה חשובה, ולא רק החיבור",
    body: [
      "מטא-אנליזה על 18 מחקרים, 42 גדלי אפקט ו-8,635 נבדקים מצאה שקידום עצמי מתואם עם ציוני ראיון (rc=0.24, מובהק סטטיסטית), ואינו מתואם עם ציוני ביצועים בעבודה (rc=0.18, לא מובהק).",
      "בפועל זה אומר שהצגה עצמית עובדת חזק על מי שעוד לא מכיר את העבודה שלכם. השיחה הראשונה עם אדם חדש היא בדיוק החלון הזה. אצל מי שכבר עובד אתכם הדעה כבר נקבעה, ושם זה כמעט לא זז.",
    ],
    cite: {
      source: "Peck ו-Levashina, Frontiers in Psychology, פברואר 2017",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5309241/",
      ref: "research/07:31-33",
    },
  },
  {
    heading: "ההבדל בין מי שנותן עצה למי שממליץ עליכם",
    body: [
      "סקר Catalyst על יותר מ-4,000 עובדים בעלי פוטנציאל גבוה מצא שלנשים היו יותר מנטורים מגברים, והן הרוויחו 4,600 דולר פחות בתפקיד הראשון אחרי ה-MBA. ההבדל היה מי מדבר בשמן בחדר שבו ההחלטה מתקבלת.",
      "תמיכה כזאת נבנית מהוכחה לאורך זמן. השיחה הראשונה היא ההתחלה שלה, וזאת בדיוק הסיבה שאסור לבקש בה שום דבר.",
    ],
    cite: {
      source: "Ibarra, Carter, Silva. Harvard Business Review, ספטמבר 2010",
      url: "https://hbr.org/2010/09/why-men-still-get-more-promotions-than-women",
      ref: "research/07:24-27",
    },
  },
];

export interface Myth {
  claim: string;
  truth: string;
  cite?: Citation;
}

/** Two numbers every job seeker hears. Both trace back to vendors, not to research. */
export const MYTHS: Myth[] = [
  {
    claim: "80% מהמשרות לעולם לא מפורסמות",
    truth:
      "המספר מגיע מברנרד הלדיין, יועץ קריירה, בערך ב-1970, והוא לא נגזר משום מחקר. הרעיון שגיוס עובר דרך אנשים מבוסס היטב. המספר עצמו מומצא.",
  },
  {
    claim: "75% מקורות החיים נדחים אוטומטית על ידי המערכת",
    truth:
      "המספר שווק על ידי Preptel, ספקית אופטימיזציית קורות חיים, בערך ב-2012. החברה נסגרה באוגוסט 2013 ומעולם לא פרסמה מתודולוגיה. בשטח מסתובבות שלוש גרסאות שונות של אותו מספר: 70, 75 ו-88 אחוז.",
    cite: {
      source: "תחקיר: unchartedcareer.com, יולי 2026",
      url: "https://unchartedcareer.com/blog/the-75-of-resumes-are-auto-rejected-myth-traced-to-its-source",
      ref: "research/11:44-50",
    },
  },
];

/** Where the idea for this tool came from. */
export const SOURCE_ARTICLE = {
  title: "5 Ways to Use AI-Powered People Search to Grow Your Career",
  author: "Jill Raines, LinkedIn",
  date: "יוני 2026",
  url: "https://www.linkedin.com/pulse/5-ways-use-ai-powered-people-search-grow-your-career-jill-raines-a6yrc/",
  note:
    "המאמר מונה חמש דרכים למצוא את האדם הנכון, ונעצר שם. הכלי הזה מתחיל בנקודה שבה המאמר נגמר. שווה לדעת שאין בשום מקום נתון אמין על שיחות היכרות עצמן, אז הרקע כאן נשען על מה שכן נמדד: הפניות, מבנה רשת, ותזמון ההצגה העצמית.",
};

/** Shown under the results: the referral ask belongs to a different tool. */
export const COFFEE_CHAT_NO_REFERRAL_NOTE = {
  title: "הכלי הזה לא כותב את בקשת ההפניה",
  body:
    "וזה בכוונה. בקשת הפניה מגיעה אחרי שכבר הייתה שיחה אמיתית, והשיחה הזאת היא בדיוק מה שהכלי כאן מכין. כשתגיעו לשלב הבא, יש לו תרחיש משלו.",
  /** The jobseeker-track connections tool owns the referral ask (chapter 7 sequence). */
  href: "/tools/connections-jobs",
  linkLabel: "הודעות חיבור למחפשי עבודה, תרחיש בקשת ההפניה →",
};
