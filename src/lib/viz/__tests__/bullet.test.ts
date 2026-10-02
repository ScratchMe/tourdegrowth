import { describe, expect, it } from "vitest";
import { bandGeometry, bulletGeometry, meterPct } from "../bullet";

describe("bulletGeometry", () => {
  it("measures value and target as a percentage of the track", () => {
    expect(bulletGeometry(6, 4, [0, 10])).toEqual({
      valueKnown: true,
      valuePct: 60,
      targetPct: 40,
      valueOverflow: null,
      targetOverflow: null,
    });
  });

  it("fills the track to its edge for a value past the domain, and says so", () => {
    const g = bulletGeometry(14, 4, [0, 10]);
    expect(g.valuePct).toBe(100);
    expect(g.valueOverflow).toBe("high");
  });

  it("says a value below the domain went LOW, which is not the same as sitting on the minimum", () => {
    // Both have a 0% bar; only the overflow side tells them apart, and
    // BulletChart draws its "lower than this" chevron from it.
    const below = bulletGeometry(3, 5, [4, 6]);
    expect(below.valuePct).toBe(0);
    expect(below.valueOverflow).toBe("low");
    const atMin = bulletGeometry(4, 5, [4, 6]);
    expect(atMin.valuePct).toBe(0);
    expect(atMin.valueOverflow).toBeNull();
  });

  it("draws no target marker for a target outside the domain, and says which side it left", () => {
    // Pinned at the edge, a tick would claim an objective of exactly 0.
    const low = bulletGeometry(5, -2, [0, 10]);
    expect(low.targetPct).toBeNull();
    expect(low.targetOverflow).toBe("low");
    const high = bulletGeometry(5, 12, [0, 10]);
    expect(high.targetPct).toBeNull();
    expect(high.targetOverflow).toBe("high");
  });

  it("keeps a target that sits exactly on an edge (it is inside the domain)", () => {
    expect(bulletGeometry(5, 0, [0, 10]).targetPct).toBe(0);
    expect(bulletGeometry(5, 10, [0, 10]).targetPct).toBe(100);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "draws no target marker for a target that is not a number (%s), never a NaN position",
    (target) => {
      const g = bulletGeometry(5, target, [0, 10]);
      expect(g.targetPct).toBeNull();
      // Not a side it escaped from: there is nothing to mark.
      expect(g.targetOverflow).toBeNull();
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "draws a value that is not a number (%s) as an empty track, not as an overflow",
    (value) => {
      const g = bulletGeometry(value, 4, [0, 10]);
      expect(g.valuePct).toBe(0);
      expect(g.valueOverflow).toBeNull();
      // The target is unaffected by a missing reading.
      expect(g.targetPct).toBe(40);
    },
  );

  it("draws no value at all for a figure not typed yet (null), and keeps its target", () => {
    // Design system extension 07: a number's screen before the value, with its target already set.
    const g = bulletGeometry(null, 4, [0, 10]);
    expect(g.valueKnown).toBe(false);
    expect(g.valueOverflow).toBeNull();
    expect(g.targetPct).toBe(40);
    expect(bulletGeometry(null, null, [0, 10]).targetPct).toBeNull();
  });

  it("says a non-number value is unknown too, so no bar is drawn for it", () => {
    expect(bulletGeometry(Number.NaN, 4, [0, 10]).valueKnown).toBe(false);
    expect(bulletGeometry(0, 4, [0, 10]).valueKnown).toBe(true);
  });

  it("works on a domain that does not start at zero", () => {
    expect(bulletGeometry(5, 4.5, [4, 6]).valuePct).toBe(50);
    expect(bulletGeometry(5, 4.5, [4, 6]).targetPct).toBe(25);
  });
});

describe("bandGeometry (design system extension 07)", () => {
  it("places the published range as a left edge and a width, in % of the track", () => {
    expect(bandGeometry([2, 5], [0, 10])).toEqual({ leftPct: 20, widthPct: 30 });
  });

  it("clamps a range that leaves the domain to the edge it crosses", () => {
    expect(bandGeometry([8, 14], [0, 10])).toEqual({ leftPct: 80, widthPct: 20 });
    expect(bandGeometry([-3, 4], [0, 10])).toEqual({ leftPct: 0, widthPct: 40 });
  });

  it("draws nothing for a range wholly outside the domain, never a bracket squashed on the edge", () => {
    expect(bandGeometry([12, 14], [0, 10])).toBeNull();
    expect(bandGeometry([-4, -1], [0, 10])).toBeNull();
  });

  it("draws nothing without a range, or with a bound that is not a number", () => {
    expect(bandGeometry(undefined, [0, 10])).toBeNull();
    expect(bandGeometry([Number.NaN, 4], [0, 10])).toBeNull();
    expect(bandGeometry([2, Number.POSITIVE_INFINITY], [0, 10])).toBeNull();
  });

  it("reads the bounds in either order, and on a domain that runs downwards", () => {
    expect(bandGeometry([5, 2], [0, 10])).toEqual({ leftPct: 20, widthPct: 30 });
    expect(bandGeometry([2, 5], [10, 0])).toEqual({ leftPct: 50, widthPct: 30 });
  });

  it("works on a domain that does not start at zero", () => {
    expect(bandGeometry([4.5, 5.5], [4, 6])).toEqual({ leftPct: 25, widthPct: 50 });
  });
});

describe("meterPct", () => {
  it("reads 0–100 as a width, clamped", () => {
    expect(meterPct(42)).toBe(42);
    expect(meterPct(140)).toBe(100);
    expect(meterPct(-5)).toBe(0);
  });

  it("turns a non-number into an empty track, never NaN% (which CSS would read as a FULL bar)", () => {
    expect(meterPct(Number.NaN)).toBe(0);
    expect(meterPct(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
