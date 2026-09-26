import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { dealHand, fresh, handIds } from "../model";
import type { CardDef, GameState, LevelDefinition } from "../types";
import { deepFreeze, finalState, PATH_A, PATH_C, playPath } from "./paths";

// GAME-BRIEF.md §7.1, série H, plus X2 (the hand is pure).
type Id = RetentionCardId;
const L = RETENTION_LEVEL;
const kind = (id: Id) => L.cards[id].kind;
const dark = (ids: Id[]) => ids.filter((id) => kind(id) === "d");
const honest = (ids: Id[]) => ids.filter((id) => kind(id) === "h");

function at(path: typeof PATH_A, quarter: number): GameState<Id> {
  const s = playPath(path)[quarter];
  if (!s) throw new Error(`no state after quarter ${quarter}`);
  return s;
}

describe("série H — what the first quarter deals", () => {
  it("H1 · four first-quarter patterns and the first six honest cards — no data review before any survey (model v2)", () => {
    const hand = handIds(L, fresh(L));
    expect(dark(hand).sort()).toEqual(["bury", "cascade", "pdef", "shame"]);
    expect(honest(hand).sort()).toEqual(["annual", "onboard", "pause", "reco", "remind", "survey"]);
  });

  it("H7 · alternates pattern, honest, pattern, honest in list order", () => {
    expect(handIds(L, fresh(L))).toEqual([
      "pdef", "pause", "bury", "survey", "cascade", "onboard", "shame", "annual", "remind", "reco",
    ]);
  });

  it("H7 · no effect number decides the order: shuffling every card's numbers leaves the hand as it was", () => {
    const shuffled = Object.fromEntries(
      Object.values(L.cards).map((c, i): [Id, CardDef<Id>] => [
        c.id,
        { ...c, red: ((i * 7) % 5) / 10, ramp: ((i * 3) % 4) / 10, trust: 20 - i, radar: i * 3 },
      ]),
    ) as Record<Id, CardDef<Id>>;
    const scrambled: LevelDefinition<Id> = { ...L, cards: shuffled };
    for (const s of playPath(PATH_A).slice(0, 4)) expect(handIds(scrambled, s)).toEqual(handIds(L, s));
  });
});

describe("série H — what later hands deal", () => {
  it("H2 · the way back out appears only with a pattern in production, and then always", () => {
    expect(handIds(L, fresh(L))).not.toContain("clean");
    // After pdef + bury, eight honest cards are free: clean still comes on
    // top of the usual six, never crowded out by them.
    const s = at(PATH_C, 1);
    const hand = handIds(L, s);
    expect(hand).toContain("clean");
    expect(honest(hand)).toHaveLength(L.handSize.honest + 1);
  });

  it("H3 · the exit survey goes once its insight is in", () => {
    expect(handIds(L, at(PATH_A, 1))).not.toContain("survey");
  });

  it("H4 · the data meeting is once a quarter: gone for the rest of it, back the next", () => {
    const q1 = at(PATH_A, 1); // quarter index 1 opens
    expect(handIds(L, { ...q1, presented: q1.q + 1 })).not.toContain("present");
    expect(handIds(L, q1)).toContain("present");
    const q2 = at(PATH_A, 2); // present was played in quarter index 1
    expect(q2.presented).toBe(2);
    expect(handIds(L, q2)).toContain("present");
  });

  it("H5 · a card in production is never dealt again", () => {
    const s = at(PATH_C, 2);
    for (const id of s.active) expect(handIds(L, s)).not.toContain(id);
    expect(s.active.length).toBeGreaterThan(0);
  });

  it("H6 · the CEO's order leads the hand when it is in it", () => {
    const s = at(PATH_A, 1);
    expect(s.order).toBe("pdef");
    expect(handIds(L, s)[0]).toBe("pdef");
  });

  it("H6 · an order that is not dealt does not lead (and is not added)", () => {
    const s = { ...fresh(L), q: 1, order: "notice" as const };
    const hand = handIds(L, s);
    expect(hand).not.toContain("notice");
    expect(hand[0]).toBe("pdef");
  });
});

describe("H8 — seen patterns, the memory December's catalogue reads", () => {
  it("records every pattern dealt, and only those", () => {
    const last = finalState(PATH_A);
    expect([...last.seenDark].sort()).toEqual(["bury", "call", "cascade", "pdef", "shame"]);
    for (const never of ["social", "notice", "streak"] as const) expect(last.seenDark).not.toContain(never);
  });

  it("deals nothing once the year is over", () => {
    const over = finalState(PATH_A);
    expect(dealHand(L, over)).toBe(over);
  });
});

describe("X2 — the hand is pure", () => {
  it("asking twice gives the same hand and touches nothing", () => {
    // seenDark emptied: a played state already records every pattern it was
    // dealt, so a hand that wrote to it would find nothing new to write.
    for (const s of playPath(PATH_C)) {
      const frozen = deepFreeze({ ...structuredClone(s), seenDark: [] as Id[] });
      const before = JSON.stringify(frozen);
      expect(handIds(L, frozen)).toEqual(handIds(L, frozen));
      expect(JSON.stringify(frozen)).toBe(before);
    }
  });

  it("dealing returns a new state and leaves its input alone", () => {
    const s = deepFreeze({ ...fresh(L), seenDark: [] as Id[] });
    const dealt = dealHand(L, s);
    expect(s.seenDark).toEqual([]);
    expect(dealt.seenDark).toEqual(["pdef", "bury", "cascade", "shame"]);
  });
});
