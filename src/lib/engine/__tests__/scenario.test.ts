import { describe, expect, it } from "vitest";
import { buildScenario, leverAlone, leverViews } from "../scenario";
import type { Interval, LeverId } from "../types";
import { CTX_FR } from "./props";
import { exampleState, withEntry, noMarginState } from "./fixtures";

/**
 * « Et si ? », cumulated (Antoine, 2026-09-26). The §6.0 example reads:
 * 820 sign-ups in August from 26 000 visitors (3.15 %), 18 % activated,
 * paid conversion estimated 6 to 9 %, 6 % referred, 42 new payers (the
 * CAC's measured count) at 120 € — 48 000 € of MRR — churn 2.5 %,
 * contraction 480 and expansion 1 440 on the 46 800 € of 1 August.
 * Gross margin and day-30 retention are unknown.
 */

const mid = (i: Interval | null) => (i ? (i.lo + i.hi) / 2 : null);

describe("buildScenario — nothing moved", () => {
  it("the projection IS today: same funnel, same money", () => {
    const s = buildScenario(exampleState(), {}, CTX_FR);
    expect(s.moved).toEqual([]);
    expect(s.projected).toEqual(s.today);
  });

  it("today, read from the example: the funnel in people, the money in euros", () => {
    const { funnel, kpis } = buildScenario(exampleState(), {}, CTX_FR).today;
    expect(funnel.visitors?.lo).toBeCloseTo(26_000, 6);
    expect(funnel.perHundred).toBe(false);
    expect(funnel.signups).toEqual({ lo: 820, hi: 820 });
    expect(funnel.activated?.lo).toBeCloseTo(147.6, 9);
    expect(funnel.d30).toBeNull(); // unknown, never 0
    expect(funnel.paying?.lo).toBeCloseTo(49.2, 9);
    expect(funnel.paying?.hi).toBeCloseTo(73.8, 9);
    expect(kpis.mrr).toEqual({ lo: 48_000, hi: 48_000 });
    expect(kpis.newMrr).toEqual({ lo: 5_040, hi: 5_040 }); // 42 × 120
    expect(kpis.cac).toEqual({ lo: 500, hi: 500 });
    expect(kpis.grr?.lo).toBeCloseTo(100 - 2.5 - (480 / 46_800) * 100, 9);
    expect(kpis.nrr?.lo).toBeCloseTo(100 - 2.5 - (480 / 46_800) * 100 + (1_440 / 46_800) * 100, 9);
    // The margin estimated at 70 to 80 % since C50: ARPA 120 × margin, 36 months counted (churn 2.5 %, capped), CAC 500.
    expect(kpis.ltv?.lo).toBeCloseTo(120 * 0.7 * 36, 6);
    expect(kpis.ltv?.hi).toBeCloseTo(120 * 0.8 * 36, 6);
    expect(kpis.payback?.lo).toBeCloseTo(500 / (120 * 0.8), 9);
    expect(kpis.payback?.hi).toBeCloseTo(500 / (120 * 0.7), 9);
    // Without it: no LTV, no payback — never a fallback on revenue.
    const none = buildScenario(noMarginState(), {}, CTX_FR).today.kpis;
    expect(none.ltv).toBeNull();
    expect(none.payback).toBeNull();
  });

  it("twelve months at this pace: the base retained at NRR every month, each month's new MRR retained from then on", () => {
    const { kpis } = buildScenario(exampleState(), {}, CTX_FR).today;
    const q = kpis.nrr!.lo / 100;
    // Closed form of the same recurrence: M·q¹² + N·(1 − q¹²)/(1 − q).
    expect(kpis.mrr12!.lo).toBeCloseTo(48_000 * q ** 12 + 5_040 * ((1 - q ** 12) / (1 - q)), 6);
  });
});

describe("buildScenario — one lever at a time", () => {
  it("activation 18 → 24 %: the activated, the payers and the new MRR grow by exactly 4/3, the CAC falls by as much", () => {
    const s = buildScenario(exampleState(), { "act.rate": 24 }, CTX_FR);
    const { funnel, kpis } = s.projected;
    expect(funnel.activated?.lo).toBeCloseTo(820 * 0.24, 9);
    // The estimate stays a range, each bound carried: 6-9 % becomes 8-12 %, never « 0.9 to 2 × ».
    expect(funnel.paying?.lo).toBeCloseTo(820 * 0.08, 9);
    expect(funnel.paying?.hi).toBeCloseTo(820 * 0.12, 9);
    expect(kpis.newMrr?.lo).toBeCloseTo(5_040 * (4 / 3), 6);
    expect(kpis.newMrr?.hi).toBeCloseTo(5_040 * (4 / 3), 6);
    expect(kpis.cac?.lo).toBeCloseTo(375, 6);
    // Activation moves nothing upstream.
    expect(funnel.signups).toEqual(s.today.funnel.signups);
    expect(s.assumptions).toContain("activation-drives-downstream");
    expect(s.assumptions).toContain("same-spend");
  });

  it("activation carries day-30 retention when it is known, never above the activated", () => {
    const withD30 = withEntry(exampleState(), "ret.d30", { status: "measured", value: { kind: "ratio", numerator: 120, denominator: 800 }, source: { kind: "other" }, updatedAt: "2026-09-26T10:00:00.000Z" });
    const s = buildScenario(withD30, { "act.rate": 24 }, CTX_FR);
    expect(s.today.funnel.d30?.lo).toBeCloseTo(820 * 0.15, 9);
    expect(s.projected.funnel.d30?.lo).toBeCloseTo(820 * 0.2, 9); // 15 % × 24/18
    // Pushed to its ceiling: 15 % × 90/18 = 75 %, capped at the 90 % activated.
    const high = buildScenario(withD30, { "act.rate": 20 }, CTX_FR).projected.funnel;
    expect(high.d30!.hi).toBeLessThanOrEqual(high.activated!.hi);
  });

  it("day 30, a lever since §19.3.1: 15 → 18 %, the paying follow it — × 6/5 — and activation caps it", () => {
    const withD30 = withEntry(exampleState(), "ret.d30", { status: "measured", value: { kind: "ratio", numerator: 120, denominator: 800 }, source: { kind: "other" }, updatedAt: "2026-09-26T10:00:00.000Z" });
    const s = buildScenario(withD30, { "ret.d30": 18 }, CTX_FR);
    expect(s.moved).toEqual(["ret.d30"]);
    expect(s.projected.funnel.d30?.lo).toBeCloseTo(820 * 0.18, 9);
    // The estimated 6-9 % paid conversion, each bound × 18/15: 7,2-10,8 %.
    expect(s.projected.funnel.paying?.lo).toBeCloseTo(820 * 0.072, 9);
    expect(s.projected.funnel.paying?.hi).toBeCloseTo(820 * 0.108, 9);
    // The leak slide's own rule: 42 new payers × 18/15, at 120 €.
    expect(s.projected.kpis.newMrr?.lo).toBeCloseTo(5_040 * 1.2, 6);
    expect(s.projected.kpis.cac?.lo).toBeCloseTo(500 / 1.2, 6);
    // Activation doesn't move: day 30 is downstream of it.
    expect(s.projected.funnel.activated).toEqual(s.today.funnel.activated);
    expect(s.assumptions).toEqual(expect.arrayContaining(["d30-drives-paying", "same-spend"]));
    // A target past the activated is capped at it: 25 % with 18 % activated reads 18 %.
    expect(buildScenario(withD30, { "ret.d30": 25 }, CTX_FR).projected.funnel.d30?.lo).toBeCloseTo(820 * 0.18, 9);
    // With activation moved too, day 30's own target carries the paying, under the new activated: 24/15.
    expect(buildScenario(withD30, { "ret.d30": 25, "act.rate": 24 }, CTX_FR).projected.kpis.newMrr?.lo).toBeCloseTo(5_040 * (24 / 15), 6);
    // Without day 30, no slider and no move: a target on it is ignored.
    const none = buildScenario(exampleState(), { "ret.d30": 18 }, CTX_FR);
    expect(none.moved).toEqual([]);
    expect(none.projected.kpis).toEqual(none.today.kpis);
  });

  it("sign-up rate 3.15 → 4 %: the same 26 000 visitors bring more sign-ups, and everything below follows", () => {
    const s = buildScenario(exampleState(), { "acq.signup-rate": 4 }, CTX_FR);
    expect(s.projected.funnel.visitors?.lo).toBeCloseTo(26_000, 6);
    expect(s.projected.funnel.signups?.lo).toBeCloseTo(1_040, 6);
    expect(mid(s.projected.kpis.newMrr)).toBeCloseTo(5_040 * (1_040 / 820), 4);
    expect(s.assumptions).toContain("signup-same-visitors");
  });

  it("referral 6 → 20 %: the referred come on top — sign-ups and the visitors they bring grow by 0.94 / 0.80", () => {
    const s = buildScenario(exampleState(), { "ref.referred-share": 20 }, CTX_FR);
    const f = 0.94 / 0.8;
    expect(s.projected.funnel.signups?.lo).toBeCloseTo(820 * f, 6);
    expect(s.projected.funnel.visitors?.lo).toBeCloseTo(26_000 * f, 4);
    expect(s.projected.funnel.referred?.lo).toBeCloseTo(820 * f * 0.2, 6);
    expect(s.assumptions).toContain("referral-on-top");
  });

  it("churn 2.5 → 1.5 %: GRR and NRR gain one point, the MRR in twelve months rises, the funnel does not move", () => {
    const s = buildScenario(exampleState(), { "ret.logo-churn": 1.5 }, CTX_FR);
    expect(s.projected.kpis.grr!.lo - s.today.kpis.grr!.lo).toBeCloseTo(1, 9);
    expect(s.projected.kpis.nrr!.lo - s.today.kpis.nrr!.lo).toBeCloseTo(1, 9);
    expect(s.projected.kpis.mrr12!.lo).toBeGreaterThan(s.today.kpis.mrr12!.lo);
    expect(s.projected.funnel).toEqual(s.today.funnel);
  });

  it("ARPA 120 → 150 €: the new customers' MRR, not the base's", () => {
    const s = buildScenario(exampleState(), { "rev.arpa": 150 }, CTX_FR);
    expect(s.projected.kpis.newMrr).toEqual({ lo: 42 * 150, hi: 42 * 150 });
    expect(s.projected.kpis.mrr).toEqual(s.today.kpis.mrr);
    expect(s.assumptions).toContain("arpa-new-customers");
  });

  it("an unknown lever can't be moved: its target is ignored, not read as a change from 0", () => {
    const noD = withEntry(exampleState(), "act.rate", undefined);
    const s = buildScenario(noD, { "act.rate": 30 }, CTX_FR);
    expect(s.moved).toEqual([]);
    expect(leverViews(noD, { "act.rate": 30 }, CTX_FR).find((l) => l.id === "act.rate")?.today).toBeNull();
  });
});

describe("buildScenario — without the month's sign-ups", () => {
  it("the funnel is read on 100 sign-ups, and the money never uses that 100", () => {
    const state = exampleState();
    const snapshot = state.snapshots[0]!;
    delete snapshot.metrics["acq.signup-rate"];
    delete snapshot.metrics["acq.top-channel-share"];
    const s = buildScenario(state, { "act.rate": 24 }, CTX_FR);
    expect(s.today.funnel.perHundred).toBe(true);
    expect(s.today.funnel.signups).toEqual({ lo: 100, hi: 100 });
    expect(s.projected.funnel.activated?.lo).toBeCloseTo(24, 9);
    expect(s.today.funnel.visitors).toBeNull();
    // The CAC's own count of new payers still prices the month: 42, not 100 × a rate.
    expect(s.today.kpis.newMrr).toEqual({ lo: 5_040, hi: 5_040 });
  });
});

describe("buildScenario — together", () => {
  const levers: Partial<Record<LeverId, number>> = { "acq.signup-rate": 4, "act.rate": 24, "ret.logo-churn": 1.5, "rev.expansion": 4 };

  it("the levers compound: all of them at once gain more than the sum of each on its own", () => {
    const state = { ...exampleState(), whatIf: levers };
    const base = mid(buildScenario(state, {}, CTX_FR).today.kpis.mrr12)!;
    const together = mid(buildScenario(state, levers, CTX_FR).projected.kpis.mrr12)! - base;
    const alone = (Object.keys(levers) as LeverId[]).map((id) => mid(leverAlone(state, id, CTX_FR)!.projected.kpis.mrr12)! - base);
    expect(together).toBeGreaterThan(alone.reduce((a, b) => a + b, 0));
    // Funnel levers multiply: 4/3.15 × 24/18 on the new MRR.
    const s = buildScenario(state, levers, CTX_FR);
    expect(mid(s.projected.kpis.newMrr)).toBeCloseTo(5_040 * (1_040 / 820) * (4 / 3), 4);
  });

  it("names every lever moved, in lever order, and each assumption once", () => {
    const s = buildScenario(exampleState(), levers, CTX_FR);
    expect(s.moved).toEqual(["acq.signup-rate", "act.rate", "ret.logo-churn", "rev.expansion"]);
    expect(new Set(s.assumptions).size).toBe(s.assumptions.length);
  });

  it("leverAlone reads the state's own target, and is null for a lever not under test", () => {
    const state = { ...exampleState(), whatIf: { "act.rate": 24 } };
    expect(leverAlone(state, "act.rate", CTX_FR)?.moved).toEqual(["act.rate"]);
    expect(leverAlone(state, "rev.arpa", CTX_FR)).toBeNull();
  });
});

describe("leverViews — the sliders' domains", () => {
  it("every known lever gets a domain that contains today; shares never pass 100, nothing goes below 0", () => {
    for (const lever of leverViews(exampleState(), {}, CTX_FR)) {
      if (!lever.today) continue;
      expect(lever.min, lever.id).toBeGreaterThanOrEqual(0);
      expect(lever.min, lever.id).toBeLessThanOrEqual(lever.today.lo);
      expect(lever.max, lever.id).toBeGreaterThanOrEqual(lever.today.hi);
      if (lever.unit === "percent" && lever.id !== "rev.expansion") expect(lever.max, lever.id).toBeLessThanOrEqual(100);
    }
  });
});
