import { describe, expect, it } from "vitest";
import { div, mul, scale } from "../interval";
import { PAYBACK_FLOOR_MONTHS, acquisitionSpend, afterPayback, arrOf, cashTiedUp, lossCheck, paybackLimit, paybackWarning } from "../money";
import { buildScenario, leverAlone, mrrPath } from "../scenario";
import { buildSlgScenario, slgMrrPath } from "../slg-scenario";
import { addBoth, buildTotal, sumPaths, timesTwelve } from "../total";
import type { EngineState, Interval, LeverId } from "../types";
import { lifetimeMonths, unitEconomics } from "../unit-economics";
import { FILM_LEVERS, exampleState, filmState, hybridState, measured, ratio, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

/**
 * The money of the engine (engine spec §20, A20): the ARR, the MRR month by
 * month, the LTV:CAC in « Et si », the loss check, the payback against the
 * customer's lifetime and the cash a month of acquisition keeps tied up.
 *
 * The film « Le moteur » (`marketing/motion/`) prints a SaaS computed « with
 * the engine's formulas »: the first block holds the film to the model, so the
 * film can only show what the engine computes.
 *
 * Non-vacuity, measured on 2026-10-03:
 * - the spend taken from the projected payers × the projected CAC (instead
 *   of today's) fails « the spend never moves »: the two intervals widen;
 * - `ltv.hi <= cac.lo` for a loss fails « break-even is not a loss »;
 * - the steady-state sum without « ÷ 2 » fails the film's cash figures;
 * - an annual sales-assisted base moving geometrically, not in a straight
 *   line, fails « half-way through the year, half the NRR ».
 *
 * One hardening no test can fail on (TESTING.md §1.2): the straight line is
 * written M × (1 − m/12) + M × f × (m/12), so its twelfth point is M × f with
 * the very operations the MRR in twelve months always used. Written
 * M × (1 + (f − 1) × m/12), the goldens still pass — on the example's NRR
 * (1.04 and 1.08), 1 + (f − 1) is f to the bit. The MRR in twelve months IS
 * the curve's last point by construction; the form keeps it equal to the old
 * figure for every NRR, not only those.
 */

const mid = (i: Interval | null | undefined) => (i ? (i.lo + i.hi) / 2 : Number.NaN);

describe("the film's SaaS, through the engine's own model", () => {
  const today = buildScenario(filmState(), {}, CTX_FR).today.kpis;
  const three = buildScenario(filmState(), FILM_LEVERS, CTX_FR).projected.kpis;

  it("today: LTV 1 500 €, LTV:CAC 0.79, payback 21 months, a customer stays ~17 months", () => {
    expect(mid(today.ltv)).toBeCloseTo(1_500, 6);
    expect(mid(today.ltvCac)).toBeCloseTo(1_500 / 1_900, 9);
    expect(Math.round(mid(today.payback))).toBe(21);
    expect(mid(today.lifetime)).toBeCloseTo(100 / 6, 9);
  });

  it("today: the MRR in twelve months is 80 212 €, the ARR 963 k€ today's pace says", () => {
    expect(Math.round(mid(today.mrr12))).toBe(80_212);
    expect(mid(today.arr)).toBe(576_000);
    expect(Math.round(mid(today.arr12) / 1_000)).toBe(963);
  });

  it("with the three levers: LTV 2 250 €, LTV:CAC 1.58, payback 16 months, MRR in twelve months 122 402 €, ARR 1 469 k€", () => {
    expect(mid(three.ltv)).toBeCloseTo(2_250, 6);
    expect(mid(three.cac)).toBeCloseTo(1_425, 6); // activation at the same spend: 1 900 × 18/24
    expect(mid(three.ltvCac)).toBeCloseTo(2_250 / 1_425, 9);
    expect(Math.round(mid(three.payback))).toBe(16);
    expect(Math.round(mid(three.mrr12))).toBe(122_402);
    expect(Math.round(mid(three.arr12) / 1_000)).toBe(1_469);
    expect(Math.round((mid(three.arr12) - mid(today.arr12)) / 1_000)).toBe(506);
  });

  it("each lever alone adds 13 344 €, 6 362 € and 18 091 € to the MRR in twelve months; together 42 190 €, 4 393 € of compounding", () => {
    // The film subtracts amounts rounded to the euro (93 556 − 80 212), where the engine prints a projection at two
    // significant digits (§6.2, « ~13 000 € »): the film is re-aligned on the engine's display at A20's end (prompt F).
    const state = { ...filmState(), whatIf: FILM_LEVERS };
    const rounded = (k: { mrr12: Interval | null }) => Math.round(mid(k.mrr12));
    const alone = (["ret.logo-churn", "rev.expansion", "act.rate"] as const).map((id) => rounded(leverAlone(state, id, CTX_FR)!.projected.kpis) - rounded(today));
    expect(alone).toEqual([13_344, 6_362, 18_091]);
    const together = rounded(three) - rounded(today);
    expect(together).toBe(42_190);
    expect(together - alone.reduce((a, b) => a + b, 0)).toBe(4_393);
  });

  it("the loss the film stamps: −400 € per new customer today, none with the three levers", () => {
    expect(today.loss).toEqual({ verdict: "loss", gap: { lo: expect.closeTo(-400, 6), hi: expect.closeTo(-400, 6) } });
    expect(three.loss?.verdict).toBe("none");
    expect(mid(three.loss?.gap)).toBeCloseTo(825, 6);
  });

  it("the payback against the lifetime: the customer leaves ~4.4 months before paying back today, keeps ~9.2 months of margin after with the levers", () => {
    expect(mid(today.afterPayback)).toBeCloseTo(100 / 6 - 1_900 / 90, 9);
    expect(mid(three.afterPayback)).toBeCloseTo(25 - 1_425 / 90, 9);
  });

  it("the cash: a month of acquisition is 93 480 €, the pace keeps ~987 000 € tied up today, ~740 000 € with the levers — the same spend", () => {
    expect(mid(today.cash?.spend)).toBeCloseTo(49.2 * 1_900, 6);
    expect(mid(today.cash?.tiedUp)).toBeCloseTo((49.2 * 1_900 * (1_900 / 90)) / 2, 4);
    expect(three.cash?.spend).toEqual(today.cash?.spend);
    expect(mid(three.cash?.tiedUp)).toBeCloseTo((49.2 * 1_900 * (1_425 / 90)) / 2, 4);
    // NRR 95 % a month: churn and contraction outweigh expansion, the figure is a floor.
    expect(today.cash?.floor).toBe(true);
    expect(today.cash?.assumptions).toEqual(["cash-linear", "cash-steady-pace", "cash-losses-not-counted", "cash-billed-monthly"]);
  });
});

describe("the ARR and the MRR month by month — one loop, one source", () => {
  it("ARR = MRR × 12, unknown when the MRR is", () => {
    expect(arrOf({ lo: 40_000, hi: 50_000 })).toEqual({ lo: 480_000, hi: 600_000 });
    expect(arrOf(null)).toBeNull();
  });

  it("13 points: the MRR first, the MRR in twelve months last, each the one before × NRR + the new MRR", () => {
    const { kpis } = buildScenario(filmState(), {}, CTX_FR).today;
    const path = kpis.mrrPath!;
    expect(path).toHaveLength(13);
    expect(path[0]).toEqual(kpis.mrr);
    expect(path[12]).toEqual(kpis.mrr12); // the same numbers, not close ones
    for (let m = 1; m <= 12; m++) expect(path[m]!.lo).toBeCloseTo(path[m - 1]!.lo * 0.95 + 5_904, 6);
  });

  it("with the what-ifs the curve is the projected one, and its last point the projected MRR in twelve months", () => {
    const s = buildScenario(filmState(), FILM_LEVERS, CTX_FR);
    expect(s.projected.kpis.mrrPath![12]).toEqual(s.projected.kpis.mrr12);
    expect(s.projected.kpis.mrrPath![0]).toEqual(s.today.kpis.mrr); // the MRR of today doesn't move
    expect(s.projected.kpis.arr).toEqual(s.today.kpis.arr);
  });

  it("an estimate stays a range at every point, and an unknown curve is null, never zeros", () => {
    const path = mrrPath({ lo: 100, hi: 100 }, { lo: 10, hi: 20 }, { lo: 90, hi: 95 })!;
    expect(path.every((p) => p.lo <= p.hi)).toBe(true);
    expect(path[12]!.hi - path[12]!.lo).toBeGreaterThan(0);
    expect(mrrPath(null, { lo: 1, hi: 1 }, { lo: 95, hi: 95 })).toBeNull();
    // The §6.0 example: no margin, but a retention and new MRR — the curve exists, the LTV doesn't.
    const example = buildScenario(exampleState(), {}, CTX_FR).today.kpis;
    expect(example.mrrPath).toHaveLength(13);
    expect(example.ltv).toBeNull();
  });
});

describe("the LTV:CAC in « Et si »", () => {
  it("today, it is the unit-economics slide's own figure", () => {
    const state = filmState();
    const ue = unitEconomics(state, CTX_FR).ltvCac;
    expect(ue.kind).toBe("known");
    expect(buildScenario(state, {}, CTX_FR).today.kpis.ltvCac).toEqual(ue.kind === "known" ? ue.value : null);
  });

  it("without the margin, no LTV and no LTV:CAC — never computed on revenue", () => {
    const kpis = buildScenario(exampleState(), {}, CTX_FR).today.kpis;
    expect(kpis.ltvCac).toBeNull();
    expect(kpis.loss).toBeNull();
    expect(kpis.cash).toBeNull();
  });
});

describe("the loss check (§20.4)", () => {
  const i = (lo: number, hi = lo) => ({ lo, hi });

  it("a loss when every reading of the LTV is under every reading of the CAC", () => {
    expect(lossCheck(i(1_000, 1_400), i(1_500, 1_900))?.verdict).toBe("loss");
  });

  it("« maybe » when the ranges overlap", () => {
    expect(lossCheck(i(1_000, 1_600), i(1_500, 1_900))?.verdict).toBe("maybe");
    expect(lossCheck(i(1_500, 3_000), i(1_400, 1_600))?.verdict).toBe("maybe");
  });

  it("nothing to say when the LTV covers the CAC — break-even is not a loss", () => {
    expect(lossCheck(i(2_000, 3_000), i(1_500, 1_900))?.verdict).toBe("none");
    expect(lossCheck(i(1_900), i(1_900))?.verdict).toBe("none");
  });

  it("nothing at all when an input is missing, and the gap per new customer is LTV − CAC", () => {
    expect(lossCheck(null, i(1_900))).toBeNull();
    expect(lossCheck(i(1_500), null)).toBeNull();
    expect(lossCheck(i(1_000, 1_400), i(1_500, 1_900))?.gap).toEqual({ lo: -900, hi: -100 });
  });

  it("names no stage: it carries no metric and no comparator, only the verdict and the gap", () => {
    expect(Object.keys(lossCheck(i(1_000), i(2_000))!).sort()).toEqual(["gap", "verdict"]);
  });
});

describe("a loss IS a payback past the lifetime (§20.5) — the same three numbers, as money and as time", () => {
  // A seeded generator: the same 2 000 cases every run.
  let seed = 20_261_003;
  const rand = () => ((seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648) / 2_147_483_648);
  const range = (min: number, max: number, spread: number) => {
    const lo = min + rand() * (max - min);
    return { lo, hi: lo * (1 + rand() * spread) };
  };

  it("loss ⟺ the customer leaves before paying back; none ⟺ they pay back before leaving", () => {
    const seen = { loss: 0, maybe: 0, none: 0 };
    for (let n = 0; n < 2_000; n++) {
      const arpa = range(20, 500, 0.3);
      const margin = range(20, 90, 0.2);
      const churn = range(0.5, 15, 0.5);
      const cac = range(100, 8_000, 0.4);
      const monthlyMargin = mul(arpa, scale(margin, 1 / 100));
      const lifetime = lifetimeMonths(churn);
      const ltv = mul(monthlyMargin, lifetime);
      const payback = div(cac, monthlyMargin)!;
      const after = afterPayback(lifetime, payback)!;
      // Away from the exact boundaries, where two roundings may fall either side.
      if (Math.abs(after.hi) < 1e-6 || Math.abs(after.lo) < 1e-6) continue;
      const verdict = lossCheck(ltv, cac)!.verdict;
      seen[verdict]++;
      expect(verdict === "loss").toBe(after.hi < 0);
      expect(verdict === "none").toBe(after.lo > 0);
    }
    // Non-vacuity: the three verdicts were all met.
    expect(Math.min(seen.loss, seen.maybe, seen.none)).toBeGreaterThan(50);
  });
});

describe("the cash a month of acquisition keeps tied up (§20.6)", () => {
  it("spend × payback ÷ 2, in intervals; nothing without the spend or the payback", () => {
    const spend = acquisitionSpend({ lo: 40, hi: 50 }, { lo: 1_000, hi: 1_000 })!;
    expect(spend).toEqual({ lo: 40_000, hi: 50_000 });
    expect(cashTiedUp(spend, { lo: 10, hi: 12 }, false)?.tiedUp).toEqual({ lo: 200_000, hi: 300_000 });
    expect(cashTiedUp(null, { lo: 10, hi: 12 }, false)).toBeNull();
    expect(cashTiedUp(spend, null, false)).toBeNull();
  });

  it("no longer a floor when expansion may outpace the losses, and it says so", () => {
    const c = cashTiedUp({ lo: 1, hi: 1 }, { lo: 1, hi: 1 }, true)!;
    expect(c.floor).toBe(false);
    expect(c.assumptions).toContain("cash-expansion-outpaces");
    expect(c.assumptions).not.toContain("cash-losses-not-counted");
  });

  it("in self-serve, expansion above churn and contraction makes it not a floor", () => {
    const growing = withEntry(filmState(), "rev.expansion", measured(ratio(4_680, 46_800))); // 10 % > 6 + 1
    expect(buildScenario(growing, {}, CTX_FR).today.kpis.cash?.floor).toBe(false);
  });

  it("which levers move the payback and the cash, and which don't — the spend never moves", () => {
    const state = filmState();
    const base = buildScenario(state, {}, CTX_FR).today.kpis;
    const moved = (id: LeverId, target: number) => buildScenario(state, { [id]: target }, CTX_FR).projected.kpis;
    // At the same spend, the funnel's levers buy more payers: the CAC falls, and the payback with it. ARPA raises the margin.
    for (const [id, target] of [["acq.signup-rate", 4], ["ref.referred-share", 12], ["act.rate", 24], ["rev.paid-conversion", 8], ["rev.arpa", 140]] as const) {
      const k = moved(id, target);
      expect(mid(k.payback), id).toBeLessThan(mid(base.payback));
      expect(mid(k.cash?.tiedUp), id).toBeLessThan(mid(base.cash?.tiedUp));
      expect(k.cash?.spend, id).toEqual(base.cash?.spend);
      expect(k.lifetime, id).toEqual(base.lifetime);
    }
    // Churn lengthens the lifetime (and the LTV), not the payback; contraction and expansion move neither.
    const churn = moved("ret.logo-churn", 4);
    expect(churn.payback).toEqual(base.payback);
    expect(mid(churn.lifetime)).toBeCloseTo(25, 9);
    expect(mid(churn.afterPayback)).toBeGreaterThan(mid(base.afterPayback));
    for (const [id, target] of [["rev.contraction", 0.5], ["rev.expansion", 3]] as const) {
      const k = moved(id, target);
      expect(k.payback, id).toEqual(base.payback);
      expect(k.cash?.tiedUp, id).toEqual(base.cash?.tiedUp);
      expect(k.lifetime, id).toEqual(base.lifetime);
      expect(mid(k.mrr12), id).toBeGreaterThan(mid(base.mrr12));
    }
  });
});

describe("sales-assisted: its own payback, its own curve, its own cash", () => {
  // §18.9: ACV 24 000 €, CAC 19 000 € (fully loaded), 18 new contracts a quarter, renewal 88 % (annual), NRR estimated 104-108 %, MRR 180 000 €.
  const withMargin = (s: EngineState) => withEntry(s, "slg.rev.gross-margin", measured(ratio(135_000, 180_000))); // 75 %

  it("without its margin, no LTV, no payback, no loss check and no cash — never the self-serve margin", () => {
    const k = buildSlgScenario(hybridState(), {}, CTX_FR).today;
    expect([k.ltv, k.payback, k.ltvCac, k.loss, k.cash, k.afterPayback]).toEqual([null, null, null, null, null, null]);
    expect(k.arr).toEqual({ lo: 2_160_000, hi: 2_160_000 });
  });

  it("with it: payback ~13 months, lifetime 36 (capped), LTV:CAC ~2.8, no loss", () => {
    const k = buildSlgScenario(withMargin(hybridState()), {}, CTX_FR).today;
    expect(mid(k.payback)).toBeCloseTo(19_000 / 1_500, 9);
    expect(k.lifetime).toEqual({ lo: 36, hi: 36 });
    expect(mid(k.ltvCac)).toBeCloseTo(54_000 / 19_000, 9);
    expect(k.loss?.verdict).toBe("none");
  });

  it("the cash: a third of the quarter's contracts × the CAC, ÷ 2 over the payback — not a floor with an NRR above 100 %", () => {
    const s = withMargin(hybridState());
    const k = buildSlgScenario(s, {}, CTX_FR).today;
    expect(k.cash?.spend).toEqual({ lo: 114_000, hi: 114_000 });
    expect(mid(k.cash?.tiedUp)).toBeCloseTo((114_000 * (19_000 / 1_500)) / 2, 4);
    expect(k.cash?.floor).toBe(false);
    // The ACV lever raises the margin a contract brings: shorter payback, less cash tied up, the same spend.
    const acv = buildSlgScenario(s, { "slg.rev.acv": 30_000 }, CTX_FR).projected;
    expect(mid(acv.payback)).toBeLessThan(mid(k.payback));
    expect(acv.cash?.spend).toEqual(k.cash?.spend);
    expect(mid(acv.cash?.tiedUp)).toBeLessThan(mid(k.cash?.tiedUp));
  });

  it("annual contracts: the base moves in a straight line — half-way through the year, half the NRR", () => {
    const k = buildSlgScenario(hybridState(), {}, CTX_FR).today;
    const path = k.mrrPath!;
    expect(path).toHaveLength(13);
    expect(path[0]).toEqual(k.mrr);
    expect(path[12]).toEqual(k.mrr12);
    // 180 000 × (1 + 4-8 % ÷ 2) + 6 × 12 000 of new MRR a month.
    expect(path[6]!.lo).toBeCloseTo(180_000 * 1.02 + 72_000, 6);
    expect(path[6]!.hi).toBeCloseTo(180_000 * 1.04 + 72_000, 6);
  });

  it("monthly contracts: the base and the new MRR compound, and the last point is still the MRR in twelve months", () => {
    const monthly = withEntry(hybridState(), "slg.ret.renewal", measured(ratio(97, 100), { kind: "tool", tool: "hubspot" }, { variant: "monthly" }));
    const k = buildSlgScenario(monthly, {}, CTX_FR).today;
    const path = k.mrrPath!;
    expect(path[12]).toEqual(k.mrr12);
    const q = 0.97;
    expect(path[6]!.lo).toBeCloseTo(180_000 * Math.pow(1.04, 0.5) + 12_000 * ((1 - q ** 6) / (1 - q)), 6);
    expect(slgMrrPath(null, { lo: 1, hi: 1 }, { lo: 1, hi: 1 }, "annual", null)).toBeNull();
  });
});

describe("the hybrid: sums, both parts or nothing (S9)", () => {
  it("the ARR rows are the MRR rows × 12, with their confidence and their missing parts", () => {
    const total = buildTotal(hybridState(), CTX_FR)!;
    const arr = timesTwelve(total.mrr);
    expect(arr.total).toEqual(total.mrr.total.kind === "known" ? { ...total.mrr.total, value: scale(total.mrr.total.value, 12) } : total.mrr.total);
    const in12 = timesTwelve(total.mrrIn12Months);
    expect(in12.plg.kind).toBe(total.mrrIn12Months.plg.kind);
    // One part missing: the total stays missing, never the known part alone.
    const noSlg = buildTotal(withEntry(hybridState(), "slg.rev.arpa", undefined), CTX_FR)!;
    expect(timesTwelve(noSlg.mrr).total.kind).toBe("uncomputable");
  });

  it("the two curves add point by point, and a missing curve gives no total curve", () => {
    const s = hybridState();
    const plg = buildScenario(s, {}, CTX_FR).today.kpis.mrrPath;
    const slg = buildSlgScenario(s, {}, CTX_FR).today.mrrPath;
    const sum = sumPaths(plg, slg)!;
    expect(sum[12]!.lo).toBeCloseTo(plg![12]!.lo + slg![12]!.lo, 6);
    expect(sumPaths(plg, null)).toBeNull();
    expect(addBoth({ lo: 1, hi: 2 }, { lo: 3, hi: 4 })).toEqual({ lo: 4, hi: 6 });
    expect(addBoth({ lo: 1, hi: 2 }, null)).toBeNull();
  });
});

describe("the long-payback warning (§20.8, C49: the runway, or the 30-month floor)", () => {
  // Non-vacuity, measured on 2026-10-03: the floor counted from strictly above 30 fails « 30 months exactly »;
  // the runway counted from 30 included fails « a payback equal to the runway »; letting the warning speak
  // over a certain loss fails « never with the loss ».
  const i = (lo: number, hi = lo) => ({ lo, hi });
  const floor = paybackLimit(undefined);
  const runway = (months: number) => paybackLimit(months);
  const none = lossCheck(i(5_000), i(1_000));

  it("with no runway typed, the floor is 30 months, a product rule and not a published reference (C1)", () => {
    expect(PAYBACK_FLOOR_MONTHS).toBe(30);
    expect(floor).toEqual({ kind: "floor", months: 30 });
    expect(runway(9)).toEqual({ kind: "runway", months: 9 });
  });

  it("the floor: 30 months exactly warns, 29.9 doesn't, a range across it is « maybe »", () => {
    expect(paybackWarning(i(30), none, floor)).toEqual({ verdict: "long", limit: floor });
    expect(paybackWarning(i(29.9), none, floor)).toBeNull();
    expect(paybackWarning(i(28, 32), none, floor)).toEqual({ verdict: "maybe", limit: floor });
  });

  it("the runway: longer than it warns, a payback equal to the runway doesn't, a range across it is « maybe »", () => {
    expect(paybackWarning(i(11), none, runway(9))).toEqual({ verdict: "long", limit: runway(9) });
    expect(paybackWarning(i(9), none, runway(9))).toBeNull();
    expect(paybackWarning(i(9, 13), none, runway(12))).toEqual({ verdict: "maybe", limit: runway(12) });
    // A typed runway replaces the floor, both ways: 31 months against 36 says nothing, 11 against 9 warns.
    expect(paybackWarning(i(31), none, runway(36))).toBeNull();
  });

  it("never with the loss: a customer who leaves before paying back is the loss, not a late return", () => {
    const loss = lossCheck(i(1_500), i(1_900));
    expect(loss?.verdict).toBe("loss");
    expect(paybackWarning(i(40), loss, floor)).toBeNull();
    // A loss only possible leaves the warning its say.
    const maybe = lossCheck(i(1_500, 2_250), i(1_900));
    expect(paybackWarning(i(40), maybe, floor)?.verdict).toBe("long");
    expect(paybackWarning(null, none, floor)).toBeNull();
  });

  it("the film's SaaS: no warning today (the loss speaks), and with the three levers against a runway of 12 months", () => {
    const state = filmState();
    expect(buildScenario(state, {}, CTX_FR).today.kpis.warning).toBeNull(); // a loss, and 21 months < 30
    const typed: EngineState = { ...state, setup: { ...state.setup, runwayMonths: 12 } };
    const s = buildScenario(typed, FILM_LEVERS, CTX_FR);
    expect(s.today.kpis.warning).toBeNull(); // still the loss, whatever the runway
    expect(s.projected.kpis.warning).toEqual({ verdict: "long", limit: { kind: "runway", months: 12 } }); // ~16 months > 12
    const roomy: EngineState = { ...state, setup: { ...state.setup, runwayMonths: 18 } };
    expect(buildScenario(roomy, FILM_LEVERS, CTX_FR).projected.kpis.warning).toBeNull();
  });

  it("a healthy customer who pays back in 33 months warns with no runway typed: the floor", () => {
    // CAC 3 000 € over 90 € of monthly margin: 33 months; churn 2 %, so 36 months of life (capped) and no loss.
    let state = withEntry(filmState(), "acq.cac", measured({ kind: "amount", amount: 3_000 }));
    state = withEntry(state, "ret.logo-churn", measured(ratio(8, 400)));
    const kpis = buildScenario(state, {}, CTX_FR).today.kpis;
    expect(kpis.loss?.verdict).toBe("none");
    expect(mid(kpis.payback)).toBeCloseTo(3_000 / 90, 9);
    expect(kpis.warning).toEqual({ verdict: "long", limit: { kind: "floor", months: 30 } });
  });

  it("sales-assisted reads the same runway: one company, one runway", () => {
    const hybrid = withEntry(hybridState(), "slg.rev.gross-margin", measured(ratio(135_000, 180_000))); // 75 %, as §20.10
    const state: EngineState = { ...hybrid, setup: { ...hybrid.setup, runwayMonths: 6 } };
    const slg = buildSlgScenario(state, {}, CTX_FR);
    // The §18.9 sales-assisted half pays back in ~13 months (§20.10): past 6 months of runway.
    expect(slg.today.payback).not.toBeNull();
    expect(slg.today.warning?.limit).toEqual({ kind: "runway", months: 6 });
    expect(slg.today.warning?.verdict).toBe("long");
  });
});
