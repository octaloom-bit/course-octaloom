import Link from "next/link";
import { toolsForChapter } from "@/lib/tools";
import ToolIcon from "@/components/ToolIcon";

// The tools built for this specific chapter, shown under the lesson overview.
// Reuses the .toolcard styling from the /tools dashboard in a tighter grid.
export default function ChapterTools({ chapterId }: { chapterId: string }) {
  const tools = toolsForChapter(chapterId);
  if (tools.length === 0) return null;

  return (
    <section className="chapter-tools">
      <h2 className="ct-title">הכלים של הפרק הזה</h2>
      <p className="ct-sub">בנויים בדיוק על החומר שראית עכשיו.</p>
      <div className="ct-grid">
        {tools.map((tool) => {
          const inner = (
            <>
              <div className="tc-head">
                <span className="tc-icon"><ToolIcon id={tool.id} /></span>
                {tool.type === "ai" && <span className="badge ai">AI</span>}
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
              <span className="arrow">←</span>
            </>
          );
          const cardClass = `toolcard t-${tool.type}`;
          return tool.external ? (
            <a
              className={cardClass}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              key={tool.id}
            >
              {inner}
            </a>
          ) : (
            <Link className={cardClass} href={tool.href!} key={tool.id}>
              {inner}
            </Link>
          );
        })}
      </div>
      <Link href="/tools" className="ct-all">← לכל הכלים של הקורס</Link>
    </section>
  );
}
