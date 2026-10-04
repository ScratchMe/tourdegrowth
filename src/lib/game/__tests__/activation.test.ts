import { describe, expect, it } from "vitest";

import { metricFormat } from "../format";
import { ACTIVATION_LEVEL } from "../levels/activation";
import { fresh, handIds, reachesBoard, stepMonth } from "../model";
import { decemberView, driverRows } from "../view";
import { mismatches, type Fixture } from "./fixture-check";
import { deepFreeze } from "./paths";
import {
  ENDING_PATHS,
  PATH_A,
  PATH_B,
  PATH_C,
  PATH_D,
  PATH_LABYRINTH,
  PATH_REPENTANT,
  playPath,
  type Id,
  type Level,
} from "./paths-activation";

// GAME-BRIEF §18 (`docs/game/activation.md`): the activation level « Comment ils comprennent ce que vous apportez », a DRAFT
// model the spec quotes number for number — written on 2026-10-04 so an
// agent can wire the level without re-deriving it (CHANTIERS.md A22). Its
// four reference years are level 2's, card for card by role. A rebalancing
// that moves one regenerates the table and the spec, it does not loosen
// the tolerance (half a tenth of a point, what the tile rounds to).

const L: Level = ACTIVATION_LEVEL;
const TOL = 0.0005;

const FIXTURES: Record<"A" | "B" | "C" | "D", Fixture<Id>> = {
  A: {
    path: PATH_A,
    metric: [0.315, 0.324, 0.398, 0.45],
    patience: [51, 42, 46, 73],
    mood: ["firm", "angry", "angry", "firm"],
    order: [null, "bundle", "banner", "phone"],
    ending: "applause",
    trust: 83,
    radar: 0,
  },
  B: { path: PATH_B, metric: [0.315, 0.335, 0.421, 0.45], patience: [51, 33, 52, 79], ending: "applause", trust: 85, radar: 0 },
  C: {
    path: PATH_C,
    metric: [0.346, 0.362, 0.348, 0.145],
    patience: [67, 79, 45, 0],
    mood: ["firm", "calm", "firm", "angry"],
    order: [null, "banner", "partners", "bundle"],
    ending: "fine",
    trust: 27,
    radar: 1,
  },
  D: { path: PATH_D, metric: [0.297, 0.292], patience: [40, 15], ending: "firedClean", trust: 73 },
};

const check = (fixture: Fixture<Id>, level: Level = L) => mismatches(fixture, level, playPath, TOL);

describe("activation — série F18, the four reference years of §18", () => {
  it("F18.1 · A: honest, refuses the three orders, presents its data", () => {
    expect(check(FIXTURES.A)).toEqual([]);
  });

  it("F18.2 · B: the honest variant", () => {
    expect(check(FIXTURES.B)).toEqual([]);
  });

  it("F18.3 · C: obeys everything, the CNIL comes in the third quarter", () => {
    expect(check(FIXTURES.C)).toEqual([]);
  });

  it("F18.4 · D: honest with nothing strong, fired in June", () => {
    expect(check(FIXTURES.D)).toEqual([]);
    const last = playPath(PATH_D).at(-1);
    expect(last?.fired).toBe(true);
    expect(last?.log).toHaveLength(2);
  });

  it("non-vacuity: a point off the honest cap breaks at least one fixture", () => {
    const mistuned = { ...L, constants: { ...L.constants, honestCap: 0.42 } };
    expect(Object.values(FIXTURES).flatMap((f) => check(f, mistuned)).length).toBeGreaterThan(0);
  });
});

describe("activation — F18.5, the balance invariants of §6, independent of exact values", () => {
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

  it("C is controlled in the third quarter, never before, and ends with the sanction", () => {
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
    for (const [ending, path] of Object.entries(ENDING_PATHS)) {
      expect(playPath(path).at(-1)?.ending, ending).toBe(ending);
    }
  });
});

describe("activation — the hand and the CEO", () => {
  it("the first hand: four tricks, six honest cards, in list order, no data review yet", () => {
    const hand = handIds(L, fresh(L));
    expect(hand.filter((id) => L.cards[id].kind === "d")).toEqual(["bundle", "phone", "prechecked", "analysis"]);
    expect(hand.filter((id) => L.cards[id].kind === "h")).toEqual(["demo", "calls", "checklist", "import", "refuse", "welcome"]);
  });

  it("after the sanction the CEO never asks again for the cookie banner or the mandatory number", () => {
    const afterControl = playPath(PATH_C)[3]!;
    expect(afterControl.sanction).toBe(true);
    expect(["banner", "phone"]).not.toContain(afterControl.order);
  });
});

describe("activation — its economy, its number, its frame", () => {
  const c = L.constants;

  it("the first month holds the base still", () => {
    const s = stepMonth(L, deepFreeze(fresh(L)));
    expect(s.metric).toBe(0.3);
    // 10 000 sign-ups at 30 % make 3 000 active users; 5 % of 60 000 stop.
    expect(s.customers).toBeCloseTo(60_000, 9);
    expect(s.revenue).toBeCloseTo(60_000 * 5, 6);
  });

  it("trust bends who stops (the quarter's) and who arrives (the moment's)", () => {
    const low = stepMonth(L, { ...fresh(L), lagTrust: 30, trust: 30 });
    // At trust 30: 6 % stop instead of 5 % (×1,2), 8 000 sign-ups instead of 10 000 (×0,8), at 24 % (×0,8).
    expect(low.customers).toBeCloseTo(60_000 - 60_000 * 0.05 * 1.2 + 10_000 * 0.8 * 0.3 * 0.8, 6);
  });

  it("good press lifts the number itself, as on level 2", () => {
    expect(stepMonth(L, { ...fresh(L), press: 2 }).metric).toBeCloseTo(c.metric0 * c.press.boost, 12);
  });

  it("December's win is the board's number as the tile rounds it", () => {
    expect(reachesBoard(c, 0.4495)).toBe(true);
    expect(reachesBoard(c, 0.4494)).toBe(false);
  });

  it("the number reads in its own unit, everywhere", () => {
    const f = metricFormat(L.display);
    expect(f.value("fr", 0.3)).toBe("30,0\u00A0%");
    expect(f.value("en", 0.4495)).toBe("45.0%");
    expect(f.gap("fr", 0.0002)).toBe("0,1\u00A0pt");
    expect(f.tick("fr", 45)).toBe("45\u00A0%");
    expect(f.delta).toBe("rate");
  });

  it("the report's drivers round to the tile's step and add up to its move, on every reference year", () => {
    for (const path of [PATH_A, PATH_B, PATH_C, PATH_D, PATH_REPENTANT, PATH_LABYRINTH]) {
      const states = playPath(path);
      for (let q = 1; q < states.length; q++) {
        const log = states[q]!.log.at(-1)!;
        const d = log.drivers;
        expect(d.picks + d.production + d.inspection + d.word + d.market).toBeCloseTo(log.metricEnd - log.metricStart, 9);
        const { total, rows } = driverRows(log, L.display.step);
        expect(rows.reduce((sum, r) => sum + r.value, 0)).toBeCloseTo(total, 9);
      }
    }
  });

  it("December's curve is drawn in the chart's unit, with the board's number as its dotted line", () => {
    const d = decemberView(L, playPath(PATH_A).at(-1)!);
    expect(d.metric.reference).toBeCloseTo(45, 9);
    expect(d.metric.scale.min).toBeLessThanOrEqual(L.display.chart.min);
    expect(d.metric.scale.max).toBeGreaterThanOrEqual(L.display.chart.max);
    expect(d.metric.scale.ticks).toContain(L.display.chart.tickFrom);
  });
});
