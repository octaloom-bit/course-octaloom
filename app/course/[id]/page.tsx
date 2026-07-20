import Link from "next/link";
import { notFound } from "next/navigation";
import { CHAPTERS } from "@/lib/chapters";
import ChapterPlayer from "@/components/ChapterPlayer";
import ChapterTools from "@/components/ChapterTools";
import ChapterRecap from "@/components/ChapterRecap";

// Render body text, turning markdown links [text](url) into clickable anchors.
function renderBody(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return part;
    return (
      <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer">
        {m[1]}
      </a>
    );
  });
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = CHAPTERS.findIndex((c) => c.id === id);
  if (idx === -1) notFound();
  const ch = CHAPTERS[idx];
  const prev = CHAPTERS[idx - 1];
  const next = CHAPTERS[idx + 1];
  // Prelude chapters sit outside the numbered path, so they get a dot.
  const coreIdx = CHAPTERS.filter((c) => c.track !== "prelude").findIndex((c) => c.id === ch.id);
  const heroNum = coreIdx === -1 ? "•" : String(coreIdx + 1).padStart(2, "0");

  return (
    <>
      <section className="lesson-hero">
        <div className="lh-inner">
          <span className="lh-num" aria-hidden>{heroNum}</span>
          <Link href="/" className="backlink dark">→ חזרה לקורס</Link>
          <div className="lh-meta">
            <span className="lh-label">{ch.label}</span>
            <span className="lh-dur">{ch.duration}</span>
          </div>
          <h1 className="lesson-title">{ch.title}</h1>
          <p className="lh-desc">{ch.desc}</p>
        </div>
      </section>

      <div className="wrap lesson-wrap">
      <ChapterPlayer chapter={ch} />

      {ch.overview && (
        <section className="lesson-overview">
          <p className="lo-hook">{ch.overview.hook}</p>
          <p className="lo-body">{renderBody(ch.overview.body)}</p>
        </section>
      )}

      <ChapterRecap chapterId={ch.id} />

      <ChapterTools chapterId={ch.id} />

      <div className="chapter-nav">
        {prev ? (
          <Link href={`/course/${prev.id}`} className="cn-link">
            {prev.label} · הקודם →
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/course/${next.id}`} className="cn-link next">
            ← הבא · {next.label}
          </Link>
        ) : (
          <span />
        )}
      </div>
      </div>
    </>
  );
}
