import { describe, expect, it } from "vitest";
import {
  METRIC_SHAPES,
  MKT_DEMAND_CANDIDATE_IDS,
  MKT_DEMAND_LEVER_IDS,
  MKT_METRIC_SHAPES,
  MKT_SUPPLY_CANDIDATE_IDS,
  MKT_SUPPLY_LEVER_IDS,
  SLG_CANDIDATE_IDS,
  SLG_METRIC_SHAPES,
  CANDIDATE_IDS,
  LINK_METRIC_SHAPES,
} from "../catalog-shape";
import type { MetricShape } from "../catalog-shape";
import { deriveEngine } from "../derive";
import { diagnose, diagnoseSide } from "../diagnose";
import { mktUnitEconomics } from "../mkt-economics";
import { buildMktFunnel } from "../mkt-funnel";
import { buildMktScenario, mktTotal } from "../mkt-scenario";
import { buildPeloton } from "../peloton";
import { buildRelays } from "../relays";
import { buildScenario } from "../scenario";
import type { EngineState, LeverId, MetricEntry, MetricId, MotionDerived } from "../types";
import { slgUnitEconomics, unitEconomics } from "../unit-economics";
import { consumerState, exampleState, hybridState, marketplaceState } from "./fixtures";
import { CTX_FR, FR } from "./props";

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

// --- A marketplace (§22.11.1, A23 MKT-4). Its numbers are read by no other type, and its two sides never read each other:
// only the total adds (D2). Four hundred random states each (fixed seeds): a derivation of a whole marketplace costs ten times a diagnosis, and a test that nears the default 5 s timeout fails on a loaded machine.
//
// Non-vacuity, measured on 2026-10-25: see the entry of A23 MKT-4 in `JOURNAL.md`.

const MKT_SELL = MKT_METRIC_SHAPES.filter((s) => s.side === "sell");
const MKT_BUY = MKT_METRIC_SHAPES.filter((s) => s.side !== "sell");
const MKT_SELL_COUNTS = ["mktSellerCohortSignups", "mktSellerMrrEnd"];
const MKT_BUY_COUNTS = ["mktCohortSignups", "mktOrders", "mktGmv", "mktNetRevenue"];
const levers = (ids: readonly LeverId[], rnd: () => number): Partial<Record<LeverId, number>> =>
  Object.fromEntries(ids.filter(() => rnd() < 0.5).map((id) => [id, Math.floor(rnd() * 100)]));

describe("a marketplace and the other types never read each other", () => {
  const mktOf = (state: EngineState) => deriveEngine(state, CTX_FR, null, [], FR.strings.units);

  it("a SaaS, a hybrid and an app don't move: four hundred random marketplace numbers, kept in their file, leave their diagnoses, economics and scenario as they were", () => {
    const rnd = seeded(20261025);
    // Non-vacuity of the draw itself: read as a marketplace's, the random numbers name a stage on one side or the other.
    const asMarketplace = marketplaceState().setup;
    let live = 0;
    for (let i = 0; i < 400; i++) {
      const base = i % 3 === 0 ? consumerState() : i % 3 === 1 ? hybridState() : exampleState();
      const s = randomise(base, MKT_METRIC_SHAPES, [...MKT_DEMAND_CANDIDATE_IDS, ...MKT_SUPPLY_CANDIDATE_IDS], rnd);
      const alone = without(s, ["mkt."], [...MKT_BUY_COUNTS, ...MKT_SELL_COUNTS]);
      expect(diagnose(s, CTX_FR)).toEqual(diagnose(alone, CTX_FR));
      expect(buildPeloton(s, CTX_FR)).toEqual(buildPeloton(alone, CTX_FR));
      expect(unitEconomics(s, CTX_FR)).toEqual(unitEconomics(alone, CTX_FR));
      expect(buildScenario(s, {}, CTX_FR)).toEqual(buildScenario(alone, {}, CTX_FR));
      if (s.setup.motions.slg) {
        expect(diagnose(s, CTX_FR, "slg")).toEqual(diagnose(alone, CTX_FR, "slg"));
        expect(buildRelays(s, CTX_FR)).toEqual(buildRelays(alone, CTX_FR));
      }
      // Everything the board and the deck are made of: the whole derivation, but for nothing of a marketplace's.
      expect(mktOf(s)).toEqual(mktOf(alone));
      const read = { ...s, setup: asMarketplace };
      if (diagnoseSide(read, CTX_FR, "demand").named.length + diagnoseSide(read, CTX_FR, "supply").named.length > 0) live++;
    }
    expect(live).toBeGreaterThan(100);
  });

  it("a marketplace doesn't move: four hundred random SaaS numbers, kept in its file, leave its motion, its checks and its findings as they were", () => {
    const rnd = seeded(20261026);
    const mktParts = (state: EngineState) => {
      const derived = mktOf(state);
      return {
        motion: derived.motions.find((m): m is Extract<MotionDerived, { motion: "mkt" }> => m.motion === "mkt"),
        sanity: derived.sanity.filter((c) => c.motion === "mkt"),
        findings: derived.findings.filter((f) => f.motion === "mkt"),
        total: derived.total,
      };
    };
    // Non-vacuity of the draw itself: read as a hybrid's, the random numbers name a stage in one motion or the other.
    const asHybrid = hybridState().setup;
    let live = 0;
    for (let i = 0; i < 400; i++) {
      const s = randomise(marketplaceState(), [...METRIC_SHAPES, ...SLG_METRIC_SHAPES, ...LINK_METRIC_SHAPES], [...CANDIDATE_IDS, ...SLG_CANDIDATE_IDS], rnd);
      const alone = without(s, [...PLG_PREFIXES, ...SLG_PREFIXES], [...PLG_COUNTS, ...SLG_COUNTS]);
      expect(mktParts(s)).toEqual(mktParts(alone));
      const read = { ...s, setup: asHybrid };
      if (diagnose(read, CTX_FR).named.length + diagnose(read, CTX_FR, "slg").named.length > 0) live++;
    }
    expect(live).toBeGreaterThan(100);
  });
});

describe("a marketplace's two sides never read each other", () => {
  it("the demand doesn't move: four hundred random supply states leave its diagnosis, funnel, economics and scenario as they were — only the total moves", () => {
    const rnd = seeded(20261027);
    // Non-vacuity of the draw itself: the supply it randomises names a stage often, and moves the total.
    let live = 0;
    let totalMoved = 0;
    for (let i = 0; i < 400; i++) {
      const s = randomise(marketplaceState(), MKT_SELL, MKT_SUPPLY_CANDIDATE_IDS, rnd);
      const alone = without(s, ["mkt.sell."], MKT_SELL_COUNTS);
      // The other side's what-ifs are in the same file, and ignored: a side's scenario is built on its own levers.
      const targets = { ...levers(MKT_DEMAND_LEVER_IDS, rnd), ...levers(MKT_SUPPLY_LEVER_IDS, rnd) };
      const own = Object.fromEntries(Object.entries(targets).filter(([id]) => (MKT_DEMAND_LEVER_IDS as readonly string[]).includes(id)));
      expect(diagnoseSide(s, CTX_FR, "demand")).toEqual(diagnoseSide(alone, CTX_FR, "demand"));
      expect(buildMktFunnel(s, CTX_FR).demand).toEqual(buildMktFunnel(alone, CTX_FR).demand);
      expect(mktUnitEconomics(s, CTX_FR, "demand")).toEqual(mktUnitEconomics(alone, CTX_FR, "demand"));
      expect(buildMktScenario(s, targets, CTX_FR, "demand")).toEqual(buildMktScenario(alone, own, CTX_FR, "demand"));
      expect(mktTotal(s, CTX_FR).now.demand).toEqual(mktTotal(alone, CTX_FR).now.demand);
      if (diagnoseSide(s, CTX_FR, "supply").named.length > 0) live++;
      if (JSON.stringify(mktTotal(s, CTX_FR).now.total) !== JSON.stringify(mktTotal(alone, CTX_FR).now.total)) totalMoved++;
    }
    expect(live).toBeGreaterThan(100);
    expect(totalMoved).toBeGreaterThan(100);
  });

  it("the supply doesn't move: four hundred random demand states leave its diagnosis, funnel, economics and scenario as they were — only the total moves", () => {
    const rnd = seeded(20261028);
    let live = 0;
    let totalMoved = 0;
    for (let i = 0; i < 400; i++) {
      const s = randomise(marketplaceState(), MKT_BUY, MKT_DEMAND_CANDIDATE_IDS, rnd);
      const alone = without(s, ["mkt.buy.", "mkt.liq.", "mkt.rev."], MKT_BUY_COUNTS);
      const targets = { ...levers(MKT_DEMAND_LEVER_IDS, rnd), ...levers(MKT_SUPPLY_LEVER_IDS, rnd) };
      const own = Object.fromEntries(Object.entries(targets).filter(([id]) => (MKT_SUPPLY_LEVER_IDS as readonly string[]).includes(id)));
      expect(diagnoseSide(s, CTX_FR, "supply")).toEqual(diagnoseSide(alone, CTX_FR, "supply"));
      expect(buildMktFunnel(s, CTX_FR).supply).toEqual(buildMktFunnel(alone, CTX_FR).supply);
      expect(mktUnitEconomics(s, CTX_FR, "supply")).toEqual(mktUnitEconomics(alone, CTX_FR, "supply"));
      expect(buildMktScenario(s, targets, CTX_FR, "supply")).toEqual(buildMktScenario(alone, own, CTX_FR, "supply"));
      expect(mktTotal(s, CTX_FR).now.supply).toEqual(mktTotal(alone, CTX_FR).now.supply);
      if (diagnoseSide(s, CTX_FR, "demand").named.length > 0) live++;
      if (JSON.stringify(mktTotal(s, CTX_FR).now.total) !== JSON.stringify(mktTotal(alone, CTX_FR).now.total)) totalMoved++;
    }
    expect(live).toBeGreaterThan(100);
    expect(totalMoved).toBeGreaterThan(100);
  });
});
