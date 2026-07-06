"use client";

import { useState } from "react";
import { syncTool, currentToolId } from "@/lib/progress-sync";

// A copyable message line: the text plus a small copy button. dir="auto" keeps
// Hebrew RTL and any Latin/placeholder runs in the right order.
export default function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    const tool = currentToolId();
    if (tool) syncTool(tool, "use");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="copyline">
      <p dir="auto">{text}</p>
      <button className={`copy-mini${copied ? " done" : ""}`} onClick={copy}>
        {copied ? "✓" : "העתקה"}
      </button>
    </div>
  );
}
