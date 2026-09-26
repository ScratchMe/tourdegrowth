import { describe, expect, it } from "vitest";

import { METRIC_SHAPES } from "../catalog-shape";
import { knownSharedCount, offBase, propagateFrom, SHARED_COUNTS, sharedCountAt, withSharedCount } from "../shared-counts";
import { validateEngine } from "../validate";
import { ENGINE_CATALOG } from "@/content/engine-catalog";
import { emptyState, exampleState, measured, ratio } from "./fixtures";

// Antoine, 2026-09-25: « il y a des chiffres qui sont demandés plusieurs fois
// dans plusieurs catégories ». The cohort's sign-ups were typed five times.

describe("SHARED_COUNTS — which numbers share a count", () => {
  it("groups exactly the count labels the catalogue writes identically, and no other", () => {
    // The catalogue is the source of truth for what a count IS: if two
    // labels read the same, they are one population and belong together.
    const label = (id: string, side: "numerator" | "denominator") =>
      ENGINE_CATALOG[id as keyof typeof ENGINE_CATALOG].inputs?.[side]?.fr ?? null;
    for (const slots of Object.values(SHARED_COUNTS)) {
      const labels = new Set(slots.map((s) => label(s.metric, s.side)));
      expect(labels.size, JSON.stringify(slots)).toBe(1);
    }
    // And every repeated label across the catalogue is covered by a group.
    const seen = new Map<string, string[]>();
    for (const shape of METRIC_SHAPES) {
      for (const side of ["numerator", "denominator"] as const) {
        const l = label(shape.id, side);
        if (l) seen.set(l, [...(seen.get(l) ?? []), `${shape.id}:${side}`]);
      }
    }
    for (const [l, slots] of seen) {
      if (slots.length < 2) continue;
      const covered = slots.every((s) => {
        const [id, side] = s.split(":") as [string, "numerator" | "denominator"];
        return sharedCountAt(id as never, side) !== null;
      });
      expect(covered, `« ${l} » appears in ${slots.join(", ")} but is not shared`).toBe(true);
    }
  });
});

describe("knownSharedCount", () => {
  it("reads the base first, then the first entry that carries the count (a file from before the base)", () => {
    const snap = exampleState().snapshots[0]!;
    expect(knownSharedCount(snap, "cohortSignups")).toEqual({ value: 800, from: "act.rate" });
    expect(knownSharedCount({ ...snap, base: { cohortSignups: 810 } }, "cohortSignups")).toEqual({ value: 810, from: "base" });
    expect(knownSharedCount(emptyState().snapshots[0]!, "cohortSignups")).toBeNull();
  });
});

describe("withSharedCount / propagateFrom", () => {
  it("writes the count into the base and into every entry that carries it as counts", () => {
    const snap = withSharedCount(exampleState().snapshots[0]!, "cohortSignups", 820);
    expect(snap.base?.cohortSignups).toBe(820);
    expect(snap.metrics["act.rate"]?.value).toEqual(ratio(144, 820));
    expect(snap.metrics["ref.referred-share"]?.value).toEqual(ratio(48, 820));
    // An estimate carries no count: untouched.
    expect(snap.metrics["rev.paid-conversion"]).toEqual(exampleState().snapshots[0]!.metrics["rev.paid-conversion"]);
    expect(offBase(snap, "cohortSignups")).toEqual([]);
  });

  it("never makes a bounded number impossible: that entry keeps its own base, and is listed as off it", () => {
    const snap = withSharedCount(exampleState().snapshots[0]!, "cohortSignups", 100);
    expect(snap.metrics["act.rate"]?.value).toEqual(ratio(144, 800));
    expect(offBase(snap, "cohortSignups")).toContain("act.rate");
  });

  it("saving one entry propagates its counts to the others, both groups", () => {
    const start = exampleState().snapshots[0]!;
    const snap = propagateFrom({ ...start, metrics: { ...start.metrics, "acq.top-channel-share": measured(ratio(410, 830)) } }, "acq.top-channel-share");
    expect(snap.base?.monthSignups).toBe(830);
    expect(snap.metrics["acq.signup-rate"]?.value).toEqual(ratio(830, 26_000));
  });

  it("a state with a base passes validation; a nonsense base does not", () => {
    const state = exampleState();
    state.snapshots[0]!.base = { cohortSignups: 800, monthSignups: 820 };
    expect(validateEngine(state)).toEqual([]);
    (state.snapshots[0]!.base as Record<string, number>).cohortSignups = 0;
    expect(validateEngine(state).join()).toContain("base.cohortSignups");
  });
});
