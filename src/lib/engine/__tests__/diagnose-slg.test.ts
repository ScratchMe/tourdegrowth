import { describe, expect, it } from "vitest";
import { SLG_CANDIDATE_IDS } from "../catalog-shape";
import { diagnose } from "../diagnose";
import { hybridState, measured, ratio, withEntry, withTarget, withoutTargets } from "./fixtures";
import { CTX_FR } from "./props";

// Engine spec §18.5.2, §18.9.4 and §18.10.1 « diagnose (SLG) » (A7.3.c S1).
// Non-vacuity, measured on 2026-10-01:
// - reading the renewal's money on W instead of D moves it from 600 to 432 €
//   and fails the example's impacts (the ranking still names the win rate);
// - letting the link into the candidates fails three: the five positions,
//   « the link names nothing » and slg-scenario's « never a candidate »;
// - dropping the 1e-9 tolerance of `clearlyAbove` fails the bound at 30 %
//   (18 × (30/24 − 1) × 2 000 ÷ 3 lands a hair off 3 000) — and self-serve's
//   own margin case in diagnose.test.ts: float residue, not the numbers,
//   would name the stage.

const hubspot = { kind: "tool", tool: "hubspot" } as const;

describe("the §18.9.4 example", () => {
  const d = diagnose(hybridState(), CTX_FR, "slg");

  it("names the win rate, clear: ~4 000 € a month against 2 400 and 600", () => {
    expect(d).toMatchObject({ motion: "slg", state: "clear", named: ["slg.rev.win-rate"], basis: "mrr", belowUnpriced: [], blind: ["slg.act.go-live"] });
    expect(d.positions["slg.rev.win-rate"].impact!.mrrPerMonth!.lo).toBeCloseTo(4_000, 9);
    expect(d.positions["slg.acq.lead-to-opp"].impact!.mrrPerMonth!.lo).toBeCloseTo(2_400, 9);
    expect(d.positions["slg.ret.renewal"].impact!.mrrPerMonth!.lo).toBeCloseTo(600, 9);
    expect(d.positions["slg.ret.renewal"].impact!.kind).toBe("retained-mrr");
  });

  it("positions its five candidates and nothing else — no self-serve stage, no NRR, no link", () => {
    expect(Object.keys(d.positions).sort()).toEqual([...SLG_CANDIDATE_IDS].sort());
    expect(d.positions["slg.act.go-live"]).toEqual({ position: "unknown" });
    expect(d.positions["slg.ref.referred-share"]).toEqual({ position: "no-comparator" });
  });

  it("the bound: a win-rate target of 30 % makes it shared with lead → opportunity, the renewal out of the group", () => {
    const at30 = diagnose(withTarget(hybridState(), "slg.rev.win-rate", 30), CTX_FR, "slg");
    expect(at30.positions["slg.rev.win-rate"].impact!.mrrPerMonth!.lo).toBeCloseTo(3_000, 9);
    expect(at30).toMatchObject({ state: "shared", named: ["slg.rev.win-rate", "slg.acq.lead-to-opp"], basis: "mrr" });
  });
});

describe("the rules, sales-assisted", () => {
  it("never prices go-live nor the referred share: below their target, they stand apart, named but unpriced", () => {
    let s = withEntry(hybridState(), "slg.act.go-live", measured(ratio(9, 15), hubspot));
    s = withTarget(withTarget(s, "slg.act.go-live", 80), "slg.ref.referred-share", 30);
    const d = diagnose(s, CTX_FR, "slg");
    expect(d.positions["slg.act.go-live"]).toMatchObject({ position: "below" });
    expect(d.positions["slg.act.go-live"].impact).toBeUndefined();
    expect(d.positions["slg.ref.referred-share"].impact).toBeUndefined();
    expect(d.belowUnpriced).toEqual(["slg.act.go-live", "slg.ref.referred-share"]);
    expect(d.named).toEqual(["slg.rev.win-rate"]);
  });

  it("no published reference names anything: without the team's targets, not enough to say (C1)", () => {
    const d = diagnose(withoutTargets(hybridState()), CTX_FR, "slg");
    expect(d.state).toBe("not-enough");
    expect(d.named).toEqual([]);
    // The NRR carries the glossary's 110-130 % as context: it is not a candidate, target or not.
    expect(Object.keys(diagnose(withTarget(hybridState(), "slg.ret.nrr", 120), CTX_FR, "slg").positions)).not.toContain("slg.ret.nrr");
  });

  it("the link names nothing, even with a team target on it (C25 Q7)", () => {
    const d = diagnose(withTarget(hybridState(), "link.pql-handoff", 60), CTX_FR, "slg");
    expect(d).toEqual(diagnose(hybridState(), CTX_FR, "slg"));
  });

  it("without the ACV, the flows rank by relative gap and the renewal stands apart", () => {
    const d = diagnose(withEntry(hybridState(), "slg.rev.acv", undefined), CTX_FR, "slg");
    // 32/24 − 1 = 0.33 against 18/15 − 1 = 0.2: clear by more than 1.25.
    expect(d).toMatchObject({ state: "clear", named: ["slg.rev.win-rate"], basis: "relative-gap" });
  });

  it("every candidate reads « higher is better »: a value above its target is `above`, never a leak", () => {
    const d = diagnose(withTarget(hybridState(), "slg.ret.renewal", 80), CTX_FR, "slg");
    expect(d.positions["slg.ret.renewal"].position).toBe("above");
  });
});
