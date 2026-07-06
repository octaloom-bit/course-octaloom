"use client";

import { useState } from "react";
import { syncTool, currentToolId } from "@/lib/progress-sync";

// Reusable prompt card: style title + short tag, a copy button in the header,
// and the ready-to-copy prompt body (dir="auto" so English aligns LTR).
export default function PromptCard({
  title,
  tag,
  body,
}: {
  title?: string;
  tag?: string;
  body: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(body);
    const tool = currentToolId();
    if (tool) syncTool(tool, "use");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card prompt-card">
      <div className="prompt-head">
        <div>
          {title && <h3 className="prompt-title">{title}</h3>}
          {tag && <p className="prompt-tag">{tag}</p>}
        </div>
        <button className={`copy${copied ? " done" : ""}`} onClick={copy}>
          {copied ? "הועתק ✓" : "העתקה"}
        </button>
      </div>
      <pre className="prompt-body" dir="auto">{body}</pre>
    </div>
  );
}
