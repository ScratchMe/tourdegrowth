import { describe, expect, it } from "vitest";
import { clamp, fractionOf, linearScale, niceTicks, overflowOf } from "../scale";

describe("clamp", () => {
  it("keeps a value inside its bounds, in either order", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
    expect(clamp(42, 10, 0)).toBe(10);
  });
});

describe("fractionOf", () => {
  it("is not clamped — the caller reads it to know a value left the frame", () => {
    expect(fractionOf(15, [0, 10])).toBe(1.5);
    expect(fractionOf(-5, [0, 10])).toBe(-0.5);
  });

  it("puts everything in the middle of a degenerate domain instead of dividing by zero", () => {
    expect(fractionOf(3, [3, 3])).toBe(0.5);
    expect(fractionOf(99, [3, 3])).toBe(0.5);
  });
});

describe("linearScale", () => {
  it("maps the domain onto the range, inverted ranges included", () => {
    const y = linearScale([0, 10], [100, 0]);
    expect(y(0)).toBe(100);
    expect(y(10)).toBe(0);
    expect(y(2.5)).toBe(75);
  });

  it("never returns a coordinate outside the range", () => {
    const x = linearScale([0, 10], [0, 100]);
    expect(x(-50)).toBe(0);
    expect(x(1e6)).toBe(100);
  });
});

describe("overflowOf", () => {
  it("names the side a value escaped from", () => {
    expect(overflowOf(5, [0, 10])).toBeNull();
    expect(overflowOf(0, [0, 10])).toBeNull();
    expect(overflowOf(10, [0, 10])).toBeNull();
    expect(overflowOf(-1, [0, 10])).toBe("low");
    expect(overflowOf(11, [0, 10])).toBe("high");
    expect(overflowOf(11, [10, 0])).toBe("high");
  });
});

describe("niceTicks", () => {
  it("steps on 1, 2, 2.5 or 5 × 10ⁿ", () => {
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(0, 100, 4)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it("keeps only ticks inside the domain, starting at the first nice one", () => {
    // A range of 4.7 in 4 intervals wants a step ≥ 1.175, so 2: never more intervals than asked for.
    expect(niceTicks(3.2, 7.9, 4)).toEqual([4, 6]);
    expect(niceTicks(3.2, 7.9, 5)).toEqual([4, 5, 6, 7]);
  });

  it("rounds floating-point noise away so a formatter never sees 0.30000000000000004", () => {
    for (const t of niceTicks(0, 0.9, 9)) {
      expect(String(t).length).toBeLessThanOrEqual(3);
    }
  });

  it("handles a reversed, flat or unusable range without throwing", () => {
    expect(niceTicks(10, 0, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(4, 4)).toEqual([4]);
    expect(niceTicks(0, Number.NaN)).toEqual([]);
    expect(niceTicks(0, 10, 0)).toEqual([]);
  });

  it("works on negative domains (a delta chart)", () => {
    expect(niceTicks(-10, 10, 4)).toEqual([-10, -5, 0, 5, 10]);
  });
});
