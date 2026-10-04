import { describe, expect, it } from "vitest";

import { metricFormat } from "../format";
import { REFERRAL_LEVEL } from "../levels/referral";
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
} from "./paths-referral";

// GAME-BRIEF §19 (`docs/game/referral.md`): the referral level « S'ils vous recommandent », a DRAFT
// model the spec quotes number for number — written on 2026-10-04 so an
// agent can wire the level without re-deriving it (CHANTIERS.md A24). Its
// four reference years are level 2's, card for card by role. A rebalancing
// that moves one regenerates the table and the spec, it does not loosen
// the tolerance (half a hundredth, what the tile rounds to).

const L: Level = REFERRAL_LEVEL;
const TOL = 0.005;

const FIXTURES: Record<"A" | "B" | "C" | "D", Fixture<Id>> = {
  A: {
    path: PATH_A,
    metric: [0.42, 0.43, 0.53, 0.6],
    patience: [51, 42, 46, 73],
    mood: ["firm", "angry", "angry", "firm"],
    order: [null, "contacts", "autoinvite", "bigshare"],
    ending: "applause",
    trust: 83,
    radar: 0,
  },
  B: { path: PATH_B, metric: [0.42, 0.45, 0.56, 0.6], patience: [51, 33, 52, 79], ending: "applause", trust: 85, radar: 0 },
  C: {
    path: PATH_C,
    metric: [0.46, 0.48, 0.46, 0.19],
    patience: [67, 79, 45, 0],
    mood: ["firm", "calm", "firm", "angry"],
    order: [null, "autoinvite", "bonus", "contacts"],
    ending: "fine",
    trust: 27,
    radar: 1,
  },
  D: { path: PATH_D, metric: [0.4, 0.39], patience: [41, 16], ending: "firedClean", trust: 73 },
};

const check = (fixture: Fixture<Id>, level: Level = L) => mismatches(fixture, level, playPath, TOL);

describe("referral — série F19, the four reference years of §19", () => {
  it("F19.1 · A: honest, refuses the three orders, presents its data", () => {
    expect(check(FIXTURES.A)).toEqual([]);
  });

  it("F19.2 · B: the honest variant", () => {
    expect(check(FIXTURES.B)).toEqual([]);
  });

  it("F19.3 · C: obeys everything, the CNIL comes in the third quarter", () => {
    expect(check(FIXTURES.C)).toEqual([]);
  });

  it("F19.4 · D: honest with nothing strong, fired in June", () => {
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

describe("referral — F19.5, the balance invariants of §6, independent of exact values", () => {
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

describe("referral — the hand and the CEO", () => {
  it("the first hand: four tricks, six honest cards, in list order, no data review yet", () => {
    const hand = handIds(L, fresh(L));
    expect(hand.filter((id) => L.cards[id].kind === "d")).toEqual(["contacts", "bigshare", "fakeinvite", "unlock"]);
    expect(hand.filter((id) => L.cards[id].kind === "h")).toEqual(["fairbonus", "guests", "recap", "guestpage", "chosen", "grouplink"]);
  });

  it("after the sanction the CEO never asks again for the automatic invitations or the big « Continuer » button", () => {
    const afterControl = playPath(PATH_C)[3]!;
    expect(afterControl.sanction).toBe(true);
    expect(["autoinvite", "bigshare"]).not.toContain(afterControl.order);
  });
});

describe("referral — its economy, its number, its frame", () => {
  const c = L.constants;

  it("the first month holds the base still", () => {
    const s = stepMonth(L, deepFreeze(fresh(L)));
    expect(s.metric).toBe(0.4);
    // 26 000 outside arrivals × (1 + 0,4 + 0,16) = 40 560 in; 4 % of a million out.
    expect(s.customers).toBeCloseTo(1_000_000 - 40_000 + 40_560, 6);
    expect(s.revenue).toBeCloseTo(s.customers * 0.2, 6);
  });

  it("trust bends who stops (the quarter's) and who arrives (the moment's)", () => {
    const low = stepMonth(L, { ...fresh(L), lagTrust: 30, trust: 30 });
    // At trust 30: 4,8 % stop (×1,2), 20 800 arrive from outside (×0,8), and k is 0,32 (×0,8).
    expect(low.customers).toBeCloseTo(1_000_000 - 1_000_000 * 0.04 * 1.2 + 26_000 * 0.8 * (1 + 0.32 + 0.32 * 0.32), 6);
  });

  it("good press lifts the number itself, as on level 2", () => {
    expect(stepMonth(L, { ...fresh(L), press: 2 }).metric).toBeCloseTo(c.metric0 * c.press.boost, 12);
  });

  it("December's win is the board's number as the tile rounds it", () => {
    expect(reachesBoard(c, 0.595)).toBe(true);
    expect(reachesBoard(c, 0.5949)).toBe(false);
  });

  it("the number reads in its own unit, everywhere", () => {
    const f = metricFormat(L.display);
    expect(f.value("fr", 0.4)).toBe("0,40");
    expect(f.value("en", 0.595)).toBe("0.60");
    expect(f.gap("fr", 0.004)).toBe("0,01");
    expect(f.tick("fr", 40)).toBe("0,4");
    expect(f.delta).toBe("hundredths");
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
    expect(d.metric.reference).toBeCloseTo(60, 9);
    expect(d.metric.scale.min).toBeLessThanOrEqual(L.display.chart.min);
    expect(d.metric.scale.max).toBeGreaterThanOrEqual(L.display.chart.max);
    expect(d.metric.scale.ticks).toContain(L.display.chart.tickFrom);
  });
});
