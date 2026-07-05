// Pull every course registrant from Clerk and write a CSV.
// Usage:  node scripts/export-clerk-emails.mjs [outfile.csv]
// Reads CLERK_SECRET_KEY from .env.local (or the environment).

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

function loadKey() {
  if (process.env.CLERK_SECRET_KEY) return process.env.CLERK_SECRET_KEY;
  for (const f of [".env.prod.local", ".env.local"]) {
    try {
      const txt = readFileSync(resolve(root, f), "utf8");
      const m = txt.match(/^CLERK_SECRET_KEY=(.+)$/m);
      if (m) return m[1].trim();
    } catch {}
  }
  throw new Error("CLERK_SECRET_KEY not found in env or .env.local");
}

const KEY = loadKey();
const out = process.argv[2] || resolve(root, "course-registrants.csv");

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const all = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const r = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=created_at`,
      { headers: { Authorization: `Bearer ${KEY}` } }
    );
    if (!r.ok) throw new Error(`clerk ${r.status}: ${await r.text()}`);
    const batch = await r.json();
    if (!batch.length) break;
    all.push(...batch);
    offset += batch.length;
    if (batch.length < limit) break;
  }

  const rows = all.map((u) => {
    const primary =
      (u.email_addresses || []).find((e) => e.id === u.primary_email_address_id) ||
      (u.email_addresses || [])[0] ||
      {};
    return {
      email: primary.email_address || "",
      name: [u.first_name, u.last_name].filter(Boolean).join(" "),
      newsletter: u.public_metadata?.newsletter ? "yes" : "",
      created_at: u.created_at ? new Date(u.created_at).toISOString() : "",
    };
  });

  const header = ["email", "name", "newsletter", "created_at"];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((h) => csvCell(row[h])).join(",")),
  ].join("\n");

  writeFileSync(out, csv + "\n");
  console.log(`Wrote ${rows.length} registrants -> ${out}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
