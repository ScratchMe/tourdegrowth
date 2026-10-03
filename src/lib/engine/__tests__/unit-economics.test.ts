import { describe, expect, it } from "vitest";
import { LTV_CAP_MONTHS } from "../catalog-shape";
import type { DerivedValue, MetricEntry } from "../types";
import { lifetimeMonths, lostInAYear, marginIsCompanyWide, revenueRetention, slgLifetimeMonths, slgUnitEconomics, unitEconomics } from "../unit-economics";
import { CTX_FR } from "./props";
import { exampleState, hybridState, measured, ratio, withEntry, noMarginState } from "./fixtures";

// Engine spec §13.1 "unit-economics". Non-vacuity, measured: falling back
// on ARPA when the margin is missing (the flattering 500 ÷ 120 = 4.2
// months) fails 6 tests — "margin unknown" here, the example's findings,
// and four deck tests whose unit-economics slide would suddenly conclude.

const tool = { kind: "tool", tool: "stripe" } as const;

describe("unit economics", () => {
  it("margin unknown: LTV, payback and LTV:CAC are uncomputable — never a fallback on revenue", () => {
    const u = unitEconomics(noMarginState(), CTX_FR);
    expect(u.payback).toEqual({ kind: "uncomputable", missing: ["rev.gross-margin"] });
    expect(u.ltv).toEqual({ kind: "uncomputable", missing: ["rev.gross-margin"] });
    expect(u.ltvCac).toEqual({ kind: "uncomputable", missing: ["rev.gross-margin"] });
    // The CAC's variant always travels with the result.
    expect(u.cacVariant).toBe("media-only");
  });

  it("margin known: payback in months of gross margin, LTV capped at 36 months, LTV:CAC", () => {
    // ARPA 120 × 80 % = 96 €/month of margin; churn 2.5 % → 40 months, capped at 36.
    const state = withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool));
    const u = unitEconomics(state, CTX_FR);
    expect(u.payback.kind).toBe("known");
    if (u.payback.kind !== "known" || u.ltv.kind !== "known" || u.ltvCac.kind !== "known") throw new Error("expected known");
    expect(u.payback.value.lo).toBeCloseTo(500 / 96, 9);
    expect(u.ltv.value.lo).toBeCloseTo(96 * LTV_CAP_MONTHS, 9);
    expect(u.ltvCac.value.lo).toBeCloseTo((96 * 36) / 500, 9);
    // The CAC came from a person (finance): approximate, whatever the rest.
    expect(u.payback.confidence).toBe("approximate");
  });

  it("solid only when every input is solid", () => {
    let state = withEntry(exampleState(), "rev.gross-margin", measured(ratio(80, 100), tool));
    state = withEntry(state, "acq.cac", measured(ratio(21_000, 42), tool));
    const u = unitEconomics(state, CTX_FR);
    expect(u.payback).toMatchObject({ kind: "known", confidence: "solid" });
    expect(u.ltv).toMatchObject({ kind: "known", confidence: "solid" });
  });

  it("a lifetime is 1 ÷ churn, capped at 36 months; higher churn, shorter life", () => {
    expect(lifetimeMonths({ lo: 1, hi: 1 })).toEqual({ lo: 36, hi: 36 });
    expect(lifetimeMonths({ lo: 0, hi: 0 })).toEqual({ lo: 36, hi: 36 });
    expect(lifetimeMonths({ lo: 5, hi: 5 })).toEqual({ lo: 20, hi: 20 });
    expect(lifetimeMonths({ lo: 2, hi: 4 })).toEqual({ lo: 25, hi: 36 });
  });

  it("a missing CAC names the CAC; a margin that spans 0 has no payback at all", () => {
    const noCac = unitEconomics(withEntry(noMarginState(), "acq.cac", undefined), CTX_FR);
    expect(noCac.payback).toEqual({ kind: "uncomputable", missing: ["acq.cac", "rev.gross-margin"] });
    expect(noCac.cacVariant).toBeNull();
    const span = withEntry(exampleState(), "rev.gross-margin", { status: "estimated", estimate: { low: -5, high: 10, basis: "team-hunch" }, updatedAt: "2026-09-20T10:00:00.000Z" });
    // Every input is known, so the sentence names the one that spans 0 rather than ending on nothing.
    expect(unitEconomics(span, CTX_FR).payback).toEqual({ kind: "uncomputable", missing: ["rev.gross-margin"] });
  });
});

describe("GRR and NRR (2026-09-26)", () => {
  it("the example: churn 2.5 %, contraction 480 / 46 800, expansion 1 440 / 46 800 — monthly, in percent, always approximate", () => {
    const u = unitEconomics(exampleState(), CTX_FR);
    if (u.grr.kind !== "known" || u.nrr.kind !== "known") throw new Error("expected known");
    const contraction = (480 / 46_800) * 100;
    const expansion = (1_440 / 46_800) * 100;
    expect(u.grr.value.lo).toBeCloseTo(100 - 2.5 - contraction, 9);
    expect(u.nrr.value.lo).toBeCloseTo(100 - 2.5 - contraction + expansion, 9);
    // Every input measured from Stripe, and still approximate: logo churn stands in for revenue churn.
    expect(u.grr.confidence).toBe("approximate");
    expect(u.nrr.confidence).toBe("approximate");
  });

  it("names what is missing: GRR needs churn and contraction, NRR expansion as well — never a 0 for the unknown one", () => {
    const noExpansion = unitEconomics(withEntry(exampleState(), "rev.expansion", undefined), CTX_FR);
    expect(noExpansion.grr.kind).toBe("known");
    expect(noExpansion.nrr).toEqual({ kind: "uncomputable", missing: ["rev.expansion"] });
    const noContraction = unitEconomics(withEntry(exampleState(), "rev.contraction", undefined), CTX_FR);
    expect(noContraction.grr).toEqual({ kind: "uncomputable", missing: ["rev.contraction"] });
    expect(noContraction.nrr).toEqual({ kind: "uncomputable", missing: ["rev.contraction"] });
  });

  it("ranges swap where they subtract, and GRR never goes below 0", () => {
    const r = revenueRetention({ lo: 2, hi: 4 }, { lo: 1, hi: 1 }, { lo: 3, hi: 5 });
    expect(r.grr).toEqual({ lo: 95, hi: 97 });
    expect(r.nrr).toEqual({ lo: 98, hi: 102 });
    expect(revenueRetention({ lo: 80, hi: 90 }, { lo: 20, hi: 30 }, null)).toEqual({ grr: { lo: 0, hi: 0 }, nrr: null });
  });
});

// --- Sales-assisted (§18.5.6, §18.9.6, C25 Q4-Q6; A7.3.c S1) -------------------
// Non-vacuity, measured on 2026-10-01: reading self-serve's `rev.gross-margin`
// when the sales-assisted margin is missing fails « never a fallback »;
// dropping the 36-month cap fails the 75 % case (LTV 1 500 × 100 = 150 000);
// annual and monthly swapped fails the lifetime grid.

describe("sales-assisted unit economics", () => {
  const slgWith = (margin?: MetricEntry, plgMargin?: MetricEntry) => {
    let s = withEntry(hybridState(), "slg.rev.gross-margin", margin);
    if (plgMargin) s = withEntry(s, "rev.gross-margin", plgMargin);
    return s;
  };
  const value = (d: DerivedValue) => (d.kind === "known" ? d.value.lo : null);

  it("the lifetime: 12 ÷ (1 − r) months for annual contracts, 1 ÷ (1 − r) for monthly ones, capped at 36", () => {
    expect(slgLifetimeMonths({ lo: 50, hi: 50 }, "annual")).toEqual({ lo: 24, hi: 24 });
    expect(slgLifetimeMonths({ lo: 88, hi: 88 }, "annual")).toEqual({ lo: 36, hi: 36 });
    expect(slgLifetimeMonths({ lo: 88, hi: 88 }, "monthly").lo).toBeCloseTo(1 / 0.12, 9);
    expect(slgLifetimeMonths({ lo: 100, hi: 100 }, "monthly")).toEqual({ lo: 36, hi: 36 });
    // A higher renewal, a longer life: no bound swaps.
    expect(slgLifetimeMonths({ lo: 50, hi: 60 }, "annual")).toEqual({ lo: 24, hi: 30 });
  });

  it("the §18.9 example: both margins missing, so payback, LTV and LTV:CAC can't be computed — never on revenue, never on the other motion's margin", () => {
    const u = slgUnitEconomics(hybridState(), CTX_FR);
    expect(u).toMatchObject({ cacVariant: "fully-loaded", renewalTerm: "annual", lifetimeMonths: { kind: "known", value: { lo: 36, hi: 36 } } });
    for (const d of [u.ltv, u.payback, u.ltvCac]) expect(d).toEqual({ kind: "uncomputable", missing: ["slg.rev.gross-margin"] });
    // Self-serve's margin known does NOT stand in for sales-assisted's (C25 Q4).
    const other = slgUnitEconomics(slgWith(undefined, measured(ratio(36_000, 48_000), tool)), CTX_FR);
    expect(other.payback).toEqual({ kind: "uncomputable", missing: ["slg.rev.gross-margin"] });
  });

  it("the 75 % test case: payback 19 000 ÷ 1 500 = 12.7 months, LTV 1 500 × 36 = 54 000 €, LTV:CAC 2.8", () => {
    const u = slgUnitEconomics(slgWith(measured(ratio(135_000, 180_000), tool)), CTX_FR);
    expect(value(u.payback)).toBeCloseTo(19_000 / 1_500, 9);
    expect(value(u.ltv)).toBeCloseTo(54_000, 9);
    expect(value(u.ltvCac)).toBeCloseTo(54_000 / 19_000, 9);
  });

  it("Q4: 60 % in sales-assisted (its onboarding included) — 16 months, 43 200 €, 2.3 — and self-serve doesn't move", () => {
    const s = slgWith(measured(ratio(108_000, 180_000), tool), measured(ratio(36_000, 48_000), tool));
    const u = slgUnitEconomics(s, CTX_FR);
    expect(value(u.payback)).toBeCloseTo(19_000 / 1_200, 9);
    expect(value(u.ltv)).toBeCloseTo(43_200, 9);
    expect(value(u.ltvCac)).toBeCloseTo(43_200 / 19_000, 9);
    expect(value(unitEconomics(s, CTX_FR).payback)).toBeCloseTo(500 / 90, 9);
  });

  it("Q4: the company-wide margin taken in the hybrid is an estimate — « ~13 months », approximate, and said", () => {
    const companyWide: MetricEntry = { status: "estimated", estimate: { low: 75, high: 75, basis: "company-wide" }, updatedAt: "2026-09-20T10:00:00.000Z" };
    const s = slgWith(companyWide);
    const u = slgUnitEconomics(s, CTX_FR);
    expect(u.payback).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(value(u.payback)).toBeCloseTo(19_000 / 1_500, 9);
    expect(marginIsCompanyWide(s, "slg")).toBe(true);
    expect(marginIsCompanyWide(s, "plg")).toBe(false);
    expect(marginIsCompanyWide(slgWith(measured(ratio(108_000, 180_000), tool)), "slg")).toBe(false);
  });

  it("customers lost over a year (Q5): ~26 % in self-serve (2.5 % a month, compounded), 12 % of the contracts up for renewal in sales-assisted", () => {
    const plg = lostInAYear(hybridState(), CTX_FR, "plg");
    expect(plg).toMatchObject({ kind: "known", confidence: "approximate" });
    expect(value(plg)).toBeCloseTo(100 * (1 - 0.975 ** 12), 9);
    const slg = lostInAYear(hybridState(), CTX_FR, "slg");
    expect(slg).toEqual({ kind: "known", value: { lo: 12, hi: 12 }, confidence: "solid" });
    const monthly = lostInAYear(withEntry(hybridState(), "slg.ret.renewal", measured(ratio(22, 25), tool, { variant: "monthly" })), CTX_FR, "slg");
    expect(value(monthly)).toBeCloseTo(100 * (1 - 0.88 ** 12), 9);
    expect(lostInAYear(withEntry(hybridState(), "slg.ret.renewal", undefined), CTX_FR, "slg")).toEqual({ kind: "uncomputable", missing: ["slg.ret.renewal"] });
  });
});
