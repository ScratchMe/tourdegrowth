import { describe, expect, it } from "vitest";
import { METRIC_SHAPES, SLG_CANDIDATE_IDS, SLG_METRIC_SHAPES, CANDIDATE_IDS, LINK_METRIC_SHAPES } from "../catalog-shape";
import type { MetricShape } from "../catalog-shape";
import { diagnose } from "../diagnose";
import { buildPeloton } from "../peloton";
import { buildRelays } from "../relays";
import { buildScenario } from "../scenario";
import type { EngineState, MetricEntry, MetricId } from "../types";
import { slgUnitEconomics, unitEconomics } from "../unit-economics";
import { exampleState, hybridState } from "./fixtures";
import { CTX_FR } from "./props";

// Engine spec §18.5 and §18.10.1 « indépendance des motions » (A7.3.c S1):
// no module reads a number of the other motion — only `total.ts` adds, and
// `sanity.ts` compares the two CACs' variants. A thousand random states
// (fixed seed) on each side, and the other motion's derived figures must not
// move by a bit.
//
// Non-vacuity, measured on 2026-10-01: a self-serve diagnosis that also
// positions `slg.rev.win-rate` fails « self-serve doesn't move » (and the
// golden v1, and the hybrid's findings); a sales-assisted diagnosis that adds
// `rev.arpa` to its blind watch fails « sales-assisted doesn't move », and
// only it — no other test sees that leak; the go-live relay reading
// `act.rate` when it is known fails it too, with the relays' own example.

/** mulberry32: a small seeded generator — the same thousand states on every run. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const at = "2026-09-20T10:00:00.000Z";
const tool = { kind: "tool", tool: "hubspot" } as const;

function randomEntry(shape: MetricShape, rnd: () => number): MetricEntry | undefined {
  const r = rnd();
  const int = (n: number) => Math.floor(rnd() * n);
  if (r < 0.15) return undefined;
  if (r < 0.25) return { status: "missing", missing: { cause: rnd() < 0.5 ? "not-tracked" : "no-definition", repair: "meeting" }, updatedAt: at };
  if (r < 0.3) return { status: "requested", request: { role: "revops", requestedAt: at }, updatedAt: at };
  const variant = shape.variants ? { variant: shape.variants[int(shape.variants.length)]! } : {};
  switch (shape.unit) {
    case "text":
      return { status: "measured", value: { kind: "text", text: "x" }, source: { kind: "other" }, updatedAt: at };
    case "choice":
      return { status: "measured", value: { kind: "choice", choice: shape.choices?.[0] ?? "product" }, source: { kind: "other" }, updatedAt: at };
    case "duration":
      return { status: "measured", value: { kind: "duration", value: 1 + int(200), unit: "days", statistic: rnd() < 0.5 ? "median" : "mean" }, source: tool, updatedAt: at, ...variant };
    case "money": {
      if (r < 0.45) return { status: "estimated", estimate: { low: 50 + int(500), high: 600 + int(5_000), basis: "team-hunch" }, updatedAt: at, ...variant };
      const n = 1 + int(60);
      return { status: "measured", value: { kind: "ratio", numerator: n * (100 + int(30_000)), denominator: n }, source: tool, updatedAt: at, ...variant };
    }
    default: {
      // Percent: counts (bounded: the part never above the whole), a typed rate, or an estimate.
      if (r < 0.45) {
        const lo = int(60);
        return { status: "estimated", estimate: { low: lo, high: lo + 1 + int(30), basis: "old-number" }, updatedAt: at, ...variant };
      }
      if (r < 0.55) return { status: "measured", value: { kind: "rate", percent: 1 + int(95) }, source: tool, updatedAt: at, ...variant };
      const den = 1 + int(600);
      const num = shape.bounded ? int(den + 1) : int(den * 2);
      return { status: "measured", value: { kind: "ratio", numerator: num, denominator: den }, source: tool, updatedAt: at, ...variant };
    }
  }
}

/** The state with `shapes` filled at random, and random targets on `candidates`. */
function randomise(state: EngineState, shapes: readonly MetricShape[], candidates: readonly MetricId[], rnd: () => number): EngineState {
  const next = structuredClone(state);
  const snapshot = next.snapshots[0]!;
  for (const shape of shapes) {
    const entry = randomEntry(shape, rnd);
    if (entry) snapshot.metrics[shape.id] = entry;
    else delete snapshot.metrics[shape.id];
  }
  for (const id of candidates) {
    if (rnd() < 0.6) snapshot.targets[id] = Math.floor(rnd() * 100);
    else delete snapshot.targets[id];
  }
  return next;
}

/** The same state without one motion's numbers, targets and counts. */
function without(state: EngineState, prefixes: readonly string[], counts: readonly string[]): EngineState {
  const next = structuredClone(state);
  const snapshot = next.snapshots[0]!;
  const drop = (id: string) => prefixes.some((p) => id.startsWith(p));
  for (const id of Object.keys(snapshot.metrics)) if (drop(id)) delete snapshot.metrics[id as MetricId];
  for (const id of Object.keys(snapshot.targets)) if (drop(id)) delete snapshot.targets[id as MetricId];
  for (const c of counts) if (snapshot.base) delete snapshot.base[c as keyof typeof snapshot.base];
  return next;
}

const SLG_PREFIXES = ["slg.", "link."];
const SLG_COUNTS = ["slgOppsCreated", "slgDealsWon", "slgCustomers"];
const PLG_PREFIXES = ["acq.", "act.", "ret.", "ref.", "rev."];
const PLG_COUNTS = ["cohortSignups", "monthSignups", "mrrEnd", "mrrStart"];

describe("the two motions never read each other", () => {
  it("self-serve doesn't move: a thousand random sales-assisted states leave its diagnosis, peloton, unit economics and scenario as they were", () => {
    const rnd = seeded(20260930);
    const base = { ...exampleState(), setup: { ...exampleState().setup, motions: { plg: true, slg: true } } };
    let named = 0;
    for (let i = 0; i < 1_000; i++) {
      const s = randomise(base, [...SLG_METRIC_SHAPES, ...LINK_METRIC_SHAPES], [...SLG_CANDIDATE_IDS, "link.pql-handoff"], rnd);
      if (i % 2 === 0) s.snapshots[0]!.base = { slgOppsCreated: 1 + Math.floor(rnd() * 300), slgDealsWon: Math.floor(rnd() * 40), slgCustomers: 1 + Math.floor(rnd() * 500) };
      const alone = without(s, SLG_PREFIXES, SLG_COUNTS);
      expect(diagnose(s, CTX_FR)).toEqual(diagnose(alone, CTX_FR));
      expect(buildPeloton(s, CTX_FR)).toEqual(buildPeloton(alone, CTX_FR));
      expect(unitEconomics(s, CTX_FR)).toEqual(unitEconomics(alone, CTX_FR));
      expect(buildScenario(s, {}, CTX_FR)).toEqual(buildScenario(alone, {}, CTX_FR));
      if (diagnose(s, CTX_FR, "slg").named.length > 0) named++;
    }
    // Non-vacuity of the draw itself: the sales-assisted side named a stage often enough to matter.
    expect(named).toBeGreaterThan(100);
  });

  it("sales-assisted doesn't move: a thousand random self-serve states leave its diagnosis, relays and unit economics as they were", () => {
    const rnd = seeded(20261001);
    let named = 0;
    for (let i = 0; i < 1_000; i++) {
      const s = randomise(hybridState(), METRIC_SHAPES, CANDIDATE_IDS, rnd);
      const alone = without(s, PLG_PREFIXES, PLG_COUNTS);
      expect(diagnose(s, CTX_FR, "slg")).toEqual(diagnose(alone, CTX_FR, "slg"));
      expect(buildRelays(s, CTX_FR)).toEqual(buildRelays(alone, CTX_FR));
      expect(slgUnitEconomics(s, CTX_FR)).toEqual(slgUnitEconomics(alone, CTX_FR));
      if (diagnose(s, CTX_FR).named.length > 0) named++;
    }
    expect(named).toBeGreaterThan(100);
  });
});
