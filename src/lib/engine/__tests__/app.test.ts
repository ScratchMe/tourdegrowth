import { describe, expect, it } from "vitest";
import { appInputs, appInputsOf, appLeverAlone, appLeverIds, buildAppScenario } from "../app";
import type { AppMonetization } from "../app-model";
import { APP_LEVER_IDS, LEVER_IDS } from "../catalog-shape";
import { EXAMPLE_CONSUMER_WHATIF } from "../example";
import { buildScenario, leverViews } from "../scenario";
import { leverAloneOf, leverIdsOf, scenarioOf } from "../scenario-of";
import type { AppDerivedId, Interval, LeverId, MetricId } from "../types";
import { consumerState, consumerUsageOnlyState, estimated, exampleState, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

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
