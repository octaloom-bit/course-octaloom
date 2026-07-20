"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { coreChapters } from "@/lib/chapters";
import { getProgress, overallPercent, completedCount, coreCount, type ProgressMap } from "@/lib/progress";

export default function HeroProgress() {
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

  const overall = overallPercent(p);
  const done = completedCount(p);
  const core = coreChapters();
  const next = core.find((c) => Math.min(100, p[c.id] || 0) < 95) ?? null;
  const total = coreCount();

  return (
    <div className="hp">
      <div className="hp-bar">
        <div className="hp-fill" style={{ width: `${overall}%` }} />
      </div>
      <div className="hp-row">
        {next ? (
          <Link href={`/course/${next.id}`} className="hp-cta">
            {overall > 0 ? `להמשיך · ${next.label}` : `להתחיל · ${next.label}`} ←
          </Link>
        ) : (
          <span className="hp-done">סיימתם את כל הקורס 🎉</span>
        )}
        <span className="hp-pct">{overall}%</span>
      </div>
      <div className="hp-meta">
        {done === total
          ? "כל הפרקים הושלמו"
          : `${done} מתוך ${total} פרקים הושלמו`}
      </div>
    </div>
  );
}
