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
    async sadd(k: string, ...m: string[]) { const s = sets.get(k) ?? new Set<string>(); m.forEach(x => s.add(x)); sets.set(k, s); return m.length; },
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
