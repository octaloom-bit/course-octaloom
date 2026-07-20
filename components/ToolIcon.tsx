// Hand-drawn stroke icon per tool id. One style: 1.7px stroke, round caps, currentColor.
// Falls back to a compass for tools without a dedicated icon.

const ICONS: Record<string, React.ReactNode> = {
  carousel: (
    <>
      <rect x="7" y="5" width="10" height="14" rx="2" />
      <path d="M3 8v8M21 8v8" />
    </>
  ),
  "identity-audit": (
    <>
      <circle cx="10" cy="8" r="3" />
      <path d="M4 19c0-3 2.6-5 6-5 1 0 1.9.2 2.7.5" />
      <path d="m14 17 2 2 4-4" />
    </>
  ),
  "profile-photo": (
    <>
      <rect x="3" y="6" width="18" height="14" rx="3" />
      <circle cx="12" cy="13" r="3.2" />
      <path d="m8.5 6 1.4-2h4.2L15.5 6" />
    </>
  ),
  headline: (
    <>
      <path d="M5 5v14M12 5v14M5 12h7" />
      <path d="M16 9h4M16 13h4M16 17h3" />
    </>
  ),
  poll: (
    <>
      <path d="M5 19v-9M12 19V5M19 19v-6" />
    </>
  ),
  "cover-text": (
    <>
      <rect x="3" y="5" width="18" height="10" rx="2" />
      <path d="M7 9h7M7 12h4" />
      <path d="M6 19h12" />
    </>
  ),
  about: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
  connections: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  "coffee-chat": (
    <>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 9.5h1.8a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 2.5v2.2M12 2.5v2.2" />
    </>
  ),
  posts: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  "circulation-guide": (
    <>
      <path d="M12 3v10m-4-4 4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  "linkedin-commenter": (
    <>
      <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4z" />
      <path d="M8 8h8M8 12h5" />
    </>
  ),
  "linkedin-formatter": (
    <>
      <path d="M5 7V4h14v3" />
      <path d="M12 4v16M9 20h6" />
    </>
  ),
  "b2b-outreach": (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    </>
  ),
  "meeting-links": (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="m9.5 15.5 2 2 3.5-3.5" />
    </>
  ),
  "presence-score": (
    <>
      <path d="M5 18a8 8 0 1 1 14 0" />
      <path d="m12 14 3.5-3.5" />
      <circle cx="12" cy="14" r="1" />
    </>
  ),
  "content-partner": (
    <>
      <path d="m12 4 1.8 4.4L18 10.2l-4.2 1.8L12 16.5l-1.8-4.5L6 10.2l4.2-1.8z" />
      <path d="m18.6 15.4.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  "weekly-plan": (
    <>
      <path d="m4 6 1.4 1.4L8 4.8M11 6h9" />
      <path d="m4 12 1.4 1.4L8 10.8M11 12h9" />
      <path d="m4 18 1.4 1.4L8 16.8M11 18h9" />
    </>
  ),
  _default: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m15 9-2 5-4 1 2-5z" />
    </>
  ),
};

export default function ToolIcon({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[id] ?? ICONS._default}
    </svg>
  );
}
