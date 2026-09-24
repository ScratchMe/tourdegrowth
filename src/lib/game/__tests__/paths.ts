/**
 * Reference years and constructed states — shared by this chunk's tests and
 * by the other chunks' (storage validation, e2e seeded saves, December
 * screenshots). Not a test file: vitest only collects `*.test.ts`.
 *
 * Every state here is PLAYED through the reducer, never hand-assembled, so
 * a seeded save is always one the game could actually have produced. Relative
 * imports only: Playwright imports this module and does not resolve `@/`.
 */
import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { fresh } from "../model";
import { gameReducer } from "../reducer";
import type { EndingId, GameState, LevelDefinition } from "../types";

type Id = RetentionCardId;
export type Pick2 = readonly [Id, Id];
export type Path = readonly Pick2[];

/** GAME-BRIEF.md §6 A — honest, refuses all three orders, presents data. */
export const PATH_A: Path = [["pause", "survey"], ["onboard", "present"], ["annual", "reco"], ["remind", "present"]];
/** §6 B — honest, variant. */
export const PATH_B: Path = [["pause", "survey"], ["onboard", "annual"], ["reco", "present"], ["three", "present"]];
/** §6 C — obeys everything; the DGCCRF comes in the third quarter. */
export const PATH_C: Path = [["pdef", "bury"], ["call", "cascade"], ["social", "notice"], ["pause", "present"]];
/** §6 D — honest with nothing strong: fired in June. */
export const PATH_D: Path = [["survey", "present"], ["remind", "reco"]];
/**
 * Plan annexe M — a pattern, then cleaning. The CEO asks for `call` two
 * quarters running (X4), and the year ends `repentant`.
 */
export const PATH_M: Path = [["pdef", "pause"], ["survey", "onboard"], ["clean", "present"], ["annual", "reco"]];

/**
 * The three endings no reference path reaches, played rather than written.
 * Found by search over hands the reducer accepts; the ending test pins that
 * each still lands where its name says, so a rebalancing that moves one is
 * seen here instead of in a December screenshot.
 */
export const PATH_CLEAN_MISS: Path = [["onboard", "survey"], ["three", "remind"], ["present", "reco"], ["pause", "annual"]];
export const PATH_FIRED_DARK: Path = [["pdef", "remind"], ["clean", "reco"]];
export const PATH_LABYRINTH: Path = [["onboard", "bury"], ["survey", "reco"], ["social", "shame"], ["remind", "three"]];

type Level = LevelDefinition<Id>;

/** Plays one quarter the way a player does: hang up, pick two, run. */
export function playQuarter(state: GameState<Id>, picks: Pick2, level: Level = RETENTION_LEVEL): GameState<Id> {
  const reduce = gameReducer(level);
  let s = reduce(state, { type: "hangup" });
  for (const card of picks) s = reduce(s, { type: "toggle", card });
  const next = reduce(s, { type: "run" });
  if (next === s) throw new Error(`quarter ${state.q + 1} refused picks ${picks.join(" + ")}`);
  return next;
}

/**
 * Every state along the way: index 0 is `fresh`, index n is after quarter n.
 * The level is a parameter so a test can replay a path on a deliberately
 * mistuned copy of it — that is how the fixtures prove they measure something.
 */
export function playPath(path: Path, level: Level = RETENTION_LEVEL): GameState<Id>[] {
  let s = fresh(level);
  const states = [s];
  for (const picks of path) {
    s = playQuarter(s, picks, level);
    states.push(s);
  }
  return states;
}

export function finalState(path: Path, level: Level = RETENTION_LEVEL): GameState<Id> {
  let s = fresh(level);
  for (const picks of path) s = playQuarter(s, picks, level);
  return s;
}

/**
 * Freezes an object and everything under it. The engine's functions must
 * never mutate their input; in an ES module (strict mode) writing to a frozen
 * object throws, so a test that passes a frozen state catches a mutation
 * where it happens instead of three functions later.
 */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

/** A finished year for each of the seven endings (seeded saves, December views). */
export const ENDING_PATHS: Readonly<Record<EndingId, Path>> = {
  applause: PATH_A,
  cleanMiss: PATH_CLEAN_MISS,
  fine: PATH_C,
  repentant: PATH_M,
  labyrinth: PATH_LABYRINTH,
  firedClean: PATH_D,
  firedDark: PATH_FIRED_DARK,
};

export function endingState(id: EndingId): GameState<Id> {
  return finalState(ENDING_PATHS[id]);
}
