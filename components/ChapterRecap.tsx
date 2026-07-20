"use client";

import { useState } from "react";
import Link from "next/link";
import { RECAPS } from "@/lib/recap";
import ChapterQuiz from "@/components/ChapterQuiz";

type Tab = "insights" | "terms" | "quiz";

// The written layer of a lesson: what to remember, what the terms mean, and a
// quick self-check. Tabbed so the page stays short — one panel at a time.
export default function ChapterRecap({ chapterId }: { chapterId: string }) {
  const recap = RECAPS[chapterId];
  const [tab, setTab] = useState<Tab>("insights");
  if (!recap) return null;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "insights", label: "סיכום הפרק", count: recap.insights.length },
    { id: "terms", label: "מושגים", count: recap.terms.length },
    { id: "quiz", label: "בדיקה עצמית", count: recap.quiz.length },
  ];

  return (
    <section className="recap">
      <div className="section-head">
        <h2>החומר בכתב</h2>
      </div>

      <div className="prompt-tabs recap-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ptab${t.id === tab ? " on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label} <span className="ptab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "insights" && (
        <ul className="recap-insights">
          {recap.insights.map((item, i) => (
            <li key={i}>
              <span className="ri-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="ri-body">
                <b>{item.head}</b>
                <span>{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === "terms" && (
        <>
          <div className="acc-list">
            {recap.terms.map((t, i) => (
              <details className="acc" key={t.term}>
                <summary className="acc-head">
                  <span className="acc-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="acc-title">
                    <b>{t.term}</b>
                    {t.en && <small>{t.en}</small>}
                  </span>
                  <span className="acc-chevron" aria-hidden>▾</span>
                </summary>
                <div className="acc-body">
                  <p className="term-def">{t.def}</p>
                </div>
              </details>
            ))}
          </div>
          <Link href="/glossary" className="recap-link">
            ← כל המושגים של הקורס במקום אחד
          </Link>
        </>
      )}

      {tab === "quiz" && (
        <>
          <p className="recap-sub">בלי ציון ובלי לחץ. רק לוודא שהחומר יושב.</p>
          <ChapterQuiz quiz={recap.quiz} />
        </>
      )}
    </section>
  );
}
