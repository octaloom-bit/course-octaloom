import Image from "next/image";
import LinkedInIcon from "@/components/LinkedInIcon";
import ChapterList from "@/components/ChapterList";

export default function CoursePage() {
  return (
    <div className="wrap">
      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          OctaLoom · קורס לינקדאין
        </span>
        <h1>
          קורס הלינקדאין שלכם, <span className="accent">צעד אחר צעד</span>
        </h1>
        <p className="sub">פתיח, פרק היכרות, ו-5 פרקים. בחרו פרק כדי לצפות.</p>
      </div>

      <section className="welcome">
        <Image className="wm" src="/brand/symbol-purple.png" alt="" width={200} height={200} />
        <h2>הייוש, שמחה שאתם.ן כאן 👋</h2>
        <p>
          הפרופיל שלכם בלינקדאין הוא הרבה מעבר ל&quot;נוכחות דיגיטלית&quot;. הוא <span className="accent">הנכס המרכזי</span> שלכם
          ב-2026. הקורס הזה נועד להפוך אותו ממקום שאנשים רק &quot;מבקרים בו&quot;, למנוע שיוצר פגישות ולקוחות באופן עקבי.
        </p>
        <p className="welcome-lead">אנחנו מדלגים על התיאוריות וניגשים ישר לאסטרטגיה שאני מיישמת בשטח.</p>

        <div className="outcomes-title">מה תלמדו ליישם בפועל</div>
        <div className="outcomes">
          <div className="outcome">
            <span className="oc-icon">✓</span>
            <div>
              <strong>פרופיל שהוא דף נחיתה ממיר</strong>
              <p>נבנה מחדש כותרת, About ובאנר שיגרמו לקהל היעד שלכם להבין בדיוק למה כדאי להם לפנות אליכם.</p>
            </div>
          </div>
          <div className="outcome">
            <span className="oc-icon">✓</span>
            <div>
              <strong>תוכן שיוצר שיחות</strong>
              <p>נלמד לכתוב פוסטים שמניעים אנשים להגיב ולפנות בפרטי, במקום רק &quot;לייקים&quot; שלא מתרגמים לכלום.</p>
            </div>
          </div>
          <div className="outcome">
            <span className="oc-icon">✓</span>
            <div>
              <strong>מערך Social Selling</strong>
              <p>נטמיע ליד מגנט ואסטרטגיות שהופכות עוקבים מתעניינים ללקוחות משלמים.</p>
            </div>
          </div>
          <div className="outcome">
            <span className="oc-icon">✓</span>
            <div>
              <strong>מפת דרכים ל-30 יום</strong>
              <p>לא יוצאים עם ידע תיאורטי בלבד. תקבלו תוכנית פעולה ברורה לכל שבוע, כדי שתתחילו לייצר תוצאות כבר מהיום הראשון.</p>
            </div>
          </div>
        </div>

        <div className="welcome-contact">
          יש לכם שאלות, טענות או בקשות? אני מזמינה אתכם לפנות אליי ישירות:{" "}
          <a href="mailto:Hanita@octaloom.com">Hanita@octaloom.com</a>
        </div>
      </section>

      <ChapterList />
    </div>
  );
}
