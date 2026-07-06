"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { syncTool } from "@/lib/progress-sync";
import { AUDIT_QUESTIONS } from "@/lib/plan";
import LinkedInIcon from "@/components/LinkedInIcon";
import ToolNote from "@/components/ToolNote";

const KEY = "octa-identity-audit";

export default function IdentityAuditPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

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

  function email() {
    const subject = encodeURIComponent("ה-Identity Audit שלי");
    const body = encodeURIComponent(buildText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

      <div className="card">
        <div className="step-label">3 שאלות · התשובות נשמרות אצלכם בדפדפן</div>
        {AUDIT_QUESTIONS.map((q, i) => (
          <div key={q.id}>
            <label>{i + 1}. {q.q}</label>
            <textarea
              placeholder={q.ph}
              value={answers[q.id] || ""}
              onChange={(e) => update(q.id, e.target.value)}
              style={{ minHeight: 90 }}
            />
          </div>
        ))}
        <div className="counter">
          {filled.length}/{AUDIT_QUESTIONS.length} שאלות מולאו · נשמר אוטומטית
        </div>
      </div>

      {done && (
        <div className="card">
          <div className="handoff">
            <h3>נוסחת הבידול שלך מוכנה 🎯</h3>
            <p>
              מישהו אחר יכול לדבר על אותו נושא. הוא לא יכול לדבר על הניסיון שלך, על הטעות הספציפית שלך,
              על התהליך שפיתחת. שמרו את זה, ותחזרו אליו לפני כל פוסט.
            </p>
            <textarea readOnly value={buildText()} style={{ minHeight: 200 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button className="copy" onClick={copy}>
                {saved ? "הועתק ✓" : "העתקת הטקסט"}
              </button>
              <button className="copy" onClick={email}>
                שליחה למייל שלי
              </button>
            </div>
          </div>
        </div>
      )}

      <ToolNote />
    </div>
  );
}
