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

const TONES: Tone[] = ["צינית", "חמה", "פרובוקטיבית"];

export default function PollPage() {
  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>("חמה");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [lang, setLang] = useState<Lang>("עברית");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [handoffPrompt, setHandoffPrompt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ category: categoryKey, tone, niche, audience, lang }),
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
          סקר חכם עושה יותר מלאסוף הצבעות. הוא מתחיל שיחה ומביא לידים. בחרו קטגוריה וטון, וקבלו 3 רעיונות מוכנים: שאלה, אופציות, פתיח לפוסט, ולמה זה עובד.
        </p>
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
        <div className="formula-grid">
          {Object.entries(POLL_CATEGORIES).map(([key, c]) => (
            <div
              key={key}
              className={`formula${categoryKey === key ? " active" : ""}`}
              onClick={() => selectCategory(key)}
            >
              <span className="formula-num" style={{ background: "var(--purple-soft)" }}>{c.icon}</span>
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

          <label>טון</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label>הניש / התחום שלך (אופציונלי)</label>
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
            הכוונה ל-ICP שלך: הלקוחה האידיאלית שמשלמת לך, לא כלל העוקבים. ככל שממוקד יותר, הפולס מסנן טוב יותר את מי שיכולה להפוך ללקוחה.
          </div>

          <label>שפת הפולסים</label>
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
              נותרו {remaining} ייצורים היום{remaining <= 0 ? " · בפעם הבאה נציג לך את הפרומפט" : ""}
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
                    <button className="copy" onClick={() => navigator.clipboard.writeText(formatPoll(p))}>
                      העתיקו הכל
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
            <h3>הגעת ל-3 ייצורים 🎯</h3>
            <p>העתיקו את הפרומפט המלא ל-ChatGPT / Claude / Gemini שלכם, והמשיכו לייצר סקרים בלי הגבלה:</p>
            <textarea readOnly value={handoffPrompt} />
            <div style={{ marginTop: 8 }}>
              <button className="copy" onClick={() => navigator.clipboard.writeText(handoffPrompt)}>
                העתקת הפרומפט
              </button>
            </div>
          </div>
        </div>
      )}

      <ToolNote />
    </div>
  );
}
