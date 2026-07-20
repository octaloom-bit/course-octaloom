import { coreChapters } from "./chapters";

// Per-user course progress, stored in localStorage (no backend needed for v1).
const KEY = "octa-course-progress";

export type ProgressMap = Record<string, number>; // chapterId -> percent watched (0..100)

export function getProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// Progress only ever goes up (monotonic max), so seeking back doesn't lower it.
export function setChapterProgress(id: string, percent: number) {
  if (typeof window === "undefined") return;
  const p = getProgress();
  const cur = p[id] || 0;
  const next = Math.min(100, Math.max(cur, Math.round(percent)));
  if (next === cur) return;
  p[id] = next;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("octa-progress"));
}

export function markComplete(id: string) {
  setChapterProgress(id, 100);
}

// Measured against the numbered chapters only — the prelude is optional.
export function overallPercent(p: ProgressMap): number {
  const core = coreChapters();
  if (!core.length) return 0;
  const sum = core.reduce((a, c) => a + Math.min(100, p[c.id] || 0), 0);
  return Math.round(sum / core.length);
}

export function completedCount(p: ProgressMap): number {
  return coreChapters().filter((c) => (p[c.id] || 0) >= 95).length;
}

export function coreCount(): number {
  return coreChapters().length;
}
