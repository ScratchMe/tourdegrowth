import { describe, expect, it } from "vitest";
import { shapeOf } from "../catalog-shape";
import type { EngineState, MetricEntry } from "../types";
import { confidenceOf, countsOf, currentSnapshot, entryOf, knownIn, knownOf, readingValue, statusOf, valueInterval } from "../values";
import { CTX_FR } from "./props";
import { EXAMPLE_TODAY, estimated, exampleState, measured, missing, ratio, withEntry } from "./fixtures";

// Engine spec §13.1 "values / confiance". Confidence is DERIVED, never
// entered. Non-vacuity, measured: dropping the maturity grading in `knownOf`
// fails the immature-cohort test only — the confidence table grades entries
// alone and passes, which is why maturity has its own test.

const at = "2026-09-20T10:00:00.000Z";
const tool = { kind: "tool", tool: "amplitude" } as const;
const person = { kind: "person", role: "data" } as const;

describe("confidenceOf — the §6.4 table", () => {
  const cases: [string, MetricEntry, string][] = [
    ["counts from a tool", measured(ratio(144, 800), tool), "solid"],
    ["counts passed on by a person", measured(ratio(144, 800), person), "approximate"],
    ["counts from 'other'", measured(ratio(144, 800), { kind: "other" }), "approximate"],
    ["a rate typed as a shortcut", measured({ kind: "rate", percent: 18 }, tool), "approximate"],
    ["an amount typed as a shortcut", measured({ kind: "amount", amount: 120 }, tool), "approximate"],
    ["a duration from a tool", measured({ kind: "duration", value: 2, unit: "days", statistic: "median" }, tool), "solid"],
    ["a duration from a person", measured({ kind: "duration", value: 2, unit: "days", statistic: "median" }, person), "approximate"],
    ["a definition (text)", measured({ kind: "text", text: "a créé un projet" }, { kind: "other" }), "solid"],
    ["a cause known by hunch", measured({ kind: "text", text: "prix" }, { kind: "other" }, { evidence: "hunch" }), "approximate"],
    ["a cause known from data", measured({ kind: "text", text: "prix" }, { kind: "other" }, { evidence: "data" }), "solid"],
    ["a choice", measured({ kind: "choice", choice: "product" }, { kind: "other" }), "solid"],
    ["an estimate", estimated(6, 9), "approximate"],
    ["two readings that disagree", { status: "conflicting", conflict: { a: { value: ratio(1, 10), source: tool }, b: { value: ratio(2, 10), source: tool } }, updatedAt: at }, "approximate"],
    ["todo", { status: "todo", updatedAt: at }, "unknown"],
    ["requested", { status: "requested", request: { role: "data", requestedAt: at }, updatedAt: at }, "unknown"],
    ["missing", missing("not-tracked", "sprint"), "unknown"],
    ["not applicable", { status: "not-applicable", naReason: "no-free-tier", updatedAt: at }, "unknown"],
  ];
  for (const [name, entry, expected] of cases) {
    it(`${name} → ${expected}`, () => expect(confidenceOf(entry)).toBe(expected));
  }
});

describe("knownOf", () => {
  it("a cohort entered on a month the window hasn't finished is approximate, even counted from a tool", () => {
    const state = exampleState();
    expect(knownIn(state, "act.rate", CTX_FR)).toMatchObject({ kind: "known", confidence: "solid" });
    // Activation within 7 days: on 24/09 the mature cohort is August; September isn't.
    const immature = withEntry(state, "act.rate", measured(ratio(144, 800), tool, { cohortMonth: "2026-09" }));
    expect(knownIn(immature, "act.rate", CTX_FR)).toMatchObject({ kind: "known", confidence: "approximate" });
    const august = withEntry(state, "act.rate", measured(ratio(144, 800), tool, { cohortMonth: "2026-08" }));
    expect(knownIn(august, "act.rate", CTX_FR)).toMatchObject({ confidence: "solid" });
    // Day 30 on the August cohort: 31/08 + 30 > 24/09.
    const d30 = withEntry(state, "ret.d30", measured(ratio(60, 800), tool, { cohortMonth: "2026-08" }));
    expect(knownIn(d30, "ret.d30", CTX_FR)).toMatchObject({ kind: "known", confidence: "approximate" });
  });

  it("an unknown stays unknown with its reason — never 0", () => {
    const state = exampleState();
    expect(knownIn(state, "ret.d30", CTX_FR)).toEqual({ kind: "unknown", why: "not-tracked" });
    expect(knownIn(state, "ref.k-factor", CTX_FR)).toEqual({ kind: "unknown", why: "requested" });
    expect(knownIn(withEntry(state, "ret.d30", undefined), "ret.d30", CTX_FR)).toEqual({ kind: "unknown", why: "todo" });
    const na = withEntry(state, "rev.paid-conversion", { status: "not-applicable", naReason: "no-free-tier", updatedAt: at });
    expect(knownIn(na, "rev.paid-conversion", CTX_FR)).toEqual({ kind: "unknown", why: "not-applicable" });
  });

  it("a known status without a number is not a known number", () => {
    expect(knownOf(exampleState().snapshots[0]!.metrics["act.event"], shapeOf("act.event"), CTX_FR)).toEqual({ kind: "unknown", why: "todo" });
    expect(knownOf(measured(ratio(1, 0)), shapeOf("act.rate"), CTX_FR)).toEqual({ kind: "unknown", why: "todo" });
  });

  it("values: a share in percent, a quotient as is, hours in days, two readings as their span", () => {
    expect(knownIn(exampleState(), "act.rate", CTX_FR)).toMatchObject({ value: { lo: 18, hi: 18 } });
    expect(knownIn(exampleState(), "acq.cac", CTX_FR)).toMatchObject({ value: { lo: 500, hi: 500 } });
    expect(knownIn(exampleState(), "rev.arpa", CTX_FR)).toMatchObject({ value: { lo: 120, hi: 120 } });
    expect(knownIn(exampleState(), "rev.paid-conversion", CTX_FR)).toMatchObject({ value: { lo: 6, hi: 9 }, confidence: "approximate" });
    expect(readingValue({ kind: "duration", value: 36, unit: "hours", statistic: "median" }, shapeOf("act.ttv"))).toBe(1.5);
    expect(readingValue({ kind: "text", text: "x" }, shapeOf("act.event"))).toBeNull();
    const conflict: MetricEntry = { status: "conflicting", conflict: { a: { value: ratio(30, 100), source: tool }, b: { value: ratio(20, 100), source: tool } }, updatedAt: at };
    expect(valueInterval(conflict, shapeOf("act.rate"))).toEqual({ lo: 20, hi: 30 });
  });

  it("status, entries and counts", () => {
    const state = exampleState();
    const snapshot = currentSnapshot(state);
    expect(statusOf(undefined)).toBe("todo");
    expect(statusOf(entryOf(snapshot, "ret.d30"))).toBe("missing");
    expect(countsOf(entryOf(snapshot, "acq.cac"))).toEqual({ numerator: 21_000, denominator: 42 });
    expect(countsOf(entryOf(snapshot, "rev.paid-conversion"))).toBeNull();
    expect(() => currentSnapshot({ ...state, snapshots: [] } as EngineState)).toThrow();
    expect(EXAMPLE_TODAY.getDate()).toBe(24);
  });
});
