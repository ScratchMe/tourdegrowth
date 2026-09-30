/*
 * Months and days picked from lists, in the page's language — design system
 * extension 04, DateField (Q10). Never `<input type="date">`, which speaks the
 * browser's language (« 09/29/2026 » in a French tool) and draws a calendar
 * glyph the system did not choose; never `type="month"`, which Safari on the
 * desktop draws as a bare text box.
 */

/** "2026-08": a year and a month, the value a month list holds. */
export type YearMonth = `${number}-${string}`;

/**
 * The `count` months that end at `latest`, newest first — the growth
 * engine's list (a flow month is closed, a cohort mature). A stored month
 * older than the window (an imported file) is kept at the end rather than
 * silently snapped to another one.
 */
export function monthsEndingAt(latest: YearMonth, count: number, keep?: YearMonth): YearMonth[] {
  const months: YearMonth[] = [];
  let [y, m] = latest.split("-").map(Number) as [number, number];
  for (let i = 0; i < count; i += 1) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  if (keep && !months.includes(keep)) months.push(keep);
  return months;
}

/** A day as three chosen parts, each "" until the person picks it. Month is "01"–"12". */
export interface DayParts {
  day: string;
  month: string;
  year: string;
}

export const EMPTY_DAY: DayParts = { day: "", month: "", year: "" };

/** "2026-09-29" → { day: "29", month: "09", year: "2026" }; anything else → three empty parts. */
export function dayPartsFromIso(iso: string): DayParts {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return { ...EMPTY_DAY };
  return { day: String(Number(m[3])), month: m[2]!, year: m[1]! };
}

/** Every part chosen, and a day the calendar has (not the 31st of February). */
export function isRealDay({ day, month, year }: DayParts): boolean {
  if (!day || !month || !year) return false;
  const d = Number(day);
  const mo = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(mo) || !Number.isInteger(y)) return false;
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** The parts as "yyyy-mm-dd" when they make a real day, "" otherwise (nothing half-chosen is stored). */
export function isoFromDayParts(parts: DayParts): string {
  if (!isRealDay(parts)) return "";
  return `${parts.year}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`;
}

/** Whether the person has started choosing, but not finished: a missing part to point at. */
export function isPartialDay({ day, month, year }: DayParts): boolean {
  const chosen = [day, month, year].filter(Boolean).length;
  return chosen > 0 && chosen < 3;
}
