import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { listAllProgress, normalizeToolUse, type UserProgress } from "@/lib/progress-server";
import { CHAPTERS } from "@/lib/chapters";
import { TOOLS } from "@/lib/tools";

export const dynamic = "force-dynamic";

const TOOL_TITLE: Record<string, string> = Object.fromEntries(TOOLS.map((t) => [t.id, t.title]));

function pctClass(p: number): string {
  if (p >= 95) return "pc-done";
  if (p > 0) return "pc-part";
  return "pc-none";
}

type Row = UserProgress & { createdAt: number; hasAccess: boolean };

// Every registered Clerk user, with their progress merged in (empty if none yet).
async function buildRows(): Promise<Row[]> {
  const client = await clerkClient();
  const progressById = new Map((await listAllProgress()).map((p) => [p.userId, p]));

  const rows: Row[] = [];
  let offset = 0;
  for (;;) {
    const page = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const u of page.data) {
      const email = u.primaryEmailAddress?.emailAddress || "";
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || undefined;
      const p = progressById.get(u.id);
      rows.push({
        userId: u.id,
        email,
        name,
        videos: p?.videos || {},
        tools: p?.tools || {},
        updatedAt: p?.updatedAt || "",
        createdAt: u.createdAt,
        hasAccess: u.publicMetadata?.courseAccess === true,
      });
    }
    offset += page.data.length;
    if (page.data.length < 100 || offset >= page.totalCount) break;
  }
  return rows;
}

export default async function AdminProgressPage() {
  if (!isAdmin(await currentUser())) redirect("/");
  const rows = await buildRows();

  return (
    <div className="wrap">
      <h1 className="admin-title">התקדמות בקורס</h1>
      <p className="admin-sub">
        <Link href="/admin/codes">← לקודי גישה</Link>
      </p>

      <p className="admin-note">
        {rows.length} נרשמים · צ׳יפ סגול = השתמש בכלי, צ׳יפ אפור = רק פתח
      </p>
      <div className="admin-scroll">
        <table className="admin-table progress-table">
          <thead>
            <tr>
              <th className="sticky-col">משתמש</th>
              <th>נרשם</th>
              <th>סה״כ</th>
              {CHAPTERS.map((c) => (
                <th key={c.id} title={c.title}>{c.label}</th>
              ))}
              <th>כלים</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const overall = Math.round(
                CHAPTERS.reduce((a, c) => a + Math.min(100, r.videos[c.id] || 0), 0) / CHAPTERS.length
              );
              const tools = Object.entries(r.tools)
                .map(([id, raw]) => ({ id, ...normalizeToolUse(raw) }))
                .sort((a, b) => b.uses - a.uses || b.opens - a.opens);
              return (
                <tr key={r.userId}>
                  <td className="sticky-col" dir="ltr">
                    {r.email || r.userId}
                    {!r.hasAccess && <span className="no-access-tag">אין גישה</span>}
                  </td>
                  <td className="signup-date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("he-IL") : "—"}
                  </td>
                  <td className={pctClass(overall)}>{overall}%</td>
                  {CHAPTERS.map((c) => {
                    const p = Math.round(r.videos[c.id] || 0);
                    return <td key={c.id} className={pctClass(p)}>{p ? `${p}%` : "—"}</td>;
                  })}
                  <td className="tools-cell">
                    {tools.length === 0
                      ? "—"
                      : tools.map((t) => (
                          <span key={t.id} className={`tool-chip${t.uses > 0 ? " used" : " opened"}`}>
                            {t.uses > 0 ? "✓ " : ""}
                            {TOOL_TITLE[t.id] || t.id}
                            {t.uses > 1 ? ` ×${t.uses}` : ""}
                          </span>
                        ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
