import Link from "next/link";
import LinkedInIcon from "@/components/LinkedInIcon";
import MeetingGuides from "@/components/MeetingGuides";
import ToolNote from "@/components/ToolNote";
import { MEETING_LINKS_INTRO, MEETING_LINKS_HOWTO_NOTE, GUIDES } from "@/content/meeting-links";

export default function MeetingLinksPage() {
  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי עזר לקורס
        </span>
        <h1 style={{ maxWidth: "none" }}>
          לינק <span className="accent">לפגישה</span>
        </h1>
        <p className="sub">{MEETING_LINKS_INTRO}</p>
      </div>

      <p className="sub" style={{ marginTop: -4, marginBottom: 16 }}>{MEETING_LINKS_HOWTO_NOTE}</p>

      <MeetingGuides guides={GUIDES} />

      <ToolNote />
    </div>
  );
}
