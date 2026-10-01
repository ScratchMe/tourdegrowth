import { describe, expect, it } from "vitest";
import { fillTemplate, roundDisplay, roundSignificant } from "../format";
import { formatAmount, impactHeadline, newPayersPerMonth, payingBase, rankingImpact, sliderStart, sliderStep, whatIf } from "../impact";
import type { EngineState, Impact } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { EXAMPLE_EXPECTED, estimated, exampleState, measured, ratio, withEntry } from "./fixtures";

// Engine spec §13.1 "impact". Non-vacuity, measured: building the chain
// from the EXACT rate instead of the displayed one fails the recompute grid
// only — the example passes, because 144/800 is exactly 18; that is why the
// grid includes rates like 3.1538 that print as "3.2".

const tool = { kind: "tool", tool: "stripe" } as const;
const lineOf = (impact: Impact, key: string) => impact.lines.find((l) => l.key === key)!;

describe("whatIf — the §6.6 example", () => {
  it("activation to 20 %: 42 × 20/18 = 47 (+5), × 120 € → ~600 €, ~6 300 € after a year", () => {
    const impact = whatIf(exampleState(), "act.rate", 20, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("new-mrr");
    expect(impact.lines.map((l) => l.key)).toEqual(["today", "if", "then", "times", "annual"]);
    expect(fillTemplate(FR.strings.whatIf.thenFlow, lineOf(impact, "then").values)).toBe(EXAMPLE_EXPECTED.leakChain);
    expect(lineOf(impact, "today").values).toEqual({ rate: "18 %", n: "42" });
    expect(lineOf(impact, "if").values).toEqual({ target: "20 %" });
    expect(lineOf(impact, "times").values).toEqual({ arpa: "120 €", amount: EXAMPLE_EXPECTED.leakAmount.fr });
    expect(lineOf(impact, "annual").values.amount).toBe(EXAMPLE_EXPECTED.annualAmount.fr);
    expect(impact.customersPerMonth).toEqual({ lo: 5, hi: 5 });
    expect(impact.mrrPerMonth).toEqual({ lo: 600, hi: 600 });
    expect(impactHeadline(impact)).toEqual({ amount: EXAMPLE_EXPECTED.leakAmount.fr });
    const en = whatIf(exampleState(), "act.rate", 20, CTX_EN, EN.strings.units)!;
    expect(lineOf(en, "times").values.amount).toBe(EXAMPLE_EXPECTED.leakAmount.en);
    expect(lineOf(en, "annual").values.amount).toBe(EXAMPLE_EXPECTED.annualAmount.en);
  });

  it("churn to 2 %: 400 × (2,5 % − 2 %) = 2 kept, × 120 € → ~240 €", () => {
    const impact = whatIf(exampleState(), "ret.logo-churn", 2, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("retained-mrr");
    expect(lineOf(impact, "then").values).toMatchObject({ base: "400", churn: "2,5 %", target: "2 %", n: "2" });
    expect(lineOf(impact, "times").values.amount).toBe(EXAMPLE_EXPECTED.churnAmount.fr);
  });
});

describe("whatIf — day-30 retention and the referred share, by hand on the example (§19.3)", () => {
  it("day 30 at 25 %, to 30 %: 42 × 30/25 = 50 (+8), × 120 € → ~960 €, the flows' own chain", () => {
    const state = withEntry(exampleState(), "ret.d30", measured(ratio(200, 800)));
    const impact = whatIf(state, "ret.d30", 30, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("new-mrr");
    expect(impact.lines.map((l) => l.key)).toEqual(["today", "if", "then", "times", "annual"]);
    expect(lineOf(impact, "today").values).toEqual({ rate: "25 %", n: "42" });
    expect(fillTemplate(FR.strings.whatIf.thenFlow, lineOf(impact, "then").values)).toBe("42 × 30/25 = 50 (+8)");
    expect(lineOf(impact, "times").values).toEqual({ arpa: "120 €", amount: "~960 €" });
    expect(impact.customersPerMonth).toEqual({ lo: 8, hi: 8 });
    expect(impactHeadline(impact)).toEqual({ amount: "~960 €" });
    // The ranking prices the same gap on the same N and ARPA: 42 × (30/25 − 1) × 120.
    expect(rankingImpact(state, "ret.d30", 30, CTX_FR).mrr!.lo).toBeCloseTo(1_008);
  });

  it("the referred share at 6 %, to 10 %: 42 × (100 – 6)/(100 – 10) = 44 (+2), × 120 € → ~240 €", () => {
    const impact = whatIf(exampleState(), "ref.referred-share", 10, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("new-mrr");
    expect(lineOf(impact, "today").values).toEqual({ rate: "6 %", n: "42" });
    expect(fillTemplate(FR.strings.whatIf.thenReferral, lineOf(impact, "then").values)).toBe("42 × (100 – 6)/(100 – 10) = 44 (+2)");
    expect(lineOf(impact, "times").values.amount).toBe("~240 €");
    // The « Et si »'s own rule, (1 − r) ÷ (1 − t), on the same N: 42 × 4/90 × 120 = 224 €.
    expect(rankingImpact(exampleState(), "ref.referred-share", 10, CTX_FR).mrr!.lo).toBeCloseTo(224);
    const en = whatIf(exampleState(), "ref.referred-share", 10, CTX_EN, EN.strings.units)!;
    expect(fillTemplate(EN.strings.whatIf.thenReferral, lineOf(en, "then").values)).toBe("42 × (100 – 6)/(100 – 10) = 44 (+2)");
  });

  it("without N, per 100 sign-ups: the paid conversion grows by the same factor", () => {
    let noN = withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool));
    noN = withEntry(noN, "acq.signup-rate", measured({ kind: "rate", percent: 3.2 }));
    const impact = whatIf(noN, "ref.referred-share", 10, CTX_FR, FR.strings.units)!;
    expect(impact.kind).toBe("per-hundred");
    // 6 to 9 payers per 100 sign-ups, × 94/90: 6,3 to 9,4 (+0,3 to 0,4).
    expect(lineOf(impact, "then").values).toEqual({ n: "6 à 9", rate: "6", target: "10", m: "6,3 à 9,4", delta: "0,3 à 0,4" });
  });
});

describe("whatIf — every displayed line recomputes from the one above", () => {
  /** "1,234" → 1234, "~€600" → 600, "€119.50" → 119.5 (English display). */
  const num = (s: string) => Number(s.replace(/[~€,%]/g, ""));

  it("over a grid of N, rates, targets and ARPA (points)", () => {
    let checked = 0;
    for (const n of [3, 17, 42, 260, 1_234]) {
      for (const rate of [0.84, 3.1538, 7.25, 18, 33.3]) {
        for (const lift of [1.07, 1.25, 2]) {
          for (const arpa of [9.9, 48, 120, 1_250.5]) {
            let state: EngineState = withEntry(exampleState(), "acq.cac", measured(ratio(500 * n, n), tool));
            state = withEntry(state, "act.rate", measured({ kind: "rate", percent: rate }));
            state = withEntry(state, "rev.arpa", measured({ kind: "amount", amount: arpa }, tool));
            const impact = whatIf(state, "act.rate", rate * lift, CTX_EN, EN.strings.units);
            if (!impact) {
              // Only when the displayed target doesn't beat the displayed rate.
              expect(roundDisplay(rate * lift)).toBeLessThanOrEqual(roundDisplay(rate));
              continue;
            }
            const then = lineOf(impact, "then").values;
            const [nD, tD, rD, mD, dD] = [then.n!, then.target!, then.rate!, then.m!, then.delta!].map(num) as [number, number, number, number, number];
            expect(num(lineOf(impact, "today").values.rate!)).toBe(rD);
            expect(num(lineOf(impact, "if").values.target!)).toBe(tD);
            expect(mD).toBe(Math.round((nD * tD) / rD));
            expect(dD).toBe(Math.max(0, mD - nD));
            const times = impact.lines.find((l) => l.key === "times");
            if (dD < 1) {
              expect(times).toBeUndefined();
              expect(impact.lines.some((l) => l.key === "less-than-one")).toBe(true);
            } else {
              const arpaD = num(times!.values.arpa!);
              expect(num(times!.values.amount!)).toBe(roundSignificant(dD * arpaD, 2));
            }
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(250);
  });

  it("the referred share: m = n × (100 – r)/(100 – t), from the displayed numbers (§19.3.2)", () => {
    let checked = 0;
    for (const n of [3, 42, 1_234]) {
      for (const share of [0, 2.5, 6, 18, 41]) {
        for (const target of [5, 12, 30, 50]) {
          let state: EngineState = withEntry(exampleState(), "acq.cac", measured(ratio(500 * n, n), tool));
          state = withEntry(state, "ref.referred-share", measured({ kind: "rate", percent: share }));
          const impact = whatIf(state, "ref.referred-share", target, CTX_EN, EN.strings.units);
          if (!impact) {
            expect(target).toBeLessThanOrEqual(share);
            continue;
          }
          const then = lineOf(impact, "then").values;
          const [nD, tD, rD, mD, dD] = [then.n!, then.target!, then.rate!, then.m!, then.delta!].map(num) as [number, number, number, number, number];
          expect(mD).toBe(Math.round((nD * (100 - rD)) / (100 - tD)));
          expect(dD).toBe(Math.max(0, mD - nD));
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(40);
  });
});

describe("whatIf — edges", () => {
  it("fewer than one more customer: no amount", () => {
    const tiny = withEntry(exampleState(), "acq.cac", measured(ratio(1_500, 3), tool));
    const impact = whatIf(tiny, "act.rate", 20, CTX_FR, FR.strings.units)!;
    expect(impact.lines.map((l) => l.key)).toEqual(["today", "if", "then", "less-than-one"]);
    expect(impact.mrrPerMonth).toBeUndefined();
    expect(impactHeadline(impact).amount).toBeUndefined();
  });

  it("no gain is shown until the target beats what the reader sees", () => {
    expect(whatIf(exampleState(), "act.rate", 18, CTX_FR, FR.strings.units)).toBeNull();
    expect(whatIf(exampleState(), "act.rate", 18.4, CTX_FR, FR.strings.units)).toBeNull();
    expect(whatIf(exampleState(), "ret.logo-churn", 2.5, CTX_FR, FR.strings.units)).toBeNull();
  });

  it("an unknown value has no chain; a referred share past a 50 % target has none either (§19.3.2)", () => {
    // The example's day 30 is missing.
    expect(whatIf(exampleState(), "ret.d30", 30, CTX_FR, FR.strings.units)).toBeNull();
    expect(whatIf(withEntry(exampleState(), "act.rate", undefined), "act.rate", 20, CTX_FR, FR.strings.units)).toBeNull();
    expect(whatIf(exampleState(), "ref.referred-share", 51, CTX_FR, FR.strings.units)).toBeNull();
    expect(whatIf(exampleState(), "ref.referred-share", 50, CTX_FR, FR.strings.units)).not.toBeNull();
  });

  it("a rate at 0 has no « × t/r », but a referred share at 0 has its gain: the referred all come on top", () => {
    const zero = withEntry(withEntry(exampleState(), "ret.d30", measured(ratio(0, 800))), "ref.referred-share", measured(ratio(0, 800)));
    expect(whatIf(zero, "ret.d30", 20, CTX_FR, FR.strings.units)).toBeNull();
    // 42 × (100 – 0)/(100 – 10) = 46,7 → 47 (+5).
    expect(lineOf(whatIf(zero, "ref.referred-share", 10, CTX_FR, FR.strings.units)!, "then").values).toMatchObject({ n: "42", m: "47", delta: "5" });
  });

  it("ARPA unknown → customers a month; N unknown → per 100 sign-ups", () => {
    const noArpa = whatIf(withEntry(exampleState(), "rev.arpa", undefined), "act.rate", 20, CTX_FR, FR.strings.units)!;
    expect(noArpa.kind).toBe("customers");
    expect(noArpa.lines.map((l) => l.key)).toEqual(["today", "if", "then"]);
    // The count travels with the figure: the noun of the title and of the chain agree with it as printed.
    expect(impactHeadline(noArpa)).toEqual({ n: "5", count: { lo: 5, hi: 5 } });
    let noN = withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool));
    noN = withEntry(noN, "acq.signup-rate", measured({ kind: "rate", percent: 3.2 }));
    expect(newPayersPerMonth(noN, CTX_FR)).toBeNull();
    const perHundred = whatIf(noN, "act.rate", 20, CTX_FR, FR.strings.units)!;
    expect(perHundred.kind).toBe("per-hundred");
    // Upstream of sign-up, "per 100 sign-ups" means nothing.
    expect(whatIf(noN, "acq.signup-rate", 5, CTX_FR, FR.strings.units)).toBeNull();
  });

  it("N falls back to sign-ups × paid conversion when the CAC has no counts", () => {
    const state = withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool));
    const n = newPayersPerMonth(state, CTX_FR)!;
    expect(n.measured).toBe(false);
    expect(n.value.lo).toBeCloseTo(49.2, 9);
    expect(n.value.hi).toBeCloseTo(73.8, 9);
    expect(newPayersPerMonth(exampleState(), CTX_FR)).toEqual({ value: { lo: 42, hi: 42 }, measured: true });
    expect(payingBase(exampleState())).toBe(400);
  });

  it("the exact ranking value: N × (t/r − 1) × ARPA, floored at 0", () => {
    const r = rankingImpact(exampleState(), "act.rate", 20, CTX_FR);
    expect(r.gap!.lo).toBeCloseTo(1 / 9, 12);
    expect(r.mrr!.lo).toBeCloseTo(560, 9);
    expect(rankingImpact(exampleState(), "act.rate", 10, CTX_FR).gap).toEqual({ lo: 0, hi: 0 });
    const ranged = rankingImpact(withEntry(exampleState(), "act.rate", estimated(16, 20)), "act.rate", 20, CTX_FR);
    expect(ranged.gap).toEqual({ lo: 0, hi: 0.25 });
  });

  it("the slider starts at the team's target, else at the value — never at a published reference (C1)", () => {
    expect(sliderStart({ lo: 18, hi: 18 }, { lo: 30, hi: 30, direction: "higher" })).toBe(30);
    expect(sliderStart({ lo: 2.5, hi: 2.5 }, { lo: 2, hi: 2, direction: "lower" })).toBe(2);
    expect(sliderStart({ lo: 7, hi: 7 }, undefined)).toBe(7);
    expect(sliderStep(18)).toBe(1);
    expect(sliderStep(3.2)).toBe(0.1);
    expect(formatAmount(21_000, exampleState(), CTX_EN)).toBe("€21,000");
  });
});
