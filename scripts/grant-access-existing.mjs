// One-time backfill: grant courseAccess to every existing Clerk user.
// Usage: node scripts/grant-access-existing.mjs
// Reads CLERK_SECRET_KEY from .env.prod.local first (production instance).

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadKey() {
  if (process.env.CLERK_SECRET_KEY) return process.env.CLERK_SECRET_KEY;
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

let offset = 0;
let granted = 0;
let total = 0;
for (;;) {
  const r = await fetch(`https://api.clerk.com/v1/users?limit=100&offset=${offset}`, { headers: H });
  if (!r.ok) throw new Error(`clerk ${r.status}: ${await r.text()}`);
  const users = await r.json();
  if (!users.length) break;
  for (const u of users) {
    total++;
    if (u.public_metadata?.courseAccess === true) continue;
    const p = await fetch(`https://api.clerk.com/v1/users/${u.id}/metadata`, {
      method: "PATCH",
      headers: H,
      body: JSON.stringify({ public_metadata: { courseAccess: true } }),
    });
    if (!p.ok) throw new Error(`patch failed for ${u.id}: ${p.status} ${await p.text()}`);
    granted++;
    console.log(`granted: ${(u.email_addresses || [])[0]?.email_address || u.id}`);
  }
  offset += users.length;
  if (users.length < 100) break;
}
console.log(`done: granted courseAccess to ${granted}/${total} users`);
