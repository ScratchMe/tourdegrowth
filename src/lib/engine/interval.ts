import type { Interval } from "./types";

/**
 * interval.ts — the only arithmetic the engine does (engine spec §6.1).
 *
 * Every known number is an interval: a measured one is `lo === hi`, an
 * estimate is its range, two readings that disagree are their span. There
 * is deliberately NO scalar path through the engine: a function that took
 * a plain number would be the one place an estimate silently turned into a
 * fact. Each operation combines the bounds at the right corners, so a
 * result can only ever be as wide as its inputs honestly make it.
 *
 * `null` means "no honest interval exists": inverted or non-finite bounds,
 * or a division by an interval that contains 0 (the quotient is unbounded).
 * Callers turn it into "unknown", never into 0.
 */

export function point(v: number): Interval {
  return { lo: v, hi: v };
}

/** An interval from two bounds, or null when they are inverted or not finite. */
export function interval(lo: number, hi: number): Interval | null {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) return null;
  return { lo, hi };
}

export function isPoint(i: Interval): boolean {
  return i.lo === i.hi;
}

export function add(a: Interval, b: Interval): Interval {
  return { lo: a.lo + b.lo, hi: a.hi + b.hi };
}

/** The widest honest difference: the smallest a minus the largest b, and the reverse. */
export function sub(a: Interval, b: Interval): Interval {
  return { lo: a.lo - b.hi, hi: a.hi - b.lo };
}

/** Signs can flip the order, so all four corner products are candidates. */
export function mul(a: Interval, b: Interval): Interval {
  const corners = [a.lo * b.lo, a.lo * b.hi, a.hi * b.lo, a.hi * b.hi];
  return { lo: Math.min(...corners), hi: Math.max(...corners) };
}

/** null when b contains 0, bounds included: the quotient would have no upper (or lower) bound. */
export function div(a: Interval, b: Interval): Interval | null {
  if (b.lo <= 0 && b.hi >= 0) return null;
  return mul(a, { lo: 1 / b.hi, hi: 1 / b.lo });
}

export function scale(a: Interval, k: number): Interval {
  return k >= 0 ? { lo: a.lo * k, hi: a.hi * k } : { lo: a.hi * k, hi: a.lo * k };
}

/** Applies a non-decreasing function bound by bound — rounding, a floor at 0. */
export function mapBounds(a: Interval, f: (v: number) => number): Interval {
  return { lo: f(a.lo), hi: f(a.hi) };
}
