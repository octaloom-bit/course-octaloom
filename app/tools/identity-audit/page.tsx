"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { syncTool } from "@/lib/progress-sync";
import { AUDIT_QUESTIONS } from "@/lib/plan";
import { printPdf } from "@/lib/print-pdf";
import LinkedInIcon from "@/components/LinkedInIcon";
import ToolNote from "@/components/ToolNote";

const KEY = "octa-identity-audit";

const DOC_EYEBROW = "לינקדאין עם OctaLoom · פרק 5";
const DOC_TITLE = "ה-Identity Audit שלי";
const DOC_INTRO =
  "נוסחת הבידול שלי בתוכן. מישהו אחר יכול לדבר על אותו נושא, הוא לא יכול לדבר על הניסיון שלי.";
const DOC_FOOTER = "octaloom.com · תחזרו לזה לפני כל פוסט.";

export default function IdentityAuditPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [mail, setMail] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Load any previous answers from localStorage (no backend needed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function update(id: string, value: string) {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    setSaved(false);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const filled = AUDIT_QUESTIONS.filter((q) => (answers[q.id] || "").trim().length > 0);
  const done = filled.length === AUDIT_QUESTIONS.length;

  function buildText(): string {
    const lines = [
      "ה-Identity Audit שלי: נוסחת הבידול שלי בתוכן",
      "(מתוך הקורס: לינקדאין עם OctaLoom, פרק 5)",
      "",
    ];
    AUDIT_QUESTIONS.forEach((q, i) => {
      lines.push(`${i + 1}. ${q.q}`);
      lines.push((answers[q.id] || "").trim() || "(טרם מולא)");
      lines.push("");
    });
    lines.push("זה מה שיהפוך את הפוסטים שלי לבלתי ניתנים להחלפה.");
    return lines.join("\n");
  }

  function copy() {
    navigator.clipboard.writeText(buildText());
    syncTool("identity-audit", "use");
    setSaved(true);
  }

  function docSections() {
    return AUDIT_QUESTIONS.map((q) => ({ title: q.q, body: (answers[q.id] || "").trim() }));
  }

  async function email() {
    setMail("sending");
    try {
      const res = await fetch("/api/email-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: DOC_TITLE,
          eyebrow: DOC_EYEBROW,
          intro: DOC_INTRO,
          footer: DOC_FOOTER,
          sections: docSections(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setMail("sent");
      syncTool("identity-audit", "use");
    } catch {
      setMail("error");
    }
  }

  function pdf() {
    printPdf({
      title: DOC_TITLE,
      eyebrow: DOC_EYEBROW,
      intro: DOC_INTRO,
      sections: docSections(),
      footer: DOC_FOOTER,
      fileName: "identity-audit",
    });
    syncTool("identity-audit", "use");
  }

  return (
    <div className="wrap">
      <Link href="/tools" className="backlink">→ חזרה לכלים</Link>

      <div className="hero">
        <span className="eyebrow">
          <LinkedInIcon />
          תרגיל: Identity Audit (נוסחת הבידול שלכם)
        </span>
        <h1>
          Identity <span className="accent">Audit</span>
        </h1>
        <p className="sub">
          לפני שנצלול לכתיבת פוסטים או לאופטימיזציה של הפרופיל, אנחנו חייבים לעצור רגע. המטרה כאן היא לזקק את
          הזווית הייחודית שרק אתם מביאים לשולחן, זו שהופכת אתכם לבלתי ניתנים להחלפה. שכחו מהגדרות ״נישה״ גנריות.
          כאן מדובר במשהו עמוק יותר, ואישי יותר.
        </p>
        <p className="sub" style={{ marginTop: 10 }}>
          קחו 10 דקות של שקט, וענו בכנות על שלוש השאלות האלו. אל תדלגו על זה, זה הבסיס לכל מה שתבנו כאן:
        </p>
      </div>

      <div className="wp-progress">
        <div className="cp-head">
          <span>ההתקדמות שלי</span>
          <span className="cp-pct">{filled.length}/{AUDIT_QUESTIONS.length}</span>
        </div>
        <div className="cp-bar">
          <div
            className="cp-fill"
            style={{ width: `${(filled.length / AUDIT_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <div className="cp-meta">3 שאלות · התשובות נשמרות אצלכם בדפדפן</div>
      </div>

      {AUDIT_QUESTIONS.map((q, i) => (
        <section className="wp-section" key={q.id}>
          <div className="wp-head">
            <span className="wp-num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2>{q.q}</h2>
            </div>
          </div>
          <div className="wp-items">
            <textarea
              placeholder={q.ph}
              value={answers[q.id] || ""}
              onChange={(e) => update(q.id, e.target.value)}
              style={{ minHeight: 90 }}
            />
          </div>
        </section>
      ))}

      {done && (
        <div className="card">
          <div className="handoff">
            <h3>נוסחת הבידול שלך מוכנה</h3>
            <p>
              מישהו אחר יכול לדבר על אותו נושא. הוא לא יכול לדבר על הניסיון שלך, על הטעות הספציפית שלך,
              על התהליך שפיתחת. שמרו את זה, ותחזרו אליו לפני כל פוסט.
            </p>
            <textarea readOnly value={buildText()} style={{ minHeight: 200 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button className="copy" onClick={copy}>
                {saved ? "הועתק ✓" : "העתקת הטקסט"}
              </button>
              <button className="copy" onClick={pdf}>
                הורדה כ-PDF
              </button>
              <button className="copy" onClick={email} disabled={mail === "sending"}>
                {mail === "sending"
                  ? "שולחת…"
                  : mail === "sent"
                    ? "נשלח למייל ✓"
                    : "שליחה למייל שלי"}
              </button>
            </div>
            {mail === "error" && (
              <p style={{ marginTop: 8, fontSize: 13, color: "var(--error)" }}>
                השליחה נכשלה. אפשר להוריד כ-PDF או להעתיק את הטקסט.
              </p>
            )}
            {mail === "sent" && (
              <p style={{ marginTop: 8, fontSize: 13, color: "var(--faint)" }}>
                שלחנו לכתובת שאיתה נרשמת לקורס.
              </p>
            )}
          </div>
        </div>
      )}

      <ToolNote />
    </div>
  );
}
