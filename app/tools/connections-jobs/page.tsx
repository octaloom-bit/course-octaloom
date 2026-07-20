import Link from "next/link";
import LinkedInIcon from "@/components/LinkedInIcon";
import ConnectionGenerator from "@/components/ConnectionGenerator";
import ToolNote from "@/components/ToolNote";

export default function ConnectionsJobsPage() {
  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי עזר לקורס · פרק 7
        </span>
        <h1 style={{ maxWidth: "none" }}>
          הודעות חיבור <span className="accent">למחפשי עבודה</span>
        </h1>
        <p className="sub" style={{ maxWidth: "62ch" }}>
          רוב האנשים פונים למגייסת. פרק 7 מלמד לפנות למישהו מהצוות עצמו, ולבקש את ההפניה רק אחרי
          שנוצרה שיחה אמיתית. ארבעת התרחישים כאן בנויים בדיוק לרצף הזה, לפי הסדר.
        </p>
      </div>

      <ConnectionGenerator audience="jobseeker" />

      <div className="card">
        <div className="step-label">הרצף, בקצרה</div>
        <ol className="howto">
          <li>
            <b>מתחברים.</b> בקשת חיבור למישהו בחברה שאתם מכוונים אליה, דרך משהו אמיתי שהוא כתב.
          </li>
          <li>
            <b>פותחים שיחה.</b> כמה ימים אחרי האישור, שאלה מקצועית אמיתית. בלי לרמוז שאתם מחפשים.
          </li>
          <li>
            <b>מבקשים, רק אם זה טבעי.</b> ואם המשרה רלוונטית והשיחה זרמה, מבקשים להגיש דרכו. משפט
            אחד, עם דלת יציאה נוחה.
          </li>
        </ol>
      </div>

      <ToolNote />
    </div>
  );
}
