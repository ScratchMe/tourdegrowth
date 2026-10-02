import { describe, expect, it } from "vitest";
import { motionsOf, startDefaults, startMotionOf, startPlan } from "../start";

/**
 * The first screen's question and its plan (design system extension 07,
 * A18 T3.a). The plan's counts come from the catalogue: the return measured
 * 5/7/5, 4/5/6 and 9/13/11, and the copy has no singular for them — every
 * count must stay at 2 or more, or the sentence needs one.
 */
describe("the start's question", () => {
  it("maps the three answers onto the model's two motions, and back", () => {
    expect(motionsOf("ss")).toEqual({ plg: true, slg: false });
    expect(motionsOf("sa")).toEqual({ plg: false, slg: true });
    expect(motionsOf("both")).toEqual({ plg: true, slg: true });
    for (const answer of ["ss", "sa", "both"] as const) expect(startMotionOf(motionsOf(answer))).toBe(answer);
  });
});

describe("startPlan", () => {
  it("counts the catalogue's numbers by effort, as the return measured them", () => {
    expect(startPlan(motionsOf("ss"))).toEqual({ n: 17, quick: 5, hour: 7, ask: 5 });
    expect(startPlan(motionsOf("sa"))).toEqual({ n: 15, quick: 4, hour: 5, ask: 6 });
    // The hybrid's link is one of its numbers (an hour's work).
    expect(startPlan(motionsOf("both"))).toEqual({ n: 33, quick: 9, hour: 13, ask: 11 });
  });

  it("adds up, and never needs a singular", () => {
    for (const answer of ["ss", "sa", "both"] as const) {
      const plan = startPlan(motionsOf(answer));
      expect(plan.quick + plan.hour + plan.ask).toBe(plan.n);
      expect(Math.min(plan.quick, plan.hour, plan.ask)).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("startDefaults", () => {
  it("the v1 defaults: euros, 7 and 30 days, the last full month and the cohort the payment window has matured", () => {
    const { setup, referenceMonth, cohortMonth } = startDefaults(motionsOf("ss"), new Date(2026, 8, 24, 12));
    expect(setup).toMatchObject({ type: "b2b-saas", currency: "EUR", activationWindowDays: 7, paidWindowDays: 30, qualificationWindowDays: 30, goLiveWindowDays: 90 });
    expect(referenceMonth).toBe("2026-08");
    expect(cohortMonth).toBe("2026-07");
  });

  it("the motions are a copy: the screen's choice is never the state's object", () => {
    const motions = motionsOf("both");
    const { setup } = startDefaults(motions, new Date(2026, 8, 24, 12));
    expect(setup.motions).toEqual(motions);
    expect(setup.motions).not.toBe(motions);
  });
});
