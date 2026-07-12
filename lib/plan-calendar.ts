import { PLAN, type PlanItem } from "@/lib/plan";
import type { IcsEvent } from "@/lib/ics";

const SITE = "https://course.octaloom.com";
const TOOL_URL = `${SITE}/tools/weekly-plan`;

/** The tools an item points to, as absolute URLs, so they survive inside a calendar event. */
function itemLinks(it: PlanItem): string {
  const links = (it.links || []).filter((l) => !l.pending);
  if (!links.length) return "";
  return (
    "\n\n" +
    links
      .map((l) => `${l.match}: ${l.href.startsWith("http") ? l.href : SITE + l.href}`)
      .join("\n")
  );
}

/** The next Sunday that has not started yet, so nothing lands in the past. */
function nextSunday(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (7 - d.getDay() || 7));
  return d;
}

/** Nth working day from base, counting Sunday to Thursday only. */
function workday(base: Date, n: number, hour: number, minute: number): Date {
  const d = new Date(base);
  let left = n;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 5 && d.getDay() !== 6) left -= 1;
  }
  d.setHours(hour, minute, 0, 0);
  return d;
}

function at(base: Date, dayOffset: number, hour: number, minute: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Strip the leading "N דקות: " prefix the daily items carry in their text. */
function clean(text: string): string {
  return text.replace(/^\d+\s*דקות:\s*/, "");
}

/**
 * Turns the 30-day plan into calendar events, honouring what the user already ticked off.
 *
 * The shape mirrors the plan itself: week 1 tasks land on consecutive working days of the
 * coming week, week 2 on the week after, weeks 3-4 spread over the fortnight. The daily
 * routine becomes one recurring 30-minute block rather than 4 tiny events a day, and the
 * metrics review lands as a single session at the end of the month. Friday and Saturday
 * stay empty.
 */
export function planEvents(checked: Record<string, boolean>, startHour: number): IcsEvent[] {
  const base = nextSunday(new Date());
  const events: IcsEvent[] = [];
  const open = (id: string) => !checked[id];

  const sectionItems = (id: string) =>
    (PLAN.find((s) => s.id === id)?.items || []).filter((it) => open(it.id));

  const task = (it: PlanItem, start: Date, fallback: number) => {
    events.push({
      uid: `${it.id}@course.octaloom.com`,
      title: `לינקדאין: ${clean(it.text).split(/[.:]/)[0]}`,
      description: `${clean(it.text)}${itemLinks(it)}\n\nמתוך תוכנית 30 הימים: ${TOOL_URL}`,
      url: TOOL_URL,
      start,
      minutes: it.minutes || fallback,
      alarmMinutes: 10,
    });
  };

  // One task per working day, never two on the same day: each section starts on its own
  // week boundary (5 working days) unless the previous section overflowed past it.
  let cursor = 0;
  const startAt = (weekBoundary: number) => (cursor = Math.max(cursor, weekBoundary));

  startAt(0);
  sectionItems("week1").forEach((it) => task(it, workday(base, cursor++, startHour, 30), 15));

  startAt(5);
  sectionItems("week2").forEach((it) => task(it, workday(base, cursor++, startHour, 30), 15));

  // Weeks 3-4: heavier tasks, spaced 3 working days apart so they do not pile up.
  startAt(10);
  sectionItems("week34").forEach((it, i) => task(it, workday(base, cursor + i * 3, startHour, 30), 30));

  // Daily routine: one recurring block for 30 days, with the 4 sub-tasks in the body.
  const daily = sectionItems("daily");
  if (daily.length) {
    events.push({
      uid: `daily-routine@course.octaloom.com`,
      title: "לינקדאין: השגרה היומית",
      description:
        daily.map((it) => `• ${it.text}${itemLinks(it)}`).join("\n") + `\n\nהתוכנית המלאה: ${TOOL_URL}`,
      url: TOOL_URL,
      start: at(base, 0, startHour, 0),
      minutes: daily.reduce((n, it) => n + (it.minutes || 5), 0),
      repeatDays: 22,
      byDays: ["SU", "MO", "TU", "WE", "TH"],
      alarmMinutes: 10,
    });
  }

  // Metrics review: one session at the end of the 30 days.
  const measure = sectionItems("measure");
  if (measure.length) {
    events.push({
      uid: `measure-review@course.octaloom.com`,
      title: "לינקדאין: מדדים של סוף החודש",
      description:
        measure.map((it) => `• ${it.text}${itemLinks(it)}`).join("\n") + `\n\nהתוכנית המלאה: ${TOOL_URL}`,
      url: TOOL_URL,
      start: workday(base, 21, startHour, 30),
      minutes: measure.reduce((n, it) => n + (it.minutes || 10), 0),
      alarmMinutes: 10,
    });
  }

  return events;
}
