import { describe, expect, it } from "vitest";
import { MKT_DEMAND_CANDIDATE_IDS, MKT_SUPPLY_CANDIDATE_IDS, UNPRICED_CANDIDATES } from "../catalog-shape";
import { fillTemplate } from "../format";
import { impactHeadline, twelveMonthFactor } from "../impact";
import { SUPPLY_PRICED, mktRankingImpact, mktWhatIf } from "../mkt-impact";
import { mktLeverAlone } from "../mkt-scenario";
import { chainTemplate, worthOf } from "../phrases";
import type { EngineState, Impact, Interval, MktCandidateId } from "../types";
import { marketplaceNoSubscriptionsState, marketplaceState, measured, ratio, withEntry } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * What closing a gap is worth to each side of a marketplace (engine spec §22.5.5, A23 MKT-4), on the example of §22.10.1:
 * 600 new buyers a month at 2,34 € of net revenue each (0,3 orders × 65 € × 12 %), 4 % of the buyers leave a month, 14 000
 * are active on the 1st; 60 new paid sellers a month at 29 €, 3 % of the 900 paid sellers leave. The figures of §22.10.2
 * (468 and 351 € a month for the demand, 580 and 130,50 € for the supply, the chains, 4 531,30 € and 5 919,05 € in twelve
 * months) are also computed, without any engine code, by `docs/engine/reference/mkt-example.mjs`.
 *
 * Non-vacuity, measured on 2026-10-25 (each sabotage applied alone, this file and `diagnose-mkt.test.ts` run, then the
 * file restored and its sha compared; the count is the tests that fall — every sabotage made at least one fall):
 * see the entry of A23 MKT-4 in `JOURNAL.md` for the list.
 */

const tool = (t: "stripe" | "ga4") => ({ kind: "tool", tool: t }) as const;

/** The state with the targets of the example's what-ifs on top, one lever at a time. */
const withWhatIf = (state: EngineState, targets: EngineState["whatIf"]): EngineState => ({ ...state, whatIf: targets });

/** Plain spaces for the no-break ones the formatter prints: `copy-typography.test.ts` holds the glyphs, these tests the numbers. */
const spaced = (text: string) => text.replace(/\u00a0/g, " ");
const lineOf = (impact: Impact, key: string) => {
  const line = impact.lines.find((l) => l.key === key)!;
  return { ...line, values: Object.fromEntries(Object.entries(line.values).map(([k, v]) => [k, spaced(v)])) };
};
const keysOf = (impact: Impact) => impact.lines.map((l) => l.key);
const value = (i: Interval | undefined) => {
  expect(i, "a value").toBeTruthy();
  expect(i!.hi).toBeCloseTo(i!.lo, 9);
  return i!.lo;
};

/** The chain as the reader sees it: each line through its template, as the drawer and the slide print it. */
function printed(impact: Impact, locale: "fr" | "en" = "fr"): string[] {
  const words = (locale === "fr" ? FR : EN).strings.whatIf;
  return impact.lines.map((l) => spaced(fillTemplate(chainTemplate(l, impact, words, locale).template, l.values)));
}

describe("mktRankingImpact — the demand (D3, C66, C68)", () => {
  const state = marketplaceState();
  const rank = (id: MktCandidateId, target: number, s = state) => mktRankingImpact(s, id, target, CTX_FR);

  it("prices a flow by N × the relative gap × a: the fill rate to 12 % is 468 € a month, the first order to 25 % 351 €", () => {
    const fill = rank("mkt.liq.fill-rate", 12);
    expect(value(fill.gap)).toBeCloseTo(12 / 9 - 1, 9);
    expect(value(fill.mrr)).toBeCloseTo(600 * (12 / 9 - 1) * 2.34, 9);
    expect(value(fill.mrr)).toBeCloseTo(468, 9);
    expect(value(rank("mkt.buy.first-order", 25).mrr)).toBeCloseTo(351, 9);
    expect(value(rank("mkt.buy.signup-rate", 6).mrr)).toBeCloseTo(600 * 0.2 * 2.34, 9);
  });

  it("ranks the flows by their relative gap alone: the money is the same N × the same a for every one, so mrr ÷ gap is 1 404", () => {
    for (const [id, target] of [["mkt.liq.fill-rate", 12], ["mkt.buy.first-order", 25], ["mkt.buy.signup-rate", 6], ["mkt.buy.referred-share", 12]] as const) {
      const { gap, mrr } = rank(id, target);
      expect(value(mrr) / value(gap), id).toBeCloseTo(600 * 2.34, 9);
    }
  });

  it("prices the referred share as « the referred come on top »: (t − r) ÷ (100 − t), not t/r − 1, and not past 50 %", () => {
    const { gap } = rank("mkt.buy.referred-share", 12);
    expect(value(gap)).toBeCloseTo((12 - 8) / (100 - 12), 9);
    expect(rank("mkt.buy.referred-share", 60)).toEqual({});
    // A share at 0 has a gain (the referred all come on top); a rate at 0 has no « × t/r ».
    const none = withEntry(state, "mkt.buy.referred-share", measured(ratio(0, 2_900), tool("stripe")));
    expect(value(rank("mkt.buy.referred-share", 10, none).gap)).toBeCloseTo(10 / 90, 9);
    const noFill = withEntry(state, "mkt.liq.fill-rate", measured(ratio(0, 26_000), tool("ga4")));
    expect(rank("mkt.liq.fill-rate", 12, noFill)).toEqual({});
  });

  it("prices the buyers' churn on the active buyers kept: 14 000 × (4 % − 3 %) × 2,34 € = 327,60 €, never below 0", () => {
    expect(value(rank("mkt.buy.churn", 3).mrr)).toBeCloseTo(14_000 * 0.01 * 2.34, 9);
    expect(rank("mkt.buy.churn", 3).gap).toBeUndefined();
    // A target the churn already meets is worth nothing, never a loss.
    expect(value(rank("mkt.buy.churn", 5).mrr)).toBe(0);
  });

  it("never prices the second order (D4), and gives the money back as the gap alone when N or a is unknown", () => {
    expect(rank("mkt.buy.repeat", 10)).toEqual({});
    // N from neither the cost's count nor the sign-ups: no money, the relative gap still orders the flows.
    const noN = withEntry(withEntry(state, "mkt.buy.cac", measured({ kind: "amount", amount: 30 }, tool("ga4"))), "mkt.buy.signup-rate", measured({ kind: "rate", percent: 5 }, tool("ga4")));
    const unpriced = rank("mkt.liq.fill-rate", 12, noN);
    expect(unpriced.mrr).toBeUndefined();
    expect(value(unpriced.gap)).toBeCloseTo(1 / 3, 9);
    const noFrequency = withEntry(state, "mkt.rev.frequency", undefined);
    expect(rank("mkt.liq.fill-rate", 12, noFrequency).mrr).toBeUndefined();
    expect(rank("mkt.buy.churn", 3, noFrequency)).toEqual({});
    const noBase = withEntry(state, "mkt.buy.churn", measured({ kind: "rate", percent: 4 }, tool("stripe")));
    expect(rank("mkt.buy.churn", 3, noBase)).toEqual({});
  });
});

describe("mktRankingImpact — the supply, priced by the sellers' subscriptions only (C67, D4)", () => {
  const state = marketplaceState();
  const rank = (id: MktCandidateId, target: number, s = state) => mktRankingImpact(s, id, target, CTX_FR);

  it("prices the conversion to a paid seller as NS × the gap × the price: 60 × (20/15 − 1) × 29 = 580 € a month", () => {
    const conversion = rank("mkt.sell.paid-conversion", 20);
    expect(value(conversion.gap)).toBeCloseTo(20 / 15 - 1, 9);
    expect(value(conversion.mrr)).toBeCloseTo(580, 9);
  });

  it("prices the paid sellers' churn on the paid sellers kept: 900 × (3 % − 2,5 %) × 29 = 130,50 € a month", () => {
    expect(value(rank("mkt.sell.paid-churn", 2.5).mrr)).toBeCloseTo(130.5, 9);
    expect(value(rank("mkt.sell.paid-churn", 4).mrr)).toBe(0);
  });

  it("names the first sale, the active sellers' churn and the sellers' sign-up rate without an amount", () => {
    for (const id of ["mkt.sell.first-sale", "mkt.sell.churn", "mkt.sell.signup-rate"] as const) expect(rank(id, 50), id).toEqual({});
    expect(SUPPLY_PRICED).toEqual(["mkt.sell.paid-conversion", "mkt.sell.paid-churn"]);
    // `SUPPLY_PRICED` is the one list that says which of the supply has an amount: nothing of it is in the unpriced list.
    expect(SUPPLY_PRICED.filter((id) => UNPRICED_CANDIDATES.includes(id))).toEqual([]);
    expect(MKT_SUPPLY_CANDIDATE_IDS.filter((id) => !SUPPLY_PRICED.includes(id))).toEqual(["mkt.sell.signup-rate", "mkt.sell.first-sale", "mkt.sell.churn"]);
  });

  it("prices nothing when the sellers pay no subscription: their numbers stay stored, and read as nothing (D9)", () => {
    const none = marketplaceNoSubscriptionsState();
    expect(rank("mkt.sell.paid-conversion", 20, none)).toEqual({});
    expect(rank("mkt.sell.paid-churn", 2.5, none)).toEqual({});
    expect(mktWhatIf(none, "mkt.sell.paid-conversion", 20, CTX_FR, FR.strings.units)).toBeNull();
    expect(mktWhatIf(none, "mkt.sell.paid-churn", 2.5, CTX_FR, FR.strings.units)).toBeNull();
  });
});

describe("mktWhatIf — the demand's chain: the fill rate (§22.10.2)", () => {
  const state = marketplaceState();
  const impact = mktWhatIf(state, "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)!;

  it("builds today, if, then, times and annual from the numbers the reader sees: 600 × 12/9 = 800 (+200), × 2,34 € → ~470 €, ~4 500 € after a year", () => {
    expect(impact.kind).toBe("new-mrr");
    expect(keysOf(impact)).toEqual(["today", "if", "then", "times", "annual"]);
    expect(lineOf(impact, "today").values).toEqual({ rate: "9 %", n: "600" });
    expect(lineOf(impact, "if").values).toEqual({ target: "12 %" });
    expect(lineOf(impact, "then").values).toEqual({ n: "600", target: "12", rate: "9", m: "800", delta: "200" });
    expect(lineOf(impact, "times").values).toEqual({ arpa: "2,34 €", amount: "~470 €" });
    expect(lineOf(impact, "annual").values).toEqual({ amount: "~4 500 €" });
    expect(spaced(fillTemplate(FR.strings.whatIf.thenFlow, lineOf(impact, "then").values))).toBe("600 × 12/9 = 800 (+200)");
    expect(impact.customersPerMonth).toEqual({ lo: 200, hi: 200 });
    expect(impactHeadline(impact)).toEqual({ amount: expect.stringMatching(/^~470.€$/) });
    expect(spaced(worthOf(impact, FR.strings, "fr")!)).toBe("~470 € de MRR nouveau par mois");
  });

  it("recomputes on a calculator from the line above: 200 × 2,34 € = 468 €, and 468 € over twelve months of a 4 % churn is 4 531,30 €", () => {
    expect(value(impact.mrrPerMonth)).toBeCloseTo(200 * 2.34, 9);
    expect(value(impact.mrrAfter12Months)).toBeCloseTo(468 * twelveMonthFactor(4), 9);
    expect(value(impact.mrrAfter12Months)).toBeCloseTo(4_531.3, 1);
    // The ranking's exact value is the chain's, to the float: the same N, the same a.
    expect(value(mktRankingImpact(state, "mkt.liq.fill-rate", 12, CTX_FR).mrr)).toBeCloseTo(value(impact.mrrPerMonth), 9);
  });

  it("says the same in English, with the same numbers", () => {
    const en = mktWhatIf(state, "mkt.liq.fill-rate", 12, CTX_EN, EN.strings.units)!;
    expect(lineOf(en, "times").values).toEqual({ arpa: "€2.34", amount: "~€470" });
    expect(lineOf(en, "annual").values.amount).toBe("~€4,500");
    expect(lineOf(en, "then").values.delta).toBe("200");
  });

  it("is the last line of the lever alone: the gain of the fill rate on its own, 4 531,30 €, is the chain's annual figure", () => {
    const alone = mktLeverAlone(withWhatIf(state, { "mkt.liq.fill-rate": 12 }), "mkt.liq.fill-rate", CTX_FR)!;
    const gain = alone.projected.kpis.mrr12!.lo - alone.today.kpis.mrr12!.lo;
    expect(gain).toBeCloseTo(value(impact.mrrAfter12Months), 6);
  });

  it("prices the first order (351 € → ~350 €) and the sign-up rate the same way, each on its own displayed numbers", () => {
    const first = mktWhatIf(state, "mkt.buy.first-order", 25, CTX_FR, FR.strings.units)!;
    expect(lineOf(first, "then").values).toEqual({ n: "600", target: "25", rate: "20", m: "750", delta: "150" });
    expect(lineOf(first, "times").values.amount).toBe("~350 €");
    const signups = mktWhatIf(state, "mkt.buy.signup-rate", 6, CTX_FR, FR.strings.units)!;
    expect(lineOf(signups, "then").values).toMatchObject({ rate: "5", target: "6", m: "720", delta: "120" });
  });

  it("recomputes every flow on a grid: m = round(n × target ÷ rate), delta = m − n, amount = delta × a — from the rates the reader sees, not the exact ones", () => {
    const number = (text: string) => Number(text.replace(/[\s\u00a0%]/g, "").replace(",", "."));
    let checked = 0;
    for (const [count, requests] of [[2_379, 26_000], [2_340, 26_000], [1_900, 26_000]] as const) {
      const s = withEntry(state, "mkt.liq.fill-rate", measured(ratio(count, requests), tool("ga4")));
      for (const target of [11, 12.5, 15]) {
        const chain = mktWhatIf(s, "mkt.liq.fill-rate", target, CTX_FR, FR.strings.units);
        if (!chain) continue;
        const [rate, shownTarget] = [number(lineOf(chain, "today").values.rate!), number(lineOf(chain, "if").values.target!)];
        const [n, m, delta] = ["n", "m", "delta"].map((k) => number(lineOf(chain, "then").values[k]!));
        expect(m, `${count} ${target}`).toBe(Math.round((n! * shownTarget) / rate));
        expect(delta, `${count} ${target}`).toBe(m! - n!);
        expect(value(chain.mrrPerMonth), `${count} ${target}`).toBeCloseTo(delta! * 2.34, 9);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(6);
  });

  it("is null for a target that is no improvement, an unpriced candidate or an unknown value; the gain stays unsaid until the slider moves", () => {
    expect(mktWhatIf(state, "mkt.liq.fill-rate", 9, CTX_FR, FR.strings.units)).toBeNull();
    expect(mktWhatIf(state, "mkt.liq.fill-rate", 5, CTX_FR, FR.strings.units)).toBeNull();
    expect(mktWhatIf(state, "mkt.buy.repeat", 10, CTX_FR, FR.strings.units)).toBeNull();
    expect(mktWhatIf(state, "mkt.buy.referred-share", 60, CTX_FR, FR.strings.units)).toBeNull();
    expect(mktWhatIf(withEntry(state, "mkt.liq.fill-rate", undefined), "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)).toBeNull();
  });

  it("has no per-100 chain when the month's volume is unknown: a marketplace says nothing it cannot count", () => {
    const noN = withEntry(withEntry(state, "mkt.buy.cac", measured({ kind: "amount", amount: 30 }, tool("ga4"))), "mkt.buy.signup-rate", measured({ kind: "rate", percent: 5 }, tool("ga4")));
    expect(mktWhatIf(noN, "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)).toBeNull();
  });

  it("keeps the customers when a revenue per buyer is unknown, and says « less than one » when the gain rounds under one buyer", () => {
    const noRevenue = withEntry(state, "mkt.rev.frequency", undefined);
    const customers = mktWhatIf(noRevenue, "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)!;
    expect(customers.kind).toBe("customers");
    expect(keysOf(customers)).toEqual(["today", "if", "then"]);
    expect(spaced(worthOf(customers, FR.strings, "fr")!)).toBe("200 clients payants de plus par mois");
    const tiny = withEntry(state, "mkt.buy.cac", measured(ratio(60, 3), tool("stripe")));
    const lessThanOne = mktWhatIf(tiny, "mkt.liq.fill-rate", 9.1, CTX_FR, FR.strings.units)!;
    expect(keysOf(lessThanOne)).toEqual(["today", "if", "then", "less-than-one"]);
    expect(worthOf(lessThanOne, FR.strings, "fr")).toBe(FR.strings.worth.lessThanOne);
  });

  it("shows whole percents on a small cohort for the cohort rates only: the first order, not the fill rate or the sign-up rate", () => {
    // 7 of 80 sign-ups placed a first order: 8,75 %, an 80-people cohort. The fill rate counts a month's requests, not a cohort.
    const small = withEntry(withEntry(state, "mkt.buy.first-order", measured(ratio(7, 80), tool("stripe"))), "mkt.liq.fill-rate", measured(ratio(2_379, 26_000), tool("ga4")));
    expect(lineOf(mktWhatIf(small, "mkt.buy.first-order", 25, CTX_FR, FR.strings.units)!, "today").values.rate).toBe("9 %");
    expect(lineOf(mktWhatIf(small, "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)!, "today").values.rate).toBe("9,2 %");
    // The same first order on a big cohort keeps its decimal.
    const big = withEntry(state, "mkt.buy.first-order", measured(ratio(175, 2_000), tool("stripe")));
    expect(lineOf(mktWhatIf(big, "mkt.buy.first-order", 25, CTX_FR, FR.strings.units)!, "today").values.rate).toBe("8,8 %");
  });
});

describe("mktWhatIf — the referred share comes on top of the others", () => {
  it("prints its own then-line: 600 × (100 – 8)/(100 – 12) = 627 (+27), through the referral template", () => {
    const state = marketplaceState();
    const impact = mktWhatIf(state, "mkt.buy.referred-share", 12, CTX_FR, FR.strings.units)!;
    expect(lineOf(impact, "then").values).toEqual({ n: "600", target: "12", rate: "8", m: "627", delta: "27" });
    // Not « 600 × 12/8 = 900 »: the template that fits the arithmetic is the SaaS's referral one.
    expect(printed(impact)[2]).toBe("600 × (100 – 8)/(100 – 12) = 627 (+27)");
    expect(printed(mktWhatIf(state, "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)!)[2]).toBe("600 × 12/9 = 800 (+200)");
  });
});

describe("mktWhatIf — the supply's chain: the conversion to a paid seller (§22.10.2)", () => {
  const state = marketplaceState();
  const impact = mktWhatIf(state, "mkt.sell.paid-conversion", 20, CTX_FR, FR.strings.units)!;

  it("builds 60 × 20/15 = 80 (+20), × 29 € → ~580 € of subscription MRR, ~5 900 € after a year", () => {
    expect(keysOf(impact)).toEqual(["today", "if", "then", "times", "annual"]);
    expect(lineOf(impact, "today").values).toEqual({ rate: "15 %", n: "60" });
    expect(lineOf(impact, "then").values).toEqual({ n: "60", target: "20", rate: "15", m: "80", delta: "20" });
    expect(lineOf(impact, "times").values).toEqual({ arpa: "29 €", amount: "~580 €" });
    expect(lineOf(impact, "annual").values.amount).toBe("~5 900 €");
    expect(value(impact.mrrPerMonth)).toBeCloseTo(580, 9);
    expect(value(impact.mrrAfter12Months)).toBeCloseTo(580 * twelveMonthFactor(3), 9);
    expect(value(impact.mrrAfter12Months)).toBeCloseTo(5_919.05, 2);
  });

  it("is the last line of the conversion on its own: 5 919,05 €", () => {
    const alone = mktLeverAlone(withWhatIf(state, { "mkt.sell.paid-conversion": 20 }), "mkt.sell.paid-conversion", CTX_FR)!;
    expect(alone.projected.kpis.mrr12!.lo - alone.today.kpis.mrr12!.lo).toBeCloseTo(value(impact.mrrAfter12Months), 6);
  });

  it("goes by the paid sellers' churn when the churn is the paid churn, not the active sellers'", () => {
    // The month's decay is the paid sellers' 3 % (twelveMonthFactor(3) = 10,21), not the buyers' 4 %.
    expect(twelveMonthFactor(3)).not.toBeCloseTo(twelveMonthFactor(4), 2);
    const buyersToo = withEntry(state, "mkt.buy.churn", measured(ratio(1_400, 14_000), tool("stripe")));
    expect(mktWhatIf(buyersToo, "mkt.sell.paid-conversion", 20, CTX_FR, FR.strings.units)!.mrrAfter12Months).toEqual(impact.mrrAfter12Months);
  });

  it("does not price the first sale, the active sellers' churn or the sign-up rate", () => {
    for (const id of ["mkt.sell.first-sale", "mkt.sell.churn", "mkt.sell.signup-rate"] as const) expect(mktWhatIf(state, id, 50, CTX_FR, FR.strings.units), id).toBeNull();
  });
});

describe("mktWhatIf — a churn counts the customers it keeps, on each side", () => {
  const state = marketplaceState();

  it("the buyers' churn to 3 %: 14 000 × (4 % – 3 %) = 140 buyers kept a month, × 2,34 € → ~330 €, ~3 300 € after a year", () => {
    const impact = mktWhatIf(state, "mkt.buy.churn", 3, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("retained-mrr");
    expect(keysOf(impact)).toEqual(["today", "if", "then", "times", "annual"]);
    expect(lineOf(impact, "today").values).toEqual({ churn: "4 %", base: "14 000" });
    expect(lineOf(impact, "then").values).toEqual({ base: "14 000", churn: "4 %", target: "3 %", n: "140" });
    expect(lineOf(impact, "times").values).toEqual({ arpa: "2,34 €", amount: "~330 €" });
    expect(value(impact.mrrPerMonth)).toBeCloseTo(327.6, 9);
    // The annual decays with the churn AFTER the change: the target for churn itself.
    expect(value(impact.mrrAfter12Months)).toBeCloseTo(327.6 * twelveMonthFactor(3), 9);
    expect(impactHeadline(impact)).toEqual({ amount: expect.stringMatching(/^~330.€$/) });
    expect(spaced(worthOf(impact, FR.strings, "fr")!)).toBe("~330 € de MRR préservé par mois");
  });

  it("the paid sellers' churn to 2,5 %: 900 × (3 % – 2,5 %) = 5 paid sellers kept, × 29 € → ~150 €", () => {
    const impact = mktWhatIf(state, "mkt.sell.paid-churn", 2.5, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("retained-mrr");
    expect(lineOf(impact, "today").values).toEqual({ churn: "3 %", base: "900" });
    expect(lineOf(impact, "then").values).toEqual({ base: "900", churn: "3 %", target: "2,5 %", n: "5" });
    expect(lineOf(impact, "times").values).toEqual({ arpa: "29 €", amount: "~150 €" });
    expect(impactHeadline(impact)).toEqual({ amount: expect.stringMatching(/^~150.€$/) });
  });

  it("is the churn's own chain, not a flow's: the template of each line is the churn's (« 14 000 × (4 % – 3 %) = 140 … gardés »)", () => {
    const lines = printed(mktWhatIf(state, "mkt.buy.churn", 3, CTX_FR, FR.strings.units)!);
    expect(lines[0]).toBe("4 % de churn sur 14 000 clients payants");
    expect(lines[2]).toBe("14 000 × (4 % – 3 %) = 140 clients gardés par mois");
    // A flow's lines are not the churn's: the same function reads the metric, not the id of the SaaS's churn.
    expect(printed(mktWhatIf(state, "mkt.liq.fill-rate", 12, CTX_FR, FR.strings.units)!)[0]).not.toContain("de churn");
  });

  it("says the customers kept when the revenue is unknown, and nothing when the base or the target is unusable", () => {
    const noRevenue = mktWhatIf(withEntry(state, "mkt.rev.take-rate", undefined), "mkt.buy.churn", 3, CTX_FR, FR.strings.units)!;
    expect(noRevenue.kind).toBe("customers");
    expect(keysOf(noRevenue)).toEqual(["today", "if", "then"]);
    expect(mktWhatIf(state, "mkt.buy.churn", 4, CTX_FR, FR.strings.units)).toBeNull();
    expect(mktWhatIf(state, "mkt.buy.churn", 6, CTX_FR, FR.strings.units)).toBeNull();
    const noBase = withEntry(state, "mkt.buy.churn", measured({ kind: "rate", percent: 4 }, tool("stripe")));
    expect(mktWhatIf(noBase, "mkt.buy.churn", 3, CTX_FR, FR.strings.units)).toBeNull();
  });
});

describe("the lists the diagnosis ranks", () => {
  it("every candidate of a side is either priced by the supply's list, a flow of the demand, a churn, or named without an amount", () => {
    // D4 and C67 made explicit: which of the eleven has an amount. A new candidate is a decision (a test pins it).
    const priced = [...MKT_DEMAND_CANDIDATE_IDS, ...MKT_SUPPLY_CANDIDATE_IDS].filter((id) => !UNPRICED_CANDIDATES.includes(id));
    expect(priced).toEqual(["mkt.buy.signup-rate", "mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.buy.referred-share", "mkt.buy.churn", "mkt.sell.paid-conversion", "mkt.sell.paid-churn"]);
    expect(priced.filter((id) => !(MKT_DEMAND_CANDIDATE_IDS as readonly string[]).includes(id))).toEqual([...SUPPLY_PRICED]);
  });
});
