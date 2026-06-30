"use client";

import { useState } from "react";
import type { MeetingGuide } from "@/content/meeting-links";

// Tab switcher across the three booking-link guides; each tab shows numbered steps.
export default function MeetingGuides({ guides }: { guides: MeetingGuide[] }) {
  const [active, setActive] = useState(guides[0]?.id);
  const current = guides.find((g) => g.id === active) ?? guides[0];

  return (
    <div>
      <div className="prompt-tabs">
        {guides.map((g) => (
          <button
            key={g.id}
            className={`ptab${g.id === active ? " on" : ""}`}
            onClick={() => setActive(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="card">
          <span className="walk-tool">{current.label}</span>
          <p className="sub" style={{ marginTop: 0, marginBottom: 18 }}>{current.tagline}</p>

          <ol className="howto guide-steps">
            {current.steps.map((s, i) => (
              <li key={i}>
                {s.text}
                {s.code && <code className="guide-code">{s.code}</code>}
              </li>
            ))}
          </ol>

          {current.tip && <p className="guide-tip">{current.tip}</p>}
        </div>
      )}
    </div>
  );
}
