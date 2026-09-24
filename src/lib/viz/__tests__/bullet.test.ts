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

  it("keeps the target marker inside the track too", () => {
    const g = bulletGeometry(5, -2, [0, 10]);
    expect(g.targetPct).toBe(0);
    expect(g.targetOverflow).toBe("low");
  });

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
