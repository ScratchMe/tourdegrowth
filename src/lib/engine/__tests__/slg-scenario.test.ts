import { describe, expect, it } from "vitest";
import { diagnose } from "../diagnose";
import { buildPeloton } from "../peloton";
import { buildScenario } from "../scenario";
import { buildSlgScenario, oppsFromSelfServe, slgLeverAlone } from "../slg-scenario";
import { buildTotal } from "../total";
import { unitEconomics } from "../unit-economics";
import { estimated, hybridState, measured, ratio, salesAssistedState, withEntry, withTarget } from "./fixtures";
import { CTX_FR } from "./props";

// Engine spec §18.5.5 and §18.10.1 « slg-scenario, levier de la liaison »
// (A7.3.c S1, C25 Q7). Non-vacuity, measured on 2026-10-01:
// - O' = O + L' instead of O + (L' − L) fails the example's two tests
//   (W' = 18 × 170/130);
// - a self-serve projection that loses 10 % of its new MRR when the link's
//   lever moves fails « nothing is taken from self-serve », and only it;
// - accepting a decimal target fails « a whole number of opportunities ».

const hubspot = { kind: "tool", tool: "hubspot" } as const;

describe("the link's lever, on the §18.9 example (C25 Q7)", () => {
  const s = hybridState();
  const today = buildSlgScenario(s, {}, CTX_FR);
  const moved = buildSlgScenario(s, { "link.pql-handoff": 40 }, CTX_FR);

  it("31 → 40 opportunities from self-serve: O' = 139, W' = 18 × 139/130 = 19.25 (+1.25 a quarter)", () => {
    const link = moved.levers.find((l) => l.id === "link.pql-handoff")!;
    expect(link).toMatchObject({ today: { lo: 31, hi: 31 }, target: 40, unit: "count", step: 1, min: 0, max: 62 });
    expect(moved.projected.won!.lo).toBeCloseTo((18 * 139) / 130, 9);
    expect(moved.projected.won!.lo - today.today.won!.lo).toBeCloseTo(1.246, 3);
  });

  it("~830 € of new MRR a month, ~10 000 € more MRR after a year — written in sales-assisted", () => {
    const perMonth = moved.projected.newMrr!.lo - today.today.newMrr!.lo;
    expect(perMonth).toBeCloseTo(830.77, 2);
    expect(moved.projected.mrr12!.lo - today.today.mrr12!.lo).toBeCloseTo(12 * 830.77, 1);
    expect(moved.assumptions).toEqual(["link-others-unchanged", "link-same-win-rate", "link-nothing-taken", "slg-same-spend", "slg-twelve-months"]);
  });

  it("nothing is taken from self-serve: its peloton, diagnosis, unit economics, scenario and MRR are the same before and after", () => {
    const after = { ...s, whatIf: { "link.pql-handoff": 40 } };
    expect(buildPeloton(after, CTX_FR)).toEqual(buildPeloton(s, CTX_FR));
    expect(diagnose(after, CTX_FR)).toEqual(diagnose(s, CTX_FR));
    expect(unitEconomics(after, CTX_FR)).toEqual(unitEconomics(s, CTX_FR));
    expect(buildScenario(after, after.whatIf, CTX_FR)).toEqual(buildScenario(s, {}, CTX_FR));
    expect(buildTotal(after, CTX_FR)!.mrr.plg).toEqual(buildTotal(s, CTX_FR)!.mrr.plg);
  });

  it("is never a candidate, even with a team target, and moves no diagnosis", () => {
    const targeted = withTarget(s, "link.pql-handoff", 60);
    expect(Object.keys(diagnose(targeted, CTX_FR, "slg").positions)).not.toContain("link.pql-handoff");
    expect(diagnose({ ...targeted, whatIf: { "link.pql-handoff": 40 } }, CTX_FR, "slg")).toEqual(diagnose(s, CTX_FR, "slg"));
  });

  it("a whole number of opportunities: a negative or a decimal target is ignored", () => {
    for (const bad of [-3, 33.5, Number.NaN]) {
      expect(buildSlgScenario(s, { "link.pql-handoff": bad }, CTX_FR).moved).not.toContain("link.pql-handoff");
    }
    expect(buildSlgScenario(s, { "link.pql-handoff": 0 }, CTX_FR).moved).toEqual(["link.pql-handoff"]);
  });
});

describe("no slider without what it moves from", () => {
  it("none outside the hybrid", () => {
    expect(buildSlgScenario(salesAssistedState(), { "link.pql-handoff": 40 }, CTX_FR).levers.map((l) => l.id)).not.toContain("link.pql-handoff");
  });

  it("none without L, nor without O", () => {
    const noLink = buildSlgScenario(withEntry(hybridState(), "link.pql-handoff", undefined), { "link.pql-handoff": 40 }, CTX_FR);
    expect(noLink.levers.find((l) => l.id === "link.pql-handoff")).toMatchObject({ today: null, target: null });
    // A share typed as a rate needs O to become opportunities.
    let noO = withEntry(hybridState(), "link.pql-handoff", estimated(20, 25));
    noO = withEntry(noO, "slg.ref.referred-share", undefined);
    noO = { ...noO, snapshots: [{ ...noO.snapshots[0]!, base: { slgDealsWon: 18, slgCustomers: 100 } }] };
    expect(oppsFromSelfServe(noO, CTX_FR)).toBeNull();
    expect(buildSlgScenario(noO, { "link.pql-handoff": 40 }, CTX_FR).moved).toEqual([]);
  });

  it("an estimated share × O gives L as a range", () => {
    expect(oppsFromSelfServe(withEntry(hybridState(), "link.pql-handoff", estimated(20, 30)), CTX_FR)).toEqual({ lo: 26, hi: 39 });
  });
});

describe("the sales-assisted levers (§18.5.5)", () => {
  it("compound: lead → opportunity and win rate multiply W, and the CAC falls with it at the same spend", () => {
    const s = hybridState();
    const both = buildSlgScenario(s, { "slg.acq.lead-to-opp": 18, "slg.rev.win-rate": 32 }, CTX_FR);
    expect(both.projected.won!.lo).toBeCloseTo(18 * (18 / 15) * (32 / 24), 9);
    expect(both.projected.cac!.lo).toBeCloseTo(342_000 / both.projected.won!.lo, 6);
    expect(both.assumptions).toEqual(["slg-lead-same-win-rate", "slg-win-same-closed", "slg-same-spend", "slg-twelve-months"]);
  });

  it("the referred share of opportunities, a lever since §19.3.2: 20 → 30 %, the opportunities and W × 80/70", () => {
    const r = buildSlgScenario(hybridState(), { "slg.ref.referred-share": 30 }, CTX_FR);
    expect(r.moved).toEqual(["slg.ref.referred-share"]);
    expect(r.today.opps).toEqual({ lo: 130, hi: 130 });
    expect(r.projected.opps!.lo).toBeCloseTo(130 * (80 / 70), 9);
    expect(r.projected.won!.lo).toBeCloseTo(18 * (80 / 70), 9);
    // The leak slide prices the same W × (t − r)/(100 − t): the « Et si » and the slide never disagree.
    expect(r.projected.newMrr!.lo - r.today.newMrr!.lo).toBeCloseTo((18 * 10 * 24_000) / 70 / 36, 6);
    expect(r.assumptions).toEqual(["slg-referral-on-top", "slg-same-spend", "slg-twelve-months"]);
  });

  it("the ACV moves the new contracts only: today's MRR keeps its price", () => {
    const acv = buildSlgScenario(hybridState(), { "slg.rev.acv": 30_000 }, CTX_FR);
    expect(acv.projected.mrr).toEqual(acv.today.mrr);
    expect(acv.projected.newMrr!.lo).toBeCloseTo((18 / 3) * (30_000 / 12), 9);
    expect(acv.assumptions).toContain("slg-acv-new-contracts");
  });

  it("the renewal moves the NRR point for point: 88 → 92 % takes 104-108 % to 108-112 %", () => {
    const r = buildSlgScenario(hybridState(), { "slg.ret.renewal": 92 }, CTX_FR);
    expect(r.projected.nrr).toEqual({ lo: 108, hi: 112 });
    expect(r.projected.mrr12!.lo).toBeCloseTo(180_000 * 1.08 + 12 * 12_000, 6);
    expect(r.assumptions).toContain("slg-renewal-as-nrr");
  });

  it("without the NRR, the renewal stands in for it — logos for revenue, said", () => {
    const r = buildSlgScenario(withEntry(hybridState(), "slg.ret.nrr", undefined), {}, CTX_FR);
    expect(r.today.mrr12!.lo).toBeCloseTo(180_000 * 0.88 + 12 * 12_000, 6);
    expect(r.assumptions).toContain("slg-logos-for-revenue");
  });

  it("each moved lever alone, for its own slide", () => {
    const s = { ...hybridState(), whatIf: { "slg.rev.win-rate": 32, "link.pql-handoff": 40 } };
    expect(slgLeverAlone(s, "slg.rev.win-rate", CTX_FR)!.moved).toEqual(["slg.rev.win-rate"]);
    expect(slgLeverAlone(s, "link.pql-handoff", CTX_FR)!.moved).toEqual(["link.pql-handoff"]);
    expect(slgLeverAlone(s, "slg.ret.renewal", CTX_FR)).toBeNull();
  });

  it("reads no self-serve lever: a self-serve target in the same what-ifs changes nothing here", () => {
    const s = hybridState();
    expect(buildSlgScenario(s, { "act.rate": 30, "rev.arpa": 200 }, CTX_FR)).toEqual(buildSlgScenario(s, {}, CTX_FR));
  });

  it("a renewal measured as counts and moved past 100 % is capped by its domain", () => {
    const s = withEntry(hybridState(), "slg.ret.renewal", measured(ratio(24, 25), hubspot, { variant: "annual" }));
    const lever = buildSlgScenario(s, { "slg.ret.renewal": 140 }, CTX_FR).levers.find((l) => l.id === "slg.ret.renewal")!;
    expect(lever.target).toBe(100);
  });
});
