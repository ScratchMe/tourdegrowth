import { describe, expect, it } from "vitest";
import { METRIC_SHAPES } from "../catalog-shape";
import { coverage } from "../coverage";
import type { MetricEntry, MetricStatus, Snapshot } from "../types";
import { exampleState } from "./fixtures";

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
  it("the §6.0 example: 11 found · 2 approximate · 1 requested · 3 missing, of 17", () => {
    expect(coverage(exampleState().snapshots[0]!)).toEqual({ denominator: 17, found: 11, approximate: 2, missing: 3, inProgress: 1, requested: 1, todo: 0 });
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
