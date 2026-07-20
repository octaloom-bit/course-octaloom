import Link from "next/link";
import { requireCourseAccess } from "@/lib/access";
import { CHAPTERS } from "@/lib/chapters";
import { RECAPS } from "@/lib/recap";
import LinkedInIcon from "@/components/LinkedInIcon";

// Every term from every chapter in one place, grouped by chapter.
// This route lives outside /course, so the course gate is applied explicitly.
export default async function GlossaryPage() {
  await requireCourseAccess();

  const groups = CHAPTERS.map((ch) => ({ ch, terms: RECAPS[ch.id]?.terms ?? [] })).filter(
    (g) => g.terms.length > 0,
  );
  const total = groups.reduce((n, g) => n + g.terms.length, 0);

  return (
    <>
      <section className="course-hero compact">
        <div className="ch-inner">
          <span className="eyebrow">
            <LinkedInIcon />
            OctaLoom · קורס לינקדאין
          </span>
          <h1>
            כל המושגים של הקורס, <span className="accent">במקום אחד</span>
          </h1>
          <p className="sub">
            {total} מושגים מכל הפרקים. כל מושג מקושר לפרק שבו הוא נלמד.
          </p>
        </div>
      </section>

      <div className="wrap glossary">
        {groups.map(({ ch, terms }) => (
          <section key={ch.id} className="gl-group">
            <div className="section-head">
              <h2>
                {ch.label} · {ch.title}
              </h2>
            </div>
            <dl className="gl-list">
              {terms.map((t) => (
                <div className="gl-item" key={`${ch.id}-${t.term}`}>
                  <dt>
                    {t.term}
                    {t.en && <span className="gl-en">{t.en}</span>}
                  </dt>
                  <dd>{t.def}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/course/${ch.id}`} className="recap-link">
              ← לפרק המלא
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
