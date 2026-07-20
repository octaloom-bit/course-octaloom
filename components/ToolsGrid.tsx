"use client";

import Link from "next/link";
import { useState } from "react";
import { TOOL_FILTERS, toolsForAudience, type ToolFilter } from "@/lib/tools";
import ToolIcon from "@/components/ToolIcon";

const BADGE_LABEL: Record<string, string> = {
  ai: "AI",
  static: "מוכן",
  gem: "Gem",
};

export default function ToolsGrid() {
  const [filter, setFilter] = useState<ToolFilter>("all");
  const tools = toolsForAudience(filter);

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
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid">
        {tools.map((tool) => {
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
            return (
              <div className={cardClass} key={tool.id}>
                {inner}
              </div>
            );
          }
          if (tool.external) {
            return (
              <a
                className={cardClass}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                key={tool.id}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link className={cardClass} href={tool.href} key={tool.id}>
              {inner}
            </Link>
          );
        })}
      </div>
    </>
  );
}
