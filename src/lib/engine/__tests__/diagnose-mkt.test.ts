import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOWER_IS_BETTER_CANDIDATES, MKT_DEMAND_CANDIDATE_IDS, MKT_SUPPLY_CANDIDATE_IDS } from "../catalog-shape";
import { deriveEngine } from "../derive";
import { comparatorOf, diagnose, diagnoseSide, directionOf, mktCandidates, mktRules, positionOf } from "../diagnose";
import { churnWithoutCommonAmount, diagnosesOf } from "../phrases";
import type { Diagnosis, EngineState, MktCandidateId, MotionDerived } from "../types";
import { exampleState, marketplaceNoSubscriptionsState, marketplaceState, measured, ratio, withEntry, withTarget, withoutTargets } from "./fixtures";
import { CTX_FR, FR } from "./props";

/**
 * A marketplace's two diagnoses (engine spec §22.5.6, A23 MKT-4), on the example of §22.10.1. Each side names its own
 * stage against its own targets and is priced on its own money (C70, D2): the demand's net revenue, the supply's
 * subscription MRR. The numbers of §22.10.2 (468 and 351 € a month for the demand, 580 and 130,50 € for the supply, the
 * 25 % margin of `clear`) are also computed, without any engine code, by `docs/engine/reference/mkt-example.mjs`.
 *
 * Non-vacuity, measured on 2026-10-25: see the entry of A23 MKT-4 in `JOURNAL.md` for the sabotages and the tests that fell.
 */

const tool = (t: "stripe" | "ga4") => ({ kind: "tool", tool: t }) as const;

const demandOf = (state: EngineState) => diagnoseSide(state, CTX_FR, "demand");
const supplyOf = (state: EngineState) => diagnoseSide(state, CTX_FR, "supply");
const money = (d: Diagnosis<MktCandidateId>, id: MktCandidateId) => d.positions[id]?.impact?.mrrPerMonth?.lo;
/** A state whose month's new buyers cannot be counted: neither the cost's counts nor the sign-ups' counts. */
const withoutN = (state: EngineState) =>
  withEntry(withEntry(state, "mkt.buy.cac", measured({ kind: "amount", amount: 30 }, tool("ga4"))), "mkt.buy.signup-rate", measured({ kind: "rate", percent: 5 }, tool("ga4")));

describe("the example's two diagnoses (§22.10.2)", () => {
  const state = marketplaceState();

  it("the demand names the fill rate, clear, priced in net revenue: 468 € a month against the first order's 351 €", () => {
    const d = demandOf(state);
    expect(d).toMatchObject({ motion: "mkt", side: "demand", state: "clear", named: ["mkt.liq.fill-rate"], basis: "mrr", belowUnpriced: [], blind: [] });
    expect(money(d, "mkt.liq.fill-rate")).toBeCloseTo(600 * (12 / 9 - 1) * 2.34, 9);
    expect(money(d, "mkt.buy.first-order")).toBeCloseTo(351, 9);
    // clear: the top's lower bound beats the other's upper bound by the margin of 1,25.
    expect(money(d, "mkt.liq.fill-rate")!).toBeGreaterThan(money(d, "mkt.buy.first-order")! * 1.25);
    expect(money(d, "mkt.liq.fill-rate")!).toBeCloseTo(468, 9);
    expect(1.25 * 351).toBeCloseTo(438.75, 9);
  });

  it("the supply names the conversion to a paid seller, clear, priced in subscription MRR: 580 € a month against the churn's 130,50 €, the first sale named unpriced", () => {
    const d = supplyOf(state);
    expect(d).toMatchObject({ motion: "mkt", side: "supply", state: "clear", named: ["mkt.sell.paid-conversion"], basis: "mrr", belowUnpriced: ["mkt.sell.first-sale"], blind: [] });
    expect(money(d, "mkt.sell.paid-conversion")).toBeCloseTo(580, 9);
    expect(money(d, "mkt.sell.paid-churn")).toBeCloseTo(130.5, 9);
    expect(money(d, "mkt.sell.paid-conversion")!).toBeGreaterThan(130.5 * 1.25);
    // The first sale is below its target and has no amount: it stays out of the ranking, and is said.
    expect(d.positions["mkt.sell.first-sale"]?.position).toBe("below");
    expect(money(d, "mkt.sell.first-sale")).toBeUndefined();
  });

  it("each side positions its own candidates and nothing of the other's, the supply's subscription ones included", () => {
    expect(Object.keys(demandOf(state).positions)).toEqual([...MKT_DEMAND_CANDIDATE_IDS]);
    expect(Object.keys(supplyOf(state).positions)).toEqual([...MKT_SUPPLY_CANDIDATE_IDS]);
  });

  it("derives both sides in the marketplace's motion, the same objects `diagnoseSide` gives, and leaves the top-level diagnosis a self-serve engine's, empty", () => {
    const derived = deriveEngine(state, CTX_FR, null, [], FR.strings.units);
    const mkt = derived.motions.find((m): m is Extract<MotionDerived, { motion: "mkt" }> => m.motion === "mkt")!;
    expect(derived.motions.map((m) => m.motion)).toEqual(["mkt"]);
    expect(mkt.sides.demand.diagnosis).toEqual(demandOf(state));
    expect(mkt.sides.supply.diagnosis).toEqual(supplyOf(state));
    expect(mkt.sides.demand.side).toBe("demand");
    expect(mkt.sides.supply.side).toBe("supply");
    expect(diagnosesOf(mkt)).toEqual([demandOf(state), supplyOf(state)]);
    // As for an assisted engine alone: the v1 field describes an empty self-serve one, and carries no side.
    expect(derived.diagnosis.state).toBe("not-enough");
    expect(derived.diagnosis).not.toHaveProperty("side");
  });

  it("leaves the SaaS's diagnosis without a `side` key: only a marketplace's side carries one", () => {
    expect(diagnose(exampleState(), CTX_FR)).not.toHaveProperty("side");
    expect(diagnose(exampleState(), CTX_FR, "slg")).not.toHaveProperty("side");
  });
});

describe("without the sellers' subscriptions (D9)", () => {
  const state = marketplaceNoSubscriptionsState();

  it("the supply has no stage to compare: only the first sale carries a target, and it is the only candidate with one besides the active sellers' churn", () => {
    expect(mktCandidates("supply", state.setup)).toEqual(["mkt.sell.first-sale", "mkt.sell.churn"]);
    const d = supplyOf(state);
    expect(d).toMatchObject({ side: "supply", state: "not-enough", named: [], basis: "none", belowUnpriced: [] });
    expect(Object.keys(d.positions)).toEqual(["mkt.sell.first-sale", "mkt.sell.churn"]);
    expect(d.positions["mkt.sell.first-sale"]?.position).toBe("below");
  });

  it("watches the first sale and the churn for blindness, and not the subscription numbers it hides", () => {
    expect(mktRules("supply", state.setup).blindWatch).toEqual(["mkt.sell.first-sale", "mkt.sell.churn"]);
    expect(mktRules("supply", marketplaceState().setup).blindWatch).toEqual(["mkt.sell.first-sale", "mkt.sell.churn", "mkt.sell.paid-conversion", "mkt.sell.paid-churn"]);
    // A hidden number that is not entered is no blind spot.
    const hidden = withEntry(state, "mkt.sell.paid-conversion", undefined);
    expect(supplyOf(hidden).blind).toEqual([]);
  });

  it("leaves the demand's diagnosis exactly what it was with the subscriptions", () => {
    expect(demandOf(state)).toEqual(demandOf(marketplaceState()));
  });
});

describe("the four states and what names a stage", () => {
  it("level: every candidate meets its target, so nothing is named", () => {
    const met = withTarget(withTarget(marketplaceState(), "mkt.buy.first-order", 15), "mkt.liq.fill-rate", 8);
    expect(demandOf(met)).toMatchObject({ state: "level", named: [], basis: "none" });
  });

  it("not-enough: a single target names nothing, and a side with no target at all says so", () => {
    const one = withTarget(withoutTargets(marketplaceState()), "mkt.liq.fill-rate", 12);
    expect(demandOf(one)).toMatchObject({ state: "not-enough", named: [], basis: "none" });
    expect(supplyOf(withoutTargets(marketplaceState()))).toMatchObject({ state: "not-enough", named: [] });
  });

  it("shared: two flows within 25 % of each other are both named, never capped at one", () => {
    // First order to 26 % is worth 421,20 € a month, the fill rate to 12 % 468 €: 468 < 421,20 × 1,25 = 526,50.
    const shared = withTarget(marketplaceState(), "mkt.buy.first-order", 26);
    const d = demandOf(shared);
    expect(d.state).toBe("shared");
    expect(d.basis).toBe("mrr");
    expect([...d.named].sort()).toEqual(["mkt.buy.first-order", "mkt.liq.fill-rate"]);
    expect(money(d, "mkt.buy.first-order")).toBeCloseTo(421.2, 9);
  });

  it("names only unpriced stages when only those are below their target: one is named, several share it, with no basis in money", () => {
    // The second order alone, against a sign-up rate within its target.
    const repeatOnly = withTarget(withTarget(withoutTargets(marketplaceState()), "mkt.buy.repeat", 10), "mkt.buy.signup-rate", 4);
    expect(demandOf(repeatOnly)).toMatchObject({ state: "clear", named: ["mkt.buy.repeat"], basis: "none", belowUnpriced: [] });
    // The sellers' first sale and active churn: both are unpriced, both are behind.
    const noSubscriptions = marketplaceNoSubscriptionsState();
    const both = withTarget(withTarget(noSubscriptions, "mkt.sell.first-sale", 40), "mkt.sell.churn", 2);
    expect(supplyOf(both)).toMatchObject({ state: "shared", named: ["mkt.sell.first-sale", "mkt.sell.churn"], basis: "none" });
  });

  it("ranks by the relative gap alone when the month's new buyers are unknown, and sets the churn apart", () => {
    const noMoney = withTarget(withoutN(marketplaceState()), "mkt.buy.churn", 3);
    const d = demandOf(noMoney);
    expect(d).toMatchObject({ state: "clear", named: ["mkt.liq.fill-rate"], basis: "relative-gap" });
    expect(d.positions["mkt.liq.fill-rate"]?.impact).toBeUndefined();
    // Behind its target but without an amount to set next to the flows': said, not ranked.
    expect(d.positions["mkt.buy.churn"]?.position).toBe("below");
    expect(churnWithoutCommonAmount(d)).toBe(true);
    expect(churnWithoutCommonAmount(demandOf(marketplaceState()))).toBe(false);
  });

  it("keeps the money for the flows when a churn has no base to be priced on: it stands apart, it does not take the ranking down to the gap", () => {
    // The buyers' churn as a bare rate (no count of active buyers on the 1st) behind its target: no amount, the flows keep theirs.
    const noBase = withTarget(withEntry(marketplaceState(), "mkt.buy.churn", measured({ kind: "rate", percent: 5 }, tool("stripe"))), "mkt.buy.churn", 3);
    const demand = demandOf(noBase);
    expect(demand).toMatchObject({ state: "clear", named: ["mkt.liq.fill-rate"], basis: "mrr", belowUnpriced: ["mkt.buy.churn"] });
    // The same on the supply: the paid churn without its paid sellers on the 1st.
    const noPaidBase = withEntry(marketplaceState(), "mkt.sell.paid-churn", measured({ kind: "rate", percent: 4 }, tool("stripe")));
    expect(supplyOf(noPaidBase)).toMatchObject({ state: "clear", named: ["mkt.sell.paid-conversion"], basis: "mrr", belowUnpriced: ["mkt.sell.first-sale", "mkt.sell.paid-churn"] });
  });

  it("does the same on the supply, with the paid sellers' churn as the base-priced candidate", () => {
    const noPrice = withEntry(marketplaceState(), "mkt.sell.arpa", undefined);
    const d = supplyOf(noPrice);
    // The churn is behind its target and has no amount to set next to the conversion's: it is said apart, like the first sale.
    expect(d).toMatchObject({ state: "clear", named: ["mkt.sell.paid-conversion"], basis: "relative-gap", belowUnpriced: ["mkt.sell.first-sale", "mkt.sell.paid-churn"] });
    expect(churnWithoutCommonAmount(d)).toBe(true);
  });

  it("reads a churn above its target as behind it, on the buyers' side as on the SaaS's", () => {
    // A churn above its target is BEHIND it: lower is better.
    const behind = demandOf(withTarget(marketplaceState(), "mkt.buy.churn", 3));
    expect(behind.positions["mkt.buy.churn"]).toMatchObject({ position: "below", comparator: { lo: 3, hi: 3, direction: "lower" } });
    expect(money(behind, "mkt.buy.churn")).toBeCloseTo(14_000 * 0.01 * 2.34, 9);
    const ahead = demandOf(withTarget(marketplaceState(), "mkt.buy.churn", 5));
    expect(ahead.positions["mkt.buy.churn"]?.position).toBe("above");
  });
});

describe("the churns, lower is better", () => {
  it("reads the SaaS's logo churn and the marketplace's three as « lower », and every other candidate as « higher »", () => {
    for (const id of ["ret.logo-churn", "mkt.buy.churn", "mkt.sell.churn", "mkt.sell.paid-churn"] as const) expect(directionOf(id), id).toBe("lower");
    expect([...LOWER_IS_BETTER_CANDIDATES].sort()).toEqual(["mkt.buy.churn", "mkt.sell.churn", "mkt.sell.paid-churn", "ret.logo-churn"]);
    for (const id of [...MKT_DEMAND_CANDIDATE_IDS, ...MKT_SUPPLY_CANDIDATE_IDS]) {
      if (!LOWER_IS_BETTER_CANDIDATES.includes(id)) expect(directionOf(id), id).toBe("higher");
    }
  });

  it("gives a team target the direction of its number: a target of 2 % on the active sellers' churn is a ceiling", () => {
    const state = withTarget(marketplaceState(), "mkt.sell.churn", 2);
    expect(comparatorOf(state, "mkt.sell.churn")).toEqual({ lo: 2, hi: 2, direction: "lower" });
    // The churn of 3 % sits above a 2 % ceiling: behind, in the diagnosis's words.
    expect(positionOf({ lo: 3, hi: 3 }, comparatorOf(state, "mkt.sell.churn")!)).toBe("below");
    const d = supplyOf(state);
    expect(d.positions["mkt.sell.churn"]?.position).toBe("below");
    // The active sellers' churn is behind and has no amount: it is said, never ranked (C67).
    expect(d.belowUnpriced).toEqual(["mkt.sell.first-sale", "mkt.sell.churn"]);
  });

  it("prices the paid sellers' churn by the paid sellers kept: 130,50 € a month, ranked below the conversion", () => {
    const d = supplyOf(marketplaceState());
    expect(d.positions["mkt.sell.paid-churn"]?.position).toBe("below");
    expect(d.positions["mkt.sell.paid-churn"]?.impact?.kind).toBe("retained-mrr");
    expect(d.positions["mkt.sell.paid-conversion"]?.impact?.kind).toBe("new-mrr");
  });
});

describe("what a side watches for blindness", () => {
  it("lists the demand's ★ then the churn and the fill rate when they are unknown: the real bottleneck may hide there", () => {
    expect(mktRules("demand", marketplaceState().setup).blindWatch).toEqual([
      "mkt.buy.signup-rate",
      "mkt.buy.first-order",
      "mkt.buy.repeat",
      "mkt.buy.referred-share",
      "mkt.rev.take-rate",
      "mkt.buy.churn",
      "mkt.liq.fill-rate",
    ]);
    const blind = demandOf(withEntry(withEntry(marketplaceState(), "mkt.buy.repeat", undefined), "mkt.liq.fill-rate", undefined));
    expect(blind.blind).toEqual(["mkt.buy.repeat", "mkt.liq.fill-rate"]);
    expect(demandOf(withEntry(marketplaceState(), "mkt.rev.take-rate", undefined)).blind).toEqual(["mkt.rev.take-rate"]);
  });

  it("watches the supply's first sale, active churn, conversion and paid churn", () => {
    const blind = supplyOf(withEntry(withEntry(marketplaceState(), "mkt.sell.paid-conversion", undefined), "mkt.sell.churn", undefined));
    expect(blind.blind).toEqual(["mkt.sell.churn", "mkt.sell.paid-conversion"]);
  });
});

describe("no function sees the candidates of both sides (D2)", () => {
  const source = readFileSync(join(process.cwd(), "src/lib/engine/diagnose.ts"), "utf8");
  /** The text of one top-level function, from its signature to the closing brace in column 0. */
  const bodyOf = (name: string) => source.match(new RegExp(`export function ${name}\\([\\s\\S]*?\\n}\\n`))![0];

  it("the two sides' candidates and their rules share nothing", () => {
    const setup = marketplaceState().setup;
    const demand = mktRules("demand", setup);
    const supply = mktRules("supply", setup);
    expect(demand.candidates.filter((id) => supply.candidates.includes(id))).toEqual([]);
    expect(demand.side).toBe("demand");
    expect(supply.side).toBe("supply");
    expect(demand.retentions).toEqual(["mkt.buy.churn"]);
    expect(supply.retentions).toEqual(["mkt.sell.paid-churn"]);
    expect(mktCandidates("demand", setup)).toEqual([...MKT_DEMAND_CANDIDATE_IDS]);
    expect(mktCandidates("supply", setup)).toEqual([...MKT_SUPPLY_CANDIDATE_IDS]);
    // Not a marketplace: no side, no candidate.
    expect(mktCandidates("demand", exampleState().setup)).toEqual([]);
  });

  it("`diagnoseSide` calls the one function that names a stage, once, on one side's rules", () => {
    const body = bodyOf("diagnoseSide");
    expect(body.match(/diagnoseWith\(/g)).toHaveLength(1);
    expect(body).toContain("mktRules(side,");
    // Neither of the two lists meets the other anywhere but in the choice of `mktCandidates`, in the marketplace's part of the module.
    const marketplacePart = source.slice(source.indexOf("// --- The two diagnoses of a marketplace"));
    const mentionsBoth = marketplacePart.split(/\n(?=(?:export )?(?:function|const) )/).filter((chunk) => chunk.includes("MKT_DEMAND_CANDIDATE_IDS") && chunk.includes("MKT_SUPPLY_CANDIDATE_IDS"));
    expect(mentionsBoth.map((chunk) => chunk.match(/(?:function|const) (\w+)/)![1])).toEqual(["mktCandidates"]);
  });

  it("changing a number of one side changes nothing of the other side's diagnosis", () => {
    const base = marketplaceState();
    const buyers = withEntry(base, "mkt.liq.fill-rate", measured(ratio(2_600, 26_000), tool("ga4")));
    expect(supplyOf(buyers)).toEqual(supplyOf(base));
    expect(demandOf(buyers)).not.toEqual(demandOf(base));
    const sellers = withEntry(withTarget(base, "mkt.sell.paid-churn", 1), "mkt.sell.arpa", measured({ kind: "amount", amount: 35 }, tool("stripe")));
    expect(demandOf(sellers)).toEqual(demandOf(base));
    expect(supplyOf(sellers)).not.toEqual(supplyOf(base));
  });
});
