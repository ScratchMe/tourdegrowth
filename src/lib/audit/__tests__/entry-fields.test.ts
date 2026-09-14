import { describe, expect, it } from "vitest";
import { entryFieldGroups, selectableStatuses, type EntryFieldGroup } from "../entry-fields";
import { VALUE_STATUSES, type ValueStatus } from "../schema";
import { validateMission } from "../validate";
import type { Entry } from "../schema";
import { entry, mission, pass } from "./fixtures";

/** Reads the field the fixture sets, so the removal above is provably a removal. */
function repairCostOf(e: Entry) {
  return e.repairCost;
}

/**
 * The rule these tests hold is not "the right boxes are on screen" — it is
 * that what the screen ASKS FOR matches what the validator will DEMAND. A
 * field shown for the wrong status lets someone enter data the validator
 * later refuses, and the only place that shows up is an export error.
 */
describe("entryFieldGroups", () => {
  it("covers every status in the schema — a new one cannot be silently unhandled", () => {
    for (const status of VALUE_STATUSES) {
      expect(Array.isArray(entryFieldGroups(status)), status).toBe(true);
    }
  });

  it("asks for the absence fields exactly where the validator requires a repair cost", () => {
    // The validator's own rule, exercised rather than restated: a row marked
    // absent without a repair cost is refused.
    const m = mission();
    // The fixture gives an absent row a repair cost, so it has to be REMOVED
    // rather than overridden — my first version spread it back in and the
    // assertion proved nothing.
    const { repairCost: _dropped, ...withoutCost } = entry("m01", "absent");
    expect(repairCostOf(entry("m01", "absent"))).toBeDefined();
    const result = validateMission({ ...m, passes: [pass(m, [withoutCost])] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes("repairCost"))).toBe(true);

    expect(entryFieldGroups("absent")).toContain("absence");
  });

  /**
   * The EXACT set per status, not membership.
   *
   * Found by a non-vacuity check: with the absence fields deliberately leaked
   * into the measured statuses, the membership version of this test passed
   * and only the e2e caught it. A `toContain` says what must be there and
   * nothing about what must not — which is the half that matters, since a
   * stray field is what lets someone enter data the validator then refuses.
   */
  it("asks for exactly the right groups, status by status", () => {
    const expected: Record<ValueStatus, EntryFieldGroup[]> = {
      measured: ["value"],
      estimated: ["value"],
      "reported-without-definition": ["value"],
      contested: ["absence", "value"],
      absent: ["absence"],
      "not-accessible": ["access"],
      "not-applicable": [],
    };
    for (const status of VALUE_STATUSES) {
      expect([...entryFieldGroups(status)].sort(), status).toEqual([...expected[status]].sort());
    }
  });

  /**
   * `contested` is the one status that needs both: two numbers that disagree
   * (the value side) and the system cause that explains why nobody settled it
   * (the absence side). Getting this wrong hides the most interesting finding
   * the instrument can produce.
   */
  it("asks for both sides on a contested row", () => {
    expect(entryFieldGroups("contested").sort()).toEqual(["absence", "value"]);
  });

  it("asks for nothing on a row outside the profile", () => {
    expect(entryFieldGroups("not-applicable")).toEqual([]);
  });
});

describe("selectableStatuses", () => {
  /**
   * `not-applicable` is written by `newPass` from the catalog's `appliesTo`,
   * never chosen. Offering it would invite emptying the denominator row by
   * row, which turns coverage into an opinion — and the validator refuses it
   * on an applicable row anyway, so the screen would be offering an error.
   */
  it("never offers not-applicable, and offers every other status", () => {
    const offered = selectableStatuses(VALUE_STATUSES);
    expect(offered).not.toContain("not-applicable");
    expect(offered).toHaveLength(VALUE_STATUSES.length - 1);
    for (const status of VALUE_STATUSES) {
      if (status !== "not-applicable") expect(offered, status).toContain(status);
    }
  });

  it("is what the validator would accept — the screen never offers a refused status", () => {
    const m = mission();
    for (const status of selectableStatuses(VALUE_STATUSES)) {
      if (status !== "not-applicable") continue;
      throw new Error("unreachable");
    }
    // And the converse, exercised: not-applicable on an applicable row is refused.
    const bad = { ...entry("m01", "not-applicable"), notApplicableReason: "made up" };
    const result = validateMission({ ...m, passes: [pass(m, [bad])] });
    expect(result.ok).toBe(false);
  });
});
