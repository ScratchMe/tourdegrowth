import { describe, expect, it } from "vitest";
import { appCandidates, appInputs, appInputsOf, appLeverAlone, appLeverIds, appRankingImpact, appRules, buildAppScenario } from "../app";
import type { AppMonetization } from "../app-model";
import { APP_LEVER_IDS, CANDIDATE_IDS, LEVER_IDS, SLG_CANDIDATE_IDS, candidatesOf, shapesOf } from "../catalog-shape";
import { diagnose } from "../diagnose";
import { EXAMPLE_CONSUMER_WHATIF } from "../example";
import { rankingImpact } from "../impact";
import { isCandidate, notEnoughBelowSentence, notEnoughBelowValues } from "../phrases";
import { buildScenario, leverViews } from "../scenario";
import { candidatesFor, leverAloneOf, leverIdsOf, scenarioOf } from "../scenario-of";
import { deriveSeries } from "../series";
import type { AppDerivedId, Diagnosis, Interval, LeverId, MetricId, SelfServeCandidateId } from "../types";
import { consumerState, consumerUsageOnlyState, estimated, exampleState, hybridState, measured, ratio, withEntry, withMonthBefore, withTarget, withoutTargets } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * A consumer app's scenario (engine spec §21.5.1 to §21.5.3, A22 APP-4), on the example of §21.9.1: a meditation app,
 * 12 000 installs in August, 4 500 subscribers at 6,40 € and 15 000 actives at 0,70 € of purchases and ads, a 22 %
 * commission, an 80 % margin net of it, 18 000 € of acquisition. Every figure below is a line of §21.9.2, which the
 * independent script `docs/engine/reference/app-example.mjs` computes without any engine code; the pure model's own
 * figures are pinned by `app-model.test.ts`, and these tests pin what the WIRING does with them.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, this file, `business-type.test.ts`, `scenario.test.ts`
 * and the two goldens run, then restored; the count is the tests that fall):
 * - the new actives read today's funnel in the projection (§21.10.4): the what-if's twelve-month revenue, its curve and
 *   day 30 alone fall (3);
 * - `fInstalls` from the install rate alone instead of the funnel (§21.10.4): both cost-per-install cases fall (2);
 * - the loss read over 12 months instead of 36 (D10): « paid back in 13,01 months » falls (1); the 36-month value
 *   counted over 12 falls five;
 * - the usage curve started from the what-if's revenue per active instead of today's: the per-active case falls (1);
 *   the month's revenue without the usage stream falls seven (five, and the two cases of a month with no installs typed);
 * - a lever's step: the cent dropped falls two, the commission as a higher-is-better lever one, the revenues per
 *   active as plain rates two;
 * - a usage-only app keeping every self-serve rule falls two, an app with subscriptions keeping the CAC's rule one;
 * - a target on a number the app no longer shows reaching the funnel falls one; `activesMissing` never raised, one;
 * - `appInputs` reading the subscription numbers without subscriptions falls one, reading the commission for ads
 *   alone one; `appInputsOf` forgetting the cost per install falls seven (every monetization), asking day 30 of a
 *   subscriptions-only app one;
 * - NRR and GRR shown without subscriptions falls one; the first month's margin without its usage part, two; the
 *   payback read without the actives' retention, six; an install's day-30 share read from today's input instead of
 *   the funnel, two; the spend following the projected cost, one;
 * - the month's revenue read from the usage curve's first point (`usage?.[0] ?? null`, the first text of §21.5.3 point 5)
 *   instead of the actives × what one brings, with no installs typed: the app with its three streams and the one without
 *   subscriptions fall (2); this file, `business-type.test.ts`, `scenario.test.ts` and the two goldens run, the rest stays
 *   green (measured on the relaunch of the same day, after Antoine's decision).
 */

const r2 = (v: number) => Math.round(v * 100) / 100;
const r4 = (v: number) => Math.round(v * 10_000) / 10_000;

/** An interval that is a single value (everything in the example is measured): its value, or the failure. */
function only(i: Interval | null | undefined): number {
  expect(i, "a known figure").toBeTruthy();
  expect(i!.hi).toBeCloseTo(i!.lo, 9);
  return i!.lo;
}

const SUBSCRIPTIONS: AppMonetization = { subscriptions: true, purchases: false, ads: false };
const PURCHASES: AppMonetization = { subscriptions: false, purchases: true, ads: false };
const ADS: AppMonetization = { subscriptions: false, purchases: false, ads: true };

function withMonetization(m: AppMonetization) {
  const state = consumerState();
  state.setup = { ...state.setup, monetization: m };
  return state;
}

describe("the example, nothing moved (§21.9.2)", () => {
  const { today, projected, moved } = buildAppScenario(consumerState(), {}, CTX_FR);

  it("is its own projection: no lever moved, the two columns are the same", () => {
    expect(moved).toEqual([]);
    expect(projected).toEqual(today);
  });

  it("earns 39 300 € a month — 28 800 € of subscriptions and 10 500 € of purchases and ads — 471 600 € a year", () => {
    const k = today.kpis;
    expect(only(k.mrr)).toBeCloseTo(39_300, 6);
    expect(only(k.app!.subscriptionsPath![0])).toBeCloseTo(28_800, 6);
    expect(only(k.app!.usagePath![0])).toBeCloseTo(10_500, 6);
    expect(only(k.arr)).toBeCloseTo(471_600, 6);
  });

  it("brings 3 312 € of new revenue a month: 2 304 € of subscriptions, 1 008 € of usage", () => {
    const k = today.kpis;
    expect(only(k.newMrr)).toBeCloseTo(3_312, 6);
    expect(only(k.app!.newSubscriptions)).toBeCloseTo(2_304, 6);
    expect(only(k.app!.newUsage)).toBeCloseTo(1_008, 6);
  });

  it("reaches 42 677,83 € in twelve months (32 479,21 € + 10 198,62 €), 512 133,93 € a year", () => {
    const k = today.kpis;
    expect(r2(only(k.mrr12))).toBe(42_677.83);
    expect(r2(only(k.app!.subscriptionsPath![12]))).toBe(32_479.21);
    expect(r2(only(k.app!.usagePath![12]))).toBe(10_198.62);
    expect(r2(only(k.arr12))).toBe(512_133.93);
  });

  it("draws the 13-point curve of §21.9.2, the revenue of the month first and of month 12 last", () => {
    const path = today.kpis.mrrPath!;
    expect(path).toHaveLength(13);
    expect(path.map((p) => Math.round(only(p)))).toEqual([39_300, 39_690, 40_056, 40_400, 40_722, 41_025, 41_309, 41_575, 41_825, 42_059, 42_279, 42_485, 42_678]);
    expect(path[12]).toEqual(today.kpis.mrr12);
  });

  it("keeps the subscriptions' retention: GRR 92,5 % and NRR 93,5 % a month — the self-serve engine's own", () => {
    expect(only(today.kpis.grr)).toBeCloseTo(92.5, 9);
    expect(only(today.kpis.nrr)).toBeCloseTo(93.5, 9);
  });

  it("prices an install at 1,50 € for 18 000 € a month, and earns 0,119808 € + 0,060864 € from it in its first month", () => {
    const k = today.kpis;
    expect(only(k.cac)).toBeCloseTo(1.5, 9);
    expect(only(k.spend)).toBeCloseTo(18_000, 6);
    expect(only(k.monthlyMargin)).toBeCloseTo(0.119808 + 0.060864, 9);
  });

  it("values an install at 1,4318 € over 12 months and 2,1809 € over 36: 0,95 times its cost in a year", () => {
    const k = today.kpis;
    expect(r4(only(k.app!.value12))).toBe(1.4318);
    expect(r4(only(k.ltv))).toBe(2.1809);
    expect(r2(only(k.ltvCac))).toBe(0.95);
  });

  it("pays an install back in 13,01 months (13,0132): no loss, no warning, nothing tied up", () => {
    const k = today.kpis;
    expect(only(k.payback)).toBeCloseTo(13.0132, 3);
    expect(k.app!.paybackBeyondCap).toBe(false);
    expect(k.loss?.verdict).toBe("none");
    expect(k.warning).toBeNull();
    // D11: no cash tied up for an app, and no counted lifetime — an install's margin falls month by month.
    expect(k.cash).toBeNull();
    expect(k.lifetime).toBeNull();
    expect(k.afterPayback).toBeNull();
  });

  it("carries the payback chart's curve: 37 points, from 0 to the 12-month and the 36-month values", () => {
    const curve = today.kpis.app!.curve!;
    expect(curve.lo).toHaveLength(37);
    expect(curve.hi).toHaveLength(37);
    expect(curve.lo[0]).toBe(0);
    expect(r4(curve.lo[12]!)).toBe(1.4318);
    expect(r4(curve.lo[36]!)).toBe(2.1809);
  });

  it("knows the month's actives: nothing is missing", () => {
    expect(today.kpis.app!.activesMissing).toBe(false);
  });

  it("reads the funnel of the self-serve engine: 12 000 installs, 1 440 still there at day 30", () => {
    const { funnel } = buildAppScenario(consumerState(), {}, CTX_FR).today;
    expect(funnel.perHundred).toBe(false);
    expect(only(funnel.signups)).toBe(12_000);
    expect(only(funnel.d30)).toBeCloseTo(1_440, 9);
    expect(only(funnel.paying)).toBeCloseTo(360, 9);
  });

  it("has the SaaS's money shape — and the key `app` the SaaS never has", () => {
    expect("app" in today.kpis).toBe(true);
    expect("app" in buildScenario(exampleState(), {}, CTX_FR).today.kpis).toBe(false);
  });
});

describe("the example with its two « Et si » (§21.9.2): day-30 retention 15 %, commission 15 %", () => {
  const scenario = buildAppScenario(consumerState(), EXAMPLE_CONSUMER_WHATIF, CTX_FR);
  const { today, projected } = scenario;

  it("moves the two levers, in panel order", () => {
    expect(scenario.moved).toEqual(["ret.d30", "app.rev.commission"]);
  });

  it("leaves today alone and the month's revenue unchanged (the revenue is counted before the commission)", () => {
    expect(today).toEqual(buildAppScenario(consumerState(), {}, CTX_FR).today);
    expect(only(projected.kpis.mrr)).toBeCloseTo(39_300, 6);
  });

  it("raises the revenue in twelve months to 49 391,72 € (+6 713,89 €) and the new revenue to 4 140 €", () => {
    expect(r2(only(projected.kpis.mrr12))).toBe(49_391.72);
    expect(r2(only(projected.kpis.mrr12) - only(today.kpis.mrr12))).toBe(6_713.89);
    expect(only(projected.kpis.newMrr)).toBeCloseTo(4_140, 6);
  });

  it("draws the what-if's curve: the new actives follow day 30, not today's funnel", () => {
    expect(projected.kpis.mrrPath!.map((p) => Math.round(only(p)))).toEqual([39_300, 40_518, 41_649, 42_701, 43_678, 44_586, 45_430, 46_215, 46_946, 47_625, 48_257, 48_845, 49_392]);
  });

  it("keeps the cost per install at 1,50 € — the installs don't move — and raises an install's value", () => {
    const k = projected.kpis;
    expect(only(k.cac)).toBeCloseTo(1.5, 9);
    expect(r4(only(k.app!.value12))).toBe(1.9195);
    expect(r4(only(k.ltv))).toBe(2.9287);
    expect(r2(only(k.ltvCac))).toBe(1.28);
    expect(r2(only(k.payback))).toBe(8.2);
  });

  it("prints the rules that served, in the order of §21.5.3 point 9", () => {
    expect(scenario.assumptions).toEqual([
      "d30-drives-paying",
      "churn-as-revenue",
      "twelve-months",
      "actives-follow-d30",
      "commission-margin-only",
      "install-months",
      "usage-twelve-months",
    ]);
  });

  it("prints, for the example with nothing moved, only the rules the curves need", () => {
    expect(buildAppScenario(consumerState(), {}, CTX_FR).assumptions).toEqual(["churn-as-revenue", "twelve-months", "install-months", "usage-twelve-months"]);
  });
});

describe("each lever on its own (§21.9.2)", () => {
  const state = { ...consumerState(), whatIf: EXAMPLE_CONSUMER_WHATIF };
  const today = buildAppScenario(consumerState(), {}, CTX_FR).today.kpis;

  it("day-30 retention at 15 %: +6 713,89 € of revenue in twelve months, an install paid back in 9,07 months", () => {
    const alone = appLeverAlone(state, "ret.d30", CTX_FR)!;
    expect(alone.moved).toEqual(["ret.d30"]);
    expect(r2(only(alone.projected.kpis.mrr12) - only(today.mrr12))).toBe(6_713.89);
    expect(r2(only(alone.projected.kpis.payback))).toBe(9.07);
    expect(alone.assumptions).toEqual(["d30-drives-paying", "churn-as-revenue", "twelve-months", "actives-follow-d30", "install-months", "usage-twelve-months"]);
  });

  it("the commission at 15 %: no more revenue (D13), an install paid back in 11,55 months", () => {
    const alone = appLeverAlone(state, "app.rev.commission", CTX_FR)!;
    expect(alone.moved).toEqual(["app.rev.commission"]);
    expect(alone.projected.kpis.mrr12).toEqual(today.mrr12);
    expect(alone.projected.kpis.mrrPath).toEqual(today.mrrPath);
    expect(r2(only(alone.projected.kpis.payback))).toBe(11.55);
    expect(alone.assumptions).toEqual(["churn-as-revenue", "twelve-months", "commission-margin-only", "install-months", "usage-twelve-months"]);
  });

  it("is null for a lever with no target in the state, and for one the app doesn't show", () => {
    expect(appLeverAlone(state, "app.rev.ads-per-active", CTX_FR)).toBeNull();
    expect(appLeverAlone(consumerState(), "ret.d30", CTX_FR)).toBeNull();
    const hidden = { ...consumerUsageOnlyState(), whatIf: { "rev.paid-conversion": 5 } };
    expect(appLeverAlone(hidden, "rev.paid-conversion", CTX_FR)).toBeNull();
  });

  it("is what scenarioOf and leverAloneOf answer for an app", () => {
    expect(leverAloneOf(state, "ret.d30", CTX_FR)).toEqual(appLeverAlone(state, "ret.d30", CTX_FR));
    expect(scenarioOf(state, EXAMPLE_CONSUMER_WHATIF, CTX_FR)).toEqual(buildAppScenario(state, EXAMPLE_CONSUMER_WHATIF, CTX_FR));
  });
});

describe("the cost per install at equal spend (§21.5.3 point 7)", () => {
  it("falls with the installs the funnel adds: 1,50 ÷ (16 521,74 ÷ 12 000) = 1,0895 € for an install rate of 40 % and a referred share of 8 %", () => {
    const scenario = buildAppScenario(consumerState(), { "acq.signup-rate": 40, "ref.referred-share": 8 }, CTX_FR);
    // The funnel's own installs, not a ratio of the two rates: 12 000 × 40/30 × (1 − 5 %) ÷ (1 − 8 %).
    expect(only(scenario.projected.funnel.signups)).toBeCloseTo(16_521.74, 2);
    expect(r4(only(scenario.projected.kpis.cac))).toBe(1.0895);
    expect(only(scenario.projected.kpis.spend)).toBeCloseTo(18_000, 6);
    expect(scenario.assumptions).toContain("same-spend-installs");
    // Today's column keeps the cost it was typed with.
    expect(only(scenario.today.kpis.cac)).toBeCloseTo(1.5, 9);
  });

  it("is today's when the installs don't move (day 30 and the commission don't buy installs)", () => {
    const scenario = buildAppScenario(consumerState(), EXAMPLE_CONSUMER_WHATIF, CTX_FR);
    expect(scenario.projected.kpis.cac).toEqual(scenario.today.kpis.cac);
    expect(scenario.assumptions).not.toContain("same-spend-installs");
  });

  it("follows the referred share alone too, through the funnel (12 000 × 95 % ÷ 92 %)", () => {
    const scenario = buildAppScenario(consumerState(), { "ref.referred-share": 8 }, CTX_FR);
    expect(r4(only(scenario.projected.kpis.cac))).toBe(r4(1.5 / (0.95 / 0.92)));
  });
});

describe("the app without subscriptions (§21.9.2)", () => {
  const scenario = buildAppScenario(consumerUsageOnlyState(), {}, CTX_FR);
  const k = scenario.today.kpis;

  it("earns 10 500 € a month from purchases and ads alone — no subscription path, no NRR, no GRR", () => {
    expect(only(k.mrr)).toBeCloseTo(10_500, 6);
    expect(k.app!.subscriptionsPath).toBeNull();
    expect(k.app!.newSubscriptions).toBeNull();
    expect(only(k.newMrr)).toBeCloseTo(1_008, 6);
    expect(k.nrr).toBeNull();
    expect(k.grr).toBeNull();
    expect(k.mrrPath).toEqual(k.app!.usagePath);
  });

  it("values an install at 0,5949 € over 36 months for 1,50 €: a loss, never paid back, and the warning keeps quiet", () => {
    expect(r4(only(k.ltv))).toBe(0.5949);
    expect(only(k.cac)).toBeCloseTo(1.5, 9);
    expect(k.loss?.verdict).toBe("loss");
    expect(k.payback).toBeNull();
    expect(k.warning).toBeNull();
    expect(k.app!.paybackBeyondCap).toBe(false);
    expect(only(k.monthlyMargin)).toBeCloseTo(0.060864, 9);
  });

  it("shows the four levers of the funnel, then the ones its usage streams call for", () => {
    expect(scenario.levers.map((l) => l.id)).toEqual([
      "acq.signup-rate",
      "ref.referred-share",
      "act.rate",
      "ret.d30",
      "app.ret.active-retention",
      "app.rev.purchases-per-active",
      "app.rev.ads-per-active",
      "app.rev.commission",
    ]);
  });

  it("ignores a target left on a number it no longer shows: the funnel's paying people don't move", () => {
    const hidden = buildAppScenario(consumerUsageOnlyState(), { "rev.paid-conversion": 5, "ret.logo-churn": 2, "rev.arpa": 12 }, CTX_FR);
    expect(hidden.moved).toEqual([]);
    expect(hidden).toEqual(scenario);
  });

  it("prints only the two self-serve rules about installs, then its own (§21.5.3 point 9)", () => {
    const moved = buildAppScenario(
      consumerUsageOnlyState(),
      { "acq.signup-rate": 40, "ref.referred-share": 8, "act.rate": 40, "ret.d30": 15, "app.rev.purchases-per-active": 0.4, "app.rev.commission": 15 },
      CTX_FR,
    );
    expect(moved.assumptions).toEqual([
      "signup-same-visitors",
      "referral-on-top",
      "actives-follow-d30",
      "per-active-all-actives",
      "commission-margin-only",
      "same-spend-installs",
      "install-months",
      "usage-twelve-months",
    ]);
  });

  it("without any lever moved: the rules the curves need, and nothing about subscribers", () => {
    expect(scenario.assumptions).toEqual(["install-months", "usage-twelve-months"]);
  });
});

describe("an app earning from subscriptions alone", () => {
  const state = withMonetization(SUBSCRIPTIONS);
  const scenario = buildAppScenario(state, { "ret.d30": 15 }, CTX_FR);

  it("is the self-serve subscription engine: its MRR, its curve and its new MRR, untouched, and no usage stream", () => {
    const saas = buildScenario(state, { "ret.d30": 15 }, CTX_FR);
    const { today, projected } = scenario;
    expect(today.kpis.mrr).toEqual(saas.today.kpis.mrr);
    expect(today.kpis.mrrPath).toEqual(saas.today.kpis.mrrPath);
    expect(projected.kpis.mrrPath).toEqual(saas.projected.kpis.mrrPath);
    expect(projected.kpis.newMrr).toEqual(saas.projected.kpis.newMrr);
    expect(today.kpis.app!.usagePath).toBeNull();
    expect(today.kpis.app!.newUsage).toBeNull();
    expect(today.kpis.app!.activesMissing).toBe(false);
    expect(only(today.kpis.mrr)).toBeCloseTo(28_800, 6);
  });

  it("earns its first install-month from the subscription alone (0,119808 €), and reads no actives", () => {
    expect(only(scenario.today.kpis.monthlyMargin)).toBeCloseTo(0.119808, 9);
    expect(scenario.levers.map((l) => l.id)).toEqual([...LEVER_IDS, "app.rev.commission"]);
  });

  it("keeps all the self-serve rules but the CAC's: an app has a cost per install, not a CAC", () => {
    expect(scenario.assumptions).toEqual(["d30-drives-paying", "churn-as-revenue", "twelve-months", "install-months"]);
    // A stale `acq.cac` (an app doesn't show one) would put the self-serve rule back: the app never prints it.
    const stale = withEntry(withMonetization(SUBSCRIPTIONS), "acq.cac", { status: "measured", value: { kind: "amount", amount: 1_900 }, source: { kind: "other" }, updatedAt: "2026-09-20T10:00:00.000Z" });
    const noted = buildAppScenario(stale, { "acq.signup-rate": 40, "ret.d30": 15 }, CTX_FR);
    expect(buildScenario(stale, { "acq.signup-rate": 40, "ret.d30": 15 }, CTX_FR).assumptions).toContain("same-spend");
    expect(noted.assumptions).not.toContain("same-spend");
  });
});

describe("a cost per install that may be too high to be paid back (§21.5.3 point 8)", () => {
  /** The cost per install estimated from 1 € to 3 €, an install worth 2,18 € over 36 months: the best case pays back, the worst never does. */
  const state = withEntry(consumerState(), "app.acq.cpi", estimated(1, 3));
  const k = buildAppScenario(state, {}, CTX_FR).today.kpis;

  it("reads the cap as the payback's high bound, and says so", () => {
    expect(k.app!.paybackBeyondCap).toBe(true);
    expect(k.payback!.hi).toBe(36);
    expect(k.payback!.lo).toBeLessThan(12);
  });

  it("is a possible loss, and a possible late return, never a certain one", () => {
    expect(k.loss?.verdict).toBe("maybe");
    expect(k.warning?.verdict).toBe("maybe");
  });
});

describe("a month whose installs are not typed (§21.5.3 points 3, 5 and 7)", () => {
  /** The install rate as a bare 30 % (no counts), the channel's share and the cost per install without them: no count of installs anywhere. */
  function noInstalls(from = consumerState()) {
    let state = from;
    state = withEntry(state, "acq.signup-rate", estimated(30, 30));
    state = withEntry(state, "acq.top-channel-share", undefined);
    state = withEntry(state, "app.acq.cpi", { status: "measured", value: { kind: "amount", amount: 1.5 }, source: { kind: "person", role: "finance" }, updatedAt: "2026-09-20T10:00:00.000Z" });
    delete state.snapshots[0]!.base!.monthSignups;
    return state;
  }

  it("reads the funnel on 100 installs and cannot count the new actives, yet knows the month's revenue: no usage curve, no new revenue, no revenue in twelve months", () => {
    const { today } = buildAppScenario(noInstalls(), {}, CTX_FR);
    expect(today.funnel.perHundred).toBe(true);
    expect(today.kpis.app!.usagePath).toBeNull();
    // The month's revenue is the actives × what one brings (+ the subscriptions' MRR): it needs no installs (2026-10-05).
    expect(only(today.kpis.mrr)).toBeCloseTo(39_300, 6);
    expect(today.kpis.newMrr).toBeNull();
    expect(today.kpis.mrr12).toBeNull();
    expect(today.kpis.mrrPath).toBeNull();
    expect(today.kpis.spend).toBeNull();
    // An install's economics read rates, not counts: they stay.
    expect(r4(only(today.kpis.ltv))).toBe(2.1809);
    expect(only(today.kpis.cac)).toBeCloseTo(1.5, 9);
  });

  it("knows the month's revenue of an app without subscriptions too: 15 000 actives × 0,70 € = 10 500 €, and nothing after it", () => {
    const { today } = buildAppScenario(noInstalls(consumerUsageOnlyState()), {}, CTX_FR);
    expect(today.funnel.perHundred).toBe(true);
    expect(only(today.kpis.mrr)).toBeCloseTo(10_500, 6);
    expect(today.kpis.app!.usagePath).toBeNull();
    expect(today.kpis.newMrr).toBeNull();
    expect(today.kpis.mrr12).toBeNull();
    expect(today.kpis.mrrPath).toBeNull();
  });

  it("still lowers the cost per install with the installs the funnel adds: 100 on 100 keeps the ratio right", () => {
    const scenario = buildAppScenario(noInstalls(), { "acq.signup-rate": 40 }, CTX_FR);
    expect(only(scenario.projected.kpis.cac)).toBeCloseTo(1.5 / (40 / 30), 9);
    expect(scenario.assumptions).toContain("same-spend-installs");
  });
});

describe("a usage stream whose actives are not typed (§21.5.3, activesMissing)", () => {
  /** Purchases and ads as ranges — a per-active revenue without counts — and no count of the month's actives anywhere. */
  function noActives() {
    let state = consumerState();
    state = withEntry(state, "app.rev.purchases-per-active", estimated(0.2, 0.4));
    state = withEntry(state, "app.rev.ads-per-active", estimated(0.3, 0.5));
    delete state.snapshots[0]!.base!.appActives;
    return state;
  }

  it("says the actives are missing, and gives no usage stream — nor a total: one stream is never passed off as the whole (S9)", () => {
    const k = buildAppScenario(noActives(), {}, CTX_FR).today.kpis;
    expect(k.app!.activesMissing).toBe(true);
    expect(k.app!.usagePath).toBeNull();
    expect(k.mrr).toBeNull();
    expect(k.mrrPath).toBeNull();
    expect(k.mrr12).toBeNull();
    expect(k.arr).toBeNull();
    // What doesn't need the actives is still there: the subscriptions, the month's new revenue (the new actives
    // × 0,50 to 0,90 € of purchases and ads), and an install's economics.
    expect(only(k.app!.subscriptionsPath![0])).toBeCloseTo(28_800, 6);
    expect(k.app!.newUsage!.lo).toBeCloseTo(720, 6);
    expect(k.app!.newUsage!.hi).toBeCloseTo(1_296, 6);
    expect(k.newMrr!.lo).toBeCloseTo(2_304 + 720, 6);
    expect(k.app!.value12).not.toBeNull();
    expect(k.ltv).not.toBeNull();
  });

  it("is a range once the actives are typed, and nothing is missing", () => {
    const state = withEntry(consumerState(), "app.rev.purchases-per-active", estimated(0.2, 0.4));
    const k = buildAppScenario(state, {}, CTX_FR).today.kpis;
    expect(k.app!.activesMissing).toBe(false);
    expect(k.mrr!.lo).toBeLessThan(k.mrr!.hi);
    // 15 000 actives × (0,20 to 0,40 € of purchases + 0,40 € of ads).
    expect(k.app!.usagePath![0]!.lo).toBeCloseTo(9_000, 6);
    expect(k.app!.usagePath![0]!.hi).toBeCloseTo(12_000, 6);
  });

  it("is false for an app with no usage stream, whatever it knows of the actives", () => {
    const state = withMonetization(SUBSCRIPTIONS);
    delete state.snapshots[0]!.base!.appActives;
    expect(buildAppScenario(state, {}, CTX_FR).today.kpis.app!.activesMissing).toBe(false);
  });
});

describe("appInputs — what the monetization shows is read, the rest is not (§21.5.2)", () => {
  it("reads the example's twelve numbers", () => {
    const i = appInputs(consumerState(), CTX_FR);
    expect(i.m).toEqual({ subscriptions: true, purchases: true, ads: true });
    const read = [i.installs, i.d30, i.paid, i.arpa, i.churn, i.actives, i.activeRetention, i.purchases, i.ads, i.commission, i.margin, i.cpi].map(only);
    const typed = [12_000, 12, 3, 6.4, 7, 15_000, 90, 0.3, 0.4, 22, 80, 1.5];
    read.forEach((value, n) => expect(value).toBeCloseTo(typed[n]!, 9));
  });

  it("leaves the subscription numbers unread without subscriptions, though they stay typed", () => {
    const i = appInputs(consumerUsageOnlyState(), CTX_FR);
    expect([i.paid, i.arpa, i.churn]).toEqual([null, null, null]);
    expect(i.purchases).not.toBeNull();
    expect(i.commission).not.toBeNull();
  });

  it("leaves the usage numbers — and the actives — unread without purchases or ads", () => {
    const i = appInputs(withMonetization(SUBSCRIPTIONS), CTX_FR);
    expect([i.actives, i.activeRetention, i.purchases, i.ads]).toEqual([null, null, null, null]);
    expect(i.paid).not.toBeNull();
    expect(i.d30).not.toBeNull();
  });

  it("reads the commission with purchases or subscriptions, never with ads alone", () => {
    expect(appInputs(withMonetization(ADS), CTX_FR).commission).toBeNull();
    expect(appInputs(withMonetization(PURCHASES), CTX_FR).commission).not.toBeNull();
    expect(appInputs(withMonetization(SUBSCRIPTIONS), CTX_FR).commission).not.toBeNull();
    expect(appInputs(withMonetization(ADS), CTX_FR).ads).not.toBeNull();
    expect(appInputs(withMonetization(ADS), CTX_FR).purchases).toBeNull();
  });

  it("reads a malformed stored monetization as the subscriptions-only default, not as typed", () => {
    const state = consumerState();
    state.setup = { ...state.setup, monetization: "x" as unknown as AppMonetization };
    expect(appInputs(state, CTX_FR).m).toEqual(SUBSCRIPTIONS);
    expect(appLeverIds(state.setup)).toEqual([...LEVER_IDS, "app.rev.commission"]);
  });
});

describe("appInputsOf — the inputs a computed figure reads, for the seven monetizations (§21.5.2)", () => {
  const BASE = ["app.rev.gross-margin"] as const;
  const CASES: readonly (readonly [string, AppMonetization, readonly MetricId[]])[] = [
    ["subscriptions", { subscriptions: true, purchases: false, ads: false }, [...BASE, "app.rev.commission", "rev.paid-conversion", "rev.arpa", "ret.logo-churn"]],
    ["purchases", { subscriptions: false, purchases: true, ads: false }, [...BASE, "app.rev.commission", "ret.d30", "app.rev.purchases-per-active", "app.ret.active-retention"]],
    ["ads", { subscriptions: false, purchases: false, ads: true }, [...BASE, "ret.d30", "app.rev.ads-per-active", "app.ret.active-retention"]],
    [
      "subscriptions and purchases",
      { subscriptions: true, purchases: true, ads: false },
      [...BASE, "app.rev.commission", "rev.paid-conversion", "rev.arpa", "ret.logo-churn", "ret.d30", "app.rev.purchases-per-active", "app.ret.active-retention"],
    ],
    [
      "subscriptions and ads",
      { subscriptions: true, purchases: false, ads: true },
      [...BASE, "app.rev.commission", "rev.paid-conversion", "rev.arpa", "ret.logo-churn", "ret.d30", "app.rev.ads-per-active", "app.ret.active-retention"],
    ],
    [
      "purchases and ads",
      { subscriptions: false, purchases: true, ads: true },
      [...BASE, "app.rev.commission", "ret.d30", "app.rev.purchases-per-active", "app.rev.ads-per-active", "app.ret.active-retention"],
    ],
    [
      "all three",
      { subscriptions: true, purchases: true, ads: true },
      [...BASE, "app.rev.commission", "rev.paid-conversion", "rev.arpa", "ret.logo-churn", "ret.d30", "app.rev.purchases-per-active", "app.rev.ads-per-active", "app.ret.active-retention"],
    ],
  ];

  for (const [name, m, expected] of CASES) {
    it(`${name}: the value and the 36-month value read ${expected.length} numbers, the payback and the ratio the cost per install too`, () => {
      expect(appInputsOf("app.rev.install-value", m)).toEqual(expected);
      expect(appInputsOf("app.rev.install-ltv", m)).toEqual(expected);
      expect(appInputsOf("app.rev.install-payback", m)).toEqual([...expected, "app.acq.cpi"]);
      expect(appInputsOf("app.rev.value-to-cost", m)).toEqual([...expected, "app.acq.cpi"]);
    });
  }

  it("never lists a number twice, and never one the setup hides", () => {
    for (const [, m] of CASES) {
      for (const id of ["app.rev.install-value", "app.rev.install-payback"] as AppDerivedId[]) {
        const ids = appInputsOf(id, m);
        expect(new Set(ids).size).toBe(ids.length);
        if (!m.subscriptions) for (const hidden of ["rev.paid-conversion", "rev.arpa", "ret.logo-churn"]) expect(ids).not.toContain(hidden);
      }
    }
  });
});

describe("the app's levers (§21.5.3)", () => {
  it("lists them in panel order, for what the monetization shows", () => {
    expect(appLeverIds({ monetization: { subscriptions: true, purchases: true, ads: true } })).toEqual([...LEVER_IDS, ...APP_LEVER_IDS]);
    expect(appLeverIds({ monetization: SUBSCRIPTIONS })).toEqual([...LEVER_IDS, "app.rev.commission"]);
    expect(appLeverIds({ monetization: PURCHASES })).toEqual([
      "acq.signup-rate",
      "ref.referred-share",
      "act.rate",
      "ret.d30",
      "app.ret.active-retention",
      "app.rev.purchases-per-active",
      "app.rev.commission",
    ]);
    expect(appLeverIds({ monetization: ADS })).toEqual(["acq.signup-rate", "ref.referred-share", "act.rate", "ret.d30", "app.ret.active-retention", "app.rev.ads-per-active"]);
  });

  it("is what leverIdsOf answers for an app, and the SaaS's nine for a SaaS", () => {
    const app = consumerState().setup;
    expect(leverIdsOf(app)).toEqual(appLeverIds(app));
    const saas = exampleState().setup;
    expect(leverIdsOf(saas)).toBe(LEVER_IDS);
  });

  it("moves what an active brings by a cent, over half to double of today", () => {
    const views = leverViews(consumerState(), {}, CTX_FR, appLeverIds(consumerState().setup));
    const view = (id: LeverId) => views.find((l) => l.id === id)!;
    const purchases = view("app.rev.purchases-per-active");
    expect(purchases).toMatchObject({ unit: "money", direction: "higher", step: 0.01 });
    expect([purchases.min, purchases.max]).toEqual([0.15, 0.6]);
    const ads = view("app.rev.ads-per-active");
    expect(ads).toMatchObject({ unit: "money", direction: "higher", step: 0.01 });
    expect([ads.min, ads.max]).toEqual([0.2, 0.8]);
  });

  it("keeps a cent per active from rounding to nothing: the slider never starts at 0", () => {
    const state = withEntry(consumerState(), "app.rev.ads-per-active", { status: "measured", value: { kind: "ratio", numerator: 60, denominator: 15_000 }, source: { kind: "other" }, updatedAt: "2026-09-20T10:00:00.000Z" });
    const ads = leverViews(state, {}, CTX_FR, appLeverIds(state.setup)).find((l) => l.id === "app.rev.ads-per-active")!;
    expect(ads.min).toBe(0.01);
    expect(ads.max).toBe(0.02);
  });

  it("lowers the commission from today to double, never past 100 %, a point at a time", () => {
    const views = leverViews(consumerState(), {}, CTX_FR, appLeverIds(consumerState().setup));
    const commission = views.find((l) => l.id === "app.rev.commission")!;
    expect(commission).toMatchObject({ unit: "percent", direction: "lower", step: 1, min: 0, max: 44 });
    const high = withEntry(consumerState(), "app.rev.commission", { status: "measured", value: { kind: "ratio", numerator: 21_000, denominator: 30_000 }, source: { kind: "other" }, updatedAt: "2026-09-20T10:00:00.000Z" });
    const view = leverViews(high, { "app.rev.commission": 400 }, CTX_FR, appLeverIds(high.setup)).find((l) => l.id === "app.rev.commission")!;
    expect(view.max).toBe(100);
    expect(view.target).toBe(100);
  });

  it("raises the actives' retention from half of today to three times, never past 100 %", () => {
    const views = leverViews(consumerState(), {}, CTX_FR, appLeverIds(consumerState().setup));
    const retention = views.find((l) => l.id === "app.ret.active-retention")!;
    expect(retention).toMatchObject({ unit: "percent", direction: "higher", step: 1, min: 45, max: 100 });
  });

  it("moves what an active brings from the next month, on every active: the usage curve starts from today's revenue", () => {
    const scenario = buildAppScenario(consumerState(), { "app.rev.purchases-per-active": 0.6 }, CTX_FR);
    const usage = scenario.projected.kpis.app!.usagePath!;
    expect(only(usage[0])).toBeCloseTo(15_000 * 0.7, 6);
    // From month 1, 15 000 actives kept at 90 % plus 1 440 new ones, each bringing 0,60 € + 0,40 €.
    expect(only(usage[1])).toBeCloseTo((15_000 * 0.9 + 1_440) * 1.0, 6);
    expect(scenario.assumptions).toContain("per-active-all-actives");
    expect(only(scenario.projected.kpis.mrr)).toBeCloseTo(39_300, 6);
  });

  it("moves the actives' retention through the usage curve, and names the rule only when it applied", () => {
    const scenario = buildAppScenario(consumerState(), { "app.ret.active-retention": 95 }, CTX_FR);
    expect(only(scenario.projected.kpis.app!.usagePath![12])).toBeGreaterThan(only(scenario.today.kpis.app!.usagePath![12]));
    // The subscriptions don't depend on it.
    expect(scenario.projected.kpis.app!.subscriptionsPath).toEqual(scenario.today.kpis.app!.subscriptionsPath);
    expect(scenario.assumptions).not.toContain("actives-follow-d30");
  });
});

describe("a scenario routed through the seam is the app's own", () => {
  it("scenarioOf and leverIdsOf answer an app from app.ts", () => {
    const state = consumerState();
    expect(scenarioOf(state, { "ret.d30": 15 }, CTX_FR)).toEqual(buildAppScenario(state, { "ret.d30": 15 }, CTX_FR));
    expect(leverIdsOf(state.setup)).toEqual(appLeverIds(state.setup));
  });
});

// ---------------------------------------------------------------------------------------------------------------
// The diagnosis of an app (engine spec §21.5.4, A22 APP-5)
//
// The example's figures are §21.9.2's (828 € / 768 € / 210 €; 252 € / 210 € without subscriptions), which the independent
// script `docs/engine/reference/app-example.mjs` also prints (« Classement »); the other prices are written from the
// closed forms of D9 in the tests themselves.
//
// Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, `src/lib/engine`, `src/content` and `src/app` run, then
// restored; the count is the tests that fall):
// - the usage stream counted for the paid conversion (§21.10.4): the example's diagnosis falls three (shared → clear
//   among them), the conversion's price one, the usage-less price one, the series' previous leak one (6);
// - `retentions` forgetting the actives' retention (§21.10.4): its price read as new revenue instead of retained revenue
//   falls one, the rules' own list one (2) — the relative-gap branch cannot see it, `appRankingImpact` returns it no gap;
// - the usage stream counted for churn: 1; `diagnose` running the SaaS's rules for an app: 15;
// - `isCandidate` without the actives' retention: 2; `notEnoughBelowValues` walking the motion's list again: 1;
// - the series comparing the SaaS's numbers for an app: 4; its candidates without the actives' retention: 1;
// - `candidatesFor` answering `candidatesOf` for an app: 3; `appCandidates` keeping the hidden candidates: 3, or the
//   actives' retention when hidden: 3;
// - `blindWatch` without the actives' retention: 2, with churn when subscriptions are unticked: 2;
// - the actives' retention priced without the month's actives: 2.
// ---------------------------------------------------------------------------------------------------------------

const ACTIVE = "app.ret.active-retention" as const;
const amplitude = { kind: "tool", tool: "amplitude" } as const;

/**
 * The example whose month's actives are typed nowhere: the actives' retention and both revenues per active as ranges
 * (their counts are the actives), and no base count. The same recipe as the « actives are not typed » case above.
 */
function noActivesState() {
  let state = consumerState();
  state = withEntry(state, ACTIVE, estimated(89, 91));
  state = withEntry(state, "app.rev.purchases-per-active", estimated(0.2, 0.4));
  state = withEntry(state, "app.rev.ads-per-active", estimated(0.3, 0.5));
  delete state.snapshots[0]!.base!.appActives;
  return state;
}

/** What a stage is worth a month in the diagnosis, as a single number (the example is all measured). */
function worth(d: Diagnosis<SelfServeCandidateId>, id: SelfServeCandidateId): number {
  return only(d.positions[id]?.impact?.mrrPerMonth);
}

describe("the diagnosis of the example (§21.9.2): shared, in money, between day 30 and the paid conversion", () => {
  const d = diagnose(consumerState(), CTX_FR);

  it("names the two flows behind their target and ranks them in money, nothing left unpriced and nothing blind", () => {
    expect(d.state).toBe("shared");
    expect(d.basis).toBe("mrr");
    expect(d.named).toEqual(["ret.d30", "rev.paid-conversion"]);
    expect(d.belowUnpriced).toEqual([]);
    expect(d.blind).toEqual([]);
  });

  it("prices day-30 retention at 828 € a month (576 € of subscriptions + 252 € of usage), the paid conversion at 768 €", () => {
    expect(worth(d, "ret.d30")).toBeCloseTo(828, 9);
    expect(worth(d, "rev.paid-conversion")).toBeCloseTo(768, 9);
    // The pieces, from the closed forms: 360 new subscribers and 1 440 new actives a month, a gap of 15/12 − 1, 6,40 € and 0,70 €.
    expect(360 * (15 / 12 - 1) * 6.4 + 1_440 * (15 / 12 - 1) * 0.7).toBeCloseTo(828, 9);
    expect(360 * (4 / 3 - 1) * 6.4).toBeCloseTo(768, 9);
  });

  it("leaves the actives' retention out of the group: below its target of 92 %, worth 210 € a month, 828 < 768 × 1,25", () => {
    const at = d.positions[ACTIVE];
    expect(at?.position).toBe("below");
    expect(at?.comparator).toEqual({ lo: 92, hi: 92, direction: "higher" });
    expect(worth(d, ACTIVE)).toBeCloseTo(210, 9);
    expect(d.named).not.toContain(ACTIVE);
    // Not clear (828 does not clear 768 × 1,25 = 960), and the group stops where 828 ÷ 1,25 = 662,4 no longer clears the price.
    expect(828).toBeLessThan(768 * 1.25);
    expect(828 / 1.25).toBeGreaterThan(210);
  });

  it("reads the actives' retention as retained revenue, like churn, and the two flows as new revenue", () => {
    expect(d.positions[ACTIVE]?.impact?.kind).toBe("retained-mrr");
    expect(d.positions["ret.d30"]?.impact?.kind).toBe("new-mrr");
    expect(d.positions["rev.paid-conversion"]?.impact?.kind).toBe("new-mrr");
  });

  it("positions the seven candidates of an app with three streams, in the rules' order, the numbers without a target apart", () => {
    expect(Object.keys(d.positions)).toEqual(["acq.signup-rate", "act.rate", "ret.d30", "rev.paid-conversion", "ref.referred-share", "ret.logo-churn", ACTIVE]);
    expect(d.positions["acq.signup-rate"]?.position).toBe("no-comparator");
    expect(d.positions["ret.logo-churn"]?.position).toBe("no-comparator");
  });

  it("positions the actives' retention « no comparator » without a target of its own: nothing but the team's target names a stage (C1)", () => {
    const state = consumerState();
    delete state.snapshots[0]!.targets[ACTIVE];
    const noActiveTarget = diagnose(state, CTX_FR);
    expect(noActiveTarget.positions[ACTIVE]).toEqual({ position: "no-comparator" });
    expect(noActiveTarget.state).toBe("shared");
    expect(noActiveTarget.named).toEqual(["ret.d30", "rev.paid-conversion"]);
  });
});

describe("the app without subscriptions (§21.9.2): 252 € and 210 €, shared", () => {
  const state = consumerUsageOnlyState();
  const d = diagnose(state, CTX_FR);

  it("keeps a target typed on a number it no longer shows out of the ranking: no paid conversion, no churn among the candidates", () => {
    // The target of the paid conversion is still stored (4 %), and the entry too: both are hidden, neither is read.
    expect(state.snapshots[0]!.targets["rev.paid-conversion"]).toBe(4);
    expect(state.snapshots[0]!.metrics["rev.paid-conversion"]).toBeDefined();
    expect(Object.keys(d.positions)).toEqual(["acq.signup-rate", "act.rate", "ret.d30", "ref.referred-share", ACTIVE]);
  });

  it("is shared between day 30 (252 € of usage) and the actives' retention (210 €): 252 < 210 × 1,25 = 262,5", () => {
    expect(d.state).toBe("shared");
    expect(d.basis).toBe("mrr");
    expect(d.named).toEqual(["ret.d30", ACTIVE]);
    expect(worth(d, "ret.d30")).toBeCloseTo(252, 9);
    expect(worth(d, ACTIVE)).toBeCloseTo(210, 9);
    expect(252).toBeLessThan(210 * 1.25);
    expect(d.blind).toEqual([]);
  });
});

describe("an app earning from subscriptions alone is ranked as the SaaS is (§21.5.4)", () => {
  const state = withMonetization(SUBSCRIPTIONS);
  const d = diagnose(state, CTX_FR);

  it("positions the six self-serve candidates and no more: the actives' retention is not shown, its target stays stored", () => {
    expect(state.snapshots[0]!.targets[ACTIVE]).toBe(92);
    expect(Object.keys(d.positions)).toEqual([...CANDIDATE_IDS]);
  });

  it("prices every candidate exactly as the self-serve engine does", () => {
    for (const id of CANDIDATE_IDS) expect(appRankingImpact(state, id, 20, CTX_FR), id).toEqual(rankingImpact(state, id, 20, CTX_FR));
  });

  it("names the paid conversion, clear: 768 € against 576 € × 1,25 = 720 €", () => {
    expect(d.state).toBe("clear");
    expect(d.named).toEqual(["rev.paid-conversion"]);
    expect(worth(d, "ret.d30")).toBeCloseTo(576, 9);
    expect(worth(d, "rev.paid-conversion")).toBeCloseTo(768, 9);
  });
});

describe("appRankingImpact — each candidate, on the example's three streams (§21.5.4)", () => {
  const state = consumerState();
  const impact = (id: SelfServeCandidateId, target: number) => appRankingImpact(state, id, target, CTX_FR);
  /** 360 new subscribers at 6,40 €, 1 440 new actives at 0,70 €, 4 500 subscribers, 15 000 actives. */
  const flow = (gap: number) => 360 * gap * 6.4 + 1_440 * gap * 0.7;

  it("the install rate (30 %): subscriptions and usage grow by the same relative gap", () => {
    const r = impact("acq.signup-rate", 33);
    expect(only(r.gap)).toBeCloseTo(0.1, 9);
    expect(only(r.mrr)).toBeCloseTo(flow(33 / 30 - 1), 9);
  });

  it("activation (35 %)", () => {
    const r = impact("act.rate", 40);
    expect(only(r.gap)).toBeCloseTo(40 / 35 - 1, 9);
    expect(only(r.mrr)).toBeCloseTo(flow(40 / 35 - 1), 9);
  });

  it("day-30 retention (12 %): 576 € + 252 € = 828 €", () => {
    const r = impact("ret.d30", 15);
    expect(only(r.gap)).toBeCloseTo(0.25, 9);
    expect(only(r.mrr)).toBeCloseTo(828, 9);
  });

  it("the paid conversion (3 %): the subscriptions only — the usage stream, point(0), is not touched by who pays", () => {
    const r = impact("rev.paid-conversion", 4);
    expect(only(r.gap)).toBeCloseTo(1 / 3, 9);
    expect(only(r.mrr)).toBeCloseTo(768, 9);
    // The same number the SaaS prices: nothing of the usage stream is added.
    expect(only(r.mrr)).toBeCloseTo(only(rankingImpact(state, "rev.paid-conversion", 4, CTX_FR).mrr), 9);
  });

  it("the referred share (5 %): the referred come on top, both streams grow by (10 − 5) ÷ (100 − 10)", () => {
    const r = impact("ref.referred-share", 10);
    const gap = (10 - 5) / (100 - 10);
    expect(only(r.gap)).toBeCloseTo(gap, 9);
    expect(only(r.mrr)).toBeCloseTo(flow(gap), 9);
  });

  it("churn (7 %): the subscriptions' base only, 4 500 × 2 points × 6,40 € = 576 €, no relative gap — and none of the usage", () => {
    const r = impact("ret.logo-churn", 5);
    expect(r.gap).toBeUndefined();
    expect(only(r.mrr)).toBeCloseTo(4_500 * 0.02 * 6.4, 9);
  });

  it("the actives' retention (90 %): 15 000 actives × 2 points × 0,70 € = 210 €, kept a month, and nothing for the subscriptions", () => {
    const r = impact(ACTIVE, 92);
    expect(r.gap).toBeUndefined();
    expect(only(r.mrr)).toBeCloseTo(15_000 * 0.02 * 0.7, 9);
  });

  it("a target already met is worth nothing, never a loss", () => {
    expect(only(impact(ACTIVE, 85).mrr)).toBe(0);
    expect(only(impact("ret.d30", 10).mrr)).toBe(0);
  });

  it("without an ARPA, the subscriptions' gain is unknown and so is the money: the flows keep their relative gap only", () => {
    const noArpa = withEntry(state, "rev.arpa", undefined);
    const r = appRankingImpact(noArpa, "ret.d30", 15, CTX_FR);
    expect(only(r.gap)).toBeCloseTo(0.25, 9);
    expect(r.mrr).toBeUndefined();
    // The actives' retention does not need it: it only reads the actives and what one brings.
    expect(only(appRankingImpact(noArpa, ACTIVE, 92, CTX_FR).mrr)).toBeCloseTo(210, 9);
  });

  it("without the month's actives, the actives' retention is not priced; the flows are (their usage reads the new actives, 1 440 a month)", () => {
    const noActives = noActivesState();
    expect(appRankingImpact(noActives, ACTIVE, 92, CTX_FR)).toEqual({});
    // 576 € of subscriptions + 1 440 new actives × 0,25 × (0,50 to 0,90 €) of usage.
    const r = appRankingImpact(noActives, "ret.d30", 15, CTX_FR);
    expect(r.mrr!.lo).toBeCloseTo(576 + 1_440 * 0.25 * 0.5, 9);
    expect(r.mrr!.hi).toBeCloseTo(576 + 1_440 * 0.25 * 0.9, 9);
  });

  it("without the usage numbers, a flow's usage gain is unknown: relative gap only; the actives' retention is not priced", () => {
    const noPerActive = withEntry(state, "app.rev.ads-per-active", undefined);
    const flowOnly = appRankingImpact(noPerActive, "ret.d30", 15, CTX_FR);
    expect(only(flowOnly.gap)).toBeCloseTo(0.25, 9);
    expect(flowOnly.mrr).toBeUndefined();
    expect(appRankingImpact(noPerActive, ACTIVE, 92, CTX_FR)).toEqual({});
    // The paid conversion's usage part is point(0) whatever is missing there: its money stays.
    expect(only(appRankingImpact(noPerActive, "rev.paid-conversion", 4, CTX_FR).mrr)).toBeCloseTo(768, 9);
  });

  it("is {} for the actives' retention when the monetization doesn't show it", () => {
    expect(appRankingImpact(withMonetization(SUBSCRIPTIONS), ACTIVE, 92, CTX_FR)).toEqual({});
  });

  it("without the month's installs, the new actives are unknown: a flow's usage gain, and with it its money, is", () => {
    const noInstalls = withEntry(withEntry(withEntry(consumerState(), "acq.signup-rate", estimated(30, 30)), "acq.top-channel-share", undefined), "app.acq.cpi", undefined);
    delete noInstalls.snapshots[0]!.base!.monthSignups;
    const r = appRankingImpact(noInstalls, "ret.d30", 15, CTX_FR);
    expect(only(r.gap)).toBeCloseTo(0.25, 9);
    expect(r.mrr).toBeUndefined();
  });
});

describe("what the diagnosis can say when a piece of money is missing (§21.5.4)", () => {
  it("without an ARPA the flows rank by relative gap, and the actives' retention stands apart as below but unpriced in the ranking", () => {
    const d = diagnose(withEntry(consumerState(), "rev.arpa", undefined), CTX_FR);
    expect(d.basis).toBe("relative-gap");
    // 1/3 against 0,25 × 1,25 = 0,3125: the paid conversion is clearly ahead.
    expect(d.state).toBe("clear");
    expect(d.named).toEqual(["rev.paid-conversion"]);
    expect(d.belowUnpriced).toEqual([ACTIVE]);
    expect(d.positions[ACTIVE]?.position).toBe("below");
    // Its price is still attached to its position: the screens that list what each leak is worth read it.
    expect(worth(d, ACTIVE)).toBeCloseTo(210, 9);
  });

  it("without the month's actives, the actives' retention is below but unpriced; the ranking in money is the flows'", () => {
    const d = diagnose(noActivesState(), CTX_FR);
    expect(d.basis).toBe("mrr");
    expect(d.belowUnpriced).toEqual([ACTIVE]);
    expect(d.named).not.toContain(ACTIVE);
    expect(d.named).toContain("rev.paid-conversion");
    expect(d.positions[ACTIVE]?.position).toBe("below");
    expect(d.positions[ACTIVE]?.impact).toBeUndefined();
  });

  it("is clear on the actives' retention alone when it is the only flow-or-retention below its target", () => {
    const state = withTarget(withTarget(withoutTargets(consumerState()), ACTIVE, 92), "ret.d30", 10);
    const d = diagnose(state, CTX_FR);
    expect(d.state).toBe("clear");
    expect(d.named).toEqual([ACTIVE]);
    expect(d.basis).toBe("mrr");
  });

  it("is level when every target is met, and not-enough with a single target", () => {
    expect(diagnose(withTarget(withTarget(withTarget(consumerState(), "ret.d30", 10), "rev.paid-conversion", 2), ACTIVE, 85), CTX_FR).state).toBe("level");
    expect(diagnose(withTarget(withoutTargets(consumerState()), ACTIVE, 92), CTX_FR).state).toBe("not-enough");
  });

  it("watches for the ★ and the retentions it shows: an unknown actives' retention may hide the real bottleneck", () => {
    expect(diagnose(withEntry(consumerState(), ACTIVE, undefined), CTX_FR).blind).toEqual([ACTIVE]);
    expect(diagnose(withEntry(consumerState(), "ret.logo-churn", undefined), CTX_FR).blind).toEqual(["ret.logo-churn"]);
    // A number the monetization hides is never a blind spot, though it is unknown.
    expect(diagnose(withEntry(withMonetization(SUBSCRIPTIONS), ACTIVE, undefined), CTX_FR).blind).toEqual([]);
    expect(diagnose(withEntry(consumerUsageOnlyState(), "ret.logo-churn", undefined), CTX_FR).blind).toEqual([]);
    expect(diagnose(withEntry(consumerUsageOnlyState(), "rev.paid-conversion", undefined), CTX_FR).blind).toEqual([]);
  });
});

describe("notEnoughBelowValues names the actives' retention when it is the only stage below its target (§21.5.4)", () => {
  const only92 = withTarget(withoutTargets(consumerState()), ACTIVE, 92);

  it("in both languages, from the keys of the diagnosis rather than a motion's list", () => {
    const d = diagnose(only92, CTX_FR);
    expect(d.state).toBe("not-enough");
    expect(Object.keys(d.positions)).toContain(ACTIVE);
    expect(notEnoughBelowValues(d, FR.strings, FR.metrics)).toEqual({ stage: "La rétention des actifs", side: "sous la cible" });
    expect(notEnoughBelowValues(diagnose(only92, CTX_EN), EN.strings, EN.metrics)).toEqual({ stage: "Active retention", side: "below the target" });
    expect(notEnoughBelowSentence(d, FR.strings, FR.metrics)).not.toBeNull();
  });

  it("says nothing when the actives' retention is not below, and the SaaS's stage still comes out of its own diagnosis", () => {
    expect(notEnoughBelowValues(diagnose(withTarget(withoutTargets(consumerState()), ACTIVE, 85), CTX_FR), FR.strings, FR.metrics)).toBeNull();
    const saas = withTarget(withoutTargets(exampleState()), "act.rate", 50);
    expect(notEnoughBelowValues(diagnose(saas, CTX_FR), FR.strings, FR.metrics)).toEqual({ stage: "L'activation", side: "sous la cible" });
  });

  it("reads the actives' retention as a candidate (isCandidate), so its target can be entered and it can be named", () => {
    expect(isCandidate(ACTIVE)).toBe(true);
    // Its neighbours of the app are numbers, not candidates.
    expect(isCandidate("app.rev.commission")).toBe(false);
    expect(isCandidate("app.acq.cpi")).toBe(false);
    expect(FR.strings.subject[ACTIVE]).toBe("la rétention des actifs");
    expect(EN.strings.subject[ACTIVE]).toBe("active retention");
  });
});

describe("candidatesFor — the candidates a setup offers a target on (§21.5.1)", () => {
  it("is the SaaS's own list for a SaaS, for each motion", () => {
    const { setup } = exampleState();
    expect(candidatesFor(setup, "plg")).toEqual(candidatesOf("plg"));
    expect(candidatesFor(setup, "slg")).toEqual(candidatesOf("slg"));
    expect(candidatesFor(setup, "plg")).not.toContain(ACTIVE);
  });

  it("is appCandidates for an app's self-serve: the shown candidates, then its own", () => {
    const full = consumerState().setup;
    expect(candidatesFor(full, "plg")).toEqual(appCandidates(full));
    expect(candidatesFor(full, "plg")).toEqual([...CANDIDATE_IDS, ACTIVE]);
    expect(candidatesFor(consumerUsageOnlyState().setup, "plg")).toEqual(["acq.signup-rate", "act.rate", "ret.d30", "ref.referred-share", ACTIVE]);
    expect(candidatesFor(withMonetization(SUBSCRIPTIONS).setup, "plg")).toEqual([...CANDIDATE_IDS]);
    expect(candidatesFor(withMonetization(ADS).setup, "plg")).toEqual(["acq.signup-rate", "act.rate", "ret.d30", "ref.referred-share", ACTIVE]);
  });

  it("is the diagnosis' own list: the keys it positions, whatever the monetization", () => {
    for (const m of [SUBSCRIPTIONS, PURCHASES, ADS, { subscriptions: true, purchases: true, ads: false }, { subscriptions: false, purchases: true, ads: true }]) {
      const state = withMonetization(m);
      expect(Object.keys(diagnose(state, CTX_FR).positions), JSON.stringify(m)).toEqual([...candidatesFor(state.setup, "plg")]);
    }
  });

  it("only lists what the monetization shows", () => {
    const shown = new Set<MetricId>(shapesOf(withMonetization(PURCHASES).setup).map((s) => s.id));
    for (const id of candidatesFor(withMonetization(PURCHASES).setup, "plg")) expect(shown.has(id), id).toBe(true);
  });
});

describe("appRules — the rules the one diagnosis function runs on (§21.5.4)", () => {
  it("is self-serve's motion, with the app's candidates and its own price", () => {
    const rules = appRules(consumerState().setup);
    expect(rules.motion).toBe("plg");
    expect(rules.candidates).toEqual([...CANDIDATE_IDS, ACTIVE]);
    expect(rules.price).toBe(appRankingImpact);
  });

  it("takes the actives' retention for a retention (ranked in money only) and churn with it; it is no flow", () => {
    const rules = appRules(consumerState().setup);
    expect(rules.retentions).toEqual(["ret.logo-churn", ACTIVE]);
    expect(rules.isFlow(ACTIVE)).toBe(false);
    expect(rules.isFlow("ret.logo-churn")).toBe(false);
    for (const flow of ["acq.signup-rate", "act.rate", "ret.d30", "ref.referred-share", "rev.paid-conversion"] as const) expect(rules.isFlow(flow), flow).toBe(true);
  });

  it("watches the shown ★, then churn with the subscriptions, then the actives' retention when shown", () => {
    const stars = ["acq.signup-rate", "act.rate", "ret.d30", "ref.referred-share"];
    expect(appRules(consumerState().setup).blindWatch).toEqual([...stars, "rev.paid-conversion", "ret.logo-churn", ACTIVE]);
    expect(appRules(consumerUsageOnlyState().setup).blindWatch).toEqual([...stars, ACTIVE]);
    expect(appRules(withMonetization(SUBSCRIPTIONS).setup).blindWatch).toEqual([...stars, "rev.paid-conversion", "ret.logo-churn"]);
  });

  it("reads a malformed stored monetization as the subscriptions-only default, like the rest of the app", () => {
    const setup = { ...consumerState().setup, monetization: { subscriptions: "yes" } as unknown as AppMonetization };
    expect(appCandidates(setup)).toEqual([...CANDIDATE_IDS]);
  });
});

describe("the SaaS is diagnosed as it was (§21.5.4)", () => {
  it("positions the six candidates and not the app's, and the hybrid's sales-assisted five apart", () => {
    expect(Object.keys(diagnose(exampleState(), CTX_FR).positions)).toEqual([...CANDIDATE_IDS]);
    expect(Object.keys(diagnose(hybridState(), CTX_FR).positions)).toEqual([...CANDIDATE_IDS]);
    expect(Object.keys(diagnose(hybridState(), CTX_FR, "slg").positions)).toEqual([...SLG_CANDIDATE_IDS]);
  });

  it("ignores an app's target left in a SaaS file: the actives' retention is not one of its candidates", () => {
    const d = diagnose(withTarget(exampleState(), ACTIVE, 99), CTX_FR);
    expect(d.positions[ACTIVE]).toBeUndefined();
    expect(d).toEqual(diagnose(exampleState(), CTX_FR));
  });
});

describe("the monthly series of an app compares the numbers it shows (§21.5.4)", () => {
  /** July is August with the actives' retention at 85 %: it got closer to the 92 % target since. */
  const state = withMonthBefore(consumerState(), (july) => {
    july.metrics[ACTIVE] = measured(ratio(12_750, 15_000), amplitude);
  });
  const series = deriveSeries(state, CTX_FR)!;
  const rows = series.motions[0]!.rows;
  const ids = rows.map((r) => r.metric);

  it("has one motion, self-serve's", () => {
    expect(series.motions.map((m) => m.motion)).toEqual(["plg"]);
  });

  it("compares the app's own numbers and none of the two it replaces", () => {
    for (const id of ["app.acq.cpi", "app.rev.gross-margin", "app.rev.commission", ACTIVE, "app.rev.purchases-per-active", "app.rev.ads-per-active"] as const) expect(ids, id).toContain(id);
    expect(ids).not.toContain("acq.cac");
    expect(ids).not.toContain("rev.gross-margin");
  });

  it("compares nothing the setup does not show — and everything it shows is a catalogue number of the setup", () => {
    const shown = new Set<MetricId>(shapesOf(state.setup).map((s) => s.id));
    for (const id of ids) expect(shown.has(id), id).toBe(true);
  });

  it("takes a step toward the 92 % target for the actives' retention, as it does for any candidate", () => {
    const row = rows.find((r) => r.metric === ACTIVE)!;
    expect(row.delta).toEqual({ kind: "points", change: 5 });
    expect(row.towardTarget).toBe(true);
    // A number that is no candidate has no « toward »: the cost per install has no target direction.
    expect(rows.find((r) => r.metric === "app.acq.cpi")!.towardTarget).toBe(false);
  });

  it("compares only the shown numbers of an app without subscriptions", () => {
    const usageOnly = deriveSeries(
      withMonthBefore(consumerUsageOnlyState(), (july) => {
        july.metrics[ACTIVE] = measured(ratio(12_750, 15_000), amplitude);
      }),
      CTX_FR,
    )!;
    const usageIds = usageOnly.motions[0]!.rows.map((r) => r.metric);
    for (const hidden of ["rev.arpa", "ret.logo-churn", "rev.paid-conversion", "rev.expansion", "rev.contraction", "acq.cac", "rev.gross-margin"] as const) expect(usageIds, hidden).not.toContain(hidden);
    expect(usageIds).toContain(ACTIVE);
  });

  it("remembers the leak of the month before from the app's own diagnosis, the actives' retention included", () => {
    // July: 15 000 actives × 7 points × 0,70 € = 735 €, which clears the group (828 ÷ 1,25 = 662,4); August: 210 €, which doesn't.
    const motion = series.motions[0]!;
    expect(motion.previousLeak).toEqual(["ret.d30", "rev.paid-conversion", ACTIVE]);
    expect(735).toBeGreaterThan(828 / 1.25);
    expect(motion.leakChanged).toBe(true);
  });
});
