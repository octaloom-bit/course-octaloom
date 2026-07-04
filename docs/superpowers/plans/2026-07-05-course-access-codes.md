# Course Access Codes + Waitlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock course content behind one-time personal access codes, with a waitlist page for visitors without a code.

**Architecture:** Codes live in Upstash Redis (`code:<CODE>` JSON + `codes:index` set). Access = `publicMetadata.courseAccess` on the Clerk user, granted at redemption (`/api/redeem`) which also adds the user to the MailerLite course group (triggering the welcome sequence). Content pages call a shared `requireCourseAccess()` server helper. `/sign-up` becomes a waitlist screen; the real Clerk SignUp moves to `/join` → lands on `/redeem`.

**Tech Stack:** Next.js 16 (app router), Clerk v7, @upstash/redis, MailerLite REST (existing lib/mailerlite.ts), vitest for pure logic.

## Global Constraints

- Hebrew UI copy: gender-neutral singular (past-tense 2nd person, infinitives). No "נרשמתם".
- Course group id 191005477850580526 ("נרשמי קורס לינקדאין"); newsletter group 191005479104677105.
- Existing 14 production users must keep access (backfill, Task 8).
- Code format `LNKD-XXXX`, alphabet without ambiguous chars, case-insensitive redemption.
- All new API routes rate-limited with existing `lib/ratelimit.ts` pattern where public.
- Env names: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ADMIN_EMAILS`, `MAILERLITE_GROUP_WAITLIST`.

---

### Task 1: Deps + KV client

**Files:**
- Modify: `package.json` (deps)
- Create: `lib/kv.ts`
- Modify: `.env.local` (placeholders)

**Interfaces:**
- Produces: `kv` — an `@upstash/redis` `Redis` instance created from env.

- [ ] **Step 1: Install deps**

```bash
npm i @upstash/redis && npm i -D vitest
```

- [ ] **Step 2: Create lib/kv.ts**

```ts
import { Redis } from "@upstash/redis";

export function getKv() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("missing UPSTASH_REDIS_REST_* env");
  return new Redis({ url, token });
}
```

- [ ] **Step 3: Append env placeholders to .env.local**

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ADMIN_EMAILS=hanitayudovski@gmail.com,octaloom@gmail.com,hanita@octaloom.com
MAILERLITE_GROUP_WAITLIST=
```

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit && git add -A && git commit -m "feat: add upstash kv client + env scaffolding"
```

### Task 2: Code store logic (TDD)

**Files:**
- Create: `lib/codes.ts`
- Test: `lib/codes.test.ts`
- Modify: `package.json` (scripts.test = "vitest run")

**Interfaces:**
- Consumes: kv-like interface (injected, so tests use an in-memory fake).
- Produces:
  - `type AccessCode = { code: string; status: "active" | "redeemed"; note?: string; lockedEmail?: string; createdAt: string; redeemedBy?: string; redeemedByEmail?: string; redeemedAt?: string }`
  - `generateCodeString(): string` — `LNKD-XXXX`, alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
  - `createCodes(kv, n, opts?: {note?: string; lockedEmail?: string}): Promise<AccessCode[]>`
  - `listCodes(kv): Promise<AccessCode[]>` (newest first)
  - `redeemCode(kv, rawCode, user: {id: string; email: string}): Promise<{ok: true} | {ok: false; reason: "not_found" | "already_redeemed" | "email_mismatch"}>`

- [ ] **Step 1: Write failing tests** (`lib/codes.test.ts`, in-memory fake with `get/set/sadd/smembers` + `set(key, val, {nx: true})` semantics)

```ts
import { describe, it, expect } from "vitest";
import { generateCodeString, createCodes, listCodes, redeemCode } from "./codes";

function fakeKv() {
  const store = new Map<string, unknown>();
  const sets = new Map<string, Set<string>>();
  return {
    async get(k: string) { return store.get(k) ?? null; },
    async set(k: string, v: unknown, opts?: { nx?: boolean }) {
      if (opts?.nx && store.has(k)) return null;
      store.set(k, v); return "OK";
    },
    async sadd(k: string, ...m: string[]) { const s = sets.get(k) ?? new Set(); m.forEach(x => s.add(x)); sets.set(k, s); return m.length; },
    async smembers(k: string) { return [...(sets.get(k) ?? [])]; },
  };
}

describe("codes", () => {
  it("generates LNKD-XXXX without ambiguous chars", () => {
    const c = generateCodeString();
    expect(c).toMatch(/^LNKD-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
  });

  it("creates and lists codes", async () => {
    const kv = fakeKv();
    await createCodes(kv, 2, { note: "טל" });
    expect((await listCodes(kv)).length).toBe(2);
  });

  it("redeems once, second attempt fails", async () => {
    const kv = fakeKv();
    const [c] = await createCodes(kv, 1);
    const u = { id: "u1", email: "a@b.co" };
    expect((await redeemCode(kv, c.code.toLowerCase(), u)).ok).toBe(true);
    const again = await redeemCode(kv, c.code, { id: "u2", email: "x@y.co" });
    expect(again).toEqual({ ok: false, reason: "already_redeemed" });
  });

  it("enforces lockedEmail case-insensitively", async () => {
    const kv = fakeKv();
    const [c] = await createCodes(kv, 1, { lockedEmail: "VIP@Client.com" });
    const bad = await redeemCode(kv, c.code, { id: "u1", email: "other@x.co" });
    expect(bad).toEqual({ ok: false, reason: "email_mismatch" });
    const good = await redeemCode(kv, c.code, { id: "u2", email: "vip@client.com" });
    expect(good.ok).toBe(true);
  });

  it("unknown code -> not_found", async () => {
    const kv = fakeKv();
    expect(await redeemCode(kv, "LNKD-ZZZZ", { id: "u", email: "e@e.co" }))
      .toEqual({ ok: false, reason: "not_found" });
  });
});
```

- [ ] **Step 2: Run, verify fail** — `npx vitest run lib/codes.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement `lib/codes.ts`**

```ts
export type AccessCode = {
  code: string; status: "active" | "redeemed";
  note?: string; lockedEmail?: string; createdAt: string;
  redeemedBy?: string; redeemedByEmail?: string; redeemedAt?: string;
};

// Minimal surface shared by @upstash/redis and the test fake.
export type KvLike = {
  get(k: string): Promise<unknown>;
  set(k: string, v: unknown, opts?: { nx?: boolean }): Promise<unknown>;
  sadd(k: string, ...members: string[]): Promise<unknown>;
  smembers(k: string): Promise<string[]>;
};

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const INDEX = "codes:index";
const key = (c: string) => `code:${c}`;
const lockKey = (c: string) => `code:${c}:lock`;

export function generateCodeString(): string {
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `LNKD-${s}`;
}

export async function createCodes(kv: KvLike, n: number, opts?: { note?: string; lockedEmail?: string }) {
  const out: AccessCode[] = [];
  for (let i = 0; i < n; i++) {
    let code = generateCodeString();
    // NX guards collisions: regenerate until unused.
    while (!(await kv.set(key(code), placeholder(code, opts), { nx: true }))) code = generateCodeString();
    await kv.sadd(INDEX, code);
    out.push(placeholder(code, opts));
  }
  return out;
}

function placeholder(code: string, opts?: { note?: string; lockedEmail?: string }): AccessCode {
  return {
    code, status: "active", createdAt: new Date().toISOString(),
    ...(opts?.note ? { note: opts.note } : {}),
    ...(opts?.lockedEmail ? { lockedEmail: opts.lockedEmail.toLowerCase() } : {}),
  };
}

export async function listCodes(kv: KvLike): Promise<AccessCode[]> {
  const codes = await kv.smembers(INDEX);
  const all = await Promise.all(codes.map(async (c) => (await kv.get(key(c))) as AccessCode | null));
  return all.filter((x): x is AccessCode => !!x)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function redeemCode(kv: KvLike, rawCode: string, user: { id: string; email: string }) {
  const code = rawCode.trim().toUpperCase();
  const rec = (await kv.get(key(code))) as AccessCode | null;
  if (!rec) return { ok: false as const, reason: "not_found" as const };
  if (rec.lockedEmail && rec.lockedEmail !== user.email.toLowerCase())
    return { ok: false as const, reason: "email_mismatch" as const };
  // Atomic claim: first SET NX on the lock wins; everyone else sees already_redeemed.
  const claimed = await kv.set(lockKey(code), user.id, { nx: true });
  if (!claimed || rec.status === "redeemed")
    return { ok: false as const, reason: "already_redeemed" as const };
  await kv.set(key(code), {
    ...rec, status: "redeemed",
    redeemedBy: user.id, redeemedByEmail: user.email, redeemedAt: new Date().toISOString(),
  });
  return { ok: true as const };
}
```

- [ ] **Step 4: Run tests, verify pass** — `npx vitest run lib/codes.test.ts` → 5 passed.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: access-code store with atomic redemption (TDD)"`

### Task 3: Access helper + redeem API + redeem page

**Files:**
- Create: `lib/access.ts`, `app/api/redeem/route.ts`, `app/redeem/page.tsx`, `components/RedeemForm.tsx`
- Modify: `app/globals.css` (redeem styles reuse `.auth-*`)

**Interfaces:**
- Consumes: `redeemCode(kv, code, user)` from Task 2, `upsertSubscriber`/`GROUPS` from `lib/mailerlite.ts`.
- Produces: `hasCourseAccess(user): boolean`, `requireCourseAccess(): Promise<void>` (redirects `/redeem` when signed-in without access).

- [ ] **Step 1: lib/access.ts**

```ts
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { User } from "@clerk/nextjs/server";

export function hasCourseAccess(user: Pick<User, "publicMetadata"> | null): boolean {
  return user?.publicMetadata?.courseAccess === true;
}

// Call at the top of every content page. Signed-out users are handled by proxy.ts.
export async function requireCourseAccess() {
  const user = await currentUser();
  if (!hasCourseAccess(user)) redirect("/redeem");
}
```

- [ ] **Step 2: app/api/redeem/route.ts**

```ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getKv } from "@/lib/kv";
import { redeemCode } from "@/lib/codes";
import { checkAndIncrement } from "@/lib/ratelimit";
import { upsertSubscriber, GROUPS } from "@/lib/mailerlite";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  // Spec: rate limit redeem attempts (reuse daily counter keyed by user).
  const today = new Date().toISOString().slice(0, 10);
  const { allowed } = checkAndIncrement(`redeem:${userId}`, today);
  if (!allowed) return Response.json({ error: "rate limited" }, { status: 429 });

  let code = "";
  try { code = String((await request.json())?.code || ""); } catch {}
  if (!code) return Response.json({ error: "missing code" }, { status: 400 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress || "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const result = await redeemCode(getKv(), code, { id: userId, email });
  if (!result.ok) return Response.json({ error: result.reason }, { status: 400 });

  await client.users.updateUser(userId, {
    publicMetadata: { ...user.publicMetadata, courseAccess: true },
  });
  // Joining the course group fires the MailerLite welcome sequence.
  try { await upsertSubscriber({ email, name, groups: [GROUPS.course] }); }
  catch (e) { console.error("mailerlite after redeem failed:", e); }

  return Response.json({ ok: true });
}
```

- [ ] **Step 3: components/RedeemForm.tsx** (client: input, submit to /api/redeem, error map `not_found`→"הקוד לא נמצא, שווה לבדוק הקלדה", `already_redeemed`→"הקוד הזה כבר מומש", `email_mismatch`→"הקוד שמור למייל אחר, אפשר לכתוב לי ל-Hanita@octaloom.com"; success → `window.location.href = "/"`).

```tsx
"use client";
import { useState } from "react";

const ERRORS: Record<string, string> = {
  not_found: "הקוד לא נמצא. שווה לבדוק את ההקלדה.",
  already_redeemed: "הקוד הזה כבר מומש. אם זה לא מסתדר, אפשר לכתוב לי ל-Hanita@octaloom.com.",
  email_mismatch: "הקוד שמור למייל אחר. אפשר לכתוב לי ל-Hanita@octaloom.com ונפתור.",
};

export default function RedeemForm() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (r.ok) { window.location.href = "/"; return; }
    const d = await r.json().catch(() => ({}));
    setErr(ERRORS[d.error] || "משהו השתבש, אפשר לנסות שוב.");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="redeem-form">
      <input value={code} onChange={(e) => setCode(e.target.value)}
        placeholder="LNKD-XXXX" autoFocus dir="ltr" className="redeem-input" />
      <button disabled={busy || !code.trim()} className="auth-btn signup">
        {busy ? "בודקת..." : "פתיחת גישה"}
      </button>
      {err && <p className="redeem-err">{err}</p>}
    </form>
  );
}
```

- [ ] **Step 4: app/redeem/page.tsx** (server: if already has access → redirect "/"; else auth-card layout: "יש לך קוד גישה?" + RedeemForm + "אין לך קוד? הקורס נפתח בקרוב. אפשר לכתוב לי ל-Hanita@octaloom.com").

```tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasCourseAccess } from "@/lib/access";
import RedeemForm from "@/components/RedeemForm";

export default async function RedeemPage() {
  const user = await currentUser();
  if (hasCourseAccess(user)) redirect("/");
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">יש לך קוד גישה?</h1>
        <p className="auth-sub">הזנת הקוד פותחת את הקורס והכלים לחשבון הזה</p>
        <RedeemForm />
        <p className="auth-consent">
          אין לך קוד? הקורס נפתח בקרוב לרכישה. בינתיים אפשר לכתוב לי:{" "}
          <a href="mailto:Hanita@octaloom.com">Hanita@octaloom.com</a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: CSS** — append to globals.css:

```css
.redeem-form{display:flex;flex-direction:column;gap:12px;width:100%;max-width:300px;margin:0 auto}
.redeem-input{padding:12px 16px;border:1.5px solid var(--line);border-radius:.9rem;font-size:16px;text-align:center;letter-spacing:2px;font-family:inherit}
.redeem-input:focus{outline:none;border-color:var(--purple)}
.redeem-err{margin:0;font-size:13px;color:#B3261E;text-align:center}
```

- [ ] **Step 6: Typecheck + commit** — `npx tsc --noEmit && git add -A && git commit -m "feat: redeem flow (api + page + access helper)"`

### Task 4: Admin page + admin API

**Files:**
- Create: `lib/admin.ts`, `app/api/admin/codes/route.ts`, `app/admin/codes/page.tsx`, `components/AdminCodes.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `createCodes`, `listCodes` (Task 2).
- Produces: `isAdmin(user): boolean` (email ∈ ADMIN_EMAILS, case-insensitive).

- [ ] **Step 1: lib/admin.ts**

```ts
import type { User } from "@clerk/nextjs/server";

export function isAdmin(user: User | null): boolean {
  const admins = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  return !!email && admins.includes(email);
}
```

- [ ] **Step 2: app/api/admin/codes/route.ts** — GET → `{codes: listCodes()}`; POST `{count?, note?, lockedEmail?}` (count clamped 1..20) → `{codes: created}`. Both: `currentUser()` + `isAdmin` else 404.

```ts
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { getKv } from "@/lib/kv";
import { createCodes, listCodes } from "@/lib/codes";

export const runtime = "nodejs";

export async function GET() {
  if (!isAdmin(await currentUser())) return new Response("not found", { status: 404 });
  return Response.json({ codes: await listCodes(getKv()) });
}

export async function POST(request: Request) {
  if (!isAdmin(await currentUser())) return new Response("not found", { status: 404 });
  let body: { count?: number; note?: string; lockedEmail?: string } = {};
  try { body = await request.json(); } catch {}
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 20);
  const codes = await createCodes(getKv(), count, {
    note: body.note?.trim() || undefined,
    lockedEmail: body.lockedEmail?.trim() || undefined,
  });
  return Response.json({ codes });
}
```

- [ ] **Step 3: app/admin/codes/page.tsx** (server: `isAdmin` else `redirect("/")`; renders `<AdminCodes/>`) + **components/AdminCodes.tsx** (client: form count/note/lockedEmail → POST; table of codes: code+copy button, status badge, note, redeemedByEmail, dates; loads via GET on mount).

```tsx
// app/admin/codes/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminCodes from "@/components/AdminCodes";

export default async function AdminCodesPage() {
  if (!isAdmin(await currentUser())) redirect("/");
  return (
    <div className="wrap">
      <h1 className="admin-title">קודי גישה</h1>
      <AdminCodes />
    </div>
  );
}
```

```tsx
// components/AdminCodes.tsx
"use client";
import { useEffect, useState } from "react";

type Code = { code: string; status: string; note?: string; lockedEmail?: string; createdAt: string; redeemedByEmail?: string; redeemedAt?: string };

export default function AdminCodes() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [lockedEmail, setLockedEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  async function load() {
    const r = await fetch("/api/admin/codes");
    if (r.ok) setCodes((await r.json()).codes);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    await fetch("/api/admin/codes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count, note, lockedEmail }),
    });
    setNote(""); setLockedEmail(""); setCount(1); setBusy(false);
    load();
  }

  function copy(c: string) {
    navigator.clipboard.writeText(c);
    setCopied(c); setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="admin-codes">
      <form onSubmit={create} className="admin-form">
        <input type="number" min={1} max={20} value={count} onChange={e => setCount(+e.target.value)} title="כמות" />
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="הערה (למי הקוד)" />
        <input value={lockedEmail} onChange={e => setLockedEmail(e.target.value)} placeholder="נעילה למייל (רשות)" dir="ltr" />
        <button disabled={busy} className="auth-btn signup">{busy ? "יוצרת..." : "צרי קוד"}</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>קוד</th><th>סטטוס</th><th>הערה</th><th>מומש ע״י</th><th>נוצר</th></tr></thead>
        <tbody>
          {codes.map(c => (
            <tr key={c.code}>
              <td dir="ltr">
                <button className="code-copy" onClick={() => copy(c.code)}>
                  {c.code} {copied === c.code ? "✓" : "⧉"}
                </button>
              </td>
              <td>{c.status === "active" ? "פנוי" : "מומש"}</td>
              <td>{c.note || ""}{c.lockedEmail ? ` · 🔒 ${c.lockedEmail}` : ""}</td>
              <td dir="ltr">{c.redeemedByEmail || ""}</td>
              <td>{new Date(c.createdAt).toLocaleDateString("he-IL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: CSS** — append:

```css
.admin-title{font-size:24px;font-weight:500;margin:24px 0 16px}
.admin-form{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
.admin-form input{padding:10px 14px;border:1.5px solid var(--line);border-radius:.9rem;font-family:inherit;font-size:14px}
.admin-form input[type=number]{width:70px}
.admin-table{width:100%;border-collapse:collapse;background:var(--white);border-radius:12px;overflow:hidden;font-size:14px}
.admin-table th,.admin-table td{padding:10px 14px;text-align:right;border-bottom:1px solid var(--line)}
.code-copy{background:var(--purple-soft);border:none;border-radius:8px;padding:6px 10px;font-family:monospace;font-size:14px;cursor:pointer}
```

- [ ] **Step 5: Typecheck + commit** — `npx tsc --noEmit && git add -A && git commit -m "feat: admin codes page + api"`

### Task 5: Waitlist page + /join + waitlist API + MailerLite group

**Files:**
- Create: `app/join/[[...join]]/page.tsx`, `app/api/waitlist/route.ts`, `components/WaitlistForm.tsx`
- Modify: `app/sign-up/[[...sign-up]]/page.tsx` (becomes waitlist screen), `proxy.ts` (public: `/join(.*)`, `/api/waitlist`), `.env.local` (`NEXT_PUBLIC_CLERK_SIGN_UP_URL=/join`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/redeem`)
- MailerLite: create group "Course Waitlist" (MCP/dashboard), put id in `MAILERLITE_GROUP_WAITLIST`.

**Interfaces:**
- Consumes: `upsertSubscriber` (existing).
- Produces: `/api/waitlist` POST `{email}` → 200.

- [ ] **Step 1: create MailerLite group "Course Waitlist"**, set `MAILERLITE_GROUP_WAITLIST=<id>` in .env.local (+ later Vercel).

- [ ] **Step 2: app/api/waitlist/route.ts** — public; rate-limited by IP reusing `checkAndIncrement` pattern (keyed `wl:<ip>`, day bucket); validates email regex; `upsertSubscriber({email, groups: [process.env.MAILERLITE_GROUP_WAITLIST!]})`.

```ts
import { upsertSubscriber } from "@/lib/mailerlite";
import { checkAndIncrement } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const today = new Date().toISOString().slice(0, 10);
  const { allowed } = checkAndIncrement(`wl:${ip}`, today);
  if (!allowed) return Response.json({ error: "rate limited" }, { status: 429 });

  let email = "";
  try { email = String((await request.json())?.email || "").trim(); } catch {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: "invalid email" }, { status: 400 });

  const group = process.env.MAILERLITE_GROUP_WAITLIST;
  if (!group) return Response.json({ error: "waitlist not configured" }, { status: 500 });
  try { await upsertSubscriber({ email, groups: [group] }); }
  catch (e) { console.error("waitlist upsert failed:", e); return Response.json({ error: "failed" }, { status: 502 }); }
  return Response.json({ ok: true });
}
```

- [ ] **Step 3: components/WaitlistForm.tsx** (client: email input + submit, success state "את/ה ברשימה! נעדכן כשנפתח 💜", error state).

```tsx
"use client";
import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"" | "busy" | "done" | "err">("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("busy");
    const r = await fetch("/api/waitlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setState(r.ok ? "done" : "err");
  }

  if (state === "done") return <p className="wl-done">✓ הכי מעודכנ.ת שיש. נשלח מייל כשהקורס נפתח 💜</p>;
  return (
    <form onSubmit={submit} className="redeem-form">
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="המייל שלך" dir="ltr" className="redeem-input" />
      <button disabled={state === "busy"} className="auth-btn signup">
        {state === "busy" ? "רגע..." : "עדכנו אותי כשנפתח"}
      </button>
      {state === "err" && <p className="redeem-err">משהו השתבש, אפשר לנסות שוב.</p>}
    </form>
  );
}
```

- [ ] **Step 4: rewrite app/sign-up page as waitlist screen** (keeps `.auth-page/.auth-card` look: logo, "לינקדאין 2026: הפרופיל כפרומפט", "ההרשמה נפתחת בקרוב", WaitlistForm, ואז שורה קטנה: "יש לך קוד גישה? <a href=/join>להרשמה</a> · כבר נרשמת? <a href=/sign-in>התחברות</a>").

```tsx
import Image from "next/image";
import WaitlistForm from "@/components/WaitlistForm";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">לינקדאין 2026: הפרופיל כפרומפט</h1>
        <Image className="auth-logo" src="/brand/nav-logo.png" alt="OctaLoom" width={150} height={37} priority />
        <p className="auth-sub">ההרשמה לקורס נפתחת בקרוב</p>
        <WaitlistForm />
        <p className="auth-consent">
          יש לך קוד גישה? <a href="/join">להרשמה</a> · כבר יש לך חשבון? <a href="/sign-in">התחברות</a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: app/join/[[...join]]/page.tsx** — the previous sign-up page content (Clerk `<SignUp/>` + consent line), unchanged copy.

```tsx
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function JoinPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">קורס הלינקדאין של</h1>
        <Image className="auth-logo" src="/brand/nav-logo.png" alt="OctaLoom" width={150} height={37} priority />
        <p className="auth-sub">הירשמו כדי לקבל גישה לקורס ולכלים</p>
        <SignUp />
        <p className="auth-consent">
          ההרשמה כוללת קבלת מיילים הקשורים לקורס (אישור הרשמה, טיפים ליישום). אפשר להסיר את עצמכם בכל רגע, בקליק אחד מתוך המייל.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: proxy.ts** — publicRoute list becomes `["/sign-in(.*)", "/sign-up(.*)", "/join(.*)", "/api/clerk-webhook(.*)", "/api/waitlist"]`.

- [ ] **Step 7: env** — .env.local: `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/join`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/redeem`. Add CSS `.wl-done{color:var(--purple);font-weight:500;text-align:center;margin:8px 0 0}`.

- [ ] **Step 8: Typecheck + commit** — `npx tsc --noEmit && git add -A && git commit -m "feat: waitlist sign-up screen + /join + waitlist api"`

### Task 6: Gate content pages

**Files:**
- Modify: `app/page.tsx`, `app/course/[id]/page.tsx`, `app/tools/page.tsx`, `app/tools/*/page.tsx` (7 tool pages)

**Interfaces:**
- Consumes: `requireCourseAccess()` from Task 3.

- [ ] **Step 1:** Add to the top of each listed page component (make component `async` where needed):

```ts
import { requireCourseAccess } from "@/lib/access";
// first line inside the component:
await requireCourseAccess();
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean; `npm run build` lists `/redeem`, `/join`, `/admin/codes`, `/api/redeem`, `/api/waitlist`, `/api/admin/codes`.

- [ ] **Step 3: Commit** — `git commit -am "feat: gate course content behind courseAccess"`

### Task 7: Webhook stops adding to course group

**Files:**
- Modify: `app/api/clerk-webhook/route.ts`

- [ ] **Step 1:** Replace the group logic: on `user.created`, log only (keep signature verification; MailerLite course-group add now happens in `/api/redeem`). Newsletter unsafe-metadata path removed (opt-in card handles it post-access).

```ts
  if (evt.type !== "user.created") return Response.json({ ignored: evt.type });
  // Access + MailerLite now happen at code redemption (/api/redeem).
  console.log("user.created", evt.data.id);
  return Response.json({ ok: true });
```

- [ ] **Step 2: Typecheck + commit** — `npx tsc --noEmit && git commit -am "chore: webhook no longer grants mailerlite course group"`

### Task 8: Backfill + deploy + acceptance

**Files:**
- Create: `scripts/grant-access-existing.mjs`
- Modify: `scripts/export-clerk-emails.mjs` (prefer .env.prod.local key first — bug found: it read the dev instance)

- [ ] **Step 1: scripts/grant-access-existing.mjs** — loads `CLERK_SECRET_KEY` from `.env.prod.local` first; pages through `/v1/users`; for each user without `public_metadata.courseAccess`, PATCH `/v1/users/{id}/metadata` with `{public_metadata: {courseAccess: true}}`; prints count.

```js
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loadKey() {
  for (const f of [".env.prod.local", ".env.local"]) {
    try {
      const m = readFileSync(resolve(root, f), "utf8").match(/^CLERK_SECRET_KEY=(.+)$/m);
      if (m) return m[1].trim();
    } catch {}
  }
  throw new Error("CLERK_SECRET_KEY not found");
}
const KEY = loadKey();
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

let offset = 0, granted = 0, total = 0;
for (;;) {
  const r = await fetch(`https://api.clerk.com/v1/users?limit=100&offset=${offset}`, { headers: H });
  if (!r.ok) throw new Error(`clerk ${r.status}`);
  const users = await r.json();
  if (!users.length) break;
  for (const u of users) {
    total++;
    if (u.public_metadata?.courseAccess === true) continue;
    const p = await fetch(`https://api.clerk.com/v1/users/${u.id}/metadata`, {
      method: "PATCH", headers: H,
      body: JSON.stringify({ public_metadata: { courseAccess: true } }),
    });
    if (!p.ok) throw new Error(`patch failed for ${u.id}: ${p.status}`);
    granted++;
  }
  offset += users.length;
  if (users.length < 100) break;
}
console.log(`done: granted courseAccess to ${granted}/${total} users`);
```

- [ ] **Step 2: fix export script env order** — in `export-clerk-emails.mjs` swap the loop to `[".env.prod.local", ".env.local"]`.

- [ ] **Step 3: provision Upstash** — user action in Vercel dashboard (Storage → Create → Upstash Redis → connect to course-octaloom), then `vercel env pull` locally to fill `UPSTASH_REDIS_REST_*`; also add `ADMIN_EMAILS`, `MAILERLITE_GROUP_WAITLIST`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/join`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/redeem` to Vercel env.

- [ ] **Step 4: run backfill** — `node scripts/grant-access-existing.mjs` → expect `granted courseAccess to 14/14 users` (or 14/N).

- [ ] **Step 5: full build + deploy** — `npm run build` clean → commit → `vercel --prod`.

- [ ] **Step 6: acceptance tests (spec §בדיקות קבלה)**
1. Existing user signs in → sees course (no redeem).
2. Incognito → /sign-up → waitlist email → appears in "Course Waitlist" group.
3. Create code in /admin/codes → sign up fresh via /join → /redeem → code → course visible; user in "נרשמי קורס לינקדאין"; welcome email received.
4. Same code again → "הקוד הזה כבר מומש".
5. /admin/codes as non-admin → redirect home.

- [ ] **Step 7: update memory + commit**
