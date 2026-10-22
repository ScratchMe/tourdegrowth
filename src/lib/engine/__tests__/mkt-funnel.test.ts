import { describe, expect, it } from "vitest";
import { SMALL_COHORT_SIZE } from "../catalog-shape";
import { buildMktFunnel } from "../mkt-funnel";
import type { EngineState, MetricId } from "../types";
import { estimated, marketplaceNoSubscriptionsState, marketplaceState, measured, missing, ratio, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

/**
 * A marketplace's two funnels (engine spec §22.5.2, A23 MKT-2), on the example of §22.10.1 and the figures of §22.10.2:
 * the buyers, 2 000 visitors for 100 sign-ups, 8 of them referred, a first order for 20 and a second for 5, a fill rate
 * of 9 % counted on searches; the sellers, 2 000 visitors of the sellers' page for 100 sign-ups, a first sale for 30 and
 * a subscription for 15, 3 % of the sellers and 3 % of the paid sellers leaving a month. The peloton's rule (`peloton.ts`,
 * `peloton.test.ts`) on each side: every column on the same 100 sign-ups, whole people per bound, an unknown is `null`.
 *
 * Non-vacuity, measured on 2026-10-22 (each sabotage applied alone, this file and `mkt-economics.test.ts` run, then
 * restored and its sha compared; the count is the tests that fall):
 * - the per-hundred columns not rounded: the estimate, the typed rate and the referred share fall (3) — the example's
 *   columns are whole already;
 * - an unknown column drawn as {0, 0}: the four chains of each side, « an unknown is never 0 », the todo case and the
 *   one-column funnel fall (6);
 * - the supply's second column kept without subscriptions: the one-column funnel and its chain fall (2), and so does the
 *   box read as always ticked (2);
 * - the buyers' cohort size read on the second step (the repeat) instead of the first: three small-cohort tests fall (3);
 *   the sellers' on the subscription instead of the first sale: three others (3);
 * - the fill rate's variant dropped: the example and « the fill rate's variant » fall (2).
 */

const stripe = { kind: "tool", tool: "stripe" } as const;
const amplitude = { kind: "tool", tool: "amplitude" } as const;

/** `buildMktFunnel` on a state of the example with the given entries replaced. */
function funnelWith(changes: Partial<Record<MetricId, ReturnType<typeof measured> | undefined>>, base: EngineState = marketplaceState()) {
  const state = (Object.entries(changes) as [MetricId, ReturnType<typeof measured> | undefined][]).reduce((acc, [id, entry]) => withEntry(acc, id, entry), base);
  return buildMktFunnel(state, CTX_FR);
}

describe("the buyers' funnel — the example of §22.10.2", () => {
  const { demand } = buildMktFunnel(marketplaceState(), CTX_FR);

  it("2 000 visitors for 100 sign-ups, from the sign-up rate of 5 %, with its source and its month", () => {
    expect(demand.visitorsPerHundred).toEqual({ lo: 2_000, hi: 2_000 });
    expect(demand.upstreamSource).toEqual({ kind: "tool", tool: "ga4" });
    expect(demand.upstreamPeriod).toBe("2026-08");
  });

  it("a first order for 20, a second for 5: the same 100 sign-ups, the cohort of May", () => {
    expect(demand.columns).toEqual([
      { metric: "mkt.buy.first-order", perHundred: { lo: 20, hi: 20 }, confidence: "solid", source: { kind: "tool", tool: "product-db" }, period: "2026-05" },
      { metric: "mkt.buy.repeat", perHundred: { lo: 5, hi: 5 }, confidence: "solid", source: { kind: "tool", tool: "product-db" }, period: "2026-05" },
    ]);
    expect(demand.chain).toBe("complete");
    expect(demand.smallCohort).toBe(false);
  });

  it("8 of the 100 referred: the red dots of the grid", () => {
    expect(demand.referredPerHundred).toEqual({ lo: 8, hi: 8 });
  });

  it("the fill rate is 9 %, counted on searches", () => {
    expect(demand.fill).toEqual({ kind: "known", value: { lo: 9, hi: 9 }, confidence: "solid" });
    expect(demand.fillVariant).toBe("searches");
  });
});

describe("the sellers' funnel — the example of §22.10.2", () => {
  const { supply } = buildMktFunnel(marketplaceState(), CTX_FR);

  it("2 000 visitors of the sellers' page for 100 sign-ups, from the sellers' sign-up rate of 5 %", () => {
    expect(supply.visitorsPerHundred).toEqual({ lo: 2_000, hi: 2_000 });
    expect(supply.upstreamSource).toEqual({ kind: "tool", tool: "ga4" });
    expect(supply.upstreamPeriod).toBe("2026-08");
  });

  it("a first sale for 30, a subscription for 15: the same 100 sign-ups, the cohort of May", () => {
    expect(supply.columns).toEqual([
      { metric: "mkt.sell.first-sale", perHundred: { lo: 30, hi: 30 }, confidence: "solid", source: { kind: "tool", tool: "product-db" }, period: "2026-05" },
      { metric: "mkt.sell.paid-conversion", perHundred: { lo: 15, hi: 15 }, confidence: "solid", source: stripe, period: "2026-05" },
    ]);
    expect(supply.chain).toBe("complete");
    expect(supply.smallCohort).toBe(false);
  });

  it("3 % of the sellers leave a month, and 3 % of the paid sellers", () => {
    expect(supply.churn).toEqual({ kind: "known", value: { lo: 3, hi: 3 }, confidence: "solid" });
    expect(supply.paidChurn).toEqual({ kind: "known", value: { lo: 3, hi: 3 }, confidence: "solid" });
  });
});

describe("the four chains, on each side", () => {
  const unknown = missing("not-tracked", "sprint");

  it("the buyers: complete, gap, tail-break, empty", () => {
    expect(funnelWith({}).demand.chain).toBe("complete");
    // The sign-ups anchor the left: an unknown column followed by a known one is a gap (we see both sides of the hole)…
    expect(funnelWith({ "mkt.buy.first-order": unknown }).demand.chain).toBe("gap");
    // …unknowns only at the end are a tail-break (we lose them)…
    expect(funnelWith({ "mkt.buy.repeat": unknown }).demand.chain).toBe("tail-break");
    // …and both unknown is empty.
    expect(funnelWith({ "mkt.buy.first-order": unknown, "mkt.buy.repeat": unknown }).demand.chain).toBe("empty");
  });

  it("the sellers: complete, gap, tail-break, empty", () => {
    expect(funnelWith({}).supply.chain).toBe("complete");
    expect(funnelWith({ "mkt.sell.first-sale": unknown }).supply.chain).toBe("gap");
    expect(funnelWith({ "mkt.sell.paid-conversion": unknown }).supply.chain).toBe("tail-break");
    expect(funnelWith({ "mkt.sell.first-sale": unknown, "mkt.sell.paid-conversion": unknown }).supply.chain).toBe("empty");
  });

  it("the chains of the two sides never mix", () => {
    const funnel = funnelWith({ "mkt.buy.repeat": unknown });
    expect(funnel.demand.chain).toBe("tail-break");
    expect(funnel.supply.chain).toBe("complete");
    const other = funnelWith({ "mkt.sell.first-sale": unknown });
    expect(other.demand.chain).toBe("complete");
    expect(other.supply.chain).toBe("gap");
  });

  it("an unknown is never 0: a null column with no confidence, no source, no month", () => {
    const { demand, supply } = funnelWith({ "mkt.buy.first-order": unknown, "mkt.sell.paid-conversion": unknown });
    expect(demand.columns[0]).toEqual({ metric: "mkt.buy.first-order", perHundred: null, confidence: "unknown", source: null, period: null });
    expect(supply.columns[1]).toEqual({ metric: "mkt.sell.paid-conversion", perHundred: null, confidence: "unknown", source: null, period: null });
    // The known columns beside them are untouched.
    expect(demand.columns[1]!.perHundred).toEqual({ lo: 5, hi: 5 });
    expect(supply.columns[0]!.perHundred).toEqual({ lo: 30, hi: 30 });
  });

  it("an entry nobody has looked at (a todo) is as unknown as a missing one", () => {
    const { demand } = funnelWith({ "mkt.buy.repeat": undefined });
    expect(demand.columns[1]!.perHundred).toBeNull();
    expect(demand.chain).toBe("tail-break");
  });
});

describe("whole people per bound, and what a column cites", () => {
  it("an estimate is rounded per bound, approximate, and has no single source to cite", () => {
    const { demand } = funnelWith({ "mkt.buy.first-order": estimated(19.6, 21.4) });
    expect(demand.columns[0]).toMatchObject({ perHundred: { lo: 20, hi: 21 }, confidence: "approximate", source: null, period: "2026-05" });
  });

  it("a rate typed without counts is rounded too, and is approximate", () => {
    const { supply } = funnelWith({ "mkt.sell.paid-conversion": measured({ kind: "rate", percent: 14.6 }, stripe) });
    expect(supply.columns[1]).toMatchObject({ perHundred: { lo: 15, hi: 15 }, confidence: "approximate" });
  });

  it("a column on a cohort still filling up is approximate, by its own window", () => {
    // On 24 September July has had the 30 days of a first order, not the 90 of a second one nor the 60 of a first sale.
    const young = marketplaceState();
    young.snapshots[0]!.cohortMonth = "2026-07";
    const { demand, supply } = buildMktFunnel(young, CTX_FR);
    expect(demand.columns.map((c) => c.confidence)).toEqual(["solid", "approximate"]);
    expect(supply.columns.map((c) => c.confidence)).toEqual(["approximate", "approximate"]);
  });

  it("a measured entry that names no source cites none, for a column and for the sign-up rate", () => {
    const { demand } = funnelWith({
      "mkt.buy.first-order": measured(ratio(580, 2_900), undefined, { source: undefined }),
      "mkt.buy.signup-rate": measured(ratio(3_000, 60_000), undefined, { source: undefined }),
    });
    expect(demand.columns[0]).toMatchObject({ perHundred: { lo: 20, hi: 20 }, source: null });
    expect(demand.upstreamSource).toBeNull();
    expect(demand.visitorsPerHundred).toEqual({ lo: 2_000, hi: 2_000 });
  });

  it("a cohort month of the entry's own is the column's month", () => {
    const { demand } = funnelWith({ "mkt.buy.repeat": measured(ratio(145, 2_900), { kind: "tool", tool: "product-db" }, { cohortMonth: "2026-04" }) });
    expect(demand.columns.map((c) => c.period)).toEqual(["2026-05", "2026-04"]);
  });

  it("the visitors behind 100 sign-ups: 100 ÷ the rate; unknown without a rate, with no month and no source", () => {
    const wide = funnelWith({ "mkt.buy.signup-rate": measured(ratio(1_500, 60_000), { kind: "tool", tool: "ga4" }) });
    expect(wide.demand.visitorsPerHundred).toEqual({ lo: 4_000, hi: 4_000 });
    const none = funnelWith({ "mkt.buy.signup-rate": undefined, "mkt.sell.signup-rate": undefined });
    expect(none.demand).toMatchObject({ visitorsPerHundred: null, upstreamSource: null, upstreamPeriod: null });
    expect(none.supply).toMatchObject({ visitorsPerHundred: null, upstreamSource: null, upstreamPeriod: null });
    // The columns do not wait for the visitors.
    expect(none.demand.columns[0]!.perHundred).toEqual({ lo: 20, hi: 20 });
  });

  it("a sign-up rate typed as an estimate or a rate cites no source, and its range gives a range of visitors", () => {
    const { demand } = funnelWith({ "mkt.buy.signup-rate": estimated(4, 5) });
    expect(demand.upstreamSource).toBeNull();
    expect(demand.upstreamPeriod).toBe("2026-08");
    expect(demand.visitorsPerHundred).toEqual({ lo: 2_000, hi: 2_500 });
  });

  it("the referred share is rounded, and null when unknown", () => {
    expect(funnelWith({ "mkt.buy.referred-share": estimated(7.6, 9.4) }).demand.referredPerHundred).toEqual({ lo: 8, hi: 9 });
    expect(funnelWith({ "mkt.buy.referred-share": undefined }).demand.referredPerHundred).toBeNull();
  });
});

describe("the fill rate and the churns", () => {
  it("the fill rate's variant is the entry's: requests or searches", () => {
    expect(funnelWith({ "mkt.liq.fill-rate": measured(ratio(2_340, 26_000), amplitude, { variant: "requests" }) }).demand.fillVariant).toBe("requests");
    expect(funnelWith({ "mkt.liq.fill-rate": measured(ratio(2_340, 26_000), amplitude, { variant: "searches" }) }).demand.fillVariant).toBe("searches");
  });

  it("no variant, or one the catalogue does not know, is null", () => {
    expect(funnelWith({ "mkt.liq.fill-rate": measured(ratio(2_340, 26_000), amplitude) }).demand.fillVariant).toBeNull();
    expect(funnelWith({ "mkt.liq.fill-rate": measured(ratio(2_340, 26_000), amplitude, { variant: "orders" }) }).demand.fillVariant).toBeNull();
    expect(funnelWith({ "mkt.liq.fill-rate": undefined }).demand.fillVariant).toBeNull();
  });

  it("an unknown fill rate is an unknown (not 0), and the funnel does not wait for it", () => {
    const { demand } = funnelWith({ "mkt.liq.fill-rate": undefined });
    expect(demand.fill).toEqual({ kind: "unknown", why: "todo" });
    expect(demand.chain).toBe("complete");
  });

  it("an unknown churn is an unknown, on each side", () => {
    const { supply } = funnelWith({ "mkt.sell.churn": missing("no-access", "meeting"), "mkt.sell.paid-churn": undefined });
    expect(supply.churn).toEqual({ kind: "unknown", why: "no-access" });
    expect(supply.paidChurn).toEqual({ kind: "unknown", why: "todo" });
  });
});

describe("the sellers pay nothing (D9): a supply funnel of one column", () => {
  const state = marketplaceNoSubscriptionsState();
  const { supply, demand } = buildMktFunnel(state, CTX_FR);

  it("only the first sale; no visitors, no source, no month (the sellers' sign-up rate is not shown), no paid churn", () => {
    expect(supply.columns).toEqual([{ metric: "mkt.sell.first-sale", perHundred: { lo: 30, hi: 30 }, confidence: "solid", source: { kind: "tool", tool: "product-db" }, period: "2026-05" }]);
    expect(supply.visitorsPerHundred).toBeNull();
    expect(supply.upstreamSource).toBeNull();
    expect(supply.upstreamPeriod).toBeNull();
    expect(supply.paidChurn).toBeNull();
    expect(supply.chain).toBe("complete");
    expect(supply.churn).toEqual({ kind: "known", value: { lo: 3, hi: 3 }, confidence: "solid" });
  });

  it("a single column is complete when known and empty when not: no gap, no tail-break", () => {
    const lost = withEntry(state, "mkt.sell.first-sale", missing("not-tracked", "sprint"));
    expect(buildMktFunnel(lost, CTX_FR).supply.chain).toBe("empty");
  });

  it("the buyers' funnel does not move", () => {
    expect(demand).toEqual(buildMktFunnel(marketplaceState(), CTX_FR).demand);
  });

  it("the five numbers of the subscriptions stay stored: ticking the box again brings the second column back", () => {
    const paying = buildMktFunnel({ ...state, setup: { ...state.setup, sellerSubscriptions: true } }, CTX_FR);
    expect(paying.supply.columns.map((c) => c.metric)).toEqual(["mkt.sell.first-sale", "mkt.sell.paid-conversion"]);
    expect(paying.supply.visitorsPerHundred).toEqual({ lo: 2_000, hi: 2_000 });
  });
});

describe("the small cohort — the first step's denominator, under 100", () => {
  const smallBuyers = ratio(16, 80);

  it("the buyers' cohort: a first order typed on 80 sign-ups is small, and the sellers' cohort is not", () => {
    const { demand, supply } = funnelWith({ "mkt.buy.first-order": measured(smallBuyers, { kind: "tool", tool: "product-db" }) });
    expect(demand.smallCohort).toBe(true);
    expect(supply.smallCohort).toBe(false);
  });

  it("the sellers' cohort: a first sale typed on 40 sign-ups is small, and the buyers' cohort is not", () => {
    const { demand, supply } = funnelWith({ "mkt.sell.first-sale": measured(ratio(12, 40), { kind: "tool", tool: "product-db" }) });
    expect(supply.smallCohort).toBe(true);
    expect(demand.smallCohort).toBe(false);
  });

  it("a cohort of exactly 100 is not small", () => {
    expect(SMALL_COHORT_SIZE).toBe(100);
    const { demand, supply } = funnelWith({
      "mkt.buy.first-order": measured(ratio(20, SMALL_COHORT_SIZE), { kind: "tool", tool: "product-db" }),
      "mkt.sell.first-sale": measured(ratio(30, SMALL_COHORT_SIZE), { kind: "tool", tool: "product-db" }),
    });
    expect(demand.smallCohort).toBe(false);
    expect(supply.smallCohort).toBe(false);
    expect(funnelWith({ "mkt.buy.first-order": measured(ratio(19, SMALL_COHORT_SIZE - 1), { kind: "tool", tool: "product-db" }) }).demand.smallCohort).toBe(true);
  });

  it("only the first step's denominator counts: a second step on a small base, or a rate without counts, flags nothing", () => {
    const { demand, supply } = funnelWith({
      "mkt.buy.repeat": measured(ratio(4, 80), { kind: "tool", tool: "product-db" }),
      "mkt.sell.paid-conversion": measured(ratio(6, 40), stripe),
    });
    expect(demand.smallCohort).toBe(false);
    expect(supply.smallCohort).toBe(false);
    const rates = funnelWith({ "mkt.buy.first-order": measured({ kind: "rate", percent: 20 }, { kind: "tool", tool: "product-db" }), "mkt.sell.first-sale": estimated(25, 35) });
    expect(rates.demand.smallCohort).toBe(false);
    expect(rates.supply.smallCohort).toBe(false);
  });

  it("the sellers' cohort is read without the subscriptions too: the first sale is still shown", () => {
    const state = withEntry(marketplaceNoSubscriptionsState(), "mkt.sell.first-sale", measured(ratio(12, 40), { kind: "tool", tool: "product-db" }));
    expect(buildMktFunnel(state, CTX_FR).supply.smallCohort).toBe(true);
  });
});
