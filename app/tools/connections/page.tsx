import Link from "next/link";
import LinkedInIcon from "@/components/LinkedInIcon";
import ConnectionTemplates from "@/components/ConnectionTemplates";
import ConnectionGenerator from "@/components/ConnectionGenerator";
import ToolNote from "@/components/ToolNote";
import { CONNECTIONS_INTRO, RULES_LEAD, BASE_RULES, SEQUENCE, PRO_BONUS } from "@/content/connections";

export default function ConnectionsPage() {
  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי עזר לקורס
        </span>
        <h1 style={{ maxWidth: "none" }}>
          מחולל <span className="accent">הודעות חיבור</span>
        </h1>
        <p className="sub" style={{ maxWidth: "60ch" }}>{CONNECTIONS_INTRO}</p>
      </div>

      <ConnectionGenerator />

      <div className="section-head">
        <h2>ספריית התבניות (למילוי ידני)</h2>
      </div>
      <ConnectionTemplates />

      <div className="section-head">
        <h2>שיטת העבודה</h2>
      </div>

      <div className="pro-note">
        <span className="tool-note-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 4 1.8 4.4 4.2 1.8-4.2 1.8L12 16.5l-1.8-4.5L6 10.2l4.2-1.8z" />
            <path d="m18.6 15.4.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
          </svg>
        </span>
        <div>
          <strong>בונוס של מקצוענים</strong>
          <p>{PRO_BONUS}</p>
        </div>
      </div>

      <div className="card">
        <div className="step-label">כללי בסיס</div>
        <p className="lead" style={{ fontSize: 14.5, marginBottom: 14 }}>{RULES_LEAD}</p>
        <ul className="howto" style={{ listStyle: "disc" }}>
          {BASE_RULES.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="step-label">הרצף המלא · 3 שלבים</div>
        <ol className="howto">
          {SEQUENCE.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <ToolNote />
    </div>
  );
}
