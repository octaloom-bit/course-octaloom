"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAPTERS, AUDIENCE_LABEL, type Chapter } from "@/lib/chapters";
import { getProgress, type ProgressMap } from "@/lib/progress";

const PRELUDE = CHAPTERS.filter((c) => c.track === "prelude");
const CORE = CHAPTERS.filter((c) => c.track !== "prelude");

function Row({
  ch,
  num,
  pct,
  current,
  delay,
}: {
  ch: Chapter;
  /** Position in the numbered path, or null for prelude chapters. */
  num: number | null;
  pct: number;
  current: boolean;
  delay: number;
}) {
  const complete = pct >= 95;
  return (
    <Link
      href={`/course/${ch.id}`}
      className={`chapter${complete ? " done" : ""}${num === null ? " prelude" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="ch-num">{num === null ? "•" : String(num).padStart(2, "0")}</span>
      <div className="chapter-body">
        <h3>
          {ch.title}
          {ch.audience && (
            <span className={`ch-aud ${ch.audience}`}>{AUDIENCE_LABEL[ch.audience]}</span>
          )}
        </h3>
        <p>{ch.desc}</p>
        {ch.audienceNote && <p className="ch-aud-note">{ch.audienceNote}</p>}
        {pct > 0 && !complete && (
          <div className="ch-bar">
            <div className="ch-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div className="chapter-meta">
        <span className="ch-label">{ch.label} · {ch.duration}</span>
        {complete ? (
          <span className="ch-state done">✓ הושלם</span>
        ) : current ? (
          <span className="ch-state now">{pct > 0 ? `${pct}%` : "הפרק הבא"}</span>
        ) : pct > 0 ? (
          <span className="ch-state part">{pct}%</span>
        ) : (
          <span className="arrow">←</span>
        )}
      </div>
    </Link>
  );
}

export default function ChapterList() {
  const [p, setP] = useState<ProgressMap>({});

  useEffect(() => {
    const load = () => setP(getProgress());
    load();
    window.addEventListener("octa-progress", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("octa-progress", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const pctOf = (ch: Chapter) => Math.min(100, p[ch.id] || 0);
  // "Next up" tracks the numbered path only, same as the hero CTA.
  const nextId = CORE.find((c) => pctOf(c) < 95)?.id;

  return (
    <>
      <div className="index-head">
        <h2>לפני שמתחילים</h2>
        <span>רשות</span>
      </div>
      <p className="index-note">
        היכרות איתי ועם מושגי היסוד של הפלטפורמה. מי שכבר פעיל.ה בלינקדאין יכול.ה לדלג ישר לפרק 1.
      </p>
      <div className="chapters">
        {PRELUDE.map((ch, i) => (
          <Row
            key={ch.id}
            ch={ch}
            num={null}
            pct={pctOf(ch)}
            current={ch.id === nextId}
            delay={i * 0.04}
          />
        ))}
      </div>

      <div className="index-head">
        <h2>פרקי הקורס</h2>
        <span>{CORE.length} פרקים</span>
      </div>
      <div className="chapters">
        {CORE.map((ch, i) => (
          <Row
            key={ch.id}
            ch={ch}
            num={i + 1}
            pct={pctOf(ch)}
            current={ch.id === nextId}
            delay={(PRELUDE.length + i) * 0.04}
          />
        ))}
      </div>
    </>
  );
}
