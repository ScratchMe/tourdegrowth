import { METRIC_SHAPES } from "./catalog-shape";
import type { MetricShape } from "./catalog-shape";
import { YEAR_MONTH_PATTERN } from "./types";
import type { EngineSetup, MetricEntry, MetricId, Snapshot, YearMonth } from "./types";

/**
 * cohort.ts — which month a number belongs to (engine spec §6.3, D7).
 *
 * Two months, not one: the FLOWS (visitors, sign-ups of the month, spend,
 * churn, ARPA) belong to `referenceMonth`, the last closed month by
 * default; the peloton's COLUMNS belong to `cohortMonth`, the most recent
 * cohort whose every sign-up has had the whole window. On 24 September an
 * August cohort hasn't had 30 days for its late sign-ups: reading its day-30
 * retention is the most common false number in a growth review.
 *
 * `today` is always injected, never read: the same inputs give the same
 * month in a test, on the board and on a slide. It is read as a LOCAL
 * calendar date — the user's "today", the day on their wall — so tests build
 * it with `new Date(2026, 8, 24)`, which is the same calendar day in every
 * time zone.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function isYearMonth(s: string): s is YearMonth {
  return YEAR_MONTH_PATTERN.test(s);
}

function parts(m: YearMonth): { year: number; month: number } {
  if (!isYearMonth(m)) throw new Error(`Not a YYYY-MM month: ${m}`);
  const [year, month] = m.split("-").map(Number) as [number, number];
  return { year, month };
}

function toYearMonth(year: number, month: number): YearMonth {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

export function previousMonth(m: YearMonth): YearMonth {
  const { year, month } = parts(m);
  return month === 1 ? toYearMonth(year - 1, 12) : toYearMonth(year, month - 1);
}

export function nextMonth(m: YearMonth): YearMonth {
  const { year, month } = parts(m);
  return month === 12 ? toYearMonth(year + 1, 1) : toYearMonth(year, month + 1);
}

/** The month `today` falls in. */
export function currentMonth(today: Date): YearMonth {
  return toYearMonth(today.getFullYear(), today.getMonth() + 1);
}

/** Days since the epoch of a calendar date — whole days, no time zone, no DST hour. */
function dayNumber(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

function lastDayNumber(m: YearMonth): number {
  const { year, month } = parts(m);
  // Day 0 of the next month is the last day of this one: February and leap years for free.
  return dayNumber(year, month + 1, 0);
}

/**
 * The last month M whose final sign-up has had `windowDays` by today:
 * `last day of M + windowDays ≤ today`. On 24/09/2026: 7 days → August,
 * 30 → July, 60 → June, 90 → May.
 */
export function matureCohortMonth(windowDays: number, today: Date): YearMonth {
  const todayNumber = dayNumber(today.getFullYear(), today.getMonth() + 1, today.getDate());
  let m = currentMonth(today);
  while (lastDayNumber(m) + windowDays > todayNumber) m = previousMonth(m);
  return m;
}

/** A cohort more recent than the mature one for its window: its rate is still moving. */
export function isImmature(period: YearMonth, windowDays: number, today: Date): boolean {
  // "YYYY-MM" strings order like the months they name.
  return period > matureCohortMonth(windowDays, today);
}

/** The window that is part of a metric's definition, in days; 0 for a metric with none. */
export function windowDaysOf(shape: MetricShape, setup: EngineSetup): number {
  if (shape.window === "activation") return setup.activationWindowDays;
  if (shape.window === "paid") return setup.paidWindowDays;
  return shape.window ?? 0;
}

/** Default reference month: the last closed month. */
export function defaultReferenceMonth(today: Date): YearMonth {
  return previousMonth(currentMonth(today));
}

/**
 * Default followed cohort: mature for the LONGEST window in the peloton —
 * day 30 is always a column, and the payment window may be 60 or 90 days —
 * so every column reads the same, complete cohort (§6.3).
 */
export function defaultCohortMonth(setup: EngineSetup, today: Date): YearMonth {
  return matureCohortMonth(Math.max(30, setup.paidWindowDays), today);
}

/** The month each metric belongs to by default: flows → the reference month, cohort numbers → the followed cohort. */
export function defaultMonths(setup: EngineSetup, today: Date): Record<MetricId, YearMonth> {
  const reference = defaultReferenceMonth(today);
  const cohort = defaultCohortMonth(setup, today);
  return Object.fromEntries(METRIC_SHAPES.map((s) => [s.id, s.flow === "cohort" ? cohort : reference])) as Record<MetricId, YearMonth>;
}

/** The period one entry actually covers: its own cohort month if set, else the snapshot's. null for a definition (event, cause). */
export function periodOf(shape: MetricShape, entry: MetricEntry | undefined, snapshot: Snapshot): YearMonth | null {
  if (shape.flow === "month") return snapshot.referenceMonth;
  if (shape.flow === "cohort") return entry?.cohortMonth ?? snapshot.cohortMonth;
  return null;
}
