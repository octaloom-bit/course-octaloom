"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// One-time card after first login: "want the newsletter too?".
// Hidden once the user is asked (publicMetadata.newsletterPrompted), so it never nags.
// Exception: arriving with ?newsletter=1 (the button in the thank-you email) re-opens
// the card even after a dismissal, so the email needs no opt-in mechanics of its own.
export default function NewsletterPrompt() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"" | "in" | "skip">("");
  const [fromEmail, setFromEmail] = useState(false);

  useEffect(() => {
    setFromEmail(new URLSearchParams(window.location.search).get("newsletter") === "1");
  }, []);

  if (!isLoaded || !isSignedIn) return null;
  if (user?.publicMetadata?.newsletter) return null;
  if (user?.publicMetadata?.newsletterPrompted && !fromEmail) return null;
  if (done === "skip") return null;

  async function send(action: "subscribe" | "dismiss") {
    setBusy(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await user?.reload();
      setDone(action === "subscribe" ? "in" : "skip");
    } finally {
      setBusy(false);
    }
  }

  if (done === "in") {
    return (
      <div className="nl-card nl-done">
        <span className="nl-check">✓</span>
        <p>מעולה, נרשמת לניוזלטר. נתראה במייל 💜</p>
      </div>
    );
  }

  return (
    <div className="nl-card">
      <div className="nl-text">
        <strong>רוצה גם את הניוזלטר?</strong>
        <p>טיפים שבועיים על לינקדאין ו-B2B, ישר למייל. בלי ספאם, אפשר לצאת בכל רגע.</p>
      </div>
      <div className="nl-actions">
        <button className="nl-yes" onClick={() => send("subscribe")} disabled={busy}>
          {busy ? "רושמת…" : "כן, אני בפנים"}
        </button>
        <button className="nl-no" onClick={() => send("dismiss")} disabled={busy}>
          לא תודה
        </button>
      </div>
    </div>
  );
}
