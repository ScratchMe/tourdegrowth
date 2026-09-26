/**
 * The island's screens — implementation plan §3.5.
 *
 * The engine knows two things about where the year stands: whether the CEO's
 * call is open and whether the year is over. The interface needs more — the
 * incoming call rings before it opens, three months scroll by after « Lancer »,
 * the quarter's report is a moment of its own (plan E1: the prototype buried
 * it under the next hand), December is a page of its own. That is a PHASE,
 * derived from the engine and from what the player just did, and never
 * persisted: a reload settles back to a phase the saved state implies.
 *
 * Pure and small on purpose, like the reducer: the island calls `nextPhase`
 * on every gesture, and a gesture that makes no sense in the current phase
 * (a stale « Décrocher », a second « Lancer » while the months scroll) returns
 * the SAME phase object, so React skips the render and a test can tell
 * « refused » from « accepted » by identity alone.
 *
 * Relative imports only — see model.ts.
 */
import type { GameState, LevelDefinition } from "./types";

export type UiPhase =
  /** A save with a quarter played was found on arrival: « Reprendre l'année en cours ? » (P15). */
  | { kind: "resumePrompt" }
  /** The CEO talks; the cards wait (brief §4: an open call locks the hand). */
  | { kind: "call" }
  /** Between two quarters: « Le DG t'appelle », one button, « Décrocher ». */
  | { kind: "ringing" }
  /** Hung up: the two actions of the quarter. */
  | { kind: "hand" }
  /** Three months scroll by on the dashboard. `q` is the quarter being played, 0-based. */
  | { kind: "running"; q: number }
  /** What quarter `q` (0-based index into the journal) did, before the next call. */
  | { kind: "report"; q: number }
  /** The year is over: the truth, on paper. */
  | { kind: "december" };

export type UiPhaseKind = UiPhase["kind"];

/**
 * The first render, on the server and in the browser alike: the first call,
 * open. The level page is prerendered with it (plan E16), and the island only
 * moves off it after mount, once it has read the device — so the HTML and the
 * first client render never differ.
 */
export const INITIAL_PHASE: UiPhase = { kind: "call" };

/** What the phase machine needs to know about a year — never the whole state. */
export interface YearFacts {
  callOpen: boolean;
  over: boolean;
  /** Quarters played so far — the journal's length. */
  quarters: number;
}

export function yearFacts(state: Pick<GameState, "callOpen" | "over" | "log">): YearFacts {
  return { callOpen: state.callOpen, over: state.over, quarters: state.log.length };
}

export type PhaseEvent =
  /** Arrival found a year worth asking about. */
  | { type: "prompt" }
  /** A year was put back — silently (a language switch, a save with nothing played) or after « Reprendre ». */
  | { type: "restore"; year: YearFacts }
  /** « Recommencer », « Rejouer l'année »: a fresh year, and it opens on the first call. */
  | { type: "restart" }
  | { type: "hangUp" }
  /** « Lancer le trimestre ». `year` is the state AFTER the engine ran the quarter. */
  | { type: "run"; year: YearFacts; animate: boolean }
  /** The three months have finished scrolling. */
  | { type: "runEnd" }
  /** The report's button: the next call, or December. */
  | { type: "next"; year: YearFacts }
  | { type: "pickUp" };

/**
 * Where a year the island did not just play lands — a reload, a language
 * switch, « Reprendre ».
 *
 * Between two quarters the engine's state already holds the NEXT call open,
 * and nothing records whether it had been picked up, so a year saved there
 * reopens on the report of the quarter just played. That report is the one
 * screen the player could not otherwise get back whole (the journal folds it),
 * and a reader switching language while reading it lands on the same report,
 * in the other language, instead of on a ringing phone.
 */
export function settledPhase(year: YearFacts): UiPhase {
  if (year.over) return { kind: "december" };
  if (!year.callOpen) return { kind: "hand" };
  if (year.quarters > 0) return { kind: "report", q: year.quarters - 1 };
  return INITIAL_PHASE;
}

export function nextPhase(phase: UiPhase, event: PhaseEvent): UiPhase {
  switch (event.type) {
    case "prompt":
      return phase.kind === "resumePrompt" ? phase : { kind: "resumePrompt" };
    case "restore": {
      const settled = settledPhase(event.year);
      return samePhase(phase, settled) ? phase : settled;
    }
    case "restart":
      return phase.kind === "call" ? phase : INITIAL_PHASE;
    case "hangUp":
      return phase.kind === "call" ? { kind: "hand" } : phase;
    case "run": {
      // The engine refused (fewer than two cards, the call still open): it
      // returns the same state, no quarter was added, and nothing moves.
      if (phase.kind !== "hand" || event.year.quarters === 0) return phase;
      const q = event.year.quarters - 1;
      return event.animate ? { kind: "running", q } : { kind: "report", q };
    }
    case "runEnd":
      return phase.kind === "running" ? { kind: "report", q: phase.q } : phase;
    case "next":
      if (phase.kind !== "report") return phase;
      return event.year.over ? { kind: "december" } : { kind: "ringing" };
    case "pickUp":
      return phase.kind === "ringing" ? { kind: "call" } : phase;
  }
}

function samePhase(a: UiPhase, b: UiPhase): boolean {
  return a.kind === b.kind && ("q" in a ? a.q : -1) === ("q" in b ? b.q : -1);
}

// ------------------------------------------------------ what each shows ---

/**
 * The year the desk and the dashboard draw. Behind « Reprendre l'année en
 * cours ? » it is the SAVED year — its tiles, its timeline, its phone, its
 * journal, as the player left them — so the question is asked in front of
 * what it is about, not in front of a fresh January the player never chose.
 *
 * Displaying is not restoring: the committed year stays fresh until
 * « Reprendre » puts the save back, and nothing on the desk can act on the
 * saved one — in this phase the hand and the action bar are absent
 * (`handVisible`), the slot holds the prompt, and the journal only folds.
 */
export function yearOnDesk<T>(phase: UiPhase, committed: T, saved: T | null): T {
  return phase.kind === "resumePrompt" && saved ? saved : committed;
}

/** The call's four states (the `VideoCall` contract), or null when something else holds its place. */
export type CallView = "ringing" | "open" | "hungUp" | "ended";

/**
 * The call, phase by phase. While the months scroll it stays on screen, hung
 * up, with the message the player just acted on; the report and the resume
 * prompt take its place (plan §2.8: one slot, « visio | rapport | reprise »);
 * in December it greys out on the CEO's last word.
 */
export function callViewFor(phase: UiPhase): CallView | null {
  switch (phase.kind) {
    case "call":
      return "open";
    case "ringing":
      return "ringing";
    case "hand":
    case "running":
      return "hungUp";
    case "december":
      return "ended";
    case "report":
    case "resumePrompt":
      return null;
  }
}

/**
 * The hand is on the desk once the call is hung up, and only then. Until
 * 2026-09-25 it was also shown, locked, while the CEO talked (brief §4); in
 * play that read as cards on the table the player was not allowed to touch —
 * « frustrating, since they are already there » (Antoine). The call is now
 * the one thing on the desk until « Raccrocher et choisir », and the hand
 * follows it. It is not shown while the months scroll, the report is read,
 * the phone rings or the year is over either: its cards would belong to a
 * quarter the screen is not about.
 */
export function handVisible(phase: UiPhase): boolean {
  return phase.kind === "hand";
}

/**
 * The action bar exists only while choosing (plan §2.6) — absent, not hidden
 * by CSS, in every other phase: on a phone it is stuck to the bottom of the
 * screen, and a bar with nothing to run would cover the report for nothing.
 */
export function actionBarVisible(phase: UiPhase): boolean {
  return phase.kind === "hand";
}

/** Which of the hand's hints applies (GAME-BRIEF §10, the prototype's `renderHand`). */
export type HandHint = "pick" | "ready";

export function handHint(picks: number, max: number): HandHint {
  return picks >= max ? "ready" : "pick";
}

/** Where the keyboard goes after a gesture — never on arrival (R-19: stealing focus on load is a defect). */
export type FocusTarget = "call" | "hand" | "dashboard" | "report" | "december" | "resume";

/**
 * The focus that follows a phase the PLAYER caused (plan §3.5). The call is a
 * region, so a screen reader hears its name and then the message; the months
 * scrolling take the focus to the dashboard, which also brings it into view
 * on a phone, where the « Lancer » button sits two screens below it.
 */
export function focusFor(phase: UiPhase): FocusTarget {
  switch (phase.kind) {
    case "call":
    case "ringing":
      return "call";
    case "hand":
      return "hand";
    case "running":
      return "dashboard";
    case "report":
      return "report";
    case "december":
      return "december";
    case "resumePrompt":
      return "resume";
  }
}

// ------------------------------------------------------- the deltas ---

/**
 * The reading the dashboard compares against after a quarter: the four tiles
 * as they stood when the last quarter STARTED. Rebuilt from the journal and the
 * month-by-month history rather than kept in memory, so the deltas survive a
 * reload and a language switch — a delta that vanished on reload would say
 * the quarter changed nothing.
 *
 * Only the fields `dashboardView` reads from its `prev` differ from `state`;
 * undefined before the first quarter, when there is nothing to compare with.
 */
export function lastQuarterStart<Id extends string>(
  level: LevelDefinition<Id>,
  state: GameState<Id>,
): GameState<Id> | undefined {
  const quarters = state.log.length;
  if (quarters === 0) return undefined;
  const last = state.log[quarters - 1]!;
  const startMonth = last.q * 3;
  const start = state.history.find((h) => h.m === startMonth);
  if (!start) return undefined;
  const patience = quarters >= 2 ? state.log[quarters - 2]!.patience : level.constants.patience0;
  return { ...state, churn: start.churn, subs: start.subs, mrr: start.mrr, patience };
}

/**
 * The months the dashboard scrolls through, as readings of the state the
 * quarter STARTED from: the churn, subscribers and revenue of each simulated
 * month, everything else as it was when « Lancer » was pressed. The engine has
 * already computed the quarter; this only picks what to show, frame by frame,
 * so the animation can never decide a number (plan §2.5).
 */
export function runFrame<Id extends string>(
  from: GameState<Id>,
  point: { m: number; churn: number; subs: number; mrr: number },
): GameState<Id> {
  return { ...from, month: point.m, churn: point.churn, subs: point.subs, mrr: point.mrr };
}
