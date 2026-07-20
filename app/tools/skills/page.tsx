import Link from "next/link";
import LinkedInIcon from "@/components/LinkedInIcon";
import PromptCard from "@/components/PromptCard";
import ToolNote from "@/components/ToolNote";
import { SKILLS_INTRO, SKILLS_PROMPT } from "@/content/skills-audit";

export default function SkillsPage() {
  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי עזר לקורס · פרק 6
        </span>
        <h1 style={{ maxWidth: "none" }}>
          סורק <span className="accent">הכישורים</span>
        </h1>
      </div>

      <div className="card">
        <p className="lead">{SKILLS_INTRO}</p>
      </div>

      <PromptCard
        title="הפרומפט"
        tag="קורא את סעיף הניסיון שלכם ואומר בדיוק אילו כישורים חסרים ברשימה"
        body={SKILLS_PROMPT}
      />

      <ToolNote />
    </div>
  );
}
