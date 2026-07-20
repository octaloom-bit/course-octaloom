"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TOOL_FILTERS, groupedTools, type ToolFilter, type Tool } from "@/lib/tools";
import ToolIcon from "@/components/ToolIcon";

const BADGE_LABEL: Record<string, string> = {
  ai: "AI",
  static: "מוכן",
  gem: "Gem",
};

function ToolCard({ tool }: { tool: Tool }) {
  const soon = tool.status === "soon";
  const badgeClass = soon ? "soon" : tool.type;
  const badgeText = soon ? "בקרוב" : BADGE_LABEL[tool.type];
  // Hide the "מוכן" badge on live static tools; keep AI / Gem / בקרוב.
  const showBadge = soon || tool.type === "ai" || tool.type === "gem";
  const cardClass = `toolcard t-${tool.type}${soon ? " soon" : ""}`;
  const inner = (
    <>
      <div className="tc-head">
        <span className="tc-icon"><ToolIcon id={tool.id} /></span>
        {showBadge && <span className={`badge ${badgeClass}`}>{badgeText}</span>}
      </div>
      <h3>{tool.title}</h3>
      <p>{tool.desc}</p>
      {!soon && <span className="arrow">←</span>}
    </>
  );
  if (soon || !tool.href) {
    return <div className={cardClass}>{inner}</div>;
  }
  if (tool.external) {
    return (
      <a className={cardClass} href={tool.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link className={cardClass} href={tool.href}>{inner}</Link>;
}

export default function ToolsGrid() {
  const [filter, setFilter] = useState<ToolFilter>("all");
  const sections = groupedTools(filter);
  const [activeGroup, setActiveGroup] = useState<string>(sections[0]?.group.id ?? "");

  // Highlight the nav entry for whichever section is currently in view.
  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(`group-${s.group.id}`))
      .filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveGroup(visible.target.id.replace("group-", ""));
      },
      // Trigger when a heading reaches the upper third of the viewport.
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  function changeFilter(next: ToolFilter) {
    setFilter(next);
    setActiveGroup("");
  }

  return (
    <>
      <div className="toolfilter" role="tablist" aria-label="סינון כלים לפי קהל">
        {TOOL_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`tf-tab${filter === f.id ? " on" : ""}`}
            onClick={() => changeFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="tools-layout">
        <nav className="tools-nav" aria-label="קטגוריות כלים">
          {sections.map(({ group, tools }) => (
            <a
              key={group.id}
              href={`#group-${group.id}`}
              className={`tn-item${activeGroup === group.id ? " on" : ""}`}
            >
              <span className="tn-label">{group.label}</span>
              <span className="tn-count">{tools.length}</span>
            </a>
          ))}
        </nav>

        <div className="tools-sections">
          {sections.map(({ group, tools }) => (
            <section key={group.id} className="tools-section">
              <div className="section-head" id={`group-${group.id}`}>
                <h2>{group.label}</h2>
              </div>
              <p className="tools-blurb">{group.blurb}</p>
              <div className="grid">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
