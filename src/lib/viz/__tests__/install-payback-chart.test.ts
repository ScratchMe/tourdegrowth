import { describe, expect, it } from "vitest";
import { buildAppScenario } from "@/lib/engine/app";
import { consumerState, consumerUsageOnlyState } from "@/lib/engine/__tests__/fixtures";
import { CTX_FR } from "@/lib/engine/__tests__/props";
import {
  INSTALL_CHART_MONTHS,
  INSTALL_CHART_PX,
  INSTALL_SHORT_LABEL_ROOM,
  installChartGeometry,
  installLossLabelY,
  type InstallChartInput,
} from "../install-payback-chart";

// `InstallPaybackChart` (consumer app, engine spec §21.6.6, A22 APP-9): one install, month by month. The rules that make
// the picture honest are geometry, so they are tested here rather than eyeballed — the payback is where the curve meets
// the cost line, and a loss is the gap, at month 36, between the curve's end and the cost line.

const W = 900;
const H = 330;
const L = INSTALL_CHART_PX.left;
const R = W - INSTALL_CHART_PX.right;
const T = INSTALL_CHART_PX.top;
const B = H - INSTALL_CHART_PX.bottom;
const xOf = (m: number) => L + (m / INSTALL_CHART_MONTHS) * (R - L);

/** The input of the app's scenario, nothing moved: the curve, the cost and the payback the slide gives the chart. */
function exampleInput(state = consumerState()): InstallChartInput {
  const { kpis } = buildAppScenario(state, {}, CTX_FR).today;
  const payback = kpis.payback;
  return {
    curve: kpis.app!.curve!,
    cost: [kpis.cac!.lo, kpis.cac!.hi],
    payback: payback ? [payback.lo, payback.hi] : null,
    story: payback ? "pays-back" : "loss",
    width: W,
    height: H,
  };
}

/** A hand-made curve: `step` more every month, 37 points. */
const ramp = (step: number) => Array.from({ length: INSTALL_CHART_MONTHS + 1 }, (_, k) => k * step);
const synthetic = (over: Partial<InstallChartInput> = {}): InstallChartInput => ({
  curve: { lo: ramp(0.1), hi: ramp(0.1) },
  cost: [2, 2],
  payback: null,
  story: "loss",
  width: W,
  height: H,
  ...over,
});

describe("installChartGeometry", () => {
  it("the example pays back: the tick is on the cost line at the payback month (13,0132), no gap", () => {
    const input = exampleInput();
    expect(input.story).toBe("pays-back");
    const g = installChartGeometry(input);
    expect(g.payback).toEqual({ x: xOf(13.013195358841038), xHi: xOf(13.013195358841038), y: g.cost.y });
    expect(g.short).toBeNull();
    expect(g.band).toBeNull();
    expect(g.cost.band).toBeNull();
  });

  it("the curve starts on the axis at month 0, rises month by month, and passes through the cost line where it pays back", () => {
    const input = exampleInput();
    const g = installChartGeometry(input);
    const points = g.mid.split(/ (?=[ML] )/).map((p) => p.slice(2).split(" ").map(Number) as [number, number]);
    expect(points).toHaveLength(INSTALL_CHART_MONTHS + 1);
    expect(g.mid.startsWith(`M ${xOf(0)} ${B}`)).toBe(true);
    for (let k = 1; k < points.length; k++) {
      expect(points[k]![0]).toBeGreaterThan(points[k - 1]![0]);
      // y grows downwards: a curve that rises has a smaller y every month.
      expect(points[k]![1]).toBeLessThanOrEqual(points[k - 1]![1]);
    }
    // Month 13 is just under the cost line, month 14 just over: the payback is where it crosses.
    expect(points[13]![1]).toBeGreaterThan(g.cost.y - 0.01);
    expect(points[14]![1]).toBeLessThan(g.cost.y);
  });

  it("the app without subscriptions loses: the gap is drawn at month 36 between the curve's end and the cost line, no payback", () => {
    const input = exampleInput(consumerUsageOnlyState());
    expect(input.story).toBe("loss");
    expect(input.payback).toBeNull();
    const g = installChartGeometry(input);
    expect(g.payback).toBeNull();
    expect(g.short).not.toBeNull();
    expect(g.short!.x).toBe(xOf(36));
    expect(g.short!.y2).toBe(g.cost.y);
    // The curve ends below the cost line (y grows downwards): the install brought back less than it cost.
    expect(g.short!.y1).toBeGreaterThan(g.cost.y);
    expect(g.mid.endsWith(`L ${xOf(36)} ${Math.round(g.short!.y1 * 100) / 100}`)).toBe(true);
  });

  it("the ticks are the months 0, 12, 24 and 36", () => {
    const g = installChartGeometry(synthetic());
    expect(g.ticks).toEqual([0, 12, 24, 36].map((month) => ({ month, x: xOf(month) })));
    expect(g.plot).toEqual({ left: L, right: R, top: T, bottom: B });
  });

  it("the scale is 1,15 × the higher of the cost and the curve's highest point", () => {
    // A cost of 2 above a curve that ends at 3,6: the curve is the highest, and ends 1/1,15 of the way up.
    const g = installChartGeometry(synthetic({ cost: [2, 2] }));
    const yMax = 1.15 * 3.6;
    expect(g.short!.y1).toBeCloseTo(B - (3.6 / yMax) * (B - T), 5);
    expect(g.cost.y).toBeCloseTo(B - (2 / yMax) * (B - T), 5);
    // The other way round: the cost is the highest.
    const high = installChartGeometry(synthetic({ cost: [9, 9] }));
    expect(high.cost.y).toBeCloseTo(B - (9 / (1.15 * 9)) * (B - T), 5);
  });

  it("a cost in a range is a band from its high end to its low end, the line at its middle", () => {
    const g = installChartGeometry(synthetic({ cost: [1.5, 2.5] }));
    const yMax = 1.15 * 3.6;
    const y = (v: number) => B - (v / yMax) * (B - T);
    expect(g.cost.y).toBeCloseTo(y(2), 5);
    expect(g.cost.band!.y).toBeCloseTo(y(2.5), 5);
    expect(g.cost.band!.height).toBeCloseTo(y(1.5) - y(2.5), 5);
  });

  it("a curve in a range is a band: the low edge forward, the high edge back, closed; the line is their middle", () => {
    const lo = ramp(0.08);
    const hi = ramp(0.12);
    const g = installChartGeometry(synthetic({ curve: { lo, hi } }));
    expect(g.band).not.toBeNull();
    expect(g.band!.startsWith("M ")).toBe(true);
    expect(g.band!.endsWith(" Z")).toBe(true);
    // 37 points forward, 37 back.
    expect(g.band!.split(" L ")).toHaveLength(2 * (INSTALL_CHART_MONTHS + 1));
    const yMax = 1.15 * Math.max(2, hi[36]!);
    expect(g.short!.y1).toBeCloseTo(B - (((lo[36]! + hi[36]!) / 2) / yMax) * (B - T), 1);
  });

  it("a payback in a range is a tick at its low end and a band to its high end; a worst case past the cap ends at month 36", () => {
    const g = installChartGeometry(synthetic({ story: "pays-back", cost: [1, 1], payback: [10, 20] }));
    expect(g.payback).toEqual({ x: xOf(10), xHi: xOf(20), y: g.cost.y });
    const beyond = installChartGeometry(synthetic({ story: "pays-back", cost: [1, 1], payback: [10, 36] }));
    expect(beyond.payback!.xHi).toBe(xOf(36));
  });

  it("each story draws its own mark only: a payback only when it pays back, a gap only in a loss", () => {
    expect(installChartGeometry(synthetic({ story: "loss", payback: [10, 20] })).payback).toBeNull();
    expect(installChartGeometry(synthetic({ story: "pays-back", payback: [10, 20] })).short).toBeNull();
  });
});

describe("installLossLabelY", () => {
  it("sits inside the bracket when the gap leaves room, above the cost line otherwise", () => {
    const wide = installChartGeometry(synthetic({ curve: { lo: ramp(0.01), hi: ramp(0.01) }, cost: [2, 2] }));
    expect(wide.short!.y1 - wide.short!.y2).toBeGreaterThanOrEqual(INSTALL_SHORT_LABEL_ROOM);
    expect(installLossLabelY(wide)).toBeGreaterThan(wide.short!.y2);
    expect(installLossLabelY(wide)).toBeLessThan(wide.short!.y1 + 10);
    // A curve that ends just under the cost line: no room inside.
    const narrow = installChartGeometry(synthetic({ curve: { lo: ramp(0.0555), hi: ramp(0.0555) }, cost: [2, 2] }));
    expect(narrow.short!.y1 - narrow.short!.y2).toBeLessThan(INSTALL_SHORT_LABEL_ROOM);
    expect(installLossLabelY(narrow)).toBe(narrow.short!.y2 - 10);
  });

  it("is null without a gap", () => {
    expect(installLossLabelY(installChartGeometry(synthetic({ story: "pays-back", payback: [10, 20] })))).toBeNull();
  });
});
