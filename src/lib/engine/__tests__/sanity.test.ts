import { describe, expect, it } from "vitest";
import { shapeOf } from "../catalog-shape";
import { blockingCheck, reconcile, sanityChecks } from "../sanity";
import type { EngineState, SanityId } from "../types";
import { CTX_FR, FR } from "./props";
import { estimated, exampleState, measured, ratio, withEntry } from "./fixtures";

// Engine spec §13.1 "sanity" — one case that triggers and one that doesn't,
// per check. Non-vacuity: firing on ANY overlap instead of the whole interval
// (e.g. `churn.hi > 30`) fails the churn "estimate" no-trigger case only;
// swapping `lo`/`hi` in the reconcile band test fails the out-of-band case
// only; the example's "no alert" passes both ways (its ratio overlaps).

const tool = { kind: "tool", tool: "amplitude" } as const;
const ids = (state: EngineState): SanityId[] => sanityChecks(state, CTX_FR, FR.strings.units).map((c) => c.id);

describe("sanity checks", () => {
  it("the §6.0 example raises nothing", () => {
    expect(sanityChecks(exampleState(), CTX_FR, FR.strings.units)).toEqual([]);
  });

  it("num-gt-den blocks, on bounded shares only", () => {
    expect(blockingCheck(measured(ratio(900, 800), tool), shapeOf("act.rate"))).toEqual({ id: "num-gt-den", blocking: true, metrics: ["act.rate"], values: {} });
    expect(blockingCheck(measured(ratio(800, 800), tool), shapeOf("act.rate"))).toBeNull();
    expect(blockingCheck(measured(ratio(21_000, 42), tool), shapeOf("acq.cac"))).toBeNull();
    const conflict = { status: "conflicting", conflict: { a: { value: ratio(1, 10), source: tool }, b: { value: ratio(12, 10), source: tool } }, updatedAt: "x" } as const;
    expect(blockingCheck(conflict, shapeOf("act.rate"))?.blocking).toBe(true);
    // An imported file can carry what the sheet would have refused: it shows.
    expect(ids(withEntry(exampleState(), "act.rate", measured(ratio(900, 800), tool)))).toContain("num-gt-den");
  });

  it("retained-gt-activated", () => {
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(200, 800), tool)))).toContain("retained-gt-activated");
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(100, 800), tool)))).not.toContain("retained-gt-activated");
  });

  it("paid-gt-retained", () => {
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(40, 800), tool)))).toContain("paid-gt-retained");
    expect(ids(withEntry(exampleState(), "ret.d30", measured(ratio(80, 800), tool)))).not.toContain("paid-gt-retained");
  });

  it("churn-high — the whole interval above 30 %", () => {
    expect(ids(withEntry(exampleState(), "ret.logo-churn", measured(ratio(140, 400), tool)))).toContain("churn-high");
    expect(ids(withEntry(exampleState(), "ret.logo-churn", estimated(20, 40)))).not.toContain("churn-high");
  });

  it("margin-odd — above 95 % or below 0", () => {
    expect(ids(withEntry(exampleState(), "rev.gross-margin", measured({ kind: "rate", percent: 98 }, tool)))).toContain("margin-odd");
    expect(ids(withEntry(exampleState(), "rev.gross-margin", estimated(-8, -2)))).toContain("margin-odd");
    expect(ids(withEntry(exampleState(), "rev.gross-margin", measured({ kind: "rate", percent: 80 }, tool)))).not.toContain("margin-odd");
  });

  it("ttv-mean — the statistic on a measured value, or the variant of an estimate", () => {
    const mean = measured({ kind: "duration", value: 2, unit: "days", statistic: "mean" }, tool);
    expect(ids(withEntry(exampleState(), "act.ttv", mean))).toContain("ttv-mean");
    expect(ids(withEntry(exampleState(), "act.ttv", estimated(1, 3, { variant: "mean" })))).toContain("ttv-mean");
    expect(ids(exampleState())).not.toContain("ttv-mean");
  });

  it("cohort-mismatch — peloton columns on different months", () => {
    expect(ids(withEntry(exampleState(), "act.rate", measured(ratio(144, 800), tool, { cohortMonth: "2026-06" })))).toContain("cohort-mismatch");
  });

  it("reconcile-gap: the example overlaps the band (no alert); a billing far off raises it with formatted values", () => {
    const r = reconcile(exampleState(), CTX_FR)!;
    expect(r.predicted.lo).toBeCloseTo(49.2, 9);
    expect(r.predicted.hi).toBeCloseTo(73.8, 9);
    expect(r.billed).toBe(42);
    const off = withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 20), { kind: "person", role: "finance" }));
    const check = sanityChecks(off, CTX_FR, FR.strings.units).find((c) => c.id === "reconcile-gap")!;
    expect(check).toMatchObject({ blocking: false, values: { p: "49 à 74", n: "20", month: "août 2026" } });
  });
});
