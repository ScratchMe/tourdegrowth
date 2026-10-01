import { describe, expect, it } from "vitest";

import { ALL_METRIC_SHAPES } from "../catalog-shape";
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
    const label = (id: string, side: "numerator" | "denominator", locale: "fr" | "en" = "fr") =>
      ENGINE_CATALOG[id as keyof typeof ENGINE_CATALOG].inputs?.[side]?.[locale] ?? null;
    // Every group, the three sales-assisted ones included since their prose (A7.3.c S2), in both languages.
    expect(Object.keys(SHARED_COUNTS)).toEqual(expect.arrayContaining(["slgOppsCreated", "slgDealsWon", "slgCustomers"]));
    for (const slots of Object.values(SHARED_COUNTS)) {
      for (const locale of ["fr", "en"] as const) {
        const labels = new Set(slots.map((s) => label(s.metric, s.side, locale)));
        expect(labels.size, `${locale} ${JSON.stringify(slots)}`).toBe(1);
        expect([...labels][0], `${locale} ${JSON.stringify(slots)}`).not.toBeNull();
      }
    }
    // And every repeated label across the catalogue, every motion's, is covered by a group.
    const seen = new Map<string, string[]>();
    for (const shape of ALL_METRIC_SHAPES) {
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

describe("the sales-assisted counts (engine spec §18.2, S6)", () => {
  it("opportunities, deals won and customers are each typed once, and reach every entry that carries them", () => {
    const at = "2026-09-30T10:00:00.000Z";
    const tool = { kind: "tool" as const, tool: "hubspot" as const };
    const snap = {
      ...emptyState().snapshots[0]!,
      metrics: {
        "slg.rev.win-rate": { status: "measured" as const, value: ratio(18, 75), source: tool, updatedAt: at },
        "slg.rev.acv": { status: "measured" as const, value: ratio(432_000, 17), source: tool, updatedAt: at },
        "slg.ref.referred-share": { status: "measured" as const, value: ratio(26, 130), source: tool, updatedAt: at },
      },
    };
    // The win rate's 18 deals won is the ACV's count of contracts: saving one writes the other.
    const next = propagateFrom(snap, "slg.rev.win-rate");
    expect(next.base?.slgDealsWon).toBe(18);
    expect(next.metrics["slg.rev.acv"]?.value).toEqual(ratio(432_000, 18));
    expect(sharedCountAt("link.pql-handoff", "denominator")).toBe("slgOppsCreated");
    expect(sharedCountAt("slg.ref.referenceable", "denominator")).toBe("slgCustomers");
    expect(sharedCountAt("slg.acq.cac", "denominator")).toBe("slgDealsWon");
    // The self-serve counts never reach a sales-assisted number, and the reverse.
    for (const count of ["cohortSignups", "monthSignups", "mrrEnd", "mrrStart"] as const)
      expect(SHARED_COUNTS[count].every((s) => !s.metric.startsWith("slg.") && !s.metric.startsWith("link."))).toBe(true);
  });

  it("a sales-assisted count is a whole number: 12.5 deals is refused", () => {
    const state = exampleState();
    state.snapshots[0]!.base = { slgOppsCreated: 130, slgDealsWon: 18, slgCustomers: 100 };
    expect(validateEngine(state)).toEqual([]);
    state.snapshots[0]!.base.slgDealsWon = 12.5;
    expect(validateEngine(state)).toEqual(["snapshots[0].base.slgDealsWon: not a whole number > 0"]);
  });
});

describe("the MRR counts (2026-09-26)", () => {
  it("the MRR typed for ARPA is the gross margin's base, and the 1st-of-month MRR is shared by expansion and contraction", () => {
    const snapshot = exampleState().snapshots[0]!;
    // Gross margin: typed later, its revenue already there.
    expect(knownSharedCount(snapshot, "mrrEnd")).toEqual({ value: 48_000, from: "rev.arpa" });
    expect(knownSharedCount(snapshot, "mrrStart")).toEqual({ value: 46_800, from: "rev.expansion" });
    const withMargin = {
      ...snapshot,
      metrics: { ...snapshot.metrics, "rev.gross-margin": { status: "measured" as const, value: { kind: "ratio" as const, numerator: 36_000, denominator: 40_000 }, source: { kind: "other" as const }, updatedAt: "2026-09-26T10:00:00.000Z" } },
    };
    const next = propagateFrom(withMargin, "rev.gross-margin");
    expect(next.base?.mrrEnd).toBe(40_000);
    expect(next.metrics["rev.arpa"]?.value).toEqual({ kind: "ratio", numerator: 40_000, denominator: 400 });
  });
});
