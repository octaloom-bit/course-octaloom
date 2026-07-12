/**
 * Print-to-PDF without a bundled PDF library: render a branded, RTL A4 document
 * into a hidden iframe and hand it to the browser's print dialog ("Save as PDF").
 */

export type PrintSection = { title: string; body: string };

export type PrintDocOptions = {
  title: string;
  eyebrow?: string;
  intro?: string;
  sections: PrintSection[];
  footer?: string;
  fileName?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Branded RTL document, shared by the PDF print view and the emailed copy. */
export function buildDocHtml(opts: PrintDocOptions): string {
  const sections = opts.sections
    .map(
      (s, i) => `
      <section class="q">
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <h2>${escapeHtml(s.title)}</h2>
        <p class="a">${escapeHtml(s.body) || "<span class='empty'>(טרם מולא)</span>"}</p>
      </section>`
    )
    .join("");

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<title>${escapeHtml(opts.fileName || opts.title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #ECE9E7; color: #201E4B;
    font-family: "Assistant", "Heebo", -apple-system, "Segoe UI", sans-serif;
    font-size: 12pt; line-height: 1.6;
  }
  .eyebrow {
    display: inline-block; background: #F3E8FC; color: #712EAC;
    border-radius: 100px; padding: 4px 12px; font-size: 9.5pt; font-weight: 600;
    margin-bottom: 12px;
  }
  h1 { font-size: 26pt; margin: 0 0 8px; letter-spacing: -.02em; }
  h1 .accent { color: #712EAC; }
  .intro { color: rgba(32,30,75,.75); margin: 0 0 22px; font-size: 11pt; }
  .rule { height: 3px; background: linear-gradient(90deg,#C5E6A2,#712EAC); border-radius: 100px; margin-bottom: 26px; }
  .q { background: #F6F4F1; border: 1px solid rgba(32,30,75,.12); border-radius: 12px;
       padding: 16px 18px; margin-bottom: 14px; page-break-inside: avoid; }
  .num { color: #712EAC; font-weight: 700; font-size: 10pt; letter-spacing: .06em; }
  .q h2 { font-size: 13pt; margin: 2px 0 8px; font-weight: 600; }
  .a { margin: 0; white-space: pre-wrap; }
  .empty { color: rgba(32,30,75,.45); }
  footer { margin-top: 22px; padding-top: 14px; border-top: 1px solid rgba(32,30,75,.12);
           color: rgba(32,30,75,.55); font-size: 9.5pt; }
  @media print { body { background: #ECE9E7; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  ${opts.eyebrow ? `<span class="eyebrow">${escapeHtml(opts.eyebrow)}</span>` : ""}
  <h1>${escapeHtml(opts.title)}</h1>
  ${opts.intro ? `<p class="intro">${escapeHtml(opts.intro)}</p>` : ""}
  <div class="rule"></div>
  ${sections}
  ${opts.footer ? `<footer>${escapeHtml(opts.footer)}</footer>` : ""}
</body>
</html>`;
}

/** Opens the browser print dialog on a branded copy of the answers. */
export function printPdf(opts: PrintDocOptions): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;inset:0;width:0;height:0;border:0;opacity:0;";
  document.body.appendChild(iframe);

  const cleanup = () => {
    // Give Safari a beat to finish spooling before the document disappears.
    setTimeout(() => iframe.remove(), 1000);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return cleanup();
    win.focus();
    win.print();
    win.onafterprint = cleanup;
    setTimeout(cleanup, 60_000);
  };

  iframe.srcdoc = buildDocHtml(opts);
}
