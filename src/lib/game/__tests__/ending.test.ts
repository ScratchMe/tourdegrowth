import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { bossMessageSpec, computeEnding, fresh, moodNow, visibleEffect } from "../model";
import type { EndingId, GameState, QuarterLog } from "../types";
import { endingState, ENDING_PATHS, finalState, PATH_A, PATH_D, playPath } from "./paths";

// GAME-BRIEF.md §5.10-5.12 and §7.1, série E.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;

function year(overrides: Partial<GameState<Id>>): GameState<Id> {
  return { ...fresh(L), q: 4, over: true, callOpen: false, churn: 0.05, ...overrides };
}

describe("E1 — how the year ends, one hand-built case per ending", () => {
  const cases: [EndingId, Partial<GameState<Id>>][] = [
    ["firedDark", { fired: true, everDark: ["bury"] }],
    ["firedClean", { fired: true }],
    ["applause", { churn: 0.041 }],
    ["cleanMiss", { churn: 0.0411 }],
    ["fine", { everDark: ["bury"], sanction: true, removedDark: ["bury"] }],
    ["repentant", { everDark: ["bury"], removedDark: ["bury"] }],
    ["labyrinth", { everDark: ["bury"], active: ["bury"] }],
  ];

  for (const [ending, overrides] of cases) {
    it(`${ending}`, () => expect(computeEnding(L, year(overrides))).toBe(ending));
  }

  it("is checked in the brief's order: being fired outranks everything, a fine outranks cleaning", () => {
    expect(computeEnding(L, year({ fired: true, churn: 0.03 }))).toBe("firedClean");
    expect(computeEnding(L, year({ fired: true, everDark: ["pdef"], sanction: true }))).toBe("firedDark");
    expect(computeEnding(L, year({ everDark: ["bury"], sanction: true, active: ["pdef"] }))).toBe("fine");
  });

  it("the win line is 4,1 %, not 4,0: the player is judged on what the tile shows", () => {
    expect(L.constants.winChurn).toBe(0.041);
    expect(computeEnding(L, year({ churn: 0.0405 }))).toBe("applause");
  });

  it("every played year in paths.ts ends where its name says (they seed saves and screenshots)", () => {
    for (const ending of Object.keys(ENDING_PATHS) as EndingId[]) {
      const s = endingState(ending);
      expect(s.over).toBe(true);
      expect(s.ending).toBe(ending);
      expect(computeEnding(L, s)).toBe(ending);
    }
  });
});

describe("E2 — the CEO's mood", () => {
  const log = (gap: number) => ({ gap }) as QuarterLog<Id>;

  it("firm in the first quarter", () => expect(moodNow(L, fresh(L))).toBe("firm"));

  it("angry after a missed target, whatever the quarter", () => {
    for (const q of [1, 2, 3]) expect(moodNow(L, { ...fresh(L), q, log: [log(0.002)] })).toBe("angry");
  });

  it("calm after a hit in the second quarter, firm after a hit from the third", () => {
    expect(moodNow(L, { ...fresh(L), q: 1, log: [log(-0.001)] })).toBe("calm");
    expect(moodNow(L, { ...fresh(L), q: 2, log: [log(-0.001), log(-0.001)] })).toBe("firm");
    expect(moodNow(L, { ...fresh(L), q: 3, log: [log(0.01), log(0.01), log(0)] })).toBe("firm");
  });

  it("cold once he has fired you, firm at a normal year end", () => {
    expect(moodNow(L, finalState(PATH_D))).toBe("cold");
    expect(moodNow(L, finalState(PATH_A))).toBe("firm");
  });

  it("the journal keeps the mood the next call opens with", () => {
    const states = playPath(PATH_A);
    states.slice(1).forEach((s, i) => expect(s.log[i]?.moodAfter).toBe(moodNow(L, s)));
  });
});

describe("E3 — what each card visibly did (§5.12)", () => {
  const running = (id: Id, age: number, insight = false): GameState<Id> => ({
    ...fresh(L),
    month: age,
    insight,
    active: [id],
    since: { [id]: 0 },
  });

  it("the survey, the meeting, the cleaning and the notice have their own line", () => {
    expect(visibleEffect(L, fresh(L), "survey")).toEqual({ kind: "insight" });
    expect(visibleEffect(L, { ...fresh(L), insight: true }, "present")).toEqual({ kind: "present" });
    expect(visibleEffect(L, fresh(L), "clean")).toEqual({ kind: "clean" });
    expect(visibleEffect(L, running("notice", 2), "notice")).toEqual({ kind: "extra" });
  });

  it("a cut, rounded to the point, rising only while below its ramp", () => {
    expect(visibleEffect(L, running("pause", 2), "pause")).toEqual({ kind: "down", pct: 4, rising: true });
    expect(visibleEffect(L, running("pause", 2, true), "pause")).toEqual({ kind: "down", pct: 5, rising: true });
    expect(visibleEffect(L, running("pause", 5), "pause")).toEqual({ kind: "down", pct: 7, rising: false });
    // With the insight, 0,084 is past the 0,07 ramp: no longer rising.
    expect(visibleEffect(L, running("pause", 5, true), "pause")).toEqual({ kind: "down", pct: 8, rising: false });
    // No ramp, never rising.
    expect(visibleEffect(L, running("bury", 1), "bury")).toEqual({ kind: "down", pct: 8, rising: false });
  });

  it("a card that raises churn says so; one that has not started says nothing", () => {
    expect(visibleEffect(L, running("remind", 1), "remind")).toEqual({ kind: "up", pct: 1 });
    expect(visibleEffect(L, running("three", 1), "three")).toEqual({ kind: "up", pct: 2 });
    expect(visibleEffect(L, running("onboard", 2), "onboard")).toEqual({ kind: "none" });
  });

  it("is what the journal records, at the quarter's last month", () => {
    const [, q1] = playPath(PATH_A);
    // −4 %, not −5 %: the survey picked alongside only boosts from NEXT
    // quarter (model v2), so the line must not show a boost that did not act.
    expect(q1?.log[0]?.fx).toEqual([
      { card: "pause", effect: { kind: "down", pct: 4, rising: true } },
      { card: "survey", effect: { kind: "insight" } },
    ]);
  });
});

describe("bossMessageSpec — which message opens the call", () => {
  it("t1, then the quarter with last quarter's figure and the new target, then the end", () => {
    const states = playPath(PATH_A);
    expect(bossMessageSpec(L, fresh(L))).toEqual({ kind: "t1" });
    const q1 = states[1];
    if (!q1) throw new Error("path A");
    expect(bossMessageSpec(L, q1)).toEqual({
      kind: "quarter",
      q: 1,
      hit: false,
      churnPrev: q1.log[0]?.churnEnd,
      target: 0.051,
      order: "pdef",
    });
    expect(bossMessageSpec(L, finalState(PATH_A))).toEqual({ kind: "yearEnd" });
    expect(bossMessageSpec(L, finalState(PATH_D))).toEqual({ kind: "fired" });
  });

  it("a hit is a hit on last quarter's target, not this one's", () => {
    const hit = playPath(PATH_A)[4 - 1]; // after Q3: 4,6 % against 4,6 %
    if (!hit) throw new Error("path A");
    const spec = bossMessageSpec(L, hit);
    expect(spec).toMatchObject({ kind: "quarter", q: 3, hit: true, target: 0.04 });
  });
});
