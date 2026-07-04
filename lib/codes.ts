export type AccessCode = {
  code: string;
  status: "active" | "redeemed";
  note?: string;
  lockedEmail?: string;
  createdAt: string;
  redeemedBy?: string;
  redeemedByEmail?: string;
  redeemedAt?: string;
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

function newCode(code: string, opts?: { note?: string; lockedEmail?: string }): AccessCode {
  return {
    code,
    status: "active",
    createdAt: new Date().toISOString(),
    ...(opts?.note ? { note: opts.note } : {}),
    ...(opts?.lockedEmail ? { lockedEmail: opts.lockedEmail.toLowerCase() } : {}),
  };
}

export async function createCodes(kv: KvLike, n: number, opts?: { note?: string; lockedEmail?: string }) {
  const out: AccessCode[] = [];
  for (let i = 0; i < n; i++) {
    let code = generateCodeString();
    let rec = newCode(code, opts);
    // NX guards collisions: regenerate until an unused code lands.
    while (!(await kv.set(key(code), rec, { nx: true }))) {
      code = generateCodeString();
      rec = newCode(code, opts);
    }
    await kv.sadd(INDEX, code);
    out.push(rec);
  }
  return out;
}

export async function listCodes(kv: KvLike): Promise<AccessCode[]> {
  const codes = await kv.smembers(INDEX);
  const all = await Promise.all(codes.map(async (c) => (await kv.get(key(c))) as AccessCode | null));
  return all
    .filter((x): x is AccessCode => !!x)
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
    ...rec,
    status: "redeemed",
    redeemedBy: user.id,
    redeemedByEmail: user.email,
    redeemedAt: new Date().toISOString(),
  });
  return { ok: true as const };
}
