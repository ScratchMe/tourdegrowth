import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL } from "../levels/retention";
import { fresh } from "../model";
import { gameReducer } from "../reducer";
import { PATH_C, playPath, playQuarter } from "./paths";

// GAME-BRIEF.md §7.1, série S.
const L = RETENTION_LEVEL;

describe("S1 — the first of January", () => {
  it("starts where the brief says, with the CEO's first call open", () => {
    const s = fresh(L);
    expect(s).toMatchObject({
      v: 1,
      level: "retention",
      q: 0,
      month: 0,
      subs: 100_000,
      churn: 0.06,
      trust: 60,
      radar: 10,
      patience: 55,
      lagTrust: 60,
      callOpen: true,
      order: null,
      picks: [],
      active: [],
      log: [],
      over: false,
      fired: false,
      ending: null,
    });
    expect(s.mrr).toBeCloseTo(1_299_000, 6);
    expect(s.history).toEqual([{ m: 0, churn: 0.06, trust: 60, subs: 100_000, mrr: s.mrr }]);
  });

  it("has already dealt the first hand: the four first-quarter patterns are seen", () => {
    // `seenDark` feeds December's « refused » group; the prototype filled it
    // while rendering, so a fresh game must not wait for a render to have it.
    expect(fresh(L).seenDark).toEqual(["pdef", "bury", "cascade", "shame"]);
  });

  it("carries no mode-class session in v1", () => {
    expect("session" in fresh(L)).toBe(false);
  });
});

describe("S2 — a state survives JSON", () => {
  it("round-trips identically, since and history included, at every step of a rich year", () => {
    for (const s of playPath(PATH_C)) {
      const copy = JSON.parse(JSON.stringify(s));
      expect(copy).toEqual(s);
    }
  });

  it("a restored state plays on exactly like the original", () => {
    // Equality of the object is not enough: a lost `since` would still
    // compare equal if both sides lost it. Playing on is what proves it.
    const mid = playPath(PATH_C)[2];
    if (!mid) throw new Error("path C has four quarters");
    const restored = gameReducer(L)(fresh(L), { type: "restore", state: JSON.parse(JSON.stringify(mid)) });
    const pick = PATH_C[2];
    if (!pick) throw new Error("path C has four quarters");
    expect(playQuarter(restored, pick)).toEqual(playQuarter(mid, pick));
  });
});
