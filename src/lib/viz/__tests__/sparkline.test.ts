import { describe, expect, it } from "vitest";
import {
  LABEL_EDGE,
  axisTicks,
  endLabelPlacement,
  linePath,
  referenceGeometry,
  referencePlacement,
  slotX,
  sparklineGeometry,
  valueY,
} from "../sparkline";

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
    expect(endLabelPlacement(at(100, LABEL_EDGE - 1), at(90, 60)).vertical).toBe("below");
    // Falling into the bottom edge: "below" would leave the frame.
    expect(endLabelPlacement(at(100, 100 - LABEL_EDGE + 1), at(90, 40)).vertical).toBe("above");
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
    expect(referencePlacement(LABEL_EDGE)).toBe("above");
    expect(referencePlacement(LABEL_EDGE - 0.01)).toBe("below");
  });

  it("refuses a reference outside the frame rather than pinning a false target to the edge", () => {
    expect(referenceGeometry(12, [0, 10])).toBeNull();
    expect(referenceGeometry(-1, [0, 10])).toBeNull();
    expect(referenceGeometry(Number.NaN, [0, 10])).toBeNull();
  });
});
