import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { fresh } from "../model";
import {
  INITIAL_PHASE,
  actionBarVisible,
  callViewFor,
  focusFor,
  handHint,
  handVisible,
  lastQuarterStart,
  nextPhase,
  runFrame,
  settledPhase,
  yearFacts,
  type UiPhase,
  type UiPhaseKind,
} from "../phases";
import { gameReducer } from "../reducer";
import type { GameState } from "../types";
import { dashboardView, monthFrames } from "../view";
import { deepFreeze, endingState, PATH_A, PATH_C, PATH_D, playPath, type Path } from "./paths";

// Plan §4.2 X27 — the island's phases, extracted as a pure function so the
// loop the player walks (call → hand → months → report → ringing → call …
// → December) is pinned here, in both motion settings, before any browser
// plays it. A gesture that makes no sense in the current phase returns the
// SAME object, exactly like the reducer's refusals.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;
const reduce = gameReducer(L);

/**
 * Walks a whole year the way the island does: every gesture goes to the
 * engine first, then to the phase machine with the engine's answer. Returns
 * the phase kinds in order — the screens a player sees.
 */
function walk(path: Path, animate: boolean): UiPhaseKind[] {
  let state: GameState<Id> = fresh(L);
  let phase: UiPhase = INITIAL_PHASE;
  const seen: UiPhaseKind[] = [phase.kind];
  const go = (next: UiPhase) => {
    if (next !== phase) seen.push(next.kind);
    phase = next;
  };
  for (const [a, b] of path) {
    if (phase.kind === "ringing") go(nextPhase(phase, { type: "pickUp" }));
    state = reduce(state, { type: "hangup" });
    go(nextPhase(phase, { type: "hangUp" }));
    state = reduce(reduce(state, { type: "toggle", card: a }), { type: "toggle", card: b });
    state = reduce(state, { type: "run" });
    go(nextPhase(phase, { type: "run", year: yearFacts(state), animate }));
    if (phase.kind === "running") go(nextPhase(phase, { type: "runEnd" }));
    go(nextPhase(phase, { type: "next", year: yearFacts(state) }));
  }
  return seen;
}

describe("X27 — the year, screen by screen", () => {
  it("the page opens on the first call, which is also where a fresh year settles", () => {
    expect(INITIAL_PHASE).toEqual({ kind: "call" });
    expect(settledPhase(yearFacts(fresh(L)))).toEqual(INITIAL_PHASE);
  });

  it("a whole honest year: every quarter has its months, its report and its call, then December", () => {
    const quarter = ["hand", "running", "report"];
    expect(walk(PATH_A, true)).toEqual([
      "call",
      ...quarter,
      "ringing",
      "call",
      ...quarter,
      "ringing",
      "call",
      ...quarter,
      "ringing",
      "call",
      ...quarter,
      "december",
    ]);
  });

  it("with reduced motion, « Lancer » goes straight to the report — no screen waits on an animation", () => {
    const kinds = walk(PATH_A, false);
    expect(kinds).not.toContain("running");
    expect(kinds.filter((k) => k === "report")).toHaveLength(4);
  });

  it("a year cut short by a firing goes from its last report to December, not to another call", () => {
    // PATH_D: fired at the end of June (GAME-BRIEF §6 D).
    const kinds = walk(PATH_D, true);
    expect(kinds.at(-1)).toBe("december");
    expect(kinds.filter((k) => k === "report")).toHaveLength(2);
    expect(kinds.filter((k) => k === "ringing")).toHaveLength(1);
  });

  it("the running and report screens carry the quarter they are about", () => {
    const [start] = playPath(PATH_C);
    let s = reduce(start!, { type: "hangup" });
    s = reduce(reduce(s, { type: "toggle", card: "pdef" }), { type: "toggle", card: "bury" });
    s = reduce(s, { type: "run" });
    const running = nextPhase({ kind: "hand" }, { type: "run", year: yearFacts(s), animate: true });
    expect(running).toEqual({ kind: "running", q: 0 });
    expect(nextPhase(running, { type: "runEnd" })).toEqual({ kind: "report", q: 0 });
  });
});

describe("X27 — gestures that make no sense are refused by identity", () => {
  const phases: UiPhase[] = [
    { kind: "resumePrompt" },
    { kind: "call" },
    { kind: "ringing" },
    { kind: "hand" },
    { kind: "running", q: 1 },
    { kind: "report", q: 1 },
    { kind: "december" },
  ];
  const year = { callOpen: true, over: false, quarters: 2 };

  it("hanging up only from the open call", () => {
    for (const p of phases.filter((x) => x.kind !== "call")) expect(nextPhase(p, { type: "hangUp" })).toBe(p);
  });

  it("running only from the hand — and not when the engine refused the quarter", () => {
    for (const p of phases.filter((x) => x.kind !== "hand")) {
      expect(nextPhase(p, { type: "run", year, animate: true })).toBe(p);
    }
    // A second « Lancer » while the months scroll, a run with one card: the
    // engine answers with the same state, the journal is still empty.
    const hand: UiPhase = { kind: "hand" };
    expect(nextPhase(hand, { type: "run", year: { callOpen: false, over: false, quarters: 0 }, animate: true })).toBe(hand);
  });

  it("the months end only while running, the report moves on only from itself, the phone is picked up only while ringing", () => {
    for (const p of phases.filter((x) => x.kind !== "running")) expect(nextPhase(p, { type: "runEnd" })).toBe(p);
    for (const p of phases.filter((x) => x.kind !== "report")) expect(nextPhase(p, { type: "next", year })).toBe(p);
    for (const p of phases.filter((x) => x.kind !== "ringing")) expect(nextPhase(p, { type: "pickUp" })).toBe(p);
  });

  it("asking twice, restoring into the same screen and restarting an open first call change nothing", () => {
    const prompt: UiPhase = { kind: "resumePrompt" };
    expect(nextPhase(prompt, { type: "prompt" })).toBe(prompt);
    const report: UiPhase = { kind: "report", q: 1 };
    expect(nextPhase(report, { type: "restore", year })).toBe(report);
    const call: UiPhase = { kind: "call" };
    expect(nextPhase(call, { type: "restart" })).toBe(call);
  });
});

describe("X27 — where a year the island did not just play lands", () => {
  const states = playPath(PATH_A);

  it("between two quarters: on the report of the quarter just played (the call is open, but nothing says it was picked up)", () => {
    expect(settledPhase(yearFacts(states[1]!))).toEqual({ kind: "report", q: 0 });
    expect(settledPhase(yearFacts(states[3]!))).toEqual({ kind: "report", q: 2 });
  });

  it("hung up, mid-quarter: on the hand, picks intact — the language switch's case (P18)", () => {
    let s = reduce(states[1]!, { type: "hangup" });
    s = reduce(s, { type: "toggle", card: "onboard" });
    const settled = settledPhase(yearFacts(s));
    expect(settled).toEqual({ kind: "hand" });
    expect(s.picks).toEqual(["onboard"]);
  });

  it("a finished year, fired or not: on December", () => {
    expect(settledPhase(yearFacts(endingState("applause")))).toEqual({ kind: "december" });
    expect(settledPhase(yearFacts(endingState("firedClean")))).toEqual({ kind: "december" });
  });

  it("« Reprendre » and a restart leave the prompt; restart always opens on the first call", () => {
    const prompt = nextPhase(INITIAL_PHASE, { type: "prompt" });
    expect(prompt).toEqual({ kind: "resumePrompt" });
    expect(nextPhase(prompt, { type: "restore", year: yearFacts(states[2]!) })).toEqual({ kind: "report", q: 1 });
    expect(nextPhase(prompt, { type: "restart" })).toEqual({ kind: "call" });
    expect(nextPhase({ kind: "december" }, { type: "restart" })).toEqual({ kind: "call" });
  });
});

describe("X27 — what each screen shows", () => {
  const all: UiPhase[] = [
    { kind: "resumePrompt" },
    { kind: "call" },
    { kind: "ringing" },
    { kind: "hand" },
    { kind: "running", q: 0 },
    { kind: "report", q: 0 },
    { kind: "december" },
  ];

  it("the call's state in each phase — the report and the prompt take its place", () => {
    expect(Object.fromEntries(all.map((p) => [p.kind, callViewFor(p)]))).toEqual({
      resumePrompt: null,
      call: "open",
      ringing: "ringing",
      hand: "hungUp",
      running: "hungUp",
      report: null,
      december: "ended",
    });
  });

  it("the hand only on the open call and once hung up; the action bar only while choosing", () => {
    expect(all.filter(handVisible).map((p) => p.kind)).toEqual(["call", "hand"]);
    expect(all.filter(actionBarVisible).map((p) => p.kind)).toEqual(["hand"]);
  });

  it("the hint follows the prototype: he talks, pick two, then « trois mois vont passer »", () => {
    expect(handHint({ kind: "call" }, 0, 2)).toBe("callOpen");
    expect(handHint({ kind: "hand" }, 0, 2)).toBe("pick");
    expect(handHint({ kind: "hand" }, 1, 2)).toBe("pick");
    expect(handHint({ kind: "hand" }, 2, 2)).toBe("ready");
  });

  it("focus follows the screen the player just opened (plan §3.5)", () => {
    expect(Object.fromEntries(all.map((p) => [p.kind, focusFor(p)]))).toEqual({
      resumePrompt: "resume",
      call: "call",
      ringing: "call",
      hand: "hand",
      running: "dashboard",
      report: "report",
      december: "december",
    });
  });
});

describe("the deltas and the scrolling months read only what the engine wrote", () => {
  const states = playPath(PATH_A);

  it("no comparison before the first quarter", () => {
    expect(lastQuarterStart(L, fresh(L))).toBeUndefined();
    expect(dashboardView(L, fresh(L), lastQuarterStart(L, fresh(L))).deltas).toBeNull();
  });

  it("the start of the last quarter is its first month in the history, and its patience the one the previous quarter ended on", () => {
    const afterQ1 = deepFreeze(states[1]!);
    const start1 = lastQuarterStart(L, afterQ1)!;
    expect(start1.churn).toBe(afterQ1.log[0]!.churnStart);
    expect(start1.subs).toBe(L.constants.subs0);
    expect(start1.patience).toBe(L.constants.patience0);

    const afterQ3 = deepFreeze(states[3]!);
    const start3 = lastQuarterStart(L, afterQ3)!;
    const endOfJune = afterQ3.history.find((h) => h.m === 6)!;
    expect(start3.churn).toBe(afterQ3.log[2]!.churnStart);
    expect(start3.subs).toBe(endOfJune.subs);
    expect(start3.mrr).toBe(endOfJune.mrr);
    expect(start3.patience).toBe(afterQ3.log[1]!.patience);
  });

  it("so the tiles' deltas are the quarter's own change, rebuilt after a reload exactly as they were", () => {
    const after = states[2]!;
    const deltas = dashboardView(L, after, lastQuarterStart(L, after)).deltas!;
    const log = after.log[1]!;
    expect(deltas.churn.value).toBeCloseTo(log.churnEnd - log.churnStart, 12);
    expect(deltas.patience.value).toBe(log.patience - after.log[0]!.patience);
    // A JSON round-trip is what a reload does to the state.
    const reloaded = JSON.parse(JSON.stringify(after)) as GameState<Id>;
    expect(dashboardView(L, reloaded, lastQuarterStart(L, reloaded)).deltas).toEqual(deltas);
  });

  it("a scrolling frame is the start state with one simulated month's figures — ending exactly on the engine's result", () => {
    const from = deepFreeze(reduce(reduce(reduce(states[1]!, { type: "hangup" }), { type: "toggle", card: "onboard" }), {
      type: "toggle",
      card: "present",
    }));
    const next = reduce(from, { type: "run" });
    const frames = monthFrames(from, next);
    expect(frames.map((f) => f.m)).toEqual([4, 5, 6]);
    const shown = frames.map((f) => runFrame(from, f));
    // Nothing but the month's own figures moves: the quarter, the hidden
    // counters and the picks stay those of the moment « Lancer » was pressed.
    for (const s of shown) {
      expect(s.q).toBe(from.q);
      expect(s.trust).toBe(from.trust);
      expect(s.radar).toBe(from.radar);
      expect(s.picks).toEqual(from.picks);
      expect(s.over).toBe(false);
    }
    const last = shown.at(-1)!;
    expect([last.churn, last.subs, last.mrr]).toEqual([next.churn, next.subs, next.mrr]);
    expect(dashboardView(L, last).trust).toEqual({ hidden: true });
  });
});
