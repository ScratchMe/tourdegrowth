import { describe, expect, it } from "vitest";

import { buildPeloton } from "../peloton";
import { projectOnFunnel } from "../projection";
import type { EngineCalcContext } from "../types";
import { EXAMPLE_TODAY, exampleState, measured, ratio, withEntry } from "./fixtures";

const ctx: EngineCalcContext = { today: EXAMPLE_TODAY, locale: "fr" };

describe("projectOnFunnel — « et si » on the whole funnel", () => {
  it("activation to 25 %: the activated column reads 25, counts kept as counts", () => {
    const projected = projectOnFunnel(exampleState(), "act.rate", 25, ctx)!;
    expect(projected.snapshots[0]!.metrics["act.rate"]?.value).toEqual(ratio(200, 800));
    const col = buildPeloton(projected, ctx).columns.find((c) => c.metric === "act.rate")!;
    expect(col.perHundred).toEqual({ lo: 25, hi: 25 });
  });

  it("paid customers are among the activated: activation × 25/18 scales the paid estimate, never above activated", () => {
    const paid = projectOnFunnel(exampleState(), "act.rate", 25, ctx)!.snapshots[0]!.metrics["rev.paid-conversion"]!;
    expect(paid.estimate?.low).toBeCloseTo((6 * 25) / 18, 9);
    expect(paid.estimate?.high).toBeCloseTo((9 * 25) / 18, 9);
    const capped = projectOnFunnel(withEntry(exampleState(), "rev.paid-conversion", measured(ratio(140, 800))), "act.rate", 20, ctx)!;
    const value = capped.snapshots[0]!.metrics["rev.paid-conversion"]!.value;
    expect(value?.kind === "ratio" && value.numerator / value.denominator).toBeLessThanOrEqual(0.2);
  });

  it("paid conversion moves only its own column", () => {
    const projected = projectOnFunnel(exampleState(), "rev.paid-conversion", 12, ctx)!;
    expect(projected.snapshots[0]!.metrics["act.rate"]).toEqual(exampleState().snapshots[0]!.metrics["act.rate"]);
    expect(buildPeloton(projected, ctx).columns.find((c) => c.metric === "rev.paid-conversion")!.perHundred).toEqual({ lo: 12, hi: 12 });
  });

  it("sign-up rate and churn don't show on the 100: no projection; nor from an unknown value", () => {
    expect(projectOnFunnel(exampleState(), "acq.signup-rate", 5, ctx)).toBeNull();
    expect(projectOnFunnel(exampleState(), "ret.logo-churn", 1, ctx)).toBeNull();
    expect(projectOnFunnel(withEntry(exampleState(), "act.rate", undefined), "act.rate", 25, ctx)).toBeNull();
  });

  it("never mutates the state it reads", () => {
    const state = exampleState();
    const before = JSON.stringify(state);
    projectOnFunnel(state, "act.rate", 30, ctx);
    expect(JSON.stringify(state)).toBe(before);
  });
});
