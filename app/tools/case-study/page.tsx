import Link from "next/link";
import LinkedInIcon from "@/components/LinkedInIcon";
import PromptCard from "@/components/PromptCard";
import ToolNote from "@/components/ToolNote";
import { CASE_STUDY_INTRO, CASE_STUDY_PROMPT } from "@/content/case-study-post";

export default function CaseStudyPage() {
  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי עזר לקורס · פרק 7
        </span>
        <h1 style={{ maxWidth: "none" }}>
          פוסט <span className="accent">קייס סטאדי</span>
        </h1>
      </div>

      <div className="card">
        <p className="lead">{CASE_STUDY_INTRO}</p>
      </div>

      <PromptCard
        title="הפרומפט"
        tag="לוקח סיפור אחד מהעבודה שלכם ובונה ממנו פוסט בארבעה חלקים"
        body={CASE_STUDY_PROMPT}
      />

      <ToolNote />
    </div>
  );
}
