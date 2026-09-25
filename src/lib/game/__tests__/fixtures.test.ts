import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { moodNow } from "../model";
import type { EndingId, LevelDefinition, Mood } from "../types";
import { PATH_A, PATH_B, PATH_C, PATH_D, playPath, type Path } from "./paths";

// GAME-BRIEF.md §6 and §7.1, série F. The four reference years ARE the
// game's balance: a rebalancing that moves one of them must regenerate the
// table, not loosen the tolerance.

type Id = RetentionCardId;

interface Fixture {
  path: Path;
  /** Churn at the end of each quarter, in percent, as the tile shows it. */
  churn: number[];
  patience: number[];
  /** The CEO's mood as each quarter's call opens (T1 first). */
  mood?: Mood[];
  /** His order as each quarter's call opens. */
  order?: (Id | null)[];
  ending: EndingId;
  trust?: number;
  radar?: number;
}

const FIXTURES: Record<"A" | "B" | "C" | "D", Fixture> = {
  A: {
    path: PATH_A,
    churn: [5.7, 5.7, 4.6, 4.0],
    patience: [52, 43, 47, 74],
    mood: ["firm", "angry", "angry", "firm"],
    order: [null, "pdef", "call", "bury"],
    ending: "applause",
    trust: 83,
    radar: 0,
  },
  B: { path: PATH_B, churn: [5.7, 5.5, 4.2, 4.0], patience: [52, 32, 51, 78], ending: "applause", trust: 85, radar: 0 },
  C: {
    path: PATH_C,
    churn: [5.3, 5.0, 5.0, 9.0],
    patience: [67, 79, 57, 15],
    mood: ["firm", "calm", "firm", "angry"],
    order: [null, "call", "notice", "pdef"],
    ending: "fine",
    trust: 19,
    radar: 9,
  },
  D: { path: PATH_D, churn: [6.0, 6.3], patience: [59, 19], ending: "firedClean", trust: 73 },
};

/**
 * Every way a replay of `fixture` on `level` departs from the brief, as
 * readable lines. Empty means the fixture reproduces. Tolerances are the
 * brief's: ±0,05 point of churn, ±1 of patience, trust and radar.
 */
function mismatches(fixture: Fixture, level: LevelDefinition<Id>): string[] {
  const states = playPath(fixture.path, level);
  const out: string[] = [];
  fixture.churn.forEach((expected, i) => {
    const got = (states[i + 1]?.churn ?? NaN) * 100;
    if (!(Math.abs(got - expected) <= 0.05)) out.push(`T${i + 1} churn ${got.toFixed(3)} ≠ ${expected}`);
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
  const last = states[states.length - 1];
  if (!last) return ["no state"];
  if (last.ending !== fixture.ending) out.push(`ending ${last.ending} ≠ ${fixture.ending}`);
  if (fixture.trust !== undefined && !(Math.abs(last.trust - fixture.trust) <= 1)) out.push(`trust ${last.trust} ≠ ${fixture.trust}`);
  if (fixture.radar !== undefined && !(Math.abs(last.radar - fixture.radar) <= 1)) out.push(`radar ${last.radar} ≠ ${fixture.radar}`);
  return out;
}

describe("série F — the brief's four reference years reproduce", () => {
  it("F1 · path A: honest, refuses the three orders, presents its data", () => {
    expect(mismatches(FIXTURES.A, RETENTION_LEVEL)).toEqual([]);
  });

  it("F2 · path B: the honest variant (X6 — no one had played it before this test)", () => {
    expect(mismatches(FIXTURES.B, RETENTION_LEVEL)).toEqual([]);
  });

  it("F3 · path C: obeys everything, the DGCCRF comes in the third quarter", () => {
    expect(mismatches(FIXTURES.C, RETENTION_LEVEL)).toEqual([]);
  });

  it("F4 · path D: honest with nothing strong, fired in June", () => {
    expect(mismatches(FIXTURES.D, RETENTION_LEVEL)).toEqual([]);
    const last = playPath(PATH_D).at(-1);
    expect(last?.fired).toBe(true);
    expect(last?.log).toHaveLength(2);
  });

  it("non-vacuity: a one-point change to the honest cap breaks at least one fixture", () => {
    // Plan §4.2, G1 criterion. If nudging a cap that paths A and B lean on
    // left all four tables green, the tolerances would be measuring nothing.
    const mistuned = { ...RETENTION_LEVEL, constants: { ...RETENTION_LEVEL.constants, honestCap: 0.31 } };
    const broken = Object.values(FIXTURES).flatMap((f) => mismatches(f, mistuned));
    expect(broken.length).toBeGreaterThan(0);
  });
});

describe("F5 — the balance invariants, independent of exact values", () => {
  const years = { A: playPath(PATH_A), B: playPath(PATH_B), C: playPath(PATH_C), D: playPath(PATH_D) };

  it("A and B end in applause, their lowest patience between 30 and 50 and never under 25", () => {
    for (const states of [years.A, years.B]) {
      const patience = states.slice(1).map((s) => s.patience);
      const lowest = Math.min(...patience);
      expect(states.at(-1)?.ending).toBe("applause");
      expect(lowest).toBeGreaterThanOrEqual(30);
      expect(lowest).toBeLessThanOrEqual(50);
      expect(patience.every((p) => p >= 25)).toBe(true);
    }
  });

  it("C is controlled in the third quarter, never before, and ends fined", () => {
    const log = years.C.at(-1)?.log ?? [];
    const controlledIn = log.findIndex((entry) => entry.events.some((e) => e.kind === "control"));
    expect(controlledIn).toBe(2);
    expect(years.C.at(-1)?.ending).toBe("fine");
  });

  it("in C the temptation pays for two quarters: targets hit in Q1 and Q2", () => {
    const log = years.C.at(-1)?.log ?? [];
    expect(log[0]?.gap).toBeLessThanOrEqual(0);
    expect(log[1]?.gap).toBeLessThanOrEqual(0);
  });

  it("D is fired at the end of the second quarter", () => {
    const last = years.D.at(-1);
    expect(last?.fired).toBe(true);
    expect(last?.q).toBe(2);
  });
});
