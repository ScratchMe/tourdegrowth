import { describe, expect, it } from "vitest";
import { CANDIDATE_IDS } from "../catalog-shape";
import { comparatorOf, diagnose, positionOf } from "../diagnose";
import { rankingImpact } from "../impact";
import type { EngineState } from "../types";
import { CTX_FR } from "./props";
import { EXAMPLE_EXPECTED, estimated, exampleState, measured, ratio, withEntry, withTarget } from "./fixtures";

// Engine spec §13.1 "diagnose". Non-vacuity, each measured on its own:
// - letting a designating reference name a value INSIDE it (positionOf's
//   `v.hi < c.lo` written `v.lo < c.hi`) fails "within never below" and
//   "level";
// - stamping maybe-below as below fails "maybe-below" only;
// - removing the float tolerance of `clearlyAbove` fails the 600-vs-480
//   boundary only (600.0000000000003 > 600);
// - capping `named` at two fails "shared names the whole group" only;
// - ranking flows by `mrr.lo / gap` instead of the same quantity breaks the
//   € == relative-gap grid only;
// - letting `designates: false` count fails "non-designating" only.

const tool = { kind: "tool", tool: "stripe" } as const;

describe("diagnose — the §6.0 example", () => {
  const d = diagnose(exampleState(), CTX_FR);

  it("activation is named, clearly, in money; day 30 is blind", () => {
    expect(d.state).toBe(EXAMPLE_EXPECTED.diagnosis.state);
    expect(d.named).toEqual(EXAMPLE_EXPECTED.diagnosis.named);
    expect(d.blind).toEqual(EXAMPLE_EXPECTED.diagnosis.blind);
    expect(d.basis).toBe("mrr");
    expect(d.belowUnpriced).toEqual([]);
  });

  it("every candidate's position, and the exact money the ranking used (560 € vs 240 €)", () => {
    expect(d.positions["acq.signup-rate"].position).toBe("no-comparator"); // its reference doesn't designate
    expect(d.positions["act.rate"]).toMatchObject({ position: "below", comparator: { kind: "reference", lo: 20, hi: 40 } });
    expect(d.positions["ret.d30"].position).toBe("unknown");
    expect(d.positions["rev.paid-conversion"].position).toBe("no-comparator");
    expect(d.positions["ref.referred-share"].position).toBe("no-comparator");
    expect(d.positions["ret.logo-churn"]).toMatchObject({ position: "below", comparator: { kind: "reference", lo: 1, hi: 2 } });
    expect(d.positions["act.rate"].impact!.mrrPerMonth!.lo).toBeCloseTo(560, 9);
    expect(d.positions["ret.logo-churn"].impact!.mrrPerMonth!.lo).toBeCloseTo(240, 9);
    expect(d.positions["ret.logo-churn"].impact!.kind).toBe("retained-mrr");
  });
});

describe("diagnose — the rules", () => {
  it("a value inside its reference is never below it; only a target makes it a candidate", () => {
    const within = withEntry(exampleState(), "act.rate", measured(ratio(200, 800)));
    expect(diagnose(within, CTX_FR).positions["act.rate"].position).toBe("within");
    expect(diagnose(within, CTX_FR).named).not.toContain("act.rate");
    const targeted = withTarget(within, "act.rate", 30);
    expect(diagnose(targeted, CTX_FR).positions["act.rate"]).toMatchObject({ position: "below", comparator: { kind: "target", lo: 30, hi: 30 } });
  });

  it("maybe-below straddles the comparator: said, never stamped", () => {
    const straddle = withEntry(exampleState(), "act.rate", estimated(15, 25));
    const d = diagnose(straddle, CTX_FR);
    expect(d.positions["act.rate"].position).toBe("maybe-below");
    expect(d.named).toEqual(["ret.logo-churn"]);
    expect(positionOf({ lo: 1.5, hi: 3 }, { kind: "reference", lo: 1, hi: 2, direction: "lower" })).toBe("maybe-below");
    expect(positionOf({ lo: 0.5, hi: 0.8 }, { kind: "reference", lo: 1, hi: 2, direction: "lower" })).toBe("above");
  });

  it("the clearness margin, both sides: 600 € vs 240 € is clear, 600 € vs 480 € is shared (600 > 600 is false)", () => {
    // N = 45 makes the activation's exact value 45 × (20/18 − 1) × 120 = 600 €.
    const n45 = withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 45), tool));
    const clear = diagnose(n45, CTX_FR);
    expect(clear.positions["act.rate"].impact!.mrrPerMonth!.lo).toBeCloseTo(600, 9);
    expect(clear.state).toBe("clear");
    // Churn at 3 %: 400 × (3 − 2) % = 4 kept × 120 = 480 €.
    const shared = diagnose(withEntry(n45, "ret.logo-churn", measured(ratio(12, 400), tool)), CTX_FR);
    expect(shared.positions["ret.logo-churn"].impact!.mrrPerMonth!.lo).toBeCloseTo(480, 9);
    expect(shared.state).toBe("shared");
    expect(shared.named).toEqual(["act.rate", "ret.logo-churn"]);
    // The example's own N (560 € vs 480 €) is shared too.
    expect(diagnose(withEntry(exampleState(), "ret.logo-churn", measured(ratio(12, 400), tool)), CTX_FR).state).toBe("shared");
  });

  it("shared names the whole group, never capped at two", () => {
    // Three flows 25 % under their targets: identical relative gaps, identical money.
    let s = withEntry(exampleState(), "rev.paid-conversion", measured(ratio(60, 800), tool));
    s = withTarget(s, "acq.signup-rate", (820 / 26_000) * 100 * 1.25);
    s = withTarget(s, "act.rate", 22.5);
    s = withTarget(s, "rev.paid-conversion", 9.375);
    const d = diagnose(s, CTX_FR);
    expect(d.state).toBe("shared");
    expect(d.named).toEqual(["acq.signup-rate", "act.rate", "rev.paid-conversion"]);
    // Churn (240 €) is far below the group's 1 260 €: not named.
    expect(d.named).not.toContain("ret.logo-churn");
  });

  it("not-enough: fewer than two comparable stages — with and without one below", () => {
    const alone = withEntry(exampleState(), "ret.logo-churn", undefined);
    const withBelow = diagnose(alone, CTX_FR);
    expect(withBelow.state).toBe("not-enough");
    expect(withBelow.named).toEqual([]);
    expect(withBelow.positions["act.rate"].position).toBe("below");
    const withoutBelow = diagnose(withEntry(alone, "act.rate", measured(ratio(200, 800))), CTX_FR);
    expect(withoutBelow.state).toBe("not-enough");
    expect(CANDIDATE_IDS.filter((id) => withoutBelow.positions[id].position === "below")).toEqual([]);
  });

  it("level: comparable, nothing below", () => {
    let s = withEntry(exampleState(), "act.rate", measured(ratio(200, 800)));
    s = withEntry(s, "ret.logo-churn", measured(ratio(6, 400), tool));
    const d = diagnose(s, CTX_FR);
    expect(d.state).toBe("level");
    expect(d.named).toEqual([]);
  });

  it("blind lists every unknown ★ and churn, not-applicable excluded", () => {
    let s = withEntry(exampleState(), "ret.logo-churn", undefined);
    s = withEntry(s, "rev.paid-conversion", { status: "not-applicable", naReason: "no-free-tier", updatedAt: "2026-09-20T10:00:00.000Z" });
    expect(diagnose(s, CTX_FR).blind).toEqual(["ret.d30", "ret.logo-churn"]);
  });

  it("day 30 and the referred share are never priced in money", () => {
    let s = withEntry(exampleState(), "ret.d30", measured(ratio(40, 800)));
    s = withTarget(s, "ret.d30", 20);
    s = withEntry(s, "ref.referred-share", measured(ratio(8, 800)));
    s = withTarget(s, "ref.referred-share", 10);
    const d = diagnose(s, CTX_FR);
    for (const id of ["ret.d30", "ref.referred-share"] as const) {
      expect(d.positions[id].position).toBe("below");
      expect(d.positions[id].impact).toBeUndefined();
      expect(rankingImpact(s, id, 20, CTX_FR)).toEqual({});
    }
    expect(d.named).toEqual(["act.rate"]);
    expect(d.belowUnpriced).toEqual(["ret.d30", "ref.referred-share"]);
    // Only unpriceable stages below: one is named, without a basis.
    const only = withEntry(withEntry(s, "act.rate", measured(ratio(200, 800))), "ret.logo-churn", measured(ratio(6, 400), tool));
    const onlyUnpriced = diagnose(withEntry(only, "ref.referred-share", measured(ratio(120, 800))), CTX_FR);
    expect(onlyUnpriced).toMatchObject({ state: "clear", named: ["ret.d30"], basis: "none" });
  });

  it("a reference that doesn't designate never names; a team target always does", () => {
    // 1 % sign-up rate: under the 2-5 % context reference, which doesn't designate.
    const low = withEntry(exampleState(), "acq.signup-rate", measured(ratio(260, 26_000)));
    expect(comparatorOf(low, "acq.signup-rate")).toBeUndefined();
    expect(diagnose(low, CTX_FR).positions["acq.signup-rate"].position).toBe("no-comparator");
    expect(diagnose(withTarget(low, "acq.signup-rate", 2), CTX_FR).positions["acq.signup-rate"].position).toBe("below");
  });

  it("€ ranking == relative-gap ranking for the flows, over a grid of rates and targets", () => {
    const signupRates = [2, 3.2, 5];
    const actRates = [12, 18, 25];
    const paidRates = [4, 6.5, 9];
    const lifts = [1.1, 1.3, 1.6];
    let compared = 0;
    for (const s of signupRates) for (const a of actRates) for (const p of paidRates) {
      for (const ls of lifts) for (const la of lifts) for (const lp of lifts) {
        let state: EngineState = withEntry(exampleState(), "ret.logo-churn", undefined);
        state = withEntry(state, "acq.signup-rate", measured({ kind: "rate", percent: s }));
        state = withEntry(state, "act.rate", measured({ kind: "rate", percent: a }));
        state = withEntry(state, "rev.paid-conversion", measured({ kind: "rate", percent: p }));
        state = withTarget(state, "acq.signup-rate", s * ls);
        state = withTarget(state, "act.rate", a * la);
        state = withTarget(state, "rev.paid-conversion", p * lp);
        const money = diagnose(state, CTX_FR);
        const gap = diagnose(withEntry(state, "rev.arpa", undefined), CTX_FR);
        expect(money.basis).toBe("mrr");
        expect(gap.basis).toBe("relative-gap");
        expect(gap.state).toBe(money.state);
        expect(gap.named).toEqual(money.named);
        compared++;
      }
    }
    expect(compared).toBe(729);
  });

  it("without ARPA, churn stands apart: flows rank by relative gap", () => {
    const d = diagnose(withEntry(exampleState(), "rev.arpa", undefined), CTX_FR);
    expect(d.basis).toBe("relative-gap");
    expect(d.state).toBe("clear");
    expect(d.named).toEqual(["act.rate"]);
    expect(d.belowUnpriced).toEqual(["ret.logo-churn"]);
  });
});
