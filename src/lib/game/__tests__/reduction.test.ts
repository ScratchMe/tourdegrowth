import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { cardReduction, fresh, monthlyReduction } from "../model";
import type { GameState } from "../types";
import { deepFreeze } from "./paths";

// GAME-BRIEF.md §5.7.2-3 and §7.1, série R.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;

/** A state with `ids` in production since month `since`, read at month `month`. */
function running(ids: Id[], since: number, month: number, insight = false): GameState<Id> {
  return {
    ...fresh(L),
    month,
    insight,
    active: ids,
    since: Object.fromEntries(ids.map((id) => [id, since])),
  };
}

const at = (id: Id, age: number, insight = false) => cardReduction(L, running([id], 0, age, insight), id);

describe("série R — one card's cut", () => {
  it("R1 · a ramping card gives its immediate cut until age 3 and its full cut from age 4", () => {
    for (const age of [0, 1, 2, 3]) expect(at("pause", age)).toBeCloseTo(0.04, 12);
    for (const age of [4, 5, 9]) expect(at("pause", age)).toBeCloseTo(0.07, 12);
    // A slow build-out starts at nothing at all.
    expect(at("onboard", 3)).toBe(0);
    expect(at("onboard", 4)).toBeCloseTo(0.09, 12);
  });

  it("R2 · a temporary card works until age 2 and stops from age 3", () => {
    for (const age of [0, 1, 2]) expect(at("three", age)).toBeCloseTo(-0.02, 12);
    for (const age of [3, 6]) expect(at("three", age)).toBe(0);
  });

  it("R3 · the survey's insight lifts honest cuts by a fifth, and nothing else", () => {
    expect(at("pause", 0, true)).toBeCloseTo(0.048, 12);
    expect(at("bury", 0, true)).toBeCloseTo(0.08, 12); // a pattern is never lifted
    expect(at("remind", 0, true)).toBeCloseTo(-0.01, 12); // a negative cut is never amplified
  });

  it("R4 · a pattern loses 30 % of its bite from its third month", () => {
    expect(at("bury", 2)).toBeCloseTo(0.08, 12);
    expect(at("bury", 3)).toBeCloseTo(0.056, 12);
    expect(at("call", 5)).toBeCloseTo(0.098, 12);
  });

  it("reads a card's age from when it went live, or zero if it has not yet", () => {
    const s = running(["pause"], 2, 6);
    expect(cardReduction(L, s, "pause")).toBeCloseTo(0.07, 12); // age 4
    expect(cardReduction(L, s, "pause", 5)).toBeCloseTo(0.04, 12); // age 3, asked for another month
    expect(cardReduction(L, { ...s, since: {} }, "pause")).toBeCloseTo(0.04, 12);
  });
});

describe("R5 — the month's total cuts are capped, whatever the combination", () => {
  const perm = Object.values(L.cards).filter((c) => c.perm).map((c) => c.id);

  it("honest cuts never exceed 30 %, pattern cuts never 45 %", () => {
    // Every subset of permanent cards (2^13), young and old, with and
    // without insight: the caps hold everywhere, and they are reached.
    let honestCapped = false;
    let darkCapped = false;
    for (let mask = 0; mask < 1 << perm.length; mask++) {
      const ids = perm.filter((_, i) => mask & (1 << i));
      for (const [month, insight] of [[1, false], [9, true]] as const) {
        const s = running(ids, 0, month, insight);
        const { hr, dr } = monthlyReduction(L, s);
        expect(hr).toBeLessThanOrEqual(L.constants.honestCap);
        expect(dr).toBeLessThanOrEqual(L.constants.darkCap);
        if (hr === L.constants.honestCap) honestCapped = true;
        if (dr === L.constants.darkCap) darkCapped = true;
      }
    }
    expect(honestCapped && darkCapped).toBe(true);
  });

  it("below the caps, the total is the plain sum of the cards' cuts", () => {
    const s = running(["pause", "bury"], 0, 1);
    const { hr, dr } = monthlyReduction(L, s);
    expect(hr).toBeCloseTo(0.04, 12);
    expect(dr).toBeCloseTo(0.08, 12);
  });

  it("carries the annual offer's price and the notice period's extra month", () => {
    expect(monthlyReduction(L, running([], 0, 1))).toMatchObject({ mrrMult: 1, extra: false });
    expect(monthlyReduction(L, running(["annual", "notice"], 0, 1))).toMatchObject({ mrrMult: 0.97, extra: true });
  });

  it("reads its input without touching it", () => {
    const s = deepFreeze(running(["pause", "bury", "annual"], 0, 7, true));
    expect(() => monthlyReduction(L, s)).not.toThrow();
  });
});
