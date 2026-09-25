import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SPARKLINE_PX,
  axisTicks,
  endLabelPlacement,
  labelMetrics,
  linePath,
  referenceGeometry,
  referencePlacement,
  slotX,
  sparklineGeometry,
  valueY,
  type SparklineSize,
} from "../sparkline";

/** The default size's measures, in the 0–100 space — what the placement tests below are written against. */
const MD = labelMetrics("md");

describe("slotX / valueY", () => {
  it("spreads slots edge to edge and centres a single one", () => {
    expect([0, 1, 2, 3, 4].map((i) => slotX(i, 5))).toEqual([0, 25, 50, 75, 100]);
    expect(slotX(0, 1)).toBe(50);
  });

  it("puts max at the top and min at the bottom (y grows downwards)", () => {
    expect(valueY(10, [0, 10])).toBe(0);
    expect(valueY(0, [0, 10])).toBe(100);
    expect(valueY(2.5, [0, 10])).toBe(75);
  });

  it("clamps an out-of-range value to the edge so the mark stays inside the frame", () => {
    expect(valueY(40, [0, 10])).toBe(0);
    expect(valueY(-40, [0, 10])).toBe(100);
  });
});

describe("sparklineGeometry", () => {
  it("builds one path through every known point, in order", () => {
    const g = sparklineGeometry([2, 4, 6], [0, 10]);
    expect(g.path).toBe("M0 80 L50 60 L100 40");
    expect(g.points.map((p) => p.index)).toEqual([0, 1, 2]);
    expect(g.end).toMatchObject({ index: 2, value: 6, x: 100, y: 40 });
  });

  it("breaks the line on an unknown month instead of drawing it as zero", () => {
    const g = sparklineGeometry([2, null, 6, 8], [0, 10]);
    expect(g.path).toBe("M0 80 L0 80 M66.67 40 L100 20");
    // A zero would have been a point at y=100; there is none.
    expect(g.points.some((p) => p.y === 100)).toBe(false);
  });

  it("leaves trailing unknown months as empty slots — the year is not over", () => {
    const g = sparklineGeometry([5, 6, 7, null, null, null, null, null, null, null, null, null], [0, 10]);
    expect(g.end).toMatchObject({ index: 2, x: slotX(2, 12) });
    expect(g.points).toHaveLength(3);
  });

  it("flags and clamps a point outside [min, max] rather than drawing it off the chart", () => {
    const g = sparklineGeometry([5, 14, -3], [0, 10]);
    expect(g.points.map((p) => p.overflow)).toEqual([null, "high", "low"]);
    expect(g.points.map((p) => p.y)).toEqual([50, 0, 100]);
    expect(g.points.every((p) => p.y >= 0 && p.y <= 100 && p.x >= 0 && p.x <= 100)).toBe(true);
    // The true value is kept: the caller's endLabel states it, the geometry does not lie about it.
    expect(g.end?.value).toBe(-3);
  });

  it("ignores NaN like an unknown month", () => {
    const g = sparklineGeometry([1, Number.NaN, 3], [0, 10]);
    expect(g.points).toHaveLength(2);
  });

  it("has no end and an empty path when nothing is known", () => {
    const g = sparklineGeometry([null, null], [0, 10]);
    expect(g.end).toBeNull();
    expect(g.path).toBe("");
  });
});

describe("linePath", () => {
  it("draws a lone point as a zero-length stroke, so a round cap shows it", () => {
    expect(linePath([[{ index: 0, value: 1, x: 10, y: 20, overflow: null }]])).toBe("M10 20 L10 20");
  });

  it("drops empty runs", () => {
    expect(linePath([[], []])).toBe("");
  });
});

describe("endLabelPlacement", () => {
  const at = (x: number, y: number) => ({ index: 0, value: 0, x, y, overflow: null });

  it("sits on the left of a point in the right third, on the right otherwise", () => {
    expect(endLabelPlacement(at(100, 50), null).horizontal).toBe("left");
    expect(endLabelPlacement(at(40, 50), null).horizontal).toBe("right");
  });

  it("avoids the incoming line: below when it comes down from above, above when it climbs", () => {
    expect(endLabelPlacement(at(100, 50), at(90, 30)).vertical).toBe("below");
    expect(endLabelPlacement(at(100, 50), at(90, 70)).vertical).toBe("above");
  });

  it("lets the frame edge win over the slope", () => {
    // Climbing into the top edge: "above" would leave the frame.
    expect(endLabelPlacement(at(100, MD.edge - 1), at(90, 60)).vertical).toBe("below");
    // Falling into the bottom edge: "below" would leave the frame.
    expect(endLabelPlacement(at(100, 100 - MD.edge + 1), at(90, 40)).vertical).toBe("above");
  });

  it("steps off the reference line when the line runs through its side", () => {
    // Flat end, the reference 16 units above the point: « above » would sit on the dashes.
    expect(endLabelPlacement(at(100, 81), at(90, 81), 65).vertical).toBe("below");
    // Coming down from above (so « below » first), the reference just under the point.
    expect(endLabelPlacement(at(100, 50), at(90, 30), 60).vertical).toBe("above");
  });

  it("keeps its side when the reference is clear of it — or runs under the marker's gap", () => {
    expect(endLabelPlacement(at(100, 50), at(90, 50), 20).vertical).toBe("above");
    expect(endLabelPlacement(at(100, 50), at(90, 50), 90).vertical).toBe("above");
    // A target the curve ends on: the line passes through the marker, not the text.
    expect(endLabelPlacement(at(100, 71.57), at(90, 71.57), 71.43).vertical).toBe("above");
    expect(endLabelPlacement(at(100, 50), at(90, 50), 50 - MD.gap).vertical).toBe("above");
  });

  it("never trades a frame edge for the reference", () => {
    // Near the top the label must go below, even with the dashes there.
    expect(endLabelPlacement(at(100, MD.edge - 1), at(90, 60), MD.edge + 5).vertical).toBe("below");
    expect(endLabelPlacement(at(100, 100 - MD.edge + 1), at(90, 40), 100 - MD.edge - 5).vertical).toBe("above");
  });
});

describe("sparklineGeometry with a reference", () => {
  it("places the end label off the dashed line — the « fine » ending's trust, 19 against 35", () => {
    // Trust flat at 19 over the last months, the viral threshold at 35, on 0-100.
    const values = [60, 55, 50, 45, 40, 35, 30, 25, 22, 20, 19, 19, 19];
    expect(sparklineGeometry(values, [0, 100]).endLabel.vertical).toBe("above");
    expect(sparklineGeometry(values, [0, 100], 35).endLabel.vertical).toBe("below");
  });

  it("steps off an objective the curve ends just under — review R14's churn, 3,3 % against 4 %", () => {
    // Twelve months under target and up a little in December: the point climbs,
    // so « above » comes first, and the objective at 4 runs through that side.
    const churn = [6, 5.5, 5, 4.6, 4.2, 3.9, 3.6, 3.4, 3.2, 3.1, 3.0, 3.3];
    expect(sparklineGeometry(churn, [0, 8]).endLabel.vertical).toBe("above");
    expect(sparklineGeometry(churn, [0, 8], 4).endLabel.vertical).toBe("below");
  });

  it("ignores a reference outside the frame — it is not drawn, so it is in nobody's way", () => {
    expect(sparklineGeometry([5, 5], [0, 10], 12).endLabel.vertical).toBe("above");
  });
});

describe("axisTicks", () => {
  it("places the caller's ticks and drops those outside the domain instead of clamping them", () => {
    expect(axisTicks([0, 5, 10, 15, Number.NaN], [0, 10])).toEqual([
      { value: 0, y: 100 },
      { value: 5, y: 50 },
      { value: 10, y: 0 },
    ]);
  });
});

describe("referenceGeometry", () => {
  it("places the line at the value and its label above it", () => {
    expect(referenceGeometry(4, [0, 10])).toEqual({ y: 60, label: "above" });
  });

  it("flips the label below when the line hugs the top", () => {
    expect(referenceGeometry(9.5, [0, 10])).toEqual({ y: 5, label: "below" });
    expect(referencePlacement(MD.referenceEdge)).toBe("above");
    expect(referencePlacement(MD.referenceEdge - 0.01)).toBe("below");
  });

  it("refuses a reference outside the frame rather than pinning a false target to the edge", () => {
    expect(referenceGeometry(12, [0, 10])).toBeNull();
    expect(referenceGeometry(-1, [0, 10])).toBeNull();
    expect(referenceGeometry(Number.NaN, [0, 10])).toBeNull();
  });
});

/**
 * Every label stays inside the component, at both sizes and anywhere a point
 * or a line can sit. Measured in pixels, the way the browser lays them out,
 * rather than in the placement rules' own units — a rule written in the
 * wrong unit passes a test written in the same one (review R15: one
 * percentage served both sizes, and `sm` labels spilled out of the plot).
 */
describe("labels fit their plot, at both sizes", () => {
  const SIZES: SparklineSize[] = ["md", "sm"];
  const px = SPARKLINE_PX;

  for (const size of SIZES) {
    const plot = px.plot[size];
    const canvas = plot - 2 * px.inset;
    const atY = (y: number) => px.inset + (y / 100) * canvas;

    it(`${size}: an end label, above or below its point, never leaves the plot`, () => {
      const spills: string[] = [];
      for (let y = 0; y <= 100; y += 0.25) {
        const point = { index: 1, value: 0, x: 100, y, overflow: null };
        for (const prevY of [0, y, 100]) {
          const previous = { index: 0, value: 0, x: 90, y: prevY, overflow: null };
          const { vertical } = endLabelPlacement(point, previous, null, labelMetrics(size));
          const top = vertical === "above" ? atY(y) - px.endGap - px.endLine[size] : atY(y) + px.endGap;
          const bottom = top + px.endLine[size];
          if (top < -0.01 || bottom > plot + 0.01) spills.push(`y=${y} from ${prevY}: ${vertical} [${top}, ${bottom}]`);
        }
      }
      expect(spills).toEqual([]);
    });

    it(`${size}: a reference label never leaves the plot`, () => {
      const spills: string[] = [];
      for (let y = 0; y <= 100; y += 0.25) {
        const side = referencePlacement(y, labelMetrics(size));
        const top = side === "above" ? atY(y) - px.referenceGap - px.referenceLine : atY(y) + 4;
        if (top < -0.01 || top + px.referenceLine > plot + 0.01) spills.push(`y=${y}: ${side} [${top}]`);
      }
      expect(spills).toEqual([]);
    });
  }

  it("the two sizes really differ — one table for both is the defect this guards", () => {
    const sm = labelMetrics("sm");
    expect(sm.edge).toBeGreaterThan(MD.edge * 2);
    expect(sm.referenceEdge).toBeGreaterThan(MD.referenceEdge * 2);
  });
});

/**
 * SPARKLINE_PX is a copy of what the stylesheet draws, so it is checked
 * against the stylesheet: the rules above are only as true as that table.
 */
describe("SPARKLINE_PX is what Sparkline.module.css and the tokens draw", () => {
  const read = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const css = read("src/components/viz/Sparkline.module.css");
  const spacing = read("src/styles/tokens/spacing.css");
  const type = read("src/styles/tokens/typography.css");
  const rule = (selector: string) => {
    const escaped = selector.replace(/\./g, "\\.").replace(/ /g, "\\s+");
    const m = css.match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`));
    expect(m, `rule ${selector}`).not.toBeNull();
    return m![1]!;
  };
  const spacePx = (name: string) => Number(spacing.match(new RegExp(`--${name}:\\s*(\\d+)px`))![1]);
  const linePx = (name: string) => {
    const [, size, lh] = type.match(new RegExp(`--${name}:\\s*\\d+ (\\d+)px/([\\d.]+)`))!;
    return Math.round(Number(size) * Number(lh) * 100) / 100;
  };

  it("the plot heights and the canvas inset", () => {
    expect(rule(".md")).toContain(`--plot-h: ${SPARKLINE_PX.plot.md}px`);
    expect(rule(".sm")).toContain(`--plot-h: ${SPARKLINE_PX.plot.sm}px`);
    expect(rule(".canvas")).toMatch(/inset:\s*var\(--space-3\)\s+var\(--[a-z0-9-]+\)\s+var\(--space-3\)/);
    expect(spacePx("space-3")).toBe(SPARKLINE_PX.inset);
  });

  it("the end label: its gap and its line, per size", () => {
    expect(rule(".endLabel.above")).toContain("margin-top: calc(-1 * var(--space-2))");
    expect(rule(".endLabel.below")).toContain("margin-top: var(--space-2)");
    expect(spacePx("space-2")).toBe(SPARKLINE_PX.endGap);
    expect(rule(".endLabel")).toContain("font: var(--chart-value)");
    expect(rule(".sm .endLabel")).toContain("font: var(--chart-label)");
    expect(linePx("chart-value")).toBe(SPARKLINE_PX.endLine.md);
    expect(linePx("chart-label")).toBe(SPARKLINE_PX.endLine.sm);
  });

  it("the reference label: its line and its offset above the dashes", () => {
    expect(rule(".referenceLabel")).toContain("font: var(--chart-label)");
    expect(linePx("chart-label")).toBe(SPARKLINE_PX.referenceLine);
    expect(rule(".referenceLabel.above")).toContain(`calc(-100% - ${SPARKLINE_PX.referenceGap}px)`);
    expect(rule(".referenceLabel.below")).toContain("translate: 0 4px");
  });

  it("the draw-in clip does not outlive the animation (review R16)", () => {
    // `both` or `forwards` keeps the last frame — inset(0 0 0 0) — on for
    // good, which clips the round caps and a clamped edge's stroke.
    const draw = rule(".draw");
    expect(draw).toMatch(/animation:\s*tdg-viz-draw\b/);
    expect(draw).not.toMatch(/\b(both|forwards)\b/);
  });
});
