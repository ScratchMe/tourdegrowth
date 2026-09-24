import { describe, expect, it } from "vitest";
import { LTV_CAP_MONTHS } from "../catalog-shape";
import { lifetimeMonths, unitEconomics } from "../unit-economics";
import { CTX_FR } from "./props";
import { exampleState, measured, ratio, withEntry } from "./fixtures";

// Engine spec §13.1 "unit-economics". Non-vacuity: falling back on ARPA when
// the margin is missing (monthlyMargin = arpa) fails "margin unknown" only —
// the flattering 500 ÷ 120 = 4.2 months would then appear; removing the
// Math.min cap fails "capped at 36 months" and the known-case LTV; dropping
// `cacVariant` fails the variant assertion only.

const tool = { kind: "tool", tool: "stripe" } as const;

describe("unit economics", () => {
  it("margin unknown: LTV, payback and LTV:CAC are uncomputable — never a fallback on revenue", () => {
    const u = unitEconomics(exampleState(), CTX_FR);
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
    const noCac = unitEconomics(withEntry(exampleState(), "acq.cac", undefined), CTX_FR);
    expect(noCac.payback).toEqual({ kind: "uncomputable", missing: ["acq.cac", "rev.gross-margin"] });
    expect(noCac.cacVariant).toBeNull();
    const span = withEntry(exampleState(), "rev.gross-margin", { status: "estimated", estimate: { low: -5, high: 10, basis: "team-hunch" }, updatedAt: "2026-09-20T10:00:00.000Z" });
    // Every input is known, so the sentence names the one that spans 0 rather than ending on nothing.
    expect(unitEconomics(span, CTX_FR).payback).toEqual({ kind: "uncomputable", missing: ["rev.gross-margin"] });
  });
});
