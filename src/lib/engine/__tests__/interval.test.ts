import { describe, expect, it } from "vitest";
import { add, div, interval, isPoint, mapBounds, mul, point, scale, sub } from "../interval";

// Engine spec §13.1 "interval". Non-vacuity, measured: keeping only two of
// `mul`'s four corners fails the grid test AND the division test (div is
// built on mul); letting `div` accept a divisor whose bound is exactly 0
// fails the division test only. The bounds/point test passes in both.

const BOUNDS = [-3, -1, -0.5, 0, 0.5, 2, 7];
const GRID = BOUNDS.flatMap((lo) => BOUNDS.filter((hi) => hi >= lo).map((hi) => ({ lo, hi })));

/** Points spread across an interval, corners included. */
function samples(i: { lo: number; hi: number }): number[] {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => i.lo + (i.hi - i.lo) * t);
}

describe("interval", () => {
  it("refuses inverted and non-finite bounds, accepts a zero-width one", () => {
    expect(interval(3, 1)).toBeNull();
    expect(interval(Number.NaN, 1)).toBeNull();
    expect(interval(0, Number.POSITIVE_INFINITY)).toBeNull();
    expect(interval(2, 2)).toEqual({ lo: 2, hi: 2 });
    expect(isPoint(point(4))).toBe(true);
    expect(isPoint({ lo: 1, hi: 2 })).toBe(false);
  });

  it("add, sub and mul contain every pointwise result and reach both bounds, on an exhaustive grid", () => {
    const ops = [
      [add, (x: number, y: number) => x + y],
      [sub, (x: number, y: number) => x - y],
      [mul, (x: number, y: number) => x * y],
    ] as const;
    for (const a of GRID) {
      for (const b of GRID) {
        for (const [op, f] of ops) {
          const r = op(a, b);
          expect(r.lo).toBeLessThanOrEqual(r.hi);
          for (const x of samples(a)) {
            for (const y of samples(b)) {
              expect(f(x, y)).toBeGreaterThanOrEqual(r.lo - 1e-9);
              expect(f(x, y)).toBeLessThanOrEqual(r.hi + 1e-9);
            }
          }
          // Tight: each bound is reached at a corner — an honest interval is never wider than its inputs make it.
          const corners = [f(a.lo, b.lo), f(a.lo, b.hi), f(a.hi, b.lo), f(a.hi, b.hi)];
          expect(corners.some((c) => Math.abs(c - r.lo) < 1e-9)).toBe(true);
          expect(corners.some((c) => Math.abs(c - r.hi) < 1e-9)).toBe(true);
        }
      }
    }
  });

  it("div is unknown when the divisor contains 0, bounds included; contains every quotient otherwise", () => {
    expect(div(point(1), { lo: -1, hi: 1 })).toBeNull();
    expect(div(point(1), { lo: 0, hi: 1 })).toBeNull();
    expect(div(point(1), { lo: -1, hi: 0 })).toBeNull();
    expect(div(point(1), point(0))).toBeNull();
    expect(div({ lo: 6, hi: 9 }, { lo: 2, hi: 3 })).toEqual({ lo: 2, hi: 4.5 });
    for (const a of GRID) {
      for (const b of GRID.filter((g) => g.lo > 0 || g.hi < 0)) {
        const r = div(a, b)!;
        for (const x of samples(a)) {
          for (const y of samples(b)) {
            expect(x / y).toBeGreaterThanOrEqual(r.lo - 1e-9);
            expect(x / y).toBeLessThanOrEqual(r.hi + 1e-9);
          }
        }
      }
    }
  });

  it("scale flips the bounds for a negative factor; mapBounds applies per bound", () => {
    expect(scale({ lo: 1, hi: 3 }, 2)).toEqual({ lo: 2, hi: 6 });
    expect(scale({ lo: 1, hi: 3 }, -1)).toEqual({ lo: -3, hi: -1 });
    expect(mapBounds({ lo: 6.4, hi: 8.6 }, Math.round)).toEqual({ lo: 6, hi: 9 });
  });
});
