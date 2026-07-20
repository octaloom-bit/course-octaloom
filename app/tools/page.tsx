import LinkedInIcon from "@/components/LinkedInIcon";
import ToolsGrid from "@/components/ToolsGrid";

export default function ToolsPage() {
  return (
    <>
      <section className="course-hero compact">
        <div className="ch-inner">
          <span className="eyebrow">
            <LinkedInIcon />
            OctaLoom · קורס לינקדאין
          </span>
          <h1>
            כל הכלים של הקורס, <span className="accent">במקום אחד</span>
          </h1>
          <p className="sub">בחרו כלי כדי להתחיל. כל כלי בנוי לפי החומר של הקורס.</p>
        </div>
      </section>

      <div className="wrap wide">
        <ToolsGrid />
      </div>
    </>
  );
}
