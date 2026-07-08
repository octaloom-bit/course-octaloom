"use client";

import { useState } from "react";
import Link from "next/link";
import {
  POLL_CATEGORIES,
  formatPoll,
  type Lang,
  type Tone,
  type Poll,
} from "@/lib/polls";
import LinkedInIcon from "@/components/LinkedInIcon";
import ToolNote from "@/components/ToolNote";

const TONES: Tone[] = ["ציני", "חם", "פרובוקטיבי"];

// Line icons per category (feather-style), keyed by category id. Replaces emoji.
const ICONS: Record<string, React.ReactElement> = {
  uncommon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4z" /><path d="M12 6.5V11M12 13.5h.01" /></svg>
  ),
  aireality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2" /></svg>
  ),
  thisorthat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16" /><path d="M6 7 3 13h6zM18 7l-3 6h6z" /><path d="M6 7h12" /></svg>
  ),
  mistake: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 4 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
  ),
  icp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>
  ),
  leadmagnet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M12 9v11M4 13.5h16" /><path d="M12 9c-1.2-2.8-5.2-2.4-4.4.4.5 1.6 2.9 1.6 4.4 1.6 1.5 0 3.9 0 4.4-1.6.8-2.8-3.2-3.2-4.4-.4Z" /></svg>
  ),
  howi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5Z" /></svg>
  ),
  trend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
  ),
};

export default function PollPage() {
  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>("חם");
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [lang, setLang] = useState<Lang>("עברית");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [handoffPrompt, setHandoffPrompt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  }

  function selectCategory(key: string) {
    setCategoryKey(key);
    setPolls([]);
    setHandoffPrompt(null);
    setRemaining(null);
    setError(null);
  }

  async function generate() {
    if (!categoryKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryKey, tone, topic, niche, audience, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "שגיאה");
        return;
      }
      if (data.handoff) {
        setHandoffPrompt(data.prompt);
        setPolls([]);
        return;
      }
      setPolls(data.polls || []);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      if (data.lastFree && data.prompt) setHandoffPrompt(data.prompt);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const category = categoryKey ? POLL_CATEGORIES[categoryKey] : null;

  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          סקרים לפי פרק 3
        </span>
        <h1>
          מחולל <span className="accent">סקרים</span> ללינקדאין
        </h1>
        <p className="sub">
          רוב הסקרים בלינקדאין הם בזבוז: שאלה גנרית, אפס תגובות. פה מייצרים סקר שפותח שיחה ומביא לידים. בוחרים קטגוריה וטון, ומקבלים 3 רעיונות מוכנים עם שאלה, אופציות, פתיח לפוסט ולמה זה עובד.
        </p>
      </div>

      <div className="gen">
        <div className="gen-hero">
          <span className="gen-eyebrow">מחולל AI · פרק 3</span>
          <h2>סקר שפותח שיחה, בשלושה צעדים</h2>
        </div>

        <div className="steps">
        <div className="step"><span className="step-num">1</span> בחרו קטגוריה</div>
        <div className="step-arrow">←</div>
        <div className="step"><span className="step-num">2</span> טון והקשר</div>
        <div className="step-arrow">←</div>
        <div className="step"><span className="step-num">3</span> קבלו 3 סקרים</div>
      </div>

      <div className="card">
        <div className="step-label">שלב 1 · בחרו קטגוריה</div>
        <div className="formula-grid poll-grid">
          {Object.entries(POLL_CATEGORIES).map(([key, c]) => (
            <div
              key={key}
              className={`formula${categoryKey === key ? " active" : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={categoryKey === key}
              onClick={() => selectCategory(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectCategory(key);
                }
              }}
            >
              <span className="formula-num poll-icon">{ICONS[key]}</span>
              <div className="formula-text">
                <div className="formula-top">
                  <h3>{c.name}</h3>
                  <span className="formula-tag">{c.chapter}</span>
                </div>
                <p>{c.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {category && (
        <div className="card">
          <div className="step-label">שלב 2 · טון והקשר</div>

          <label>על מה הסקר? מה בא לכם לשאול? (הכי חשוב)</label>
          <input
            type="text"
            placeholder="למשל: אם עדיף לבנות סוכני AI או להישאר עם פרומפטים ידניים"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="field-hint">
            ככל שתכתבו פה נושא או זווית ספציפית, הסקר יצא חד ורלוונטי. בלי זה מקבלים משהו כללי.
          </div>

          <label>טון</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label>הנישה / התחום שלכם (אופציונלי)</label>
          <input
            type="text"
            placeholder="למשל: אוטומציות AI לעסקים קטנים, ייעוץ HR, קופירייטינג"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />

          <label>מי הקהל של הפוסט? (אופציונלי)</label>
          <input
            type="text"
            placeholder="למשל: מנהלות שיווק בחברות B2B"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
          <div className="field-hint">
            זה ה-ICP שלכם: הלקוחה שמשלמת, לא כל מי שעוקב. ככל שתדייקו פה, הסקר יסנן טוב יותר בדיוק את מי שיכולה להפוך ללקוחה.
          </div>

          <label>שפת הסקרים</label>
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="עברית">עברית</option>
            <option value="אנגלית">אנגלית</option>
          </select>

          <div style={{ marginTop: 18 }} />
          <button className="btn-primary" onClick={generate} disabled={loading}>
            {loading ? <>מייצרים<span className="spin" /></> : "ייצרו 3 סקרים"}
          </button>
          {remaining !== null && (
            <div className="counter">
              נותרו {remaining} ייצורים היום{remaining <= 0 ? " · בפעם הבאה נציג לכם את הפרומפט" : ""}
            </div>
          )}
          {error && <div className="err">שגיאה: {error}</div>}
        </div>
      )}

      {polls.length > 0 && (
        <div className="card">
          <div className="step-label">שלב 3 · הסקרים שלך</div>
          <div className="legend">
            מגבלות לינקדאין: שאלה עד <b>140 תווים</b>, כל אופציה עד <b>30 תווים</b>. משך מומלץ: 7 ימים.
          </div>
          <div className="results">
            {polls.map((p, i) => {
              const qOver = p.question.length > 140;
              return (
                <div className="poll" key={i}>
                  <div className="poll-head">
                    <span className="poll-num">סקר {i + 1}</span>
                    <button
                      className={`copy${copied === `poll-${i}` ? " done" : ""}`}
                      onClick={() => copyText(formatPoll(p), `poll-${i}`)}
                    >
                      {copied === `poll-${i}` ? "הועתק ✓" : "העתיקו הכל"}
                    </button>
                  </div>

                  <div className="poll-q">
                    {p.question}
                    <span className={`chars ${qOver ? "over" : "ok"}`}>{p.question.length}/140</span>
                  </div>

                  <div className="poll-opts">
                    {p.options.map((o, j) => {
                      const oOver = o.length > 30;
                      return (
                        <div className="poll-opt" key={j}>
                          <span className="poll-opt-txt">{o}</span>
                          <span className={`chars ${oOver ? "over" : "ok"}`}>{o.length}/30</span>
                        </div>
                      );
                    })}
                  </div>

                  {p.opener && (
                    <div className="poll-opener">
                      <span className="poll-meta-label">פתיח לפוסט</span>
                      {p.opener}
                    </div>
                  )}
                  {p.why && (
                    <div className="poll-why">
                      <span className="poll-meta-label">למה זה עובד</span>
                      {p.why}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {handoffPrompt && (
        <div className="card">
          <div className="handoff">
            <h3>נגמרו 3 הייצורים להיום</h3>
            <p>העתיקו את הפרומפט המלא ל-ChatGPT / Claude / Gemini שלכם, ותמשיכו לייצר סקרים בלי הגבלה:</p>
            <textarea readOnly value={handoffPrompt} />
            <div style={{ marginTop: 8 }}>
              <button
                className={`copy${copied === "handoff" ? " done" : ""}`}
                onClick={() => copyText(handoffPrompt, "handoff")}
              >
                {copied === "handoff" ? "הועתק ✓" : "העתקת הפרומפט"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <ToolNote />
    </div>
  );
}
