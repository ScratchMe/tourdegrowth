import { describe, expect, it } from "vitest";
import { longestTransition } from "../QuarterNews";

/*
 * QuarterNews hands the quarter over once the dialog's fade out has run, and
 * reads that length off the dialog's computed `transition-duration`
 * (CHANTIERS.md A4, 2026-09-29): a list, one entry per property — opacity,
 * display, overlay — each in `s` as the browser writes it. The fade itself
 * is read in e2e/platform-native.spec.ts; this is the arithmetic.
 *
 * Non-vacuity (2026-09-29): reading the first entry only fails the first
 * two; `parseFloat` without the unit check fails « in milliseconds either
 * way ».
 */
describe("longestTransition", () => {
  it("the longest of the list, in ms", () => {
    expect(longestTransition("0.15s, 0.15s, 0.15s")).toBe(150);
    expect(longestTransition("0s, 0.25s, 0.15s")).toBe(250);
  });

  it("in milliseconds either way", () => {
    expect(longestTransition("150ms")).toBe(150);
    expect(longestTransition("0.1s, 120ms")).toBe(120);
  });

  it("nothing to wait for under reduced motion, or on a value it cannot read", () => {
    expect(longestTransition("0s")).toBe(0);
    expect(longestTransition("")).toBe(0);
    expect(longestTransition("auto")).toBe(0);
  });
});
