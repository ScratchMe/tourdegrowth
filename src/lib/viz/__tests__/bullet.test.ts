import { describe, expect, it } from "vitest";
import { bulletGeometry, meterPct } from "../bullet";

describe("bulletGeometry", () => {
  it("measures value and target as a percentage of the track", () => {
    expect(bulletGeometry(6, 4, [0, 10])).toEqual({
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

  it("works on a domain that does not start at zero", () => {
    expect(bulletGeometry(5, 4.5, [4, 6]).valuePct).toBe(50);
    expect(bulletGeometry(5, 4.5, [4, 6]).targetPct).toBe(25);
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
