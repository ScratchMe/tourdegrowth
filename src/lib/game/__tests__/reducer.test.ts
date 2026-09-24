import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import {
  applyPicks,
  bossMessageSpec,
  cardReduction,
  computeEnding,
  dealHand,
  fresh,
  handIds,
  monthlyReduction,
  moodNow,
  pickOrder,
  runQuarter,
  stepMonth,
  visibleEffect,
} from "../model";
import { gameReducer } from "../reducer";
import type { GameAction, GameState } from "../types";
import { deepFreeze, finalState, PATH_A, PATH_C, PATH_M, playPath } from "./paths";

// Plan §4.2 X1 (nothing mutates its input) and X3 (the reducer refuses what
// the rules refuse). A refusal returns the SAME object — that identity is
// what lets React skip the render and this test tell « refused » apart.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;
const reduce = gameReducer(L);

function hungUp(): GameState<Id> {
  return reduce(fresh(L), { type: "hangup" });
}

describe("X3 — while the CEO is talking", () => {
  it("no card can be picked and no quarter run", () => {
    const s = fresh(L);
    expect(reduce(s, { type: "toggle", card: "pause" })).toBe(s);
    expect(reduce({ ...s, picks: ["pause", "survey"] }, { type: "run" }).q).toBe(0);
  });

  it("hanging up opens the hand, once", () => {
    const s = hungUp();
    expect(s.callOpen).toBe(false);
    expect(reduce(s, { type: "hangup" })).toBe(s);
  });
});

describe("X3 — two cards, no more, no less", () => {
  it("picks, unpicks, and refuses a third", () => {
    let s = hungUp();
    s = reduce(s, { type: "toggle", card: "pause" });
    s = reduce(s, { type: "toggle", card: "survey" });
    expect(s.picks).toEqual(["pause", "survey"]);
    expect(reduce(s, { type: "toggle", card: "pdef" })).toBe(s);
    s = reduce(s, { type: "toggle", card: "pause" });
    expect(s.picks).toEqual(["survey"]);
  });

  it("refuses a card that is not on the table", () => {
    const s = hungUp();
    expect(handIds(L, s)).not.toContain("streak");
    expect(reduce(s, { type: "toggle", card: "streak" })).toBe(s);
  });

  it("refuses to run a quarter with fewer than two", () => {
    const one = reduce(hungUp(), { type: "toggle", card: "pause" });
    expect(reduce(one, { type: "run" })).toBe(one);
    const none = hungUp();
    expect(reduce(none, { type: "run" })).toBe(none);
  });

  it("runs the quarter with exactly two", () => {
    let s = hungUp();
    s = reduce(s, { type: "toggle", card: "pause" });
    s = reduce(s, { type: "toggle", card: "survey" });
    const next = reduce(s, { type: "run" });
    expect(next.q).toBe(1);
    expect(next.log).toHaveLength(1);
  });
});

describe("X3 — once the year is over", () => {
  const over = finalState(PATH_A);
  const refused: GameAction<Id>[] = [
    { type: "hangup" },
    { type: "toggle", card: "pause" },
    { type: "run" },
  ];

  it("refuses everything but a reset or a restore", () => {
    for (const action of refused) expect(reduce(over, action)).toBe(over);
    expect(reduce({ ...over, picks: ["pause", "survey"] as Id[] }, { type: "run" }).log).toHaveLength(4);
  });

  it("reset starts a fresh year", () => {
    expect(reduce(over, { type: "reset" })).toEqual(fresh(L));
  });

  it("restore takes a saved state of this level, and only of this level", () => {
    const saved = playPath(PATH_C)[2];
    if (!saved) throw new Error("path C");
    expect(reduce(fresh(L), { type: "restore", state: saved })).toBe(saved);
    const start = fresh(L);
    const alien = { ...saved, level: "acquisition" } as unknown as GameState<Id>;
    expect(reduce(start, { type: "restore", state: alien })).toBe(start);
    const future = { ...saved, v: 2 } as unknown as GameState<Id>;
    expect(reduce(start, { type: "restore", state: future })).toBe(start);
  });
});

describe("X1 — no engine function mutates its input", () => {
  // Every state of three rich years, deep-frozen, through every exported
  // function. An ES module runs in strict mode, so a write to a frozen object
  // throws right where it happens.
  const states = [...playPath(PATH_A), ...playPath(PATH_C), ...playPath(PATH_M)];

  it("model functions", () => {
    for (const original of states) {
      const s = deepFreeze(structuredClone(original));
      const snapshot = JSON.stringify(s);
      handIds(L, s);
      dealHand(L, s);
      monthlyReduction(L, s);
      for (const id of s.active) cardReduction(L, s, id);
      for (const id of handIds(L, s)) visibleEffect(L, s, id);
      stepMonth(L, s);
      moodNow(L, s);
      pickOrder(L, s);
      bossMessageSpec(L, s);
      computeEnding(L, s);
      if (!s.over) {
        const [a, b] = handIds(L, s);
        if (!a || !b) throw new Error("a hand has at least two cards");
        const withPicks = deepFreeze({ ...structuredClone(original), callOpen: false, picks: [a, b] });
        applyPicks(L, withPicks);
        runQuarter(L, withPicks);
      }
      expect(JSON.stringify(s)).toBe(snapshot);
    }
  });

  it("the reducer, on every action", () => {
    for (const original of states) {
      const s = deepFreeze(structuredClone(original));
      const snapshot = JSON.stringify(s);
      const [a, b] = handIds(L, s);
      const actions: GameAction<Id>[] = [{ type: "hangup" }, { type: "reset" }, { type: "restore", state: s }];
      if (a) actions.push({ type: "toggle", card: a });
      if (a && b) actions.push({ type: "run" });
      let t = s;
      for (const action of actions) t = reduce(deepFreeze(t), action);
      // And through a whole quarter, frozen at every step.
      if (!s.over && a && b) {
        let q = reduce(s, { type: "hangup" });
        q = reduce(deepFreeze(q), { type: "toggle", card: a });
        q = reduce(deepFreeze(q), { type: "toggle", card: b });
        reduce(deepFreeze(q), { type: "run" });
      }
      expect(JSON.stringify(s)).toBe(snapshot);
    }
  });

  it("fresh builds a new object every time", () => {
    const a = fresh(L);
    const b = fresh(L);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a.history).not.toBe(b.history);
  });
});

describe("the engine loads without the @/ alias", () => {
  // Plan §3.1: e2e specs import the engine (seeded saves come from paths.ts)
  // and Playwright does not resolve `@/`. A value import from `@/` anywhere
  // in what they load fails at spec start-up, far from the line that did it.
  // Types are fine: TypeScript erases them.
  const IMPORT = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/g;

  function imports(file: string): { spec: string; type: boolean }[] {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(IMPORT)].map((m) => ({ spec: m[2] ?? "", type: Boolean(m[1]) }));
  }

  function walk(entry: string, seen: Set<string>): void {
    if (seen.has(entry)) return;
    seen.add(entry);
    for (const { spec, type } of imports(entry)) {
      if (type || !spec.startsWith(".")) continue;
      const base = resolve(dirname(entry), spec);
      const file = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find((f) => existsSync(f));
      if (file) walk(file, seen);
    }
  }

  it("what an e2e spec would import reaches `@/` for types only", () => {
    const game = resolve(__dirname, "..");
    const reached = new Set<string>();
    for (const entry of ["__tests__/paths.ts", "view.ts", "format.ts", "ui-timing.ts"]) walk(join(game, entry), reached);
    // paths, levels/retention, model, reducer, view, format, ui-timing — or
    // the walk has stopped following imports and proves nothing.
    expect(reached.size).toBeGreaterThanOrEqual(7);
    for (const file of reached) {
      for (const { spec, type } of imports(file)) {
        if (spec.startsWith("@/")) expect(type, `${file} imports a value from ${spec}`).toBe(true);
      }
    }
  });
});
