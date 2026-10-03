import { describe, expect, it } from "vitest";
import { METRIC_SHAPES } from "../catalog-shape";
import { coverage, motionCoverage, setupCoverage } from "../coverage";
import type { MetricEntry, MetricStatus, Snapshot } from "../types";
import { exampleState, hybridState, salesAssistedState, withEntry } from "./fixtures";

// Engine spec §13.1 "coverage". The invariant that lost half a point in the
// audit instrument: found + approximate + missing + inProgress ===
// denominator, for every combination of statuses. Non-vacuity, measured:
// counting "conflicting" nowhere fails the two invariant sweeps only — the
// example has no conflict and passes; keeping "not-applicable" in the
// denominator fails the two sweeps and "only not-applicable moves the
// denominator". The example alone would have caught neither.

const STATUSES: MetricStatus[] = ["todo", "requested", "measured", "estimated", "conflicting", "missing", "not-applicable"];
const at = "2026-09-24T00:00:00.000Z";

function snapshotWith(statuses: MetricStatus[]): Snapshot {
  const base = exampleState().snapshots[0]!;
  const metrics: Snapshot["metrics"] = {};
  METRIC_SHAPES.forEach((shape, i) => {
    // "todo" is written half the time and left absent the other half: absent IS todo.
    const status = statuses[i]!;
    if (status === "todo" && i % 2 === 0) return;
    metrics[shape.id] = { status, updatedAt: at } as MetricEntry;
  });
  return { ...base, metrics };
}

/** The number of metrics, read from the catalogue: seventeen since the MRR movements (2026-09-26). */
const N = METRIC_SHAPES.length;

function check(statuses: MetricStatus[]): void {
  const c = coverage(snapshotWith(statuses));
  expect(c.found + c.approximate + c.missing + c.inProgress).toBe(c.denominator);
  expect(c.requested + c.todo).toBe(c.inProgress);
  expect(c.denominator).toBe(N - statuses.filter((s) => s === "not-applicable").length);
}

/** mulberry32: a seeded, deterministic generator — the same 10 000 cases on every run. */
function prng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("coverage", () => {
  it("the §6.0 example: 11 found · 3 approximate · 1 requested · 2 missing, of 17 (the margin estimated since C50)", () => {
    expect(coverage(exampleState().snapshots[0]!)).toEqual({ denominator: 17, found: 11, approximate: 3, missing: 2, inProgress: 1, requested: 1, todo: 0 });
  });

  it("the sum invariant holds for the full cartesian product of statuses over any three consecutive numbers (7³ each)", () => {
    let cases = 0;
    for (let start = 0; start + 3 <= N; start += 3) {
      for (const a of STATUSES) {
        for (const b of STATUSES) {
          for (const c of STATUSES) {
            const statuses = Array<MetricStatus>(N).fill("measured");
            statuses[start] = a;
            statuses[start + 1] = b;
            statuses[start + 2] = c;
            check(statuses);
            cases++;
          }
        }
      }
    }
    expect(cases).toBe(Math.floor(N / 3) * 343);
  });

  it("the sum invariant holds on 10 000 deterministic random combinations across all the numbers", () => {
    const random = prng(20260924);
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const statuses = Array.from({ length: N }, () => STATUSES[Math.floor(random() * STATUSES.length)]!);
      seen.add(statuses.join());
      check(statuses);
    }
    // The generator really spreads: nearly every draw is new (7¹⁷ ≈ 2.3 × 10¹⁴).
    expect(seen.size).toBeGreaterThan(9_990);
  });

  it("only not-applicable moves the denominator", () => {
    for (const status of STATUSES) {
      const statuses = Array<MetricStatus>(N).fill(status);
      expect(coverage(snapshotWith(statuses)).denominator).toBe(status === "not-applicable" ? 0 : N);
    }
  });
});

// --- Per motion and their union (§18.6.1, §18.9.2; A7.3.c S1). Non-vacuity,
// measured on 2026-10-01: counting the link fails the union (33, not 32) and
// « optional »; reading the union off METRIC_SHAPES fails the hybrid.

describe("coverage per motion, and the union", () => {
  it("the §18.9 example: self-serve 11 of 17, sales-assisted 10 of 15, the union 21 of 32 — the link left out", () => {
    const snapshot = hybridState().snapshots[0]!;
    // Self-serve's margin estimated since C50 (A20.d T6): one approximate more, one missing less.
    expect(motionCoverage(snapshot, "plg")).toEqual({ denominator: 17, found: 11, approximate: 3, missing: 2, inProgress: 1, requested: 1, todo: 0 });
    expect(motionCoverage(snapshot, "slg")).toEqual({ denominator: 15, found: 10, approximate: 1, missing: 2, inProgress: 2, requested: 1, todo: 1 });
    expect(setupCoverage(snapshot, hybridState().setup)).toEqual({ denominator: 32, found: 21, approximate: 4, missing: 4, inProgress: 3, requested: 2, todo: 1 });
    // « On documente 25 chiffres sur 32 » (§18.9.2, 24 before C50): found + approximate.
    const union = setupCoverage(snapshot, hybridState().setup);
    expect(union.found + union.approximate).toBe(25);
  });

  it("the link is optional: its status never moves the coverage", () => {
    const state = hybridState();
    const without = withEntry(state, "link.pql-handoff", undefined);
    expect(setupCoverage(without.snapshots[0]!, without.setup)).toEqual(setupCoverage(state.snapshots[0]!, state.setup));
  });

  it("one motion ticked: its own numbers only — self-serve alone is the v1 coverage", () => {
    const state = exampleState();
    expect(setupCoverage(state.snapshots[0]!, state.setup)).toEqual(coverage(state.snapshots[0]!));
    const slg = salesAssistedState();
    expect(setupCoverage(slg.snapshots[0]!, slg.setup)).toEqual(motionCoverage(slg.snapshots[0]!, "slg"));
  });
});
