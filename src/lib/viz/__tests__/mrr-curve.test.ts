import { describe, expect, it } from "vitest";
import { MRR_CURVE_PX, MRR_CURVE_SLIDE_PX, mrrCurveGeometry, type CurvePoint } from "../mrr-curve";

/**
 * The MRR's curve (design system extension 09, Q8, A20.d T3.a): the geometry
 * the SVG draws, pinned without a DOM — thirteen points across the plot,
 * room on the right for the lines' names on a desktop and none on a phone,
 * the what-ifs' room between the lines, a range as a band, and two names
 * that never touch.
 *
 * Extension 10 (A23 MKT-7a, relance), non-vacuity (2026-10-27, one sabotage at
 * a time, restored after, both MrrCurve test files run): `step.x` at `x(2)`
 * drops 4 tests (3 here, the ring's place in the component's); `step.y` on the
 * low edge instead of the middle 2 (1 here, the range's ring in the
 * component's). `step` forced to non-null throws on a null what-if: not a
 * detection, not counted.
 */
const line = (from: number, to: number): CurvePoint[] => Array.from({ length: 13 }, (_, i) => [from + ((to - from) * i) / 12, from + ((to - from) * i) / 12] as const);
const band = (from: number, to: number, spread: number): CurvePoint[] => line(from, to).map(([v]) => [v - spread, v + spread] as const);
const xs = (path: string) => path.split(" ").map((p) => Number(p.split(",")[0]));
const ys = (path: string) => path.split(" ").map((p) => Number(p.split(",")[1]));

describe("mrrCurveGeometry", () => {
  const today = line(48_000, 80_000);
  const whatif = line(48_000, 94_000);

  it("thirteen points from the left edge to the room the names leave on a desktop", () => {
    const g = mrrCurveGeometry({ today, whatif: null, width: 720, height: 200, compact: false });
    const x = xs(g.today.path);
    expect(x).toHaveLength(13);
    expect(x[0]).toBe(MRR_CURVE_PX.left);
    expect(x[12]).toBeCloseTo(720 - MRR_CURVE_PX.keyRoom - MRR_CURVE_PX.right, 0);
    expect(g.ticks).toEqual([x[0], x[6], x[12]]);
    expect(g.keys?.x).toBeCloseTo(x[12]! + MRR_CURVE_PX.keyOffset, 0);
  });

  it("on a phone the plot takes the whole width and draws no names: the legend goes under it", () => {
    const g = mrrCurveGeometry({ today, whatif, width: 350, height: 170, compact: true });
    expect(xs(g.today.path)[12]).toBeCloseTo(350 - MRR_CURVE_PX.right, 0);
    expect(g.keys).toBeNull();
  });

  it("y grows downwards: a growing MRR ends higher on screen than it starts; today's figure sits under the start", () => {
    const g = mrrCurveGeometry({ today, whatif: null, width: 720, height: 200, compact: false });
    const y = ys(g.today.path);
    expect(y[12]).toBeLessThan(y[0]!);
    expect(g.start.labelY).toBeGreaterThan(g.start.y);
    expect(g.level.y).toBe(g.start.y);
    // A shrinking MRR: the figure goes over the start, where the curve isn't.
    const down = mrrCurveGeometry({ today: line(48_000, 30_000), whatif: null, width: 720, height: 200, compact: false });
    expect(down.start.labelY).toBeLessThan(down.start.y);
  });

  it("untouched: today's line alone, no room between lines; moved: the room is the what-ifs' low path back along today's high one", () => {
    expect(mrrCurveGeometry({ today, whatif: null, width: 720, height: 200, compact: false }).gain).toBeNull();
    const g = mrrCurveGeometry({ today, whatif, width: 720, height: 200, compact: false });
    expect(g.whatif).not.toBeNull();
    expect(g.gain!.split(" ")).toHaveLength(26);
    // Both lines stay inside the plot.
    for (const y of [...ys(g.today.path), ...ys(g.whatif!.path)]) {
      expect(y).toBeGreaterThanOrEqual(MRR_CURVE_PX.top - 0.1);
      expect(y).toBeLessThanOrEqual(200 - MRR_CURVE_PX.bottom + 0.1);
    }
  });

  it("a range is a band edged by its low and high paths, with no end dot; a fact is one path", () => {
    const fact = mrrCurveGeometry({ today, whatif: null, width: 720, height: 200, compact: false }).today;
    expect(fact).toMatchObject({ range: false, low: null, band: null });
    const r = mrrCurveGeometry({ today: band(180_000, 335_000, 3_600), whatif: null, width: 720, height: 200, compact: false }).today;
    expect(r.range).toBe(true);
    expect(r.band!.split(" ")).toHaveLength(26);
    // The high edge is above (smaller y) the low edge at every month.
    ys(r.path).forEach((y, i) => expect(y).toBeLessThan(ys(r.low!)[i]!));
  });

  it("two names closer than the gap are pushed apart, the what-ifs' above when its line ends higher", () => {
    const close = line(48_000, 80_400);
    const g = mrrCurveGeometry({ today, whatif: close, width: 720, height: 200, compact: false });
    expect(g.keys!.today - g.keys!.whatif!).toBeCloseTo(MRR_CURVE_PX.keyGap, 5);
    // Far apart: each name at its own line's end.
    const far = mrrCurveGeometry({ today, whatif, width: 720, height: 200, compact: false });
    expect(far.keys!.whatif).toBeCloseTo(far.whatif!.end.y + MRR_CURVE_PX.keyBaseline, 5);
    expect(far.keys!.today).toBeCloseTo(far.today.end.y + MRR_CURVE_PX.keyBaseline, 5);
  });

  it("extension 10: `step` is the what-if line at month 1 — x(1) and the middle of its range — and null without a what-if", () => {
    const input = { today, width: 720, height: 200, compact: false };
    expect(mrrCurveGeometry({ ...input, whatif: null }).step).toBeNull();
    const g = mrrCurveGeometry({ ...input, whatif });
    // A fact: the second vertex of the what-if path, to the tenth of a pixel the path is printed at.
    const [x1, y1] = g.whatif!.path.split(" ")[1]!.split(",").map(Number);
    expect(g.step!.x).toBeCloseTo(x1!, 1);
    expect(g.step!.y).toBeCloseTo(y1!, 1);
    // x(1) is one twelfth of the way from the left edge to the line's end, and the left edge is the first tick.
    expect(g.step!.x).toBeCloseTo(g.ticks[0] + (g.ticks[2] - g.ticks[0]) / 12, 9);
    // The what-if jumps at month 1 above where today's line is then: y grows downwards.
    expect(g.step!.y).toBeLessThan(ys(g.today.path)[1]!);
  });

  it("extension 10: `step` of a range is the middle of its low and high edges at month 1", () => {
    const g = mrrCurveGeometry({ today: band(180_000, 335_000, 3_600), whatif: band(180_000, 400_000, 3_600), width: 720, height: 200, compact: false });
    const [x1, high] = g.whatif!.path.split(" ")[1]!.split(",").map(Number);
    const [, low] = g.whatif!.low!.split(" ")[1]!.split(",").map(Number);
    expect(g.step!.x).toBeCloseTo(x1!, 1);
    expect(g.step!.y).toBeCloseTo((high! + low!) / 2, 1);
    expect(g.step!.y).toBeGreaterThan(high!);
    expect(g.step!.y).toBeLessThan(low!);
  });

  it("extension 10: `step` follows a slide's own margins and a phone's whole width", () => {
    const slide = mrrCurveGeometry({ today, whatif, width: 1_520, height: 260, compact: true, slide: true });
    const [sx, sy] = slide.whatif!.path.split(" ")[1]!.split(",").map(Number);
    expect(slide.step!.x).toBeCloseTo(sx!, 1);
    expect(slide.step!.y).toBeCloseTo(sy!, 1);
    expect(slide.step!.x).toBeCloseTo(MRR_CURVE_SLIDE_PX.left + (1_520 - MRR_CURVE_SLIDE_PX.right - MRR_CURVE_SLIDE_PX.left) / 12, 9);
    // Not the screen's: the slide has its own top and bottom, so the same data lands elsewhere.
    const screen = mrrCurveGeometry({ today, whatif, width: 1_520, height: 260, compact: true });
    expect(slide.step!.y).not.toBeCloseTo(screen.step!.y, 1);
    const phone = mrrCurveGeometry({ today, whatif, width: 350, height: 170, compact: true });
    expect(phone.step!.x).toBeCloseTo(MRR_CURVE_PX.left + (350 - MRR_CURVE_PX.right - MRR_CURVE_PX.left) / 12, 9);
  });

  it("refuses anything but thirteen points", () => {
    expect(() => mrrCurveGeometry({ today: today.slice(0, 12), whatif: null, width: 720, height: 200, compact: false })).toThrow(/13 points/);
  });
});
