import { describe, expect, it } from "vitest";
import { formatApproxNumber } from "../format";
import { buildPeloton, chainOf } from "../peloton";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { EXAMPLE_EXPECTED, estimated, exampleState, measured, missing, ratio, withEntry } from "./fixtures";

// Engine spec §13.1 "peloton". Non-vacuity: turning an unknown column into
// {lo: 0, hi: 0} fails "never 0" and the example (d30 must be null); dropping
// the sign-ups anchor in `chainOf` (treating a leading unknown as a
// tail-break) fails the chainOf test's [false, true, true] case only; using
// the CAC's denominator instead of the sign-up rate for the upstream line
// fails the example's "~3 200" only.

const amplitude = { kind: "tool", tool: "amplitude" } as const;

describe("peloton — the §6.0 example", () => {
  const peloton = buildPeloton(exampleState(), CTX_FR);

  it("18 activated, day 30 unknown, 6 to 9 paying — all on the same 100 sign-ups", () => {
    expect(peloton.columns.map((c) => c.metric)).toEqual(["act.rate", "ret.d30", "rev.paid-conversion"]);
    expect(peloton.columns[0]).toMatchObject({ perHundred: { lo: 18, hi: 18 }, confidence: "solid", source: amplitude, period: "2026-07" });
    expect(peloton.columns[1]).toMatchObject({ perHundred: null, confidence: "unknown", source: null, period: null });
    // An estimate has no single source to cite.
    expect(peloton.columns[2]).toMatchObject({ perHundred: { lo: 6, hi: 9 }, confidence: "approximate", source: null, period: "2026-07" });
    expect(peloton.chain).toBe("gap");
    expect(peloton.smallCohort).toBe(false);
  });

  it("~3 200 visitors per 100 sign-ups, 6 referred", () => {
    expect(peloton.visitorsPerHundred!.lo).toBeCloseTo(10_000 / (820 / 260), 6);
    expect(formatApproxNumber(peloton.visitorsPerHundred!.lo, "fr", FR.strings.units)).toBe(EXAMPLE_EXPECTED.visitorsPerHundred.fr);
    expect(formatApproxNumber(buildPeloton(exampleState(), CTX_EN).visitorsPerHundred!.lo, "en", EN.strings.units)).toBe(EXAMPLE_EXPECTED.visitorsPerHundred.en);
    expect(peloton.referredPerHundred).toEqual({ lo: 6, hi: 6 });
    expect(peloton.upstreamSource).toEqual({ kind: "tool", tool: "ga4" });
    expect(peloton.upstreamPeriod).toBe("2026-08");
  });
});

describe("peloton — the four chains", () => {
  it("chainOf: the sign-ups column anchors the left", () => {
    expect(chainOf([true, true, true])).toBe("complete");
    expect(chainOf([true, false, true])).toBe("gap");
    expect(chainOf([false, true, true])).toBe("gap");
    expect(chainOf([false, false, true])).toBe("gap");
    expect(chainOf([true, false, false])).toBe("tail-break");
    expect(chainOf([true, true, false])).toBe("tail-break");
    expect(chainOf([false, false, false])).toBe("empty");
  });

  it("built from states", () => {
    const complete = withEntry(exampleState(), "ret.d30", measured(ratio(80, 800), amplitude));
    expect(buildPeloton(complete, CTX_FR).chain).toBe("complete");
    const tail = withEntry(exampleState(), "rev.paid-conversion", missing("not-computed", "sprint"));
    expect(buildPeloton(tail, CTX_FR).chain).toBe("tail-break");
    const empty = withEntry(tail, "act.rate", missing("no-definition", "meeting"));
    expect(buildPeloton(empty, CTX_FR).chain).toBe("empty");
  });

  it("an unknown is never 0", () => {
    const state = withEntry(exampleState(), "act.rate", undefined);
    const p = buildPeloton(state, CTX_FR);
    expect(p.columns[0]!.perHundred).toBeNull();
    for (const c of p.columns) if (c.perHundred) expect(c.perHundred.hi).toBeGreaterThan(0);
    const noSignup = withEntry(exampleState(), "acq.signup-rate", undefined);
    expect(buildPeloton(noSignup, CTX_FR).visitorsPerHundred).toBeNull();
    expect(buildPeloton(noSignup, CTX_FR).upstreamPeriod).toBeNull();
  });

  it("whole people per bound; a cohort under 100 is flagged small", () => {
    const state = withEntry(exampleState(), "rev.paid-conversion", estimated(6.4, 8.6));
    expect(buildPeloton(state, CTX_FR).columns[2]!.perHundred).toEqual({ lo: 6, hi: 9 });
    const small = withEntry(exampleState(), "act.rate", measured(ratio(14, 80), amplitude));
    expect(buildPeloton(small, CTX_FR).smallCohort).toBe(true);
  });
});
