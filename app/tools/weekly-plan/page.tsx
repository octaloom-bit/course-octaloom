"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { syncTool } from "@/lib/progress-sync";
import { PLAN, type PlanItem } from "@/lib/plan";
import LinkedInIcon from "@/components/LinkedInIcon";
import ToolNote from "@/components/ToolNote";

const KEY = "octa-weekly-plan";

// Wrap runs of Latin letters in <bdi> so mixed Hebrew/Latin text keeps the right
// visual order in the RTL layout (e.g. "Identity Audit, 10 דקות" no longer flips).
function bdiWrap(str: string, keyBase: string): ReactNode[] {
  const re = /[A-Za-z][A-Za-z'.]*(?:[ /-][A-Za-z'.]+)*/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let j = 0;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) nodes.push(str.slice(last, m.index));
    nodes.push(<bdi key={`${keyBase}-b${j}`}>{m[0]}</bdi>);
    j += 1;
    last = m.index + m[0].length;
  }
  if (last < str.length) nodes.push(str.slice(last));
  return nodes;
}

// Render an item's text, turning any configured links into clickable anchors
// (or a colored "pending" marker when the target tool is not built yet).
function renderItem(it: PlanItem): ReactNode[] {
  const links = it.links || [];
  let parts: (string | NonNullable<PlanItem["links"]>[number])[] = [it.text];
  links.forEach((link) => {
    const next: typeof parts = [];
    parts.forEach((p) => {
      if (typeof p !== "string") {
        next.push(p);
        return;
      }
      const idx = p.indexOf(link.match);
      if (idx === -1) {
        next.push(p);
        return;
      }
      if (idx > 0) next.push(p.slice(0, idx));
      next.push(link);
      const rest = p.slice(idx + link.match.length);
      if (rest) next.push(rest);
    });
    parts = next;
  });
  return parts.map((p, i) => {
    if (typeof p === "string") return <span key={i}>{bdiWrap(p, `s${i}`)}</span>;
    if (p.pending) {
      return (
        <span key={i} className="link-pending" title="לקשר לכלי B2B Cluster כשהוא מוכן">
          {p.match}
        </span>
      );
    }
    if (p.external) {
      return (
        <a key={i} className="ilink" href={p.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {p.match}
        </a>
      );
    }
    return (
      <Link key={i} className="ilink" href={p.href} onClick={(e) => e.stopPropagation()}>
        {p.match}
      </Link>
    );
  });
}

export default function WeeklyPlanPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Load saved checkmarks from localStorage (no backend needed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const allItems = PLAN.flatMap((s) => s.items);
  const doneCount = allItems.filter((it) => checked[it.id]).length;

  // Build a plain-text version of one section (or all) for copy / email export.
  function sectionText(onlyOpen: boolean): string {
    const lines = [
      "תוכנית הפעולה שלי ל-30 יום (לינקדאין עם OctaLoom, פרק 5)",
      "",
    ];
    PLAN.forEach((s) => {
      const items = onlyOpen ? s.items.filter((it) => !checked[it.id]) : s.items;
      if (!items.length) return;
      lines.push(`▸ ${s.title}`);
      lines.push(`  ${s.meta}`);
      items.forEach((it) => {
        const box = checked[it.id] ? "[x]" : "[ ]";
        lines.push(`  ${box} ${it.text}`);
      });
      lines.push("");
    });
    lines.push("כל זה 30 דקות ביום. זה לא כזה נורא, וזה מה שמניע את המנוע.");
    return lines.join("\n");
  }

  function copyAll() {
    navigator.clipboard.writeText(sectionText(false));
    syncTool("weekly-plan", "use");
  }

  function emailOpen() {
    const subject = encodeURIComponent("המשימות שנשארו לי בתוכנית 30 יום בלינקדאין");
    const body = encodeURIComponent(sectionText(true));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          תוכנית מפרק 5
        </span>
        <h1 style={{ maxWidth: "none" }}>
          תוכנית העבודה <span className="accent" style={{ whiteSpace: "nowrap" }}>ל-30 ימים</span>
        </h1>
        <p className="sub">
          הטעות הכי נפוצה היא ניסיון להטמיע הכל בבת אחת. זה מוביל לשחיקה מהירה, לא לעקביות. לינקדאין הוא שריר,
          והמטרה שלנו היא לפתח אותו בהדרגה.
        </p>
        <p className="sub" style={{ marginTop: 10 }}>
          אנחנו עובדים בשבועות ממוקדים, כל שבוע מתמקד בנדבך אחד בלבד:
        </p>
      </div>

      <div className="card">
        <div className="step-label">ההתקדמות שלי</div>
        <div className="counter" style={{ marginTop: 0, fontSize: 14 }}>
          {doneCount}/{allItems.length} משימות הושלמו
        </div>
        <div
          style={{
            height: 8,
            background: "var(--line)",
            borderRadius: 999,
            overflow: "hidden",
            marginTop: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${allItems.length ? (doneCount / allItems.length) * 100 : 0}%`,
              background: "var(--purple)",
              transition: "width .2s",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button className="copy" onClick={copyAll}>העתקת התוכנית</button>
          <button className="copy" onClick={emailOpen}>שליחת המשימות שנשארו למייל</button>
        </div>
      </div>

      {PLAN.map((section) => (
        <div className="card" key={section.id}>
          <div className="step-label">{section.title}</div>
          <p className="sub" style={{ marginTop: -6, marginBottom: 14 }}>{section.meta}</p>
          <div>
            {section.items.map((it) => {
              const on = !!checked[it.id];
              return (
                <label
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    margin: "10px 0",
                    cursor: "pointer",
                    fontWeight: 400,
                    color: on ? "var(--muted)" : "var(--ink)",
                    textDecoration: on ? "line-through" : "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(it.id)}
                    style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--green)", flexShrink: 0 }}
                  />
                  <span>{renderItem(it)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <ToolNote />
    </div>
  );
}
