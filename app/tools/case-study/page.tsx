"use client";

import { useState } from "react";
import Link from "next/link";
import { STORY_FIELDS, type PostLang } from "@/lib/case-study-gen";
import { CASE_STUDY_INTRO, CASE_STUDY_PROMPT } from "@/content/case-study-post";
import LinkedInIcon from "@/components/LinkedInIcon";
import PromptCard from "@/components/PromptCard";
import ToolNote from "@/components/ToolNote";

type Mode = "generate" | "prompt";

export default function CaseStudyPage() {
  const [mode, setMode] = useState<Mode>("generate");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<PostLang>("עברית");
  const [posts, setPosts] = useState<string[]>([]);
  const [handoffPrompt, setHandoffPrompt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The story is the point. Without the first two fields there is nothing to edit.
  const ready =
    (answers.situation || "").trim().length > 15 &&
    (answers.actions || "").trim().length > 15;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "שגיאה");
        return;
      }
      if (data.handoff) {
        setHandoffPrompt(data.prompt);
        setPosts([]);
        return;
      }
      setPosts(data.posts || []);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      if (data.lastFree && data.prompt) setHandoffPrompt(data.prompt);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          כלי עזר לקורס · פרק 7
        </span>
        <h1 style={{ maxWidth: "none" }}>
          פוסט <span className="accent">קייס סטאדי</span>
        </h1>
      </div>

      <div className="card">
        <p className="lead">{CASE_STUDY_INTRO}</p>
      </div>

      <div className="toolfilter" role="tablist" aria-label="בחירת מצב">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "generate"}
          className={`tf-tab${mode === "generate" ? " on" : ""}`}
          onClick={() => setMode("generate")}
        >
          לכתוב איתי כאן
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "prompt"}
          className={`tf-tab${mode === "prompt" ? " on" : ""}`}
          onClick={() => setMode("prompt")}
        >
          להעתיק פרומפט
        </button>
      </div>

      {mode === "prompt" ? (
        <PromptCard
          title="הפרומפט"
          tag="מלווה אתכם שאלה־שאלה ב-ChatGPT או Claude, ובונה את הפוסט בארבעה חלקים"
          body={CASE_STUDY_PROMPT}
        />
      ) : (
        <>
          <div className="card">
            <div className="step-label">הסיפור שלכם</div>
            <p className="legend">
              ככל שתכתבו כאן חומר אמיתי וספציפי, כך הפוסט יהיה שלכם. הכלי <b>עורך</b> את מה שתיתנו,
              והוא לא ימציא פרטים או מספרים שלא כתבתם.
            </p>

            {STORY_FIELDS.map((f) => (
              <div className="field" key={f.id}>
                <label>
                  {f.label}
                  {f.optional && <span className="opt"> · רשות</span>}
                </label>
                <textarea
                  rows={f.big ? 4 : 2}
                  placeholder={f.ph}
                  value={answers[f.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })}
                />
              </div>
            ))}

            <div className="field">
              <label>שפת הפוסט</label>
              <select value={lang} onChange={(e) => setLang(e.target.value as PostLang)}>
                <option value="עברית">עברית</option>
                <option value="אנגלית">אנגלית</option>
              </select>
            </div>

            <div style={{ marginTop: 18 }} />
            <button className="btn-primary" onClick={generate} disabled={loading || !ready}>
              {loading ? <>כותבים<span className="spin" /></> : "ייצרו שתי גרסאות"}
            </button>
            {!ready && (
              <div className="counter">
                כדי להתחיל, מלאו לפחות את המצב ההתחלתי ואת מה שעשיתם.
              </div>
            )}
            {remaining !== null && (
              <div className="counter">
                נותרו {remaining} ייצורים היום
                {remaining <= 0 ? " · בפעם הבאה נציג לך את הפרומפט" : ""}
              </div>
            )}
            {error && <div className="err">שגיאה: {error}</div>}
          </div>

          {posts.length > 0 && (
            <div className="card">
              <div className="step-label">שתי גרסאות</div>
              <p className="legend">
                בחרו אחת, ואז <b>תשנו בה משהו</b>. פוסט שעבר דרך היד שלכם תמיד מנצח.
              </p>
              <div className="results">
                {posts.map((p, i) => (
                  <div className="variation post" key={i}>
                    <div className="txt" dir="auto" style={{ whiteSpace: "pre-wrap" }}>
                      {p}
                    </div>
                    <button className="copy" onClick={() => navigator.clipboard.writeText(p)}>
                      העתיקו
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {handoffPrompt && (
            <div className="card">
              <div className="handoff">
                <h3>הגעת ל-3 ייצורים להיום</h3>
                <p>
                  העתיקו את הפרומפט המלא ל-ChatGPT / Claude / Gemini שלכם, והמשיכו לשחק איתו שם בלי
                  הגבלה:
                </p>
                <textarea readOnly value={handoffPrompt} />
                <div style={{ marginTop: 8 }}>
                  <button
                    className="copy"
                    onClick={() => navigator.clipboard.writeText(handoffPrompt)}
                  >
                    העתקת הפרומפט
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <ToolNote />
    </div>
  );
}
