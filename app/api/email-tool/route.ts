import { auth, clerkClient } from "@clerk/nextjs/server";
import { buildDocHtml, type PrintSection } from "@/lib/print-pdf";

export const runtime = "nodejs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = process.env.RESEND_FROM || "OctaLoom <course@octaloom.com>";
const MAX_CHARS = 20_000;

// Emails a tool's filled-in output to the signed-in user's own address.
// Replaces the old mailto: link, which silently did nothing for anyone without
// a default mail client and truncated long bodies at the URL length limit.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "email not configured" }, { status: 503 });
  }

  let body: {
    title?: string;
    eyebrow?: string;
    intro?: string;
    footer?: string;
    sections?: PrintSection[];
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const sections = Array.isArray(body.sections) ? body.sections : [];
  if (!title || sections.length === 0) {
    return Response.json({ error: "missing title or sections" }, { status: 400 });
  }

  const size = sections.reduce((n, s) => n + (s.title?.length || 0) + (s.body?.length || 0), 0);
  if (size > MAX_CHARS) {
    return Response.json({ error: "content too long" }, { status: 413 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const to = user.primaryEmailAddress?.emailAddress;
  if (!to) return Response.json({ error: "no email on user" }, { status: 400 });

  const html = buildDocHtml({
    title,
    eyebrow: body.eyebrow,
    intro: body.intro,
    footer: body.footer,
    sections: sections.map((s) => ({ title: String(s.title || ""), body: String(s.body || "") })),
  });

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject: title, html }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("resend send failed:", res.status, detail);
    return Response.json({ error: "send failed" }, { status: 502 });
  }

  return Response.json({ ok: true, to });
}
