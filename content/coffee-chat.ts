// Static copy for the "קפה זום" tool (jobseeker track, standalone — no chapter).
// The route slug stays /tools/coffee-chat; only the display name changed.
// The page opens with a short argument for why a job seeker should talk to people,
// then the generator. Every number is tied to a named source with a live link.
//
// Rule for editing this file: no claim without a named source. Two widely repeated
// numbers ("80% hidden job market", "75% auto-rejected") are listed as debunked on
// purpose — the research files trace both to vendors with no methodology.
//
// Deliberately cut to keep the page short (all still in the research files if ever
// needed): Burt 2004 structural holes (research/07:20-22), Ibarra/Catalyst HBR 2010
// sponsorship (research/07:24-27), LinkedIn Economic Graph hiring rate (research/10:23-24).

export interface Citation {
  /** Author / org, year — rendered as the source line. */
  source: string;
  url: string;
  /** Where in the workspace research this came from, for future editing. */
  ref: string;
}

export interface BackgroundBlock {
  heading: string;
  body: string[];
  cites: Citation[];
}

export const COFFEE_CHAT_INTRO =
  "בקשת החיבור אושרה, נקבעה שיחה, ועכשיו יש 20 דקות עם מישהו שאתם רוצים ללמוד ממנו. הכלי הזה בונה לכם את השיחה: פתיח של 30 שניות שממצב אתכם בלי לבקש כלום, חמש שאלות שמדרגות מקליל לעמוק, שאלה אחת שאסור לשאול, והודעת המשך ליום שאחרי.";

/** Why bother reaching out at all. Two blocks, no more — the page is a tool, not an essay. */
export const WHY_BLOCKS: BackgroundBlock[] = [
  {
    heading: "הערך של הפניה (Referral)",
    body: [
      "88% מהמעסיקים הסכימו שמועמדים מיומנים מסוננים החוצה, כי הם לא תואמים לקריטריונים המדויקים של המשרה. הסינון קורה לפני שמישהו קרא משפט שכתבתם.",
      "רפרלים, לעומת זאת, הם כאחוז אחד מכלל ההגשות. מתוך המועמדים המופנים, 40% עוברים מהגשה לראיון ו-16% מגיעים לשלב ההצעה. הניתוח נשען על 38 מיליון הגשות ל-93,000 משרות. ככל שההגשות הקרות מוצפות, הערך של הפניה עולה, והפניה מגיעה מאדם.",
    ],
    cites: [
      {
        source: 'HBS ו-Accenture, "Hidden Workers", 2021',
        url: "https://www.hbs.edu/ris/Publication%20Files/hiddenworkers09032021_Fuller_white_paper_33a2047f-41dd-47b1-9a8d-bd08cf3bfa94.pdf",
        ref: "research/11:57-60",
      },
      {
        source: "Ashby Talent Trends Report, 2021-2024",
        url: "https://www.ashbyhq.com/talent-trends-report/reports/referrals",
        ref: "research/10:12-18",
      },
    ],
  },
  {
    heading: "ההצגה העצמית שלכם עובדת הכי חזק על מי שעוד לא מכיר את העבודה שלכם",
    body: [
      "מחקר על 20 מיליון משתמשי לינקדאין לאורך חמש שנים עקב אחרי 600,000 משרות חדשות. הקשרים שהניבו הכי הרבה מעברי עבודה היו הקשרים החלשים-בינוניים, בערך עשרה מכרים משותפים. החברים הקרובים הניבו פחות, כי מי שקרוב אליכם יודע מה שאתם כבר יודעים.",
      "ומטא-אנליזה על 8,635 נבדקים מצאה שקידום עצמי מתואם עם ציוני ראיון (rc=0.24, מובהק), ואינו מתואם עם ציוני ביצועים בעבודה (rc=0.18, לא מובהק). כלומר ההצגה העצמית שלכם עובדת הכי חזק על מי שעוד לא מכיר את העבודה שלכם. השיחה הראשונה היא בדיוק החלון הזה.",
    ],
    cites: [
      {
        source: "Rajkumar ואחרים, Science, ספטמבר 2022",
        url: "https://www.science.org/doi/10.1126/science.abl4476",
        ref: "research/07:14-17",
      },
      {
        source: "Peck ו-Levashina, Frontiers in Psychology, 2017",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5309241/",
        ref: "research/07:31-33",
      },
    ],
  },
];

export interface Myth {
  claim: string;
  truth: string;
  cite?: Citation;
}

/** Rendered as an accordion. Both numbers trace back to vendors, not to research. */
export const MYTHS: Myth[] = [
  {
    claim: "80% מהמשרות לעולם לא מפורסמות",
    truth:
      "המספר מגיע מברנרד הלדיין, יועץ קריירה, בערך ב-1970, והוא לא נגזר משום מחקר. הרעיון שגיוס עובר דרך אנשים מבוסס היטב. המספר עצמו מומצא.",
  },
  {
    claim: "75% מקורות החיים נדחים אוטומטית",
    truth:
      "המספר שווק על ידי Preptel, ספקית אופטימיזציית קורות חיים, בערך ב-2012. החברה נסגרה באוגוסט 2013 ומעולם לא פרסמה מתודולוגיה. בשטח מסתובבות שלוש גרסאות של אותו מספר: 70, 75 ו-88 אחוז.",
    cite: {
      source: "תחקיר unchartedcareer.com, יולי 2026",
      url: "https://unchartedcareer.com/blog/the-75-of-resumes-are-auto-rejected-myth-traced-to-its-source",
      ref: "research/11:44-50",
    },
  },
];

export const MYTHS_INTRO =
  "שניהם מסתובבים בכל קבוצת מחפשי עבודה, ושניהם הגיעו מספקים מסחריים בלי מתודולוגיה מאחוריהם.";

/** Where the idea for this tool came from. */
export const SOURCE_ARTICLE = {
  title: "5 Ways to Use AI-Powered People Search to Grow Your Career",
  author: "Jill Raines, LinkedIn",
  date: "יוני 2026",
  url: "https://www.linkedin.com/pulse/5-ways-use-ai-powered-people-search-grow-your-career-jill-raines-a6yrc/",
  note: "המאמר מונה חמש דרכים למצוא את האדם הנכון, ונעצר שם. הכלי הזה מתחיל בנקודה שבה המאמר נגמר.",
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
