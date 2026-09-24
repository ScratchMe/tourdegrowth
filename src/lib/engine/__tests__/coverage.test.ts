import { describe, expect, it } from "vitest";
import { METRIC_SHAPES } from "../catalog-shape";
import { coverage } from "../coverage";
import type { MetricEntry, MetricStatus, Snapshot } from "../types";
import { exampleState } from "./fixtures";

// Engine spec §13.1 "coverage". The invariant that lost half a point in the
// audit instrument: found + approximate + missing + inProgress ===
// denominator, for every combination of statuses. Non-vacuity: counting
// "conflicting" nowhere fails both invariant tests and the example; letting
// "not-applicable" stay in the denominator fails the invariant tests and
// "only not-applicable moves the denominator", while the example passes
// (it has no not-applicable) — which is why the invariant is swept.

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

function check(statuses: MetricStatus[]): void {
  const c = coverage(snapshotWith(statuses));
  expect(c.found + c.approximate + c.missing + c.inProgress).toBe(c.denominator);
  expect(c.requested + c.todo).toBe(c.inProgress);
  expect(c.denominator).toBe(15 - statuses.filter((s) => s === "not-applicable").length);
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
  it("the §6.0 example: 9 found · 2 approximate · 1 requested · 3 missing, of 15", () => {
    expect(coverage(exampleState().snapshots[0]!)).toEqual({ denominator: 15, found: 9, approximate: 2, missing: 3, inProgress: 1, requested: 1, todo: 0 });
  });

  it("the sum invariant holds for the full cartesian product of statuses within each stage (7³ × 5)", () => {
    let cases = 0;
    for (let stage = 0; stage < 5; stage++) {
      for (const a of STATUSES) {
        for (const b of STATUSES) {
          for (const c of STATUSES) {
            const statuses = Array<MetricStatus>(15).fill("measured");
            statuses[stage * 3] = a;
            statuses[stage * 3 + 1] = b;
            statuses[stage * 3 + 2] = c;
            check(statuses);
            cases++;
          }
        }
      }
    }
    expect(cases).toBe(1715);
  });

  it("the sum invariant holds on 10 000 deterministic random combinations across all 15 numbers", () => {
    const random = prng(20260924);
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const statuses = Array.from({ length: 15 }, () => STATUSES[Math.floor(random() * STATUSES.length)]!);
      seen.add(statuses.join());
      check(statuses);
    }
    // The generator really spreads: nearly every draw is new (7¹⁵ ≈ 4.7 × 10¹²).
    expect(seen.size).toBeGreaterThan(9_990);
  });

  it("only not-applicable moves the denominator", () => {
    for (const status of STATUSES) {
      const statuses = Array<MetricStatus>(15).fill(status);
      expect(coverage(snapshotWith(statuses)).denominator).toBe(status === "not-applicable" ? 0 : 15);
    }
  });
});
