"use client";

import { useState } from "react";
import { syncTool, currentToolId } from "@/lib/progress-sync";
import {
  SCENARIOS,
  getScenario,
  type Gender,
  type MsgLang,
} from "@/lib/connections-gen";

// AI generator for personalized connection messages: pick a scenario, paste the
// prospect's post, get 3 variations in the course method. Same 3+prompt handoff
// mechanic as the headline generator.
export default function ConnectionGenerator() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [prospectName, setProspectName] = useState("");
  const [prospectGender, setProspectGender] = useState<Gender>("זכר");
  const [writerGender, setWriterGender] = useState<Gender>("נקבה");
  const [writerLine, setWriterLine] = useState("");
  const [material, setMaterial] = useState("");
  const [lang, setLang] = useState<MsgLang>("עברית");
  const [variations, setVariations] = useState<string[]>([]);
  const [handoffPrompt, setHandoffPrompt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const scenario = scenarioId ? getScenario(scenarioId) : null;

  function selectScenario(id: string) {
    setScenarioId(id);
    setVariations([]);
    setHandoffPrompt(null);
    setRemaining(null);
    setError(null);
  }

  function copyVariation(text: string, i: number) {
    navigator.clipboard.writeText(text);
    const tool = currentToolId();
    if (tool) syncTool(tool, "use");
    setCopiedIdx(i);
    window.setTimeout(() => setCopiedIdx(null), 1500);
  }

  async function generate() {
    if (!scenarioId || !material.trim()) {
      setError("חסר החומר על האדם. בלי זה נקבל בדיוק את ההודעה הגנרית שאנחנו מנסים להימנע ממנה.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          prospectName,
          prospectGender,
          writerGender,
          writerLine,
          material,
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
        setVariations([]);
        return;
      }
      setVariations(data.variations || []);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      if (data.lastFree && data.prompt) setHandoffPrompt(data.prompt);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const isRequest = scenario?.kind === "request";

  return (
    <div>
      <div className="section-head">
        <h2>מחולל הודעות מותאמות</h2>
      </div>

      <div className="card">
        <div className="step-label">שלב 1 · בחרו תרחיש</div>
        <div className="formula-grid">
          {SCENARIOS.map((s, i) => (
            <div
              key={s.id}
              className={`formula${scenarioId === s.id ? " active" : ""}`}
              onClick={() => selectScenario(s.id)}
            >
              <span className="formula-num">{i + 1}</span>
              <div className="formula-text">
                <div className="formula-top">
                  <h3>{s.title}</h3>
                  <span className="formula-tag">
                    {s.kind === "request" ? "בקשת חיבור" : "אחרי חיבור"}
                  </span>
                </div>
                <p>{s.when}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {scenario && (
        <div className="card">
          <div className="step-label">שלב 2 · החומר על האדם</div>

          <label>השם הפרטי שלו</label>
          <input
            type="text"
            placeholder="למשל: יעל"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
          />

          <label>{scenario.materialLabel}</label>
          <textarea
            rows={5}
            placeholder={scenario.materialPh}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />

          <label>מי אתם, במשפט (כדי שהחיבור לתחום שלכם יהיה אמיתי)</label>
          <input
            type="text"
            placeholder="למשל: יועצת שיווק B2B לסטארטאפים ישראליים"
            value={writerLine}
            onChange={(e) => setWriterLine(e.target.value)}
          />

          <label>פנייה אליו בלשון</label>
          <select value={prospectGender} onChange={(e) => setProspectGender(e.target.value as Gender)}>
            <option value="זכר">זכר</option>
            <option value="נקבה">נקבה</option>
          </select>

          <label>אתם כותבים בלשון</label>
          <select value={writerGender} onChange={(e) => setWriterGender(e.target.value as Gender)}>
            <option value="נקבה">נקבה</option>
            <option value="זכר">זכר</option>
          </select>

          <label>שפת ההודעה</label>
          <select value={lang} onChange={(e) => setLang(e.target.value as MsgLang)}>
            <option value="עברית">עברית</option>
            <option value="אנגלית">אנגלית</option>
          </select>

          <div style={{ marginTop: 18 }} />
          <button className="btn-primary" onClick={generate} disabled={loading}>
            {loading ? <>מייצרים<span className="spin" /></> : "ייצרו 3 וריאציות"}
          </button>
          {remaining !== null && (
            <div className="counter">
              נותרו {remaining} ייצורים היום{remaining <= 0 ? " · בפעם הבאה נציג לך את הפרומפט" : ""}
            </div>
          )}
          {error && <div className="err">שגיאה: {error}</div>}
        </div>
      )}

      {variations.length > 0 && (
        <div className="card">
          <div className="step-label">שלב 3 · התוצאות</div>
          {isRequest && (
            <div className="legend">
              בקשת חיבור מוגבלת ל-<b>300 תווים</b>. המונה ליד כל וריאציה בודק את זה.
            </div>
          )}
          <div className="results">
            {variations.map((v, i) => {
              const n = v.length;
              const cls = !isRequest || n <= 300 ? "ok" : "over";
              return (
                <div className="variation" key={i}>
                  <div className="txt">
                    <span dir="auto">{v}</span>
                  </div>
                  {isRequest && <span className={`chars ${cls}`}>{n}/300</span>}
                  <button className="copy" onClick={() => copyVariation(v, i)}>
                    {copiedIdx === i ? "✓" : "העתיקו"}
                  </button>
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
            <p>העתיקו את הפרומפט המלא ל-ChatGPT / Claude / Gemini שלכם, והמשיכו לייצר שם בלי הגבלה:</p>
            <textarea readOnly value={handoffPrompt} />
            <div style={{ marginTop: 8 }}>
              <button className="copy" onClick={() => navigator.clipboard.writeText(handoffPrompt)}>
                העתקת הפרומפט
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
