/**
 * Level 2's reference years (GAME-BRIEF §17.6, `docs/game/niveau-2.md`) and
 * the helpers that play them — shared by the model's fixtures
 * (`acquisition.test.ts`) and the island's (`_island/__tests__`), so both
 * walk the same years. Level 1's are in `paths.ts`.
 *
 * Relative imports only: e2e specs may import this to build seeded saves.
 */
import { ACQUISITION_LEVEL, type AcquisitionCardId } from "../levels/acquisition";
import { fresh } from "../model";
import { gameReducer } from "../reducer";
import type { EndingId, GameState, LevelDefinition, ModelSlug } from "../types";

export type Id = AcquisitionCardId;
export type Level = LevelDefinition<Id, ModelSlug>;
export type Pick2 = readonly [Id, Id];
export type Path = readonly Pick2[];

const L: Level = ACQUISITION_LEVEL;

/** §17.6 A — honest, refuses the three orders, presents its data (level 1's A, card for card by role). */
export const PATH_A: Path = [["delivery", "origin"], ["guides", "present"], ["specs", "compare"], ["allin", "present"]];
/** §17.6 B — honest, variant. */
export const PATH_B: Path = [["delivery", "origin"], ["guides", "specs"], ["compare", "present"], ["verified", "present"]];
/** §17.6 C — obeys everything; the DGCCRF comes in the third quarter. */
export const PATH_C: Path = [["stock", "reviews"], ["anchor", "countdown"], ["native", "teaser"], ["delivery", "allin"]];
/** §17.6 D — honest with nothing strong: fired in June. */
export const PATH_D: Path = [["origin", "allin"], ["present", "compare"]];
/** The three endings no reference year reaches, found by search and pinned so they stay reachable. */
export const PATH_CLEAN_MISS: Path = [["origin", "guides"], ["compare", "present"], ["specs", "verified"], ["present", "allin"]];
export const PATH_REPENTANT: Path = [["compare", "countdown"], ["watchers", "guides"], ["allin", "delivery"], ["specs", "clean"]];
export const PATH_LABYRINTH: Path = [["origin", "stock"], ["delivery", "specs"], ["clean", "reviews"], ["anchor", "allin"]];
export const PATH_FIRED_DARK: Path = [["reviews", "allin"], ["origin", "guides"]];

export function playQuarter(state: GameState<Id>, picks: Pick2, level: Level = L): GameState<Id> {
  const reduce = gameReducer(level);
  let s = reduce(state, { type: "hangup" });
  for (const card of picks) s = reduce(s, { type: "toggle", card });
  const next = reduce(s, { type: "run" });
  if (next === s) throw new Error(`quarter ${state.q + 1} refused picks ${picks.join(" + ")}`);
  return next;
}

export function playPath(path: Path, level: Level = L): GameState<Id>[] {
  let s = fresh(level);
  const states = [s];
  for (const picks of path) {
    s = playQuarter(s, picks, level);
    states.push(s);
  }
  return states;
}

/** One year per ending, the reference ones first: every December the level can show. */
export const ENDING_PATHS: Readonly<Record<EndingId, Path>> = {
  applause: PATH_A,
  cleanMiss: PATH_CLEAN_MISS,
  firedClean: PATH_D,
  firedDark: PATH_FIRED_DARK,
  fine: PATH_C,
  repentant: PATH_REPENTANT,
  labyrinth: PATH_LABYRINTH,
};
