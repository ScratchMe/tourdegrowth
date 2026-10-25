import { describe, expect, it } from "vitest";
import { ALL_LEVER_IDS, MKT_DEMAND_LEVER_IDS, MKT_SUPPLY_LEVER_IDS } from "../catalog-shape";
import { EXAMPLE_MKT_WHATIF } from "../example";
import { twelveMonthFactor } from "../impact";
import { mul } from "../interval";
import { mktNetRevenueToday, mktNewBuyersPerMonth, mktNewPaidSellers, mktRevenuePerBuyer, mktSellerMrrToday } from "../mkt-economics";
import { demandPath, sellerPath } from "../mkt-model";
import { buildMktScenario, mktLeverAlone, mktTotal, mktTotalPaths, type MktScenario, type MktScenarioAssumption } from "../mkt-scenario";
import { scenarioOf } from "../scenario-of";
import type { EngineState, Interval, LeverId } from "../types";
import { knownIn } from "../values";
import { estimated, marketplaceNoSubscriptionsState, marketplaceState, measured, ratio, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

/**
 * A marketplace's « Et si » (engine spec §22.5.4, A23 MKT-3), on the example of §22.10.1: a second-hand furniture
 * marketplace, 600 new buyers a month, an active buyer orders 0,3 times a month for 65 € at a 12 % take rate, 4 % of
 * the buyers leave a month, a net revenue of 32 853,60 €, a 55 to 65 % margin estimated, a buyer costs 30 €; 400
 * seller sign-ups, 30 % sell, 15 % subscribe, 900 paid sellers pay 29 € (an MRR of 26 100 €), 3 % of them leave a
 * month, an 85 % margin, an active seller costs 100 €. Every figure of §22.10.2 below is also computed, without any
 * engine code, by `docs/engine/reference/mkt-example.mjs`; `mkt-model.test.ts` pins the model's own figures, and these
 * tests pin what the WIRING does with them: which lever moves which factor, which rule is printed, what an unknown does.
 *
 * Non-vacuity, measured on 2026-10-22 (27 sabotages, each applied alone, this file, `engine-copy.test.ts`,
 * `scenario-view.test.ts` and `catalog-shape.test.ts` run, then the file restored and its sha compared; the count is
 * the tests that fall — every sabotage made at least one fall):
 * - the fill rate also applied to a and to the base (D5 betrayed): the demand's « Et si » curve and KPIs, the fill rate
 *   alone and the lever-alone-equals-its-chain test fall (9);
 * - the money levers applied to the new buyers only, the base kept at today's revenue (D6 betrayed): the curve's first
 *   point and the take rate alone fall (6);
 * - the price applied to the new paid sellers only (D6 betrayed): « price 35 €: month 1 = 32 655 € » falls (1);
 * - a paid seller's cost that does not fall when the conversion rises: « cost 150 € » and the payback, LTV:CAC and cash
 *   that hang on it fall (2);
 * - `same-spend` printed without a known cost, on either side: the unknown-cost test of each side falls (1 and 1);
 * - the demand reading the supply's levers too: the independence tests fall (3);
 * - the supply counted without subscriptions (no early return): the no-subscriptions tests fall (2);
 * - the total without the supply's curve when the sellers pay: the total tests fall (4);
 * - `mkt.rev.frequency` a « percent » lever (2), without its own step (2); `mkt.buy.churn` (1), `mkt.sell.paid-churn` (1)
 *   not lower-is-better; `mkt.sell.arpa` (1) or `mkt.rev.aov` (2) not a money lever: the domain tests fall;
 * - an assumption printed out of the type's order: the order tests fall (5);
 * - today's spend computed on N', not N (1); the referred not on top of the others (1); the sign-up factor ignored (1);
 * - the warning never raised (1); the cash tied up not a floor (1);
 * - the projected visitors left at the sign-up rate's denominator, not grown with the referred (1);
 * - `scenario-view.ts#leverText` printing the frequency as a percent: its test falls (1);
 * - a lever subject (1), an own rule's sentence (2) removed from the copy; `ALL_LEVER_IDS` without the supply's levers (2);
 * - a lever alone always read on the demand's side: the supply lever tests fall (2).
 */

const r2 = (v: number) => Math.round(v * 100) / 100;
const all = (list: Interval[] | null) => list!.map((p) => Math.round(p.lo));

/** An interval that is a single value (everything in the example is measured): its value, or the failure. */
function only(i: Interval | null | undefined): number {
  expect(i, "a known figure").toBeTruthy();
  expect(i!.hi).toBeCloseTo(i!.lo, 9);
  return i!.lo;
}

/** The rounded bounds of an interval, to the cent, as « lo to hi » (or a single value). */
function range(i: Interval | null | undefined): [number, number] {
  expect(i, "a known figure").toBeTruthy();
  return [r2(i!.lo), r2(i!.hi)];
}

/** The state with the what-ifs of the example on top (`EXAMPLE_MKT_WHATIF` is never put in the state itself). */
function withWhatIf(state: EngineState, whatIf: Partial<Record<LeverId, number>>): EngineState {
  return { ...state, whatIf };
}

/** `t ← t × kept + added`, twelve times from `start`: the loop of the model, written again (the engine's `pathFromNextMonth` is not used). */
function loop(start: number, added: number, kept: number): number[] {
  const out: number[] = [];
  let t = start;
  for (let m = 0; m < 12; m++) {
    t = t * kept + added;
    out.push(t);
  }
  return out;
}

const example = marketplaceState();
const noSubscriptions = marketplaceNoSubscriptionsState();
const demandToday = buildMktScenario(example, {}, CTX_FR, "demand");
const supplyToday = buildMktScenario(example, {}, CTX_FR, "supply");
const demandIf = buildMktScenario(example, EXAMPLE_MKT_WHATIF, CTX_FR, "demand");
const supplyIf = buildMktScenario(example, EXAMPLE_MKT_WHATIF, CTX_FR, "supply");

describe("the levers: domains, units and directions (§22.5.4)", () => {
  it("the marketplace's eleven levers are among the ones a file may carry a what-if for, after the other types'", () => {
    expect(ALL_LEVER_IDS.slice(-11)).toEqual([...MKT_DEMAND_LEVER_IDS, ...MKT_SUPPLY_LEVER_IDS]);
  });

  it("the demand's eight, in the order of the list, each on its step and with the unit and direction it deserves", () => {
    const rows = demandToday.levers.map((l) => [l.id, l.unit, l.direction, l.step, l.min, l.max]);
    expect(rows).toEqual([
      ["mkt.buy.signup-rate", "percent", "higher", 0.1, 2.5, 15],
      ["mkt.buy.referred-share", "percent", "higher", 0.1, 4, 24],
      ["mkt.buy.first-order", "percent", "higher", 1, 10, 60],
      ["mkt.liq.fill-rate", "percent", "higher", 0.1, 4.5, 27],
      ["mkt.buy.churn", "percent", "lower", 0.1, 0, 8],
      // The order frequency is a plain number of orders: a ratio, a hundredth for a step, from half to three times today.
      ["mkt.rev.frequency", "ratio", "higher", 0.01, 0.15, 0.9],
      ["mkt.rev.aov", "money", "higher", 1, 33, 130],
      ["mkt.rev.take-rate", "percent", "higher", 1, 6, 36],
    ]);
  });

  it("the supply's three: the subscription price is money, the paid sellers' churn is lower-is-better", () => {
    expect(supplyToday.levers.map((l) => [l.id, l.unit, l.direction, l.step, l.min, l.max])).toEqual([
      ["mkt.sell.paid-conversion", "percent", "higher", 1, 8, 45],
      ["mkt.sell.paid-churn", "percent", "lower", 0.1, 0, 6],
      ["mkt.sell.arpa", "money", "higher", 1, 15, 58],
    ]);
  });

  it("a ratio lever is never capped at 100 (it is no share); a bounded rate is", () => {
    const frequency = buildMktScenario(example, { "mkt.rev.frequency": 150 }, CTX_FR, "demand").levers.find((l) => l.id === "mkt.rev.frequency")!;
    expect(frequency.target).toBe(150);
    const take = buildMktScenario(example, { "mkt.rev.take-rate": 150 }, CTX_FR, "demand").levers.find((l) => l.id === "mkt.rev.take-rate")!;
    expect(take.target).toBe(100);
  });

  it("an unknown lever has no slider and its target is ignored: nothing moves, and no rule is printed for it", () => {
    const unknown = withEntry(example, "mkt.liq.fill-rate", undefined);
    const s = buildMktScenario(unknown, { "mkt.liq.fill-rate": 12 }, CTX_FR, "demand");
    expect(s.levers.find((l) => l.id === "mkt.liq.fill-rate")).toMatchObject({ today: null, target: null, min: 0, max: 0, step: 1 });
    expect(s.moved).toEqual([]);
    expect(s.assumptions).not.toContain("fill-new-buyers-only");
    expect(s.projected.kpis.mrr12).toEqual(s.today.kpis.mrr12);
  });
});

describe("the demand, today (§22.10.2)", () => {
  const { funnel, kpis } = demandToday.today;

  it("the month's funnel: 60 000 visitors, 3 000 sign-ups, 240 referred, 600 new buyers", () => {
    expect(funnel).toEqual({ visitors: { lo: 60_000, hi: 60_000 }, signups: { lo: 3_000, hi: 3_000 }, referred: { lo: 240, hi: 240 }, newUnits: { lo: 600, hi: 600 } });
  });

  it("the revenue: 32 853,60 € a month and 394 243,20 € a year; the GMV 273 780 €; 1 404 € of new revenue; 2,34 € a buyer", () => {
    expect(only(kpis.mrr)).toBeCloseTo(32_853.6, 9);
    expect(only(kpis.arr)).toBeCloseTo(394_243.2, 6);
    expect(only(kpis.gmv)).toBeCloseTo(273_780, 6);
    expect(only(kpis.newMrr)).toBeCloseTo(1_404, 9);
    expect(only(kpis.revenuePerUnit)).toBeCloseTo(2.34, 9);
  });

  it("in twelve months: 33 723,61 € (404 683,31 € a year), on the curve of §22.10.2", () => {
    expect(r2(only(kpis.mrr12))).toBe(33_723.61);
    expect(r2(only(kpis.arr12))).toBe(404_683.31);
    expect(all(kpis.mrrPath)).toEqual([32_854, 32_943, 33_030, 33_113, 33_192, 33_268, 33_342, 33_412, 33_479, 33_544, 33_607, 33_666, 33_724]);
    expect(kpis.mrrPath).toHaveLength(13);
  });

  it("a buyer: cost 30 €, margin 1,287 to 1,521 € a month, 25 months, LTV 32,17 to 38,03 €, payback 19,72 to 23,31 months, LTV:CAC 1,07 to 1,27", () => {
    expect(only(kpis.cac)).toBe(30);
    expect(range(kpis.monthlyMargin)).toEqual([1.29, 1.52]);
    expect(only(kpis.lifetime)).toBeCloseTo(25, 9);
    expect(kpis.ltv!.lo).toBeCloseTo(32.175, 6);
    expect(kpis.ltv!.hi).toBeCloseTo(38.025, 6);
    expect(range(kpis.payback)).toEqual([19.72, 23.31]);
    expect(range(kpis.ltvCac)).toEqual([1.07, 1.27]);
  });

  it("the money of A20: no loss, 1,69 to 5,28 months of margin after the payback, no warning, 18 000 € a month and 177 514,79 to 209 790,21 € tied up, a floor", () => {
    expect(kpis.loss!.verdict).toBe("none");
    expect(range(kpis.afterPayback)).toEqual([1.69, 5.28]);
    expect(kpis.warning).toBeNull();
    expect(only(kpis.spend)).toBeCloseTo(18_000, 9);
    expect(range(kpis.cash!.tiedUp)).toEqual([177_514.79, 209_790.21]);
    expect(kpis.cash!.floor).toBe(true);
  });

  it("with no lever the projection is today's, the GMV apart (it is today only)", () => {
    expect(demandToday.projected.kpis).toEqual({ ...demandToday.today.kpis, gmv: null });
    expect(demandToday.projected.funnel).toEqual(demandToday.today.funnel);
    expect(demandToday.moved).toEqual([]);
  });

  it("with no lever, the curve is the model's `demandPath` on the wired quantities, written again here", () => {
    const direct = demandPath(mktNetRevenueToday(example, CTX_FR), mul(mktNewBuyersPerMonth(example, CTX_FR)!, mktRevenuePerBuyer(example, CTX_FR)!), { lo: 4, hi: 4 });
    expect(demandToday.today.kpis.mrrPath).toEqual(direct);
    const again = loop(32_853.6, 600 * 2.34, 0.96);
    demandToday.today.kpis.mrrPath!.slice(1).forEach((p, m) => expect(p.lo).toBeCloseTo(again[m]!, 6));
  });
});

describe("the demand, with the what-ifs of the example: fill rate 12 %, first order 25 %, take rate 13 % (§22.10.2)", () => {
  const { funnel, kpis } = demandIf.projected;

  it("N' = 1 000 new buyers (600 × 12/9 × 25/20); the sign-ups and the referred are untouched", () => {
    expect(funnel).toEqual({ visitors: { lo: 60_000, hi: 60_000 }, signups: { lo: 3_000, hi: 3_000 }, referred: { lo: 240, hi: 240 }, newUnits: expect.anything() });
    expect(only(funnel.newUnits)).toBeCloseTo(1_000, 9);
  });

  it("a' = 2,535 €, 2 535 € of new revenue a month, the revenue unchanged today", () => {
    expect(only(kpis.revenuePerUnit)).toBeCloseTo(2.535, 9);
    expect(only(kpis.newMrr)).toBeCloseTo(2_535, 6);
    expect(only(kpis.mrr)).toBeCloseTo(32_853.6, 9);
    expect(kpis.gmv).toBeNull();
  });

  it("in twelve months 46 351,72 € (556 220,61 € a year), a gain of 12 628,11 €", () => {
    expect(r2(only(kpis.mrr12))).toBe(46_351.72);
    expect(r2(only(kpis.arr12))).toBe(556_220.61);
    expect(r2(only(kpis.mrr12) - only(demandIf.today.kpis.mrr12))).toBe(12_628.11);
  });

  it("the curve: the whole base is at 13/12 from the next month (D6), the new buyers on top", () => {
    expect(all(kpis.mrrPath)).toEqual([32_854, 36_703, 37_770, 38_794, 39_777, 40_721, 41_627, 42_497, 43_332, 44_134, 44_904, 45_642, 46_352]);
    // Month 1 by hand: 32 853,60 × 13/12 × 0,96 + 1 000 × 2,535.
    expect(kpis.mrrPath![1]!.lo).toBeCloseTo(((32_853.6 * 13) / 12) * 0.96 + 2_535, 6);
  });

  it("the same spend: a buyer costs 18 €, with an LTV of 34,86 to 41,19 €, a payback of 10,92 to 12,91 months, an LTV:CAC of 1,94 to 2,29", () => {
    expect(only(kpis.cac)).toBeCloseTo(18, 9);
    expect(range(kpis.ltv)).toEqual([34.86, 41.19]);
    expect(range(kpis.payback)).toEqual([10.92, 12.91]);
    expect(range(kpis.ltvCac)).toEqual([1.94, 2.29]);
    // The spend of a month stays today's, whatever the what-ifs (A20): 600 buyers at 30 € and 1 000 at 18 €.
    expect(only(kpis.spend)).toBeCloseTo(18_000, 9);
    expect(kpis.loss!.verdict).toBe("none");
    expect(kpis.warning).toBeNull();
  });

  it("prints the six rules that served, in the type's order", () => {
    expect(demandIf.assumptions).toEqual(["fill-new-buyers-only", "new-buyer-spends-average", "money-levers-all-buyers", "same-spend", "active-twelve-months", "twelve-months"]);
    expect(demandIf.moved).toEqual(["mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.rev.take-rate"]);
  });

  it("with no lever, only the three rules that always hold are printed (and the new buyer's, since the revenue is known)", () => {
    expect(demandToday.assumptions).toEqual(["new-buyer-spends-average", "active-twelve-months", "twelve-months"]);
  });
});

describe("each demand lever alone, and what they do together", () => {
  const withExample = withWhatIf(example, EXAMPLE_MKT_WHATIF);
  const gain = (id: LeverId) => {
    const alone = mktLeverAlone(withExample, id, CTX_FR)!;
    return alone.projected.kpis.mrr12!.lo - alone.today.kpis.mrr12!.lo;
  };

  it("fill rate 4 531,30 €, first order 3 398,47 €, take rate 2 810,30 €: 10 740,07 € added, and +1 888,04 € because they compound", () => {
    expect(r2(gain("mkt.liq.fill-rate"))).toBe(4_531.3);
    expect(r2(gain("mkt.buy.first-order"))).toBe(3_398.47);
    expect(r2(gain("mkt.rev.take-rate"))).toBe(2_810.3);
    const sum = gain("mkt.liq.fill-rate") + gain("mkt.buy.first-order") + gain("mkt.rev.take-rate");
    expect(r2(sum)).toBe(10_740.07);
    expect(r2(only(demandIf.projected.kpis.mrr12) - only(demandIf.today.kpis.mrr12) - sum)).toBe(1_888.04);
  });

  it("the fill rate alone is the last line of its chain: 600 × (12/9 − 1) buyers × 2,34 € × the twelve-month factor of a 4 % churn (D5)", () => {
    const chain = 600 * (12 / 9 - 1) * 2.34 * twelveMonthFactor(4);
    expect(r2(chain)).toBe(4_531.3);
    expect(gain("mkt.liq.fill-rate")).toBeCloseTo(chain, 6);
  });

  it("a lever alone is a scenario with that one lever moved, on its own side; a lever with no target, an unknown one or another type's gives none", () => {
    const alone = mktLeverAlone(withExample, "mkt.liq.fill-rate", CTX_FR)!;
    expect(alone.side).toBe("demand");
    expect(alone.moved).toEqual(["mkt.liq.fill-rate"]);
    expect(alone.assumptions).toEqual(["fill-new-buyers-only", "new-buyer-spends-average", "same-spend", "active-twelve-months", "twelve-months"]);
    expect(mktLeverAlone(withExample, "mkt.rev.aov", CTX_FR)).toBeNull(); // no target
    expect(mktLeverAlone(withWhatIf(example, { "acq.signup-rate": 4 }), "acq.signup-rate", CTX_FR)).toBeNull(); // the SaaS's
    expect(mktLeverAlone(example, "mkt.liq.fill-rate", CTX_FR)).toBeNull(); // no what-if at all
    expect(mktLeverAlone(withEntry(withExample, "mkt.liq.fill-rate", undefined), "mkt.liq.fill-rate", CTX_FR)).toBeNull(); // unknown: no slider
    expect(mktLeverAlone(withExample, "mkt.sell.paid-conversion", CTX_FR)!.side).toBe("supply");
  });
});

describe("the other demand levers, each through its own factor", () => {
  it("the sign-up rate 5 % to 6 %: the same visitors, 3 600 sign-ups, 288 referred, 720 new buyers", () => {
    const s = buildMktScenario(example, { "mkt.buy.signup-rate": 6 }, CTX_FR, "demand");
    expect(only(s.projected.funnel.visitors)).toBe(60_000);
    expect(only(s.projected.funnel.signups)).toBeCloseTo(3_600, 9);
    expect(only(s.projected.funnel.referred)).toBeCloseTo(288, 9);
    expect(only(s.projected.funnel.newUnits)).toBeCloseTo(720, 9);
    expect(s.assumptions).toEqual(["signup-same-visitors", "new-buyer-spends-average", "same-spend", "active-twelve-months", "twelve-months"]);
  });

  it("the referred share 8 % to 20 %: the referred come on top of the others, through visitors who sign up at today's rate — 3 000 × 0,92 ÷ 0,80 = 3 450 sign-ups from 69 000 visitors, 690 of them referred", () => {
    const s = buildMktScenario(example, { "mkt.buy.referred-share": 20 }, CTX_FR, "demand");
    expect(only(s.projected.funnel.signups)).toBeCloseTo(3_450, 9);
    // The visitors grow by the same factor as the sign-ups (60 000 × 1,15), as self-serve's do; today's stay 60 000.
    expect(only(s.projected.funnel.visitors)).toBeCloseTo(69_000, 6);
    expect(only(s.today.funnel.visitors)).toBe(60_000);
    expect(only(s.projected.funnel.referred)).toBeCloseTo(690, 9);
    expect(only(s.projected.funnel.newUnits)).toBeCloseTo(690, 9);
    expect(s.assumptions).toEqual(["referral-on-top", "new-buyer-spends-average", "same-spend", "active-twelve-months", "twelve-months"]);
  });

  it("the buyers' churn 4 % to 3 %: the base is kept at 97 %, a buyer lives 33,3 months, and nothing is spent differently", () => {
    const s = buildMktScenario(example, { "mkt.buy.churn": 3 }, CTX_FR, "demand");
    const again = loop(32_853.6, 1_404, 0.97);
    s.projected.kpis.mrrPath!.slice(1).forEach((p, m) => expect(p.lo).toBeCloseTo(again[m]!, 6));
    expect(only(s.projected.kpis.lifetime)).toBeCloseTo(100 / 3, 9);
    expect(s.assumptions).toEqual(["new-buyer-spends-average", "active-twelve-months", "twelve-months"]);
  });

  it("the frequency 0,3 to 0,45 applies to every buyer from the next month: a' = 3,51 €, the base at 1,5 × from month 1", () => {
    const s = buildMktScenario(example, { "mkt.rev.frequency": 0.45 }, CTX_FR, "demand");
    expect(only(s.projected.kpis.revenuePerUnit)).toBeCloseTo(3.51, 9);
    expect(s.projected.kpis.mrrPath![1]!.lo).toBeCloseTo(32_853.6 * 1.5 * 0.96 + 600 * 3.51, 6);
    expect(s.assumptions).toEqual(["new-buyer-spends-average", "money-levers-all-buyers", "active-twelve-months", "twelve-months"]);
  });

  it("the basket 65 € to 78 €: the same rule as the take rate", () => {
    const s = buildMktScenario(example, { "mkt.rev.aov": 78 }, CTX_FR, "demand");
    expect(only(s.projected.kpis.revenuePerUnit)).toBeCloseTo(0.3 * 78 * 0.12, 9);
    expect(s.projected.kpis.mrrPath![1]!.lo).toBeCloseTo(32_853.6 * 1.2 * 0.96 + 600 * 0.3 * 78 * 0.12, 6);
    expect(s.assumptions).toContain("money-levers-all-buyers");
  });

  it("an estimate stays a range: a fill rate of 8 to 10 % taken to 12 % gives 720 to 900 new buyers, and the bounds never cross", () => {
    const estimate = withEntry(example, "mkt.liq.fill-rate", estimated(8, 10));
    const s = buildMktScenario(estimate, { "mkt.liq.fill-rate": 12 }, CTX_FR, "demand");
    expect(s.projected.funnel.newUnits!.lo).toBeCloseTo(720, 9);
    expect(s.projected.funnel.newUnits!.hi).toBeCloseTo(900, 9);
    for (const p of s.projected.kpis.mrrPath!) expect(p.lo).toBeLessThanOrEqual(p.hi);
    expect(s.projected.kpis.cac!.lo).toBeCloseTo(30 / 1.5, 9);
    expect(s.projected.kpis.cac!.hi).toBeCloseTo(30 / 1.2, 9);
  });
});

describe("the long-payback warning, against the team's runway (C49, A20)", () => {
  const withRunway = (state: EngineState, months: number): EngineState => ({ ...state, setup: { ...state.setup, runwayMonths: months } });

  it("a buyer who may cost more than they bring in, paid back in 23 to 27 months, warns against a 20-month runway, and says it is a runway", () => {
    // 21 000 € for 600 new buyers: 35 € a buyer, against an LTV of 32 to 38 €.
    const pricey = withRunway(withEntry(example, "mkt.buy.cac", measured(ratio(21_000, 600))), 20);
    const s = buildMktScenario(pricey, {}, CTX_FR, "demand");
    expect(s.today.kpis.loss!.verdict).toBe("maybe");
    expect(range(s.today.kpis.payback)).toEqual([23.01, 27.2]);
    expect(s.today.kpis.warning).toEqual({ verdict: "long", limit: { kind: "runway", months: 20 } });
    // The same buyer against the 30-month floor of a team that typed no runway: not yet.
    expect(buildMktScenario(withEntry(example, "mkt.buy.cac", measured(ratio(21_000, 600))), {}, CTX_FR, "demand").today.kpis.warning).toBeNull();
  });

  it("a loss is the loss alone: a buyer who leaves before paying back raises no warning on top", () => {
    const loss = withRunway(withEntry(example, "mkt.buy.cac", measured(ratio(30_000, 600))), 20);
    const s = buildMktScenario(loss, {}, CTX_FR, "demand");
    expect(s.today.kpis.loss!.verdict).toBe("loss");
    expect(s.today.kpis.warning).toBeNull();
  });

  it("a paid seller repaid in 8,11 months warns against a 7-month runway, and no longer once the what-if brings it to 6,09", () => {
    const s = buildMktScenario(withRunway(example, 7), EXAMPLE_MKT_WHATIF, CTX_FR, "supply");
    expect(s.today.kpis.warning).toEqual({ verdict: "long", limit: { kind: "runway", months: 7 } });
    expect(s.projected.kpis.warning).toBeNull();
  });
});

describe("the demand when a number is missing", () => {
  it("without the buyers' churn there is no curve and no revenue in twelve months, and the rest still reads", () => {
    const s = buildMktScenario(withEntry(example, "mkt.buy.churn", undefined), EXAMPLE_MKT_WHATIF, CTX_FR, "demand");
    expect(s.today.kpis.mrrPath).toBeNull();
    expect(s.projected.kpis.mrr12).toBeNull();
    expect(s.projected.kpis.arr12).toBeNull();
    expect(only(s.projected.kpis.mrr)).toBeCloseTo(32_853.6, 9);
    expect(only(s.projected.kpis.newMrr)).toBeCloseTo(2_535, 6);
    expect(s.projected.kpis.ltv).toBeNull();
  });

  it("without the cost of a buyer there is no spend, no cash and no payback, and no « same spend » rule is printed (it did not serve)", () => {
    const s = buildMktScenario(withEntry(example, "mkt.buy.cac", undefined), EXAMPLE_MKT_WHATIF, CTX_FR, "demand");
    expect(s.projected.kpis.cac).toBeNull();
    expect(s.projected.kpis.spend).toBeNull();
    expect(s.projected.kpis.cash).toBeNull();
    expect(s.projected.kpis.payback).toBeNull();
    expect(s.assumptions).not.toContain("same-spend");
    expect(only(s.projected.kpis.mrr12)).toBeCloseTo(only(demandIf.projected.kpis.mrr12), 9);
  });

  it("without the buyers' margin the money of one buyer is unknown and the revenue still projects", () => {
    const s = buildMktScenario(withEntry(example, "mkt.rev.gross-margin", undefined), EXAMPLE_MKT_WHATIF, CTX_FR, "demand");
    expect(s.projected.kpis.ltv).toBeNull();
    expect(s.projected.kpis.payback).toBeNull();
    expect(s.projected.kpis.loss).toBeNull();
    expect(s.projected.kpis.mrr12).not.toBeNull();
  });
});

describe("the supply, today (§22.10.2)", () => {
  const { funnel, kpis } = supplyToday.today;

  it("the month's funnel: 8 000 visitors, 400 seller sign-ups, nobody referred, 60 new paid sellers", () => {
    expect(funnel).toEqual({ visitors: { lo: 8_000, hi: 8_000 }, signups: { lo: 400, hi: 400 }, referred: null, newUnits: expect.anything() });
    expect(only(funnel.newUnits)).toBeCloseTo(60, 9);
  });

  it("the subscriptions: 26 100 € a month and 313 200 € a year; 1 740 € of new MRR; 29 € a seller; no GMV", () => {
    expect(only(kpis.mrr)).toBe(26_100);
    expect(only(kpis.arr)).toBe(313_200);
    expect(only(kpis.newMrr)).toBeCloseTo(1_740, 9);
    expect(only(kpis.revenuePerUnit)).toBe(29);
    expect(kpis.gmv).toBeNull();
  });

  it("in twelve months 35 866,43 € (430 397,14 € a year), on the curve of §22.10.2", () => {
    expect(r2(only(kpis.mrr12))).toBe(35_866.43);
    expect(r2(only(kpis.arr12))).toBe(430_397.14);
    expect(all(kpis.mrrPath)).toEqual([26_100, 27_057, 27_985, 28_886, 29_759, 30_606, 31_428, 32_225, 32_999, 33_749, 34_476, 35_182, 35_866]);
  });

  it("a paid seller: costs 200 € (100 × 30 ÷ 15), margin 24,65 € a month, 33,33 months, LTV 821,67 €, payback 8,11 months, LTV:CAC 4,11", () => {
    expect(only(kpis.cac)).toBeCloseTo(200, 9);
    expect(only(kpis.monthlyMargin)).toBeCloseTo(24.65, 9);
    expect(r2(only(kpis.lifetime))).toBe(33.33);
    expect(r2(only(kpis.ltv))).toBe(821.67);
    expect(r2(only(kpis.payback))).toBe(8.11);
    expect(r2(only(kpis.ltvCac))).toBe(4.11);
  });

  it("the money of A20: no loss, 25,22 months of margin after the payback, no warning, 12 000 € a month and 48 681,54 € tied up, a floor", () => {
    expect(kpis.loss!.verdict).toBe("none");
    expect(r2(only(kpis.afterPayback))).toBe(25.22);
    expect(kpis.warning).toBeNull();
    expect(only(kpis.spend)).toBeCloseTo(12_000, 9);
    expect(r2(only(kpis.cash!.tiedUp))).toBe(48_681.54);
    expect(kpis.cash!.floor).toBe(true);
  });

  it("with no lever the projection is today's, and the curve is the model's `sellerPath` on the wired quantities", () => {
    expect(supplyToday.projected).toEqual(supplyToday.today);
    const direct = sellerPath(mktSellerMrrToday(example, CTX_FR), mul(mktNewPaidSellers(example, CTX_FR)!, { lo: 29, hi: 29 }), { lo: 3, hi: 3 });
    expect(supplyToday.today.kpis.mrrPath).toEqual(direct);
    const again = loop(26_100, 60 * 29, 0.97);
    supplyToday.today.kpis.mrrPath!.slice(1).forEach((p, m) => expect(p.lo).toBeCloseTo(again[m]!, 6));
    expect(supplyToday.assumptions).toEqual(["supply-priced-by-subscriptions", "twelve-months"]);
  });
});

describe("the supply, with the conversion to a paid seller at 20 % (§22.10.2)", () => {
  const { funnel, kpis } = supplyIf.projected;

  it("80 new paid sellers (60 × 20/15); the sign-ups are the same", () => {
    expect(only(funnel.newUnits)).toBeCloseTo(80, 9);
    expect(only(funnel.signups)).toBe(400);
    expect(only(funnel.visitors)).toBe(8_000);
    expect(funnel.referred).toBeNull();
  });

  it("2 320 € of new MRR a month; in twelve months 41 785,48 €, a gain of 5 919,05 €", () => {
    expect(only(kpis.newMrr)).toBeCloseTo(2_320, 6);
    expect(r2(only(kpis.mrr12))).toBe(41_785.48);
    expect(r2(only(kpis.mrr12) - only(supplyIf.today.kpis.mrr12))).toBe(5_919.05);
    expect(all(kpis.mrrPath)).toEqual([26_100, 27_637, 29_128, 30_574, 31_977, 33_338, 34_657, 35_938, 37_180, 38_384, 39_553, 40_686, 41_785]);
  });

  it("the same spend: a paid seller costs 150 € (100 × 30 ÷ 20), a payback of 6,09 months, an LTV:CAC of 5,48 — and 12 000 € are still spent", () => {
    expect(only(kpis.cac)).toBeCloseTo(150, 9);
    expect(r2(only(kpis.payback))).toBe(6.09);
    expect(r2(only(kpis.ltvCac))).toBe(5.48);
    expect(only(kpis.spend)).toBeCloseTo(12_000, 9);
    expect(only(kpis.ltv)).toBeCloseTo(only(supplyIf.today.kpis.ltv), 9);
  });

  it("prints the three rules that served: the same spend, the subscriptions, twelve months", () => {
    expect(supplyIf.assumptions).toEqual(["same-spend", "supply-priced-by-subscriptions", "twelve-months"]);
    expect(supplyIf.moved).toEqual(["mkt.sell.paid-conversion"]);
  });
});

describe("each supply lever alone", () => {
  it("conversion 20 %: +5 919,05 €; paid sellers' churn 2,5 %: +1 630,64 €; price 35 €: +7 420,64 € and 32 655 € at month 1", () => {
    const withLevers = withWhatIf(example, { "mkt.sell.paid-conversion": 20, "mkt.sell.paid-churn": 2.5, "mkt.sell.arpa": 35 });
    const gain = (id: LeverId) => {
      const alone = mktLeverAlone(withLevers, id, CTX_FR)!;
      return alone.projected.kpis.mrr12!.lo - alone.today.kpis.mrr12!.lo;
    };
    expect(r2(gain("mkt.sell.paid-conversion"))).toBe(5_919.05);
    expect(r2(gain("mkt.sell.paid-churn"))).toBe(1_630.64);
    expect(r2(gain("mkt.sell.arpa"))).toBe(7_420.64);
    // The price applies to EVERY paid seller from the next month (D6): 26 100 × 35/29 × 0,97 + 60 × 35.
    const price = mktLeverAlone(withLevers, "mkt.sell.arpa", CTX_FR)!;
    expect(r2(price.projected.kpis.mrrPath![1]!.lo)).toBe(32_655);
    expect(price.assumptions).toEqual(["price-all-paid-sellers", "supply-priced-by-subscriptions", "twelve-months"]);
  });

  it("the paid sellers' churn lowers nothing else: their cost does not move, so no « same spend » rule", () => {
    const churn = buildMktScenario(example, { "mkt.sell.paid-churn": 2.5 }, CTX_FR, "supply");
    expect(only(churn.projected.kpis.cac)).toBeCloseTo(200, 9);
    expect(churn.assumptions).toEqual(["supply-priced-by-subscriptions", "twelve-months"]);
    // 1 ÷ 2,5 % is 40 months, counted for 36 at most (A20): a seller's lifetime lengthens, and the cap holds it.
    expect(only(churn.projected.kpis.lifetime)).toBeCloseTo(36, 9);
  });

  it("without the cost of an active seller, a better conversion has no cost to lower: no « same spend » rule", () => {
    const s = buildMktScenario(withEntry(example, "mkt.sell.cac", undefined), EXAMPLE_MKT_WHATIF, CTX_FR, "supply");
    expect(s.projected.kpis.cac).toBeNull();
    expect(s.projected.kpis.spend).toBeNull();
    expect(s.assumptions).toEqual(["supply-priced-by-subscriptions", "twelve-months"]);
    expect(r2(only(s.projected.kpis.mrr12))).toBe(41_785.48);
  });
});

describe("the sellers pay nothing (D9): the supply has no money, no lever and no rule", () => {
  const supply = buildMktScenario(noSubscriptions, EXAMPLE_MKT_WHATIF, CTX_FR, "supply");

  it("no lever, none moved, no rule, and every figure of both columns unknown", () => {
    expect(supply.side).toBe("supply");
    expect(supply.levers).toEqual([]);
    expect(supply.moved).toEqual([]);
    expect(supply.assumptions).toEqual([]);
    for (const column of [supply.today, supply.projected]) {
      expect(Object.values(column.funnel).every((v) => v === null)).toBe(true);
      expect(Object.values(column.kpis).every((v) => v === null)).toBe(true);
    }
  });

  it("no supply lever is ever alone, even with a target on it", () => {
    expect(mktLeverAlone(withWhatIf(noSubscriptions, { "mkt.sell.paid-conversion": 20 }), "mkt.sell.paid-conversion", CTX_FR)).toBeNull();
  });

  it("the demand does not change: the same figures with and without the subscriptions", () => {
    expect(buildMktScenario(noSubscriptions, EXAMPLE_MKT_WHATIF, CTX_FR, "demand")).toEqual(demandIf);
  });
});

describe("the two sides are separate (C70, D2)", () => {
  it("a target on the supply's levers moves nothing on the demand, and the reverse", () => {
    const supplyOnly = { "mkt.sell.paid-conversion": 20, "mkt.sell.paid-churn": 2.5, "mkt.sell.arpa": 35 };
    expect(buildMktScenario(example, supplyOnly, CTX_FR, "demand")).toEqual(demandToday);
    expect(buildMktScenario(example, { ...EXAMPLE_MKT_WHATIF, ...supplyOnly }, CTX_FR, "demand")).toEqual(demandIf);
    expect(buildMktScenario(example, { "mkt.liq.fill-rate": 12, "mkt.rev.take-rate": 13 }, CTX_FR, "supply")).toEqual(supplyToday);
    expect(buildMktScenario(example, { ...EXAMPLE_MKT_WHATIF, ...supplyOnly }, CTX_FR, "supply").projected).toEqual(
      buildMktScenario(example, supplyOnly, CTX_FR, "supply").projected,
    );
  });

  it("a target on a SaaS lever is ignored by both sides", () => {
    expect(buildMktScenario(example, { "act.rate": 40, "rev.arpa": 150 }, CTX_FR, "demand")).toEqual(demandToday);
    expect(buildMktScenario(example, { "act.rate": 40, "rev.arpa": 150 }, CTX_FR, "supply")).toEqual(supplyToday);
  });
});

describe("the total: the commissions and the subscriptions added, point by point (S9)", () => {
  it("today: 58 953,60 € this month, 69 590,04 € in twelve months, on the curve of §22.10.2", () => {
    const total = mktTotalPaths(example, {}, CTX_FR);
    expect(all(total.today)).toEqual([58_954, 60_000, 61_015, 61_998, 62_951, 63_875, 64_770, 65_637, 66_478, 67_293, 68_083, 68_848, 69_590]);
    expect(only(total.today![0])).toBeCloseTo(58_953.6, 6);
    expect(r2(only(total.today![12]))).toBe(69_590.04);
    expect(total.projected).toEqual(total.today);
  });

  it("with the what-ifs of both sides together: 88 137,19 € in twelve months, on the curve of §22.10.2", () => {
    const total = mktTotalPaths(example, EXAMPLE_MKT_WHATIF, CTX_FR);
    expect(all(total.projected)).toEqual([58_954, 64_340, 66_898, 69_368, 71_754, 74_059, 76_285, 78_435, 80_512, 82_518, 84_456, 86_328, 88_137]);
    expect(r2(only(total.projected![12]))).toBe(88_137.19);
    // Today is untouched by the what-ifs.
    expect(total.today).toEqual(mktTotalPaths(example, {}, CTX_FR).today);
  });

  it("each point is the sum of the two sides' points", () => {
    const total = mktTotalPaths(example, EXAMPLE_MKT_WHATIF, CTX_FR);
    total.projected!.forEach((p, m) => {
      expect(p.lo).toBeCloseTo(demandIf.projected.kpis.mrrPath![m]!.lo + supplyIf.projected.kpis.mrrPath![m]!.lo, 6);
      expect(p.hi).toBeCloseTo(demandIf.projected.kpis.mrrPath![m]!.hi + supplyIf.projected.kpis.mrrPath![m]!.hi, 6);
    });
    // The new revenue of the total: 1 404 € + 1 740 € today, 2 535 € + 2 320 € with the what-ifs.
    expect(only(demandToday.today.kpis.newMrr) + only(supplyToday.today.kpis.newMrr)).toBeCloseTo(3_144, 6);
    expect(only(demandIf.projected.kpis.newMrr) + only(supplyIf.projected.kpis.newMrr)).toBeCloseTo(4_855, 6);
  });

  it("without subscriptions the total is the commissions alone: 32 853,60 €, and 33 723,61 € in twelve months", () => {
    const total = mktTotalPaths(noSubscriptions, {}, CTX_FR);
    expect(total.today).toEqual(demandToday.today.kpis.mrrPath);
    expect(only(total.today![0])).toBeCloseTo(32_853.6, 9);
    expect(r2(only(total.today![12]))).toBe(33_723.61);
    // A target on the supply's levers does not enter it.
    expect(mktTotalPaths(noSubscriptions, EXAMPLE_MKT_WHATIF, CTX_FR).projected).toEqual(demandIf.projected.kpis.mrrPath);
  });

  it("a total exists only when both of its parts do: a side that cannot project makes it unknown, never the other side passed off as the whole", () => {
    const demandUnknown = mktTotalPaths(withEntry(example, "mkt.buy.churn", undefined), EXAMPLE_MKT_WHATIF, CTX_FR);
    expect(demandUnknown).toEqual({ today: null, projected: null });
    const supplyUnknown = mktTotalPaths(withEntry(example, "mkt.sell.paid-churn", undefined), EXAMPLE_MKT_WHATIF, CTX_FR);
    expect(supplyUnknown).toEqual({ today: null, projected: null });
    // Sellers paying nothing: the supply's missing number is nothing the total reads.
    const unusedSupply = withEntry(noSubscriptions, "mkt.sell.paid-churn", undefined);
    expect(mktTotalPaths(unusedSupply, {}, CTX_FR).today).not.toBeNull();
    // And with the demand unknown, there is no total even without subscriptions.
    expect(mktTotalPaths(withEntry(noSubscriptions, "mkt.buy.churn", undefined), {}, CTX_FR)).toEqual({ today: null, projected: null });
  });
});

describe("what is printed is what was used", () => {
  const states: [string, EngineState, Partial<Record<LeverId, number>>][] = [
    ["the example", example, {}],
    ["the example with its what-ifs", example, EXAMPLE_MKT_WHATIF],
    ["every lever moved", example, { "mkt.buy.signup-rate": 6, "mkt.buy.referred-share": 20, "mkt.buy.first-order": 25, "mkt.liq.fill-rate": 12, "mkt.buy.churn": 3, "mkt.rev.frequency": 0.4, "mkt.rev.aov": 70, "mkt.rev.take-rate": 13, "mkt.sell.paid-conversion": 20, "mkt.sell.paid-churn": 2.5, "mkt.sell.arpa": 35 }],
    ["no subscriptions", noSubscriptions, EXAMPLE_MKT_WHATIF],
  ];
  const ORDER: MktScenarioAssumption[] = [
    "signup-same-visitors",
    "referral-on-top",
    "fill-new-buyers-only",
    "new-buyer-spends-average",
    "money-levers-all-buyers",
    "price-all-paid-sellers",
    "same-spend",
    "active-twelve-months",
    "supply-priced-by-subscriptions",
    "twelve-months",
  ];

  it.each(states)("%s: each side's rules come in the type's order, once", (_name, state, targets) => {
    for (const side of ["demand", "supply"] as const) {
      const s: MktScenario = buildMktScenario(state, targets, CTX_FR, side);
      expect(s.assumptions).toEqual(ORDER.filter((a) => s.assumptions.includes(a)));
      expect(new Set(s.assumptions).size).toBe(s.assumptions.length);
    }
  });

  it("every lever moved prints every rule of the type, split between the two sides", () => {
    const targets = states[2]![2];
    const printed = new Set([...buildMktScenario(example, targets, CTX_FR, "demand").assumptions, ...buildMktScenario(example, targets, CTX_FR, "supply").assumptions]);
    expect([...printed].sort()).toEqual([...ORDER].sort());
    // The demand never prints the supply's rules and the reverse.
    expect(buildMktScenario(example, targets, CTX_FR, "demand").assumptions).not.toContain("price-all-paid-sellers");
    expect(buildMktScenario(example, targets, CTX_FR, "demand").assumptions).not.toContain("supply-priced-by-subscriptions");
    expect(buildMktScenario(example, targets, CTX_FR, "supply").assumptions).not.toContain("money-levers-all-buyers");
    expect(buildMktScenario(example, targets, CTX_FR, "supply").assumptions).not.toContain("active-twelve-months");
  });
});

describe("the seams of A22 do not serve the marketplace (§22.5.4)", () => {
  it("`scenarioOf` of a marketplace's state is the self-serve scenario with every figure unknown, and raises nothing", () => {
    const s = scenarioOf(example, {}, CTX_FR);
    expect(s.levers.every((l) => l.today === null)).toBe(true);
    expect(s.today.kpis.mrr).toBeNull();
    expect(s.projected.kpis.mrr12).toBeNull();
  });

  it("the entries the marketplace's scenario reads are the ones the state holds: a lever's today is the catalogue's known value", () => {
    for (const lever of demandToday.levers) {
      const known = knownIn(example, lever.id, CTX_FR);
      expect(known.kind, lever.id).toBe("known");
      expect(lever.today, lever.id).toEqual(known.kind === "known" ? known.value : null);
    }
  });
});

// --- The total's three rows (A23 MKT-4, §22.5.9). Non-vacuity, measured on 2026-10-25: see the entry of A23 MKT-4 in `JOURNAL.md`.

describe("mktTotal — this month, new a month, in twelve months (S9)", () => {
  const total = mktTotal(example, CTX_FR);
  const known = (v: { kind: string }) => v as Extract<typeof total.now.total, { kind: "known" }>;
  const amount = (v: { kind: string }) => only(known(v).value);

  it("adds the two sides' shares of the example: 58 953,60 € this month, 3 144 € new a month, 69 590,04 € in twelve months", () => {
    expect([amount(total.now.demand), amount(total.now.supply!), amount(total.now.total)].map(r2)).toEqual([32_853.6, 26_100, 58_953.6]);
    expect([amount(total.newPerMonth.demand), amount(total.newPerMonth.supply!), amount(total.newPerMonth.total)].map(r2)).toEqual([1_404, 1_740, 3_144]);
    expect([amount(total.in12Months.demand), amount(total.in12Months.supply!), amount(total.in12Months.total)].map(r2)).toEqual([33_723.61, 35_866.43, 69_590.04]);
  });

  it("reads each share on its own scenario, with no what-if: the first and the last point of the curves", () => {
    expect(amount(total.now.demand)).toBeCloseTo(demandToday.today.kpis.mrrPath![0]!.lo, 9);
    expect(amount(total.in12Months.demand)).toBeCloseTo(demandToday.today.kpis.mrrPath![12]!.lo, 9);
    expect(amount(total.in12Months.supply!)).toBeCloseTo(supplyToday.today.kpis.mrrPath![12]!.lo, 9);
    // The total's curve is the sum of the two, so its ends are the total's rows.
    const curve = mktTotalPaths(example, {}, CTX_FR).today!;
    expect(curve[0]!.lo).toBeCloseTo(amount(total.now.total), 9);
    expect(curve[12]!.lo).toBeCloseTo(amount(total.in12Months.total), 9);
    // A what-if moves nothing here: the three rows are today's, at the current pace.
    expect(mktTotal(withWhatIf(example, EXAMPLE_MKT_WHATIF), CTX_FR)).toEqual(total);
  });

  it("this month is exact (`solid`) when the side's count is typed, and every other share is a model's (`approximate`)", () => {
    const confidences = (row: typeof total.now) => [row.demand, row.supply, row.total].map((v) => known(v!).confidence);
    expect(confidences(total.now)).toEqual(["solid", "solid", "solid"]);
    expect(confidences(total.newPerMonth)).toEqual(["approximate", "approximate", "approximate"]);
    expect(confidences(total.in12Months)).toEqual(["approximate", "approximate", "approximate"]);
    // Without a typed count of the month's revenue (the take rate typed as a rate, the subscription as an amount, so no
    // entry carries it) the month is a × the active buyers, and the price × the paid sellers: a model's, to the same figure.
    const stripe = { kind: "tool", tool: "stripe" } as const;
    const buyersModelled = (state: EngineState) => {
      const next = withEntry(state, "mkt.rev.take-rate", measured({ kind: "rate", percent: 12 }, stripe));
      delete next.snapshots[0]!.base!.mktNetRevenue;
      return next;
    };
    const sellersModelled = (state: EngineState) => {
      const next = withEntry(withEntry(state, "mkt.sell.arpa", measured({ kind: "amount", amount: 29 }, stripe)), "mkt.sell.gross-margin", measured({ kind: "rate", percent: 85 }, stripe));
      delete next.snapshots[0]!.base!.mktSellerMrrEnd;
      return next;
    };
    // One exact share and one modelled: the weakest of the two.
    expect(confidences(mktTotal(sellersModelled(example), CTX_FR).now)).toEqual(["solid", "approximate", "approximate"]);
    expect(confidences(mktTotal(buyersModelled(example), CTX_FR).now)).toEqual(["approximate", "solid", "approximate"]);
    const both = mktTotal(buyersModelled(sellersModelled(example)), CTX_FR);
    expect(confidences(both.now)).toEqual(["approximate", "approximate", "approximate"]);
    expect([amount(both.now.demand), amount(both.now.supply!)].map(r2)).toEqual([32_853.6, 26_100]);
  });

  it("the sellers pay nothing: the total is the commissions alone, and the supply of every row is null", () => {
    const none = mktTotal(noSubscriptions, CTX_FR);
    for (const row of [none.now, none.newPerMonth, none.in12Months]) {
      expect(row.supply).toBeNull();
      expect(row.total).toEqual(row.demand);
    }
    expect([none.now, none.newPerMonth, none.in12Months].map((r) => r2(amount(r.total)))).toEqual([32_853.6, 1_404, 33_723.61]);
    // The subscription numbers stay stored, and read as nothing: emptying them moves nothing.
    expect(mktTotal(withEntry(withEntry(noSubscriptions, "mkt.sell.arpa", undefined), "mkt.sell.paid-churn", undefined), CTX_FR)).toEqual(none);
  });

  it("a total exists only when its parts do (S9): the known part is never passed off as the total, and the total names what each part lacks", () => {
    // No take rate: the month's revenue is the typed count, but what a new buyer brings is unknown, so is the demand's new revenue.
    const noTake = mktTotal(withEntry(example, "mkt.rev.take-rate", undefined), CTX_FR);
    expect(noTake.now.demand.kind).toBe("known");
    expect(noTake.newPerMonth.demand).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
    expect(noTake.newPerMonth.supply!.kind).toBe("known");
    expect(noTake.newPerMonth.total).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
    expect(noTake.in12Months.total).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate"] });
    // Both sides lacking something: the union, the demand's first.
    const both = mktTotal(withEntry(withEntry(example, "mkt.rev.take-rate", undefined), "mkt.sell.arpa", undefined), CTX_FR);
    expect(both.newPerMonth.total).toEqual({ kind: "uncomputable", missing: ["mkt.rev.take-rate", "mkt.sell.arpa"] });
    // Each row names what ITS figure reads: the twelve months also need the churn, this month needs neither the cost nor the churn.
    const noChurn = mktTotal(withEntry(example, "mkt.buy.churn", undefined), CTX_FR);
    expect(noChurn.now.total.kind).toBe("known");
    expect(noChurn.newPerMonth.total.kind).toBe("known");
    expect(noChurn.in12Months.demand).toEqual({ kind: "uncomputable", missing: ["mkt.buy.churn"] });
    expect(noChurn.in12Months.total).toEqual({ kind: "uncomputable", missing: ["mkt.buy.churn"] });
    const noPaidChurn = mktTotal(withEntry(example, "mkt.sell.paid-churn", undefined), CTX_FR);
    expect(noPaidChurn.in12Months.supply).toEqual({ kind: "uncomputable", missing: ["mkt.sell.paid-churn"] });
    expect(noPaidChurn.in12Months.demand.kind).toBe("known");
  });

  it("names the first input of the figure when every one is known and the figure still is not: new buyers that cannot be counted", () => {
    const noN = withEntry(withEntry(example, "mkt.buy.cac", measured({ kind: "amount", amount: 30 }, { kind: "tool", tool: "ga4" })), "mkt.buy.signup-rate", measured({ kind: "rate", percent: 5 }, { kind: "tool", tool: "ga4" }));
    expect(mktTotal(noN, CTX_FR).newPerMonth.demand).toEqual({ kind: "uncomputable", missing: ["mkt.rev.frequency"] });
  });

  it("an empty marketplace has a total of nothing known, naming the figure each row lacks", () => {
    const empty = structuredClone(example);
    empty.snapshots[0]!.metrics = {};
    empty.snapshots[0]!.base = {};
    const none = mktTotal(empty, CTX_FR);
    expect(none.now.total).toEqual({ kind: "uncomputable", missing: ["mkt.rev.frequency", "mkt.rev.aov", "mkt.rev.take-rate", "mkt.sell.arpa"] });
    expect(none.in12Months.total.kind).toBe("uncomputable");
  });
});
