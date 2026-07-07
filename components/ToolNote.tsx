// Shared closing note shown at the bottom of every tool page.
export default function ToolNote() {
  return (
    <div className="tool-note">
      <span className="tool-note-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.3 1.5 1.5 2.5h5c.2-1 .7-1.8 1.5-2.5A6 6 0 0 0 12 3Z" />
        </svg>
      </span>
      <p>
        כלי ה-AI מצוינים להשראה ולבניית בסיס ראשוני. אם התוצאה שקיבלת לא מדויקת עבורך, תמיד אפשר
        להריץ אותה שוב עם דגשים חדשים, או פשוט ליישם את העקרונות שלמדנו ולכתוב זאת בעצמך.
      </p>
    </div>
  );
}
