import { describe, expect, it } from "vitest";
import { diffPasses } from "../diff";
import { entry, fillRemaining, mission, pass, withPasses } from "./fixtures";

describe("diffPasses — the sentence that proves the instrument served", () => {
  it("reports coverage before and after, and every status change in catalog order", () => {
    const m = mission();
    const first = fillRemaining(m, pass(m, [entry("m01", "measured"), entry("m12", "absent"), entry("m07", "not-accessible")], "pass-1", "2026-09-13"), "absent");
    const second = fillRemaining(
      m,
      pass(m, [entry("m01", "measured"), entry("m12", "measured"), entry("m07", "measured"), entry("m04", "measured")], "pass-2", "2027-03-13"),
      "absent",
    );
    const diff = diffPasses(withPasses(m, first, second), "pass-1", "pass-2");
    expect(diff.before.coverage.documented).toBe(1);
    expect(diff.after.coverage.documented).toBe(4);
    expect(diff.before.coverage.denominator).toBe(diff.after.coverage.denominator);
    expect(diff.changes).toEqual([
      { metricId: "m04", from: "absent", to: "measured" },
      { metricId: "m07", from: "not-accessible", to: "measured" },
      { metricId: "m12", from: "absent", to: "measured" },
    ]);
    expect(diff.before).toMatchObject({ passId: "pass-1", date: "2026-09-13" });
    expect(diff.after).toMatchObject({ passId: "pass-2", date: "2027-03-13" });
  });

  it("an identical pass produces no change", () => {
    const m = mission();
    const p = fillRemaining(m, pass(m), "measured");
    const diff = diffPasses(withPasses(m, p, { ...p, id: "pass-2" }), "pass-1", "pass-2");
    expect(diff.changes).toEqual([]);
  });

  it("a line examined for the first time appears as null → status", () => {
    const m = mission();
    const first = pass(m, [], "pass-1");
    const second = pass(m, [entry("m01", "measured")], "pass-2");
    expect(diffPasses(withPasses(m, first, second), "pass-1", "pass-2").changes).toEqual([{ metricId: "m01", from: null, to: "measured" }]);
  });

  it("throws on an unknown pass", () => {
    const m = withPasses(mission(), pass(mission()));
    expect(() => diffPasses(m, "pass-1", "nope")).toThrow(/Unknown pass nope/);
  });
});
