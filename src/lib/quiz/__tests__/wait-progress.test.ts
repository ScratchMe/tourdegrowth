import { describe, expect, it } from "vitest";
import { formatElapsed, TYPICAL_WAIT_MS, waitProgress } from "../wait-progress";

/** A14.6: the bar follows the clock, slows as it goes, and only the answer fills it. */
describe("waitProgress", () => {
  it("starts empty", () => {
    expect(waitProgress(0)).toBe(0);
    expect(waitProgress(-5)).toBe(0);
    expect(waitProgress(Number.NaN)).toBe(0);
  });

  it("stands at 85 % after the typical minute, about a quarter after ten seconds", () => {
    expect(waitProgress(TYPICAL_WAIT_MS)).toBeCloseTo(0.85, 5);
    expect(waitProgress(10_000)).toBeGreaterThan(0.25);
    expect(waitProgress(10_000)).toBeLessThan(0.3);
  });

  it("never reaches the end, even past the route's 120 s ceiling", () => {
    expect(waitProgress(120_000)).toBeLessThan(1);
    expect(waitProgress(10 * 60_000)).toBeLessThan(1);
  });

  it("only ever moves forward, and slower and slower", () => {
    let previous = 0;
    let previousStep = Infinity;
    for (let t = 5_000; t <= 120_000; t += 5_000) {
      const p = waitProgress(t);
      expect(p).toBeGreaterThan(previous);
      expect(p - previous).toBeLessThan(previousStep);
      previousStep = p - previous;
      previous = p;
    }
  });
});

describe("formatElapsed", () => {
  it("reads as a clock, in whole seconds", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(7_900)).toBe("0:07");
    expect(formatElapsed(65_000)).toBe("1:05");
    expect(formatElapsed(-1)).toBe("0:00");
  });
});
