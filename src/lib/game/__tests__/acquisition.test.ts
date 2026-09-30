import { describe, expect, it } from "vitest";

import { ACQUISITION_LEVEL, type AcquisitionCardId } from "../levels/acquisition";
import { RETENTION_LEVEL } from "../levels/retention";
import {
  cardGain,
  fresh,
  handIds,
  metricDrivers,
  moodNow,
  reachesBoard,
  shortfall,
  stepMonth,
  trustFactor,
  trustMult,
  visibleEffect,
} from "../model";
import { gameReducer } from "../reducer";
import type { EndingId, GameState, LevelDefinition, ModelSlug, Mood } from "../types";
import { dashboardView, decemberView, driverRows, reportView } from "../view";
import { deepFreeze } from "./paths";

// GAME-BRIEF.md §17: level 2, « Comment les gens vous trouvent », a DRAFT
// the spec quotes number for number. Its four reference years are the
// mirror of level 1's (§6): same picks by role, same shape of year. A
// rebalancing that moves one regenerates the table and §17.6, it does not
// loosen the tolerance.

type Id = AcquisitionCardId;
type Level = LevelDefinition<Id, ModelSlug>;
type Pick2 = readonly [Id, Id];
type Path = readonly Pick2[];

const L: Level = ACQUISITION_LEVEL;

/** §17.6 A — honest, refuses the three orders, presents its data (level 1's A, card for card by role). */
const PATH_A: Path = [["delivery", "origin"], ["guides", "present"], ["specs", "compare"], ["allin", "present"]];
/** §17.6 B — honest, variant. */
const PATH_B: Path = [["delivery", "origin"], ["guides", "specs"], ["compare", "present"], ["verified", "present"]];
/** §17.6 C — obeys everything; the DGCCRF comes in the third quarter. */
const PATH_C: Path = [["stock", "reviews"], ["anchor", "countdown"], ["native", "teaser"], ["delivery", "allin"]];
/** §17.6 D — honest with nothing strong: fired in June. */
const PATH_D: Path = [["origin", "allin"], ["present", "compare"]];
/** The three endings no reference year reaches, found by search and pinned so they stay reachable. */
const PATH_CLEAN_MISS: Path = [["origin", "guides"], ["compare", "present"], ["specs", "verified"], ["present", "allin"]];
const PATH_REPENTANT: Path = [["compare", "countdown"], ["watchers", "guides"], ["allin", "delivery"], ["specs", "clean"]];
const PATH_LABYRINTH: Path = [["origin", "stock"], ["delivery", "specs"], ["clean", "reviews"], ["anchor", "allin"]];
const PATH_FIRED_DARK: Path = [["reviews", "allin"], ["origin", "guides"]];

function playQuarter(state: GameState<Id>, picks: Pick2, level: Level = L): GameState<Id> {
  const reduce = gameReducer(level);
  let s = reduce(state, { type: "hangup" });
  for (const card of picks) s = reduce(s, { type: "toggle", card });
  const next = reduce(s, { type: "run" });
  if (next === s) throw new Error(`quarter ${state.q + 1} refused picks ${picks.join(" + ")}`);
  return next;
}

function playPath(path: Path, level: Level = L): GameState<Id>[] {
  let s = fresh(level);
  const states = [s];
  for (const picks of path) {
    s = playQuarter(s, picks, level);
    states.push(s);
  }
  return states;
}

interface Fixture {
  path: Path;
  /** New customers at the end of each quarter, rounded to the ten as the tile shows it. */
  metric: number[];
  patience: number[];
  mood?: Mood[];
  order?: (Id | null)[];
  ending: EndingId;
  trust?: number;
  radar?: number;
}

const FIXTURES: Record<"A" | "B" | "C" | "D", Fixture> = {
  A: {
    path: PATH_A,
    metric: [2_100, 2_160, 2_650, 3_000],
    patience: [51, 42, 46, 73],
    mood: ["firm", "angry", "angry", "firm"],
    order: [null, "stock", "anchor", "reviews"],
    ending: "applause",
    trust: 83,
    radar: 0,
  },
  B: { path: PATH_B, metric: [2_100, 2_230, 2_800, 3_000], patience: [51, 33, 52, 79], ending: "applause", trust: 85, radar: 0 },
  C: {
    path: PATH_C,
    metric: [2_310, 2_410, 2_320, 970],
    patience: [67, 79, 45, 0],
    mood: ["firm", "calm", "firm", "angry"],
    order: [null, "anchor", "teaser", "stock"],
    ending: "fine",
    trust: 27,
    radar: 1,
  },
  D: { path: PATH_D, metric: [1_980, 1_950], patience: [41, 16], ending: "firedClean", trust: 73 },
};

/** Every departure from §17.6, as readable lines. Tolerances: half the tile's step (5 customers), ±1 elsewhere. */
function mismatches(fixture: Fixture, level: Level): string[] {
  const states = playPath(fixture.path, level);
  const out: string[] = [];
  fixture.metric.forEach((expected, i) => {
    const got = states[i + 1]?.metric ?? NaN;
    if (!(Math.abs(got - expected) <= 5)) out.push(`T${i + 1} new customers ${got.toFixed(1)} ≠ ${expected}`);
  });
  fixture.patience.forEach((expected, i) => {
    const got = states[i + 1]?.patience ?? NaN;
    if (!(Math.abs(got - expected) <= 1)) out.push(`T${i + 1} patience ${got} ≠ ${expected}`);
  });
  fixture.mood?.forEach((expected, i) => {
    const s = states[i];
    const got = s ? moodNow(level, s) : undefined;
    if (got !== expected) out.push(`T${i + 1} mood ${got} ≠ ${expected}`);
  });
  fixture.order?.forEach((expected, i) => {
    const got = states[i]?.order;
    if (got !== expected) out.push(`T${i + 1} order ${got} ≠ ${expected}`);
  });
  const last = states.at(-1);
  if (!last) return ["no state"];
  if (last.ending !== fixture.ending) out.push(`ending ${last.ending} ≠ ${fixture.ending}`);
  if (fixture.trust !== undefined && !(Math.abs(last.trust - fixture.trust) <= 1)) out.push(`trust ${last.trust} ≠ ${fixture.trust}`);
  if (fixture.radar !== undefined && !(Math.abs(last.radar - fixture.radar) <= 1)) out.push(`radar ${last.radar} ≠ ${fixture.radar}`);
  return out;
}

describe("level 2 — série F2, the four reference years of §17.6", () => {
  it("F2.1 · A: honest, refuses the three orders, presents its data", () => {
    expect(mismatches(FIXTURES.A, L)).toEqual([]);
  });

  it("F2.2 · B: the honest variant", () => {
    expect(mismatches(FIXTURES.B, L)).toEqual([]);
  });

  it("F2.3 · C: obeys everything, the DGCCRF comes in the third quarter", () => {
    expect(mismatches(FIXTURES.C, L)).toEqual([]);
  });

  it("F2.4 · D: honest with nothing strong, fired in June", () => {
    expect(mismatches(FIXTURES.D, L)).toEqual([]);
    const last = playPath(PATH_D).at(-1);
    expect(last?.fired).toBe(true);
    expect(last?.log).toHaveLength(2);
  });

  it("non-vacuity: a point off the honest cap breaks at least one fixture", () => {
    const mistuned = { ...L, constants: { ...L.constants, honestCap: 0.42 } };
    const broken = Object.values(FIXTURES).flatMap((f) => mismatches(f, mistuned));
    expect(broken.length).toBeGreaterThan(0);
  });
});

describe("level 2 — F2.5, the balance invariants of §6, independent of exact values", () => {
  const years = { A: playPath(PATH_A), B: playPath(PATH_B), C: playPath(PATH_C), D: playPath(PATH_D) };

  it("A and B end in applause, their lowest patience between 30 and 50 and never under 25", () => {
    for (const states of [years.A, years.B]) {
      const patience = states.slice(1).map((s) => s.patience);
      expect(states.at(-1)?.ending).toBe("applause");
      expect(Math.min(...patience)).toBeGreaterThanOrEqual(30);
      expect(Math.min(...patience)).toBeLessThanOrEqual(50);
      expect(patience.every((p) => p >= 25)).toBe(true);
    }
  });

  it("C is controlled in the third quarter, never before, and ends fined", () => {
    const log = years.C.at(-1)?.log ?? [];
    expect(log.findIndex((entry) => entry.events.some((e) => e.kind === "control"))).toBe(2);
    expect(years.C.at(-1)?.ending).toBe("fine");
  });

  it("in C the temptation pays for two quarters: targets hit in Q1 and Q2", () => {
    const log = years.C.at(-1)?.log ?? [];
    expect(log[0]?.gap).toBeLessThanOrEqual(0);
    expect(log[1]?.gap).toBeLessThanOrEqual(0);
  });

  it("D is fired at the end of the second quarter", () => {
    expect(years.D.at(-1)?.fired).toBe(true);
    expect(years.D.at(-1)?.q).toBe(2);
  });

  it("the patience of A, year for year, is level 1's: the year keeps the shape Antoine validated", () => {
    expect(years.A.slice(1).map((s) => s.patience)).toEqual([51, 42, 46, 73]);
  });

  it("every ending is reachable, each by the year pinned for it", () => {
    const reached: Record<EndingId, Path> = {
      applause: PATH_A,
      cleanMiss: PATH_CLEAN_MISS,
      fine: PATH_C,
      repentant: PATH_REPENTANT,
      labyrinth: PATH_LABYRINTH,
      firedClean: PATH_D,
      firedDark: PATH_FIRED_DARK,
    };
    for (const [ending, path] of Object.entries(reached)) {
      expect(playPath(path).at(-1)?.ending, ending).toBe(ending);
    }
  });
});

describe("level 2 — the hand and the CEO (§17.4)", () => {
  it("the first hand: four tricks, six honest cards, in list order, no data review yet", () => {
    const hand = handIds(L, fresh(L));
    expect(hand.filter((id) => L.cards[id].kind === "d")).toEqual(["stock", "reviews", "countdown", "watchers"]);
    expect(hand.filter((id) => L.cards[id].kind === "h")).toEqual(["delivery", "origin", "guides", "specs", "allin", "compare"]);
  });

  it("after an inspection the CEO never asks again for the reference price or the featured reviews", () => {
    const C = playPath(PATH_C);
    const afterControl = C[3]!;
    expect(afterControl.sanction).toBe(true);
    expect(["anchor", "reviews"]).not.toContain(afterControl.order);
  });
});

describe("the engine, when the board wants its number UP", () => {
  const c = L.constants;

  it("a shortfall is positive under the target and a hit at or above it", () => {
    expect(shortfall(c, 2_100, 2_150)).toBe(50);
    expect(shortfall(c, 2_150, 2_150)).toBe(0);
    expect(shortfall(c, 2_200, 2_150)).toBe(-50);
    // Level 1 reads the same function the other way.
    expect(shortfall(RETENTION_LEVEL.constants, 0.058, 0.056)).toBeCloseTo(0.002, 12);
  });

  it("December's win is 3 000 as the tile rounds it, not a customer less", () => {
    expect(reachesBoard(c, 2_995)).toBe(true);
    expect(reachesBoard(c, 2_994.9)).toBe(false);
    expect(reachesBoard(RETENTION_LEVEL.constants, 0.041)).toBe(true);
    expect(reachesBoard(RETENTION_LEVEL.constants, 0.0411)).toBe(false);
  });

  it("trust weighs the same both ways: ×1,2 on churn at 30 is ×0,8 on new customers", () => {
    expect(trustFactor("down", 30)).toBe(trustMult(30));
    expect(trustFactor("up", 30)).toBeCloseTo(0.8, 12);
    expect(trustFactor("up", 60)).toBe(1);
    expect(trustFactor("up", 90)).toBeCloseTo(1.1, 12);
  });

  it("the first month: 2 000 new customers, the file grows by them, revenue is orders times the basket", () => {
    const s = stepMonth(L, deepFreeze(fresh(L)));
    const e = c.economy;
    if (e.kind !== "shop") throw new Error("level 2 is a shop");
    expect(s.metric).toBe(2_000);
    expect(s.customers).toBe(62_000);
    expect(s.revenue).toBe((2_000 + 60_000 * e.repeatRate) * e.basket);
  });

  it("a gain lifts the number, the spring competitor takes 100 off, a spike takes its size off, the floor holds", () => {
    const at = (over: Partial<GameState<Id>>) => stepMonth(L, { ...fresh(L), ...over });
    expect(at({ active: ["delivery"], since: { delivery: 0 } }).metric).toBeCloseTo(2_100, 9);
    expect(at({ month: 3 }).metric).toBe(1_900);
    expect(at({ spike: 500 }).metric).toBe(1_500);
    expect(at({ spike: 500 }).spike).toBe(500 - c.spikeDecay);
    expect(at({ spike: 5_000 }).metric).toBe(c.floor);
  });

  it("good press brings a shop customers, on the number itself; it never touches level 1's churn", () => {
    expect(stepMonth(L, { ...fresh(L), press: 2 }).metric).toBeCloseTo(2_000 * c.press.boost, 9);
    const R = RETENTION_LEVEL;
    expect(stepMonth(R, { ...fresh(R), press: 2 }).metric).toBe(stepMonth(R, fresh(R)).metric);
  });

  it("trust bends what past customers order again, read on the quarter's trust", () => {
    const e = c.economy;
    if (e.kind !== "shop") throw new Error("level 2 is a shop");
    const low = stepMonth(L, { ...fresh(L), lagTrust: 30, trust: 30 });
    const repeat = 60_000 * e.repeatRate * 0.8;
    expect(low.revenue).toBeCloseTo((low.metric + repeat) * e.basket, 6);
  });

  it("a card's gain reads as a gain, the honest price as a loss", () => {
    const running = (id: Id, age: number): GameState<Id> => ({ ...fresh(L), month: age, active: [id], since: { [id]: 0 } });
    expect(visibleEffect(L, running("stock", 1), "stock")).toEqual({ kind: "gain", pct: 12, rising: false });
    expect(visibleEffect(L, running("delivery", 2), "delivery")).toEqual({ kind: "gain", pct: 5, rising: true });
    expect(visibleEffect(L, running("allin", 1), "allin")).toEqual({ kind: "loss", pct: 1 });
    expect(cardGain(L, running("guides", 4), "guides")).toBe(0.12);
  });

  it("the drivers add up exactly to each quarter's move, on every reference year", () => {
    for (const path of [PATH_A, PATH_B, PATH_C, PATH_D, PATH_REPENTANT, PATH_LABYRINTH]) {
      const states = playPath(path);
      for (let q = 1; q < states.length; q++) {
        const log = states[q]!.log.at(-1)!;
        const d = log.drivers;
        const sum = d.picks + d.production + d.inspection + d.word + d.market;
        expect(sum).toBeCloseTo(log.metricEnd - log.metricStart, 9);
      }
    }
  });

  it("the drivers are the ones the model computes, re-read from the quarter's two ends", () => {
    const states = playPath(PATH_C);
    const before = { ...states[1]!, picks: [...PATH_C[1]!] };
    expect(states[2]!.log.at(-1)!.drivers.market).toBe(metricDrivers(L, { ...before, month: 3 }, { ...states[2]!, month: 6 }).market);
    // The spring offer comes in over Q2 and costs the shop 100 new customers a month.
    expect(states[2]!.log.at(-1)!.drivers.market).toBe(-100);
  });

  it("the report's drivers round to the ten the tile shows, and add up to its move", () => {
    for (const path of [PATH_A, PATH_C]) {
      for (const s of playPath(path).slice(1)) {
        const log = s.log.at(-1)!;
        const { total, rows } = driverRows(log, L.display.step);
        expect(total).toBe(Math.round(log.metricEnd / 10) * 10 - Math.round(log.metricStart / 10) * 10);
        expect(rows.reduce((sum, r) => sum + r.value, 0)).toBeCloseTo(total, 9);
        for (const r of rows) expect(Math.abs(r.value % 10)).toBe(0);
      }
    }
  });

  it("the dashboard: more new customers is good news, January's revenue is the history's first point", () => {
    const states = playPath(PATH_A);
    const v = dashboardView(L, states[1]!, states[0]!);
    expect(v.deltas?.metric.sentiment).toBe("good");
    expect(v.revenueVsJanuary).toBe(states[1]!.revenue - states[0]!.history[0]!.revenue);
    const miss = reportView(L, playPath(PATH_D)[2]!.log[1]!);
    expect(miss.status).toEqual({ kind: "missed", by: miss.status.kind === "missed" ? miss.status.by : 0, severe: true });
  });

  it("December's curve is drawn in customers, with the board's 3 000 as its dotted line", () => {
    const d = decemberView(L, playPath(PATH_A).at(-1)!);
    expect(d.metric.reference).toBe(3_000);
    expect(d.metric.values[0]).toBe(2_000);
    expect(d.metric.scale.min).toBe(1_000);
    expect(d.metric.scale.max).toBeGreaterThanOrEqual(4_000);
  });
});
