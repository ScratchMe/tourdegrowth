import { describe, expect, it } from "vitest";
import { PAYBACK_CHART_PX, PAYBACK_MONTHS, paybackChartGeometry, type PaybackChartInput } from "../payback-chart";

// `PaybackChart` (design system extension 09, Q12, A20.d T4.c): one customer, month by month. The rules that make the
// picture honest are geometry, so they are tested here rather than eyeballed — the loss and its months are one picture.

const W = 900;
const H = 380;
const plot = { L: PAYBACK_CHART_PX.left, R: W - PAYBACK_CHART_PX.right, T: PAYBACK_CHART_PX.top, B: H - PAYBACK_CHART_PX.bottom };
const xOf = (m: number) => plot.L + (m / PAYBACK_MONTHS) * (plot.R - plot.L);

/** The film's SaaS: ~90 € of margin a month, a CAC of 1 900 €, 16.7 months counted, paid back at 21.1 — it leaves first. */
const film: PaybackChartInput = { story: "loss", monthlyMargin: [90, 90], cac: [1900, 1900], lifetime: [16.67, 16.67], payback: [21.11, 21.11], width: W, height: H, reference: 12 };
/** Churn at 2 %: counted to the 36-month cap, a CAC of 2 900 € paid back at 32.2 — it pays back, late. */
const late: PaybackChartInput = { ...film, story: "pays-back", cac: [2900, 2900], lifetime: [36, 36], payback: [32.22, 32.22] };

describe("paybackChartGeometry", () => {
  it("the loss: the margin line stops below the cost line, before where it would have paid back", () => {
    const g = paybackChartGeometry(film);
    expect(g.story).toBe("loss");
    expect(g.margin!.x2).toBeCloseTo(xOf(16.67));
    // Below the cost line (y grows downwards): the customer brought back less than it cost.
    expect(g.margin!.y2).toBeGreaterThan(g.cost.y);
    expect(g.leaves).toEqual({ x: g.margin!.x2, y: g.margin!.y2 });
    // Never reached: the thread runs from the line's end to the cost line at the payback, dashed, with its tick.
    expect(g.thread).toMatchObject({ x1: g.margin!.x2, y1: g.margin!.y2, y2: g.cost.y });
    expect(g.thread!.x2).toBeCloseTo(xOf(21.11));
    expect(g.thread!.tickX).toBe(g.thread!.x2);
    expect(g.crossing).toBeNull();
    expect(g.after).toBeNull();
  });

  it("the loss's bracket measures exactly the gap between the line's end and the cost: the loss itself", () => {
    const g = paybackChartGeometry(film);
    const [, x1, y1, , y2] = g.short!.path.match(/^M (\S+) (\S+) H (\S+) V (\S+) H (\S+)$/)!.map(Number);
    expect(y1).toBeCloseTo(g.cost.y);
    expect(y2).toBeCloseTo(g.margin!.y2);
    // Left of the line's end, never over it.
    expect(x1).toBeLessThan(g.margin!.x2);
    expect(g.short!.labelY).toBeGreaterThan(g.cost.y);
    expect(g.short!.labelY).toBeLessThan(g.margin!.y2 + 10);
  });

  it("a payback past the 36 months drawn: no thread off the plot, the label hangs at its right end", () => {
    const g = paybackChartGeometry({ ...film, lifetime: [36, 36], payback: [95, 95] });
    expect(g.thread).toBeNull();
    expect(g.wouldPayBack).toEqual({ x: plot.R, beyond: true });
    expect(paybackChartGeometry(film).wouldPayBack).toEqual({ x: xOf(21.11), beyond: false });
  });

  it("the cost's label runs from the left end, where the margin line is still at the axis", () => {
    for (const g of [paybackChartGeometry(film), paybackChartGeometry(late)]) {
      expect(g.cost.labelX).toBe(plot.L);
      expect(g.cost.labelY).toBeLessThan(g.cost.y);
    }
  });

  it("pays back: the crossing on the cost line, then the months after it under the cost line", () => {
    const g = paybackChartGeometry(late);
    expect(g.story).toBe("pays-back");
    expect(g.crossing!.x).toBeCloseTo(xOf(32.22));
    expect(g.crossing!.y).toBe(g.cost.y);
    // Above the cost line at its end: it brought back more than it cost.
    expect(g.margin!.y2).toBeLessThan(g.cost.y);
    expect(g.after!.path).toMatch(new RegExp(`^M ${g.crossing!.x} `));
    expect(g.after!.labelX).toBeCloseTo((xOf(32.22) + xOf(36)) / 2);
    expect(g.thread).toBeNull();
    expect(g.short).toBeNull();
  });

  it("a possible loss drawn as paying back by its middles: no months-after bracket when the line ends first", () => {
    const g = paybackChartGeometry({ ...late, lifetime: [30, 30] });
    expect(g.crossing).not.toBeNull();
    expect(g.after).toBeNull();
  });

  it("no margin: the « ? » box under a known cost line, inside the plot — never a 0", () => {
    const g = paybackChartGeometry({ ...film, story: "unknown", monthlyMargin: null, lifetime: null, payback: null });
    expect(g.story).toBe("unknown");
    expect(g.margin).toBeNull();
    expect(g.unknown!.y).toBeGreaterThan(g.cost.y);
    expect(g.unknown!.y + g.unknown!.height).toBeLessThanOrEqual(plot.B);
    expect(g.unknown!.cx).toBeCloseTo((g.unknown!.x * 2 + g.unknown!.width) / 2);
  });

  it("a range: the CAC as a band, the lifetime's reach as a thinner line to its high end", () => {
    const g = paybackChartGeometry({ ...film, cac: [1700, 2100], lifetime: [14, 20] });
    expect(g.cost.band!.height).toBeGreaterThan(0);
    expect(g.cost.y).toBeGreaterThan(g.cost.band!.y);
    expect(g.marginRange!.x1).toBeCloseTo(xOf(14));
    expect(g.marginRange!.x2).toBeCloseTo(xOf(20));
    expect(paybackChartGeometry(film).cost.band).toBeNull();
    expect(paybackChartGeometry(film).marginRange).toBeNull();
  });

  it("the cost line keeps room under it: the scale never runs past 3.4 times the cost, and a line that leaves the plot has no end dot", () => {
    const g = paybackChartGeometry({ ...late, monthlyMargin: [900, 900], payback: [3.2, 3.2] });
    // 3.4 × the cost at the top: the cost line sits at 1/3.4 of the plot's height.
    expect((plot.B - g.cost.y) / (plot.B - plot.T)).toBeCloseTo(1 / 3.4);
    expect(g.leaves).toBeNull();
  });

  it("the 12-month reference is a dotted line at 12 months, or none", () => {
    expect(paybackChartGeometry(film).ticks.reference).toBeCloseTo(xOf(12));
    expect(paybackChartGeometry({ ...film, reference: null }).ticks.reference).toBeNull();
    expect(paybackChartGeometry(film).ticks).toMatchObject({ x0: plot.L, x36: plot.R, y: plot.B + PAYBACK_CHART_PX.tickBaseline });
  });
});
