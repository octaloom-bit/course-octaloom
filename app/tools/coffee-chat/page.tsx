"use client";

import { useState } from "react";
import Link from "next/link";
import {
  COFFEE_GOALS,
  formatQuestions,
  type Lang,
  type Gender,
  type CoffeeChatResult,
} from "@/lib/coffee-chat";
import {
  COFFEE_CHAT_INTRO,
  COFFEE_CHAT_NO_REFERRAL_NOTE,
  MYTHS,
  SOURCE_ARTICLE,
  WHY_BLOCKS,
} from "@/content/coffee-chat";
import LinkedInIcon from "@/components/LinkedInIcon";
import ToolNote from "@/components/ToolNote";

// Line icons per goal (feather-style), matching the poll tool's grid style.
const ICONS: Record<string, React.ReactElement> = {
  "industry-pivot": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17h6a4 4 0 0 0 4-4V9" /><path d="m11 6 3-3 3 3" /><path d="M14 3v10" /><path d="m7 14-3 3 3 3" /></svg>
  ),
  "target-company": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15" /><path d="M14 11h5a1 1 0 0 1 1 1v9" /><path d="M7 9h4M7 13h4M7 17h4M17 15h.01M17 18h.01" /></svg>
  ),
  "positioning-feedback": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 10a3 3 0 1 1 4 2.8V15" /><path d="M12 18h.01" /></svg>
  ),
  "long-term-sponsor": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6 1 0 2 .3 2.8.7" /><path d="m16 13 1.4 3 3.1.4-2.3 2.2.6 3.1L16 20.2 13.2 21.7l.6-3.1-2.3-2.2 3.1-.4z" /></svg>
  ),
};

const GENDERS: Gender[] = ["זכר", "נקבה"];

export default function CoffeeChatPage() {
  const [goalId, setGoalId] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactGender, setContactGender] = useState<Gender>("זכר");
  const [writerGender, setWriterGender] = useState<Gender>("נקבה");
  const [userContext, setUserContext] = useState("");
  const [lang, setLang] = useState<Lang>("עברית");
  const [result, setResult] = useState<CoffeeChatResult | null>(null);
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

  function selectGoal(key: string) {
    setGoalId(key);
    setResult(null);
    setHandoffPrompt(null);
    setRemaining(null);
    setError(null);
  }

  async function generate() {
    if (!goalId || !userContext.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coffee-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          contactName,
          contactRole,
          contactGender,
          writerGender,
          userContext,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "שגיאה");
        return;
      }
      if (data.handoff) {
        setHandoffPrompt(data.prompt);
        setResult(null);
        return;
      }
      setResult(data.result || null);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      if (data.lastFree && data.prompt) setHandoffPrompt(data.prompt);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const goal = goalId ? COFFEE_GOALS[goalId] : null;

  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי למחפשי עבודה
        </span>
        <h1>
          שיחת ה<span className="accent">קפה</span>
        </h1>
        <p className="sub">{COFFEE_CHAT_INTRO}</p>
      </div>

      <div className="section-head">
        <h2>למה בכלל לדבר עם אנשים</h2>
      </div>

      {WHY_BLOCKS.map((b) => (
        <div className="card" key={b.heading}>
          <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 500 }}>{b.heading}</h3>
          {b.body.map((p, i) => (
            <p key={i} style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.65 }}>{p}</p>
          ))}
          {b.cite && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              מקור:{" "}
              <a href={b.cite.url} target="_blank" rel="noopener noreferrer">
                {b.cite.source}
              </a>
            </p>
          )}
        </div>
      ))}

      <div className="section-head">
        <h2>שני מספרים שתשמעו, ואסור להאמין להם</h2>
      </div>

      <div className="card">
        <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.65 }}>
          שניהם מסתובבים בכל קבוצת מחפשי עבודה, ושניהם הגיעו מספקים מסחריים בלי שום מתודולוגיה מאחוריהם.
        </p>
        {MYTHS.map((m) => (
          <div className="copyline" key={m.claim} style={{ display: "block" }}>
            <p style={{ fontWeight: 500, marginBottom: 6 }}>״{m.claim}״</p>
            <p style={{ fontSize: 13.5, color: "var(--muted)" }}>{m.truth}</p>
            {m.cite && (
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted)" }}>
                <a href={m.cite.url} target="_blank" rel="noopener noreferrer">{m.cite.source}</a>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="pro-note">
        <div>
          <strong>מאיפה הרעיון לכלי</strong>
          <p>
            {SOURCE_ARTICLE.note}{" "}
            <a href={SOURCE_ARTICLE.url} target="_blank" rel="noopener noreferrer">
              {SOURCE_ARTICLE.title}
            </a>{" "}
            ({SOURCE_ARTICLE.author}, {SOURCE_ARTICLE.date}).
          </p>
        </div>
      </div>

      <div className="gen">
        <div className="gen-hero">
          <span className="gen-eyebrow">מחולל AI · למחפשי עבודה</span>
          <h2>שיחה מוכנה, בשלושה צעדים</h2>
          <p>
            בוחרים מה רוצים מהשיחה, מספרים מי האדם ומי אתם, ומקבלים פתיח, חמש שאלות, שאלה אחת שלא לשאול, והודעת המשך.
          </p>
        </div>

        <div className="steps">
          <div className="step"><span className="step-num">1</span> בחרו מטרה</div>
          <div className="step-arrow">←</div>
          <div className="step"><span className="step-num">2</span> פרטי השיחה</div>
          <div className="step-arrow">←</div>
          <div className="step"><span className="step-num">3</span> קבלו הכנה</div>
        </div>

        <div className="card">
          <div className="step-label">שלב 1 · מה אתם רוצים מהשיחה</div>
          <div className="formula-grid">
            {Object.entries(COFFEE_GOALS).map(([key, g]) => (
              <div
                key={key}
                className={`formula${goalId === key ? " active" : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={goalId === key}
                onClick={() => selectGoal(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectGoal(key);
                  }
                }}
              >
                <span className="formula-num poll-icon">{ICONS[key]}</span>
                <div className="formula-text">
                  <div className="formula-top">
                    <h3>{g.title}</h3>
                    <span className="formula-tag">{g.tag}</span>
                  </div>
                  <p>{g.when}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {goal && (
          <div className="card">
            <div className="step-label">שלב 2 · פרטי השיחה</div>

            <label>שם האדם</label>
            <input
              type="text"
              placeholder="שם פרטי מספיק"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />

            <label>מי הוא, ואיך הגעתם אליו</label>
            <input
              type="text"
              placeholder="למשל: Product Manager במאנדיי, ראיתי פוסט שלו על מעבר מ-QA למוצר"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
            />

            <label>פנייה אליו בלשון</label>
            <select
              value={contactGender}
              onChange={(e) => setContactGender(e.target.value as Gender)}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <label>אתם כותבים בלשון</label>
            <select
              value={writerGender}
              onChange={(e) => setWriterGender(e.target.value as Gender)}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <label>מי אתם, מה אתם מחפשים, ולמה דווקא הקשר הזה (הכי חשוב)</label>
            <textarea
              rows={5}
              placeholder="למשל: 4 שנים ב-QA בחברת סייבר, רוצה לעבור לניהול מוצר. הוא עשה בדיוק את המעבר הזה לפני שנתיים באותה תעשייה."
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
            />
            <div className="field-hint">
              ככל שתכתבו פה משהו ספציפי, השאלות ייצאו מותאמות לשיחה הזאת. תיאור כללי מייצר שאלות כלליות.
            </div>

            <label>שפת הפלט</label>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              <option value="עברית">עברית</option>
              <option value="אנגלית">אנגלית</option>
            </select>

            <div style={{ marginTop: 18 }} />
            <button
              className="btn-primary"
              onClick={generate}
              disabled={loading || !userContext.trim()}
            >
              {loading ? <>מכינים<span className="spin" /></> : "הכינו לי את השיחה"}
            </button>
            {remaining !== null && (
              <div className="counter">
                נותרו {remaining} ייצורים היום{remaining <= 0 ? " · בפעם הבאה נציג לכם את הפרומפט" : ""}
              </div>
            )}
            {error && <div className="err">שגיאה: {error}</div>}
          </div>
        )}

        {result && (
          <>
            <div className="card">
              <div className="poll-head">
                <span className="poll-num">1 · פתיח 30 שניות</span>
                <button
                  className={`copy${copied === "opener" ? " done" : ""}`}
                  onClick={() => copyText(result.opener, "opener")}
                >
                  {copied === "opener" ? "הועתק ✓" : "העתיקו"}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }} dir="auto">{result.opener}</p>
            </div>

            <div className="card">
              <div className="poll-head">
                <span className="poll-num">2 · חמש שאלות, מקליל לעמוק</span>
                <button
                  className={`copy${copied === "questions" ? " done" : ""}`}
                  onClick={() => copyText(formatQuestions(result.questions), "questions")}
                >
                  {copied === "questions" ? "הועתק ✓" : "העתיקו הכל"}
                </button>
              </div>
              <div className="results">
                {result.questions.map((q, i) => (
                  <div className="poll" key={i}>
                    <div className="poll-head">
                      <span className="poll-num">{i + 1}</span>
                      <span className="formula-tag">{q.depth}</span>
                    </div>
                    <div className="poll-q" dir="auto">{q.q}</div>
                    {q.reveals && (
                      <div className="poll-why">
                        <span className="poll-meta-label">מה זה חושף</span>
                        <span dir="auto">{q.reveals}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="poll-head">
                <span className="poll-num">3 · מה לא לשאול בשיחה הזאת</span>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 500 }} dir="auto">
                ״{result.avoid.q}״
              </p>
              <div className="poll-why">
                <span className="poll-meta-label">למה</span>
                <span dir="auto">{result.avoid.why}</span>
              </div>
            </div>

            <div className="card">
              <div className="poll-head">
                <span className="poll-num">4 · הודעת המשך, 24 שעות אחרי</span>
                <button
                  className={`copy${copied === "followup" ? " done" : ""}`}
                  onClick={() => copyText(result.followUp, "followup")}
                >
                  {copied === "followup" ? "הועתק ✓" : "העתיקו"}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }} dir="auto">{result.followUp}</p>
            </div>
          </>
        )}

        {handoffPrompt && (
          <div className="card">
            <div className="handoff">
              <h3>נגמרו 3 הייצורים להיום</h3>
              <p>העתיקו את הפרומפט המלא ל-ChatGPT / Claude / Gemini שלכם, ותמשיכו להכין שיחות בלי הגבלה:</p>
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

      <div className="pro-note">
        <div>
          <strong>{COFFEE_CHAT_NO_REFERRAL_NOTE.title}</strong>
          <p>
            {COFFEE_CHAT_NO_REFERRAL_NOTE.body}{" "}
            <Link href={COFFEE_CHAT_NO_REFERRAL_NOTE.href}>
              {COFFEE_CHAT_NO_REFERRAL_NOTE.linkLabel}
            </Link>
          </p>
        </div>
      </div>

      <ToolNote />
    </div>
  );
}
