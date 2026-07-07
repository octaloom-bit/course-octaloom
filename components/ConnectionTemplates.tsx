import CopyLine from "@/components/CopyLine";
import {
  REQUEST_CATEGORIES,
  MESSAGE_CATEGORIES,
  type MessageCategory,
} from "@/content/connections";

// Template library as an editorial accordion: hairline rows, open one to see the
// copyable lines. Replaces the previous stack of 6 identical cards.
function CategoryRow({ cat, num, defaultOpen }: { cat: MessageCategory; num: number; defaultOpen?: boolean }) {
  return (
    <details className="acc" open={defaultOpen}>
      <summary className="acc-head">
        <span className="acc-num">{String(num).padStart(2, "0")}</span>
        <span className="acc-title">
          <b>{cat.title}</b>
          <small>{cat.when}</small>
        </span>
        <span className="acc-chevron" aria-hidden>▾</span>
      </summary>
      <div className="acc-body">
        <CopyLine text={cat.template} />
        {cat.variations.length > 0 && (
          <>
            <p className="var-label">וריאציות</p>
            {cat.variations.map((v, i) => (
              <CopyLine key={i} text={v} />
            ))}
          </>
        )}
      </div>
    </details>
  );
}

export default function ConnectionTemplates() {
  return (
    <div>
      <div className="section-head">
        <h2>בקשות חיבור</h2>
      </div>
      <div className="acc-list">
        {REQUEST_CATEGORIES.map((cat, i) => (
          <CategoryRow key={`req-${i}`} cat={cat} num={i + 1} defaultOpen={i === 0} />
        ))}
      </div>

      <div className="section-head">
        <h2>הודעות אחרי שמתחברים</h2>
      </div>
      <div className="acc-list">
        {MESSAGE_CATEGORIES.map((cat, i) => (
          <CategoryRow key={`msg-${i}`} cat={cat} num={REQUEST_CATEGORIES.length + i + 1} />
        ))}
      </div>
    </div>
  );
}
