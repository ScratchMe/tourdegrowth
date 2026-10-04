/**
 * The revenue level's reference years (GAME-BRIEF §20, `docs/game/revenue.md`)
 * and the helpers that play them — shared by the model's fixtures
 * (`revenue.test.ts`) and, once the level is wired, by the island's. They are
 * level 2's years (`paths-acquisition.ts`), card for card by role.
 *
 * Relative imports only: e2e specs may import this to build seeded saves.
 */
import { REVENUE_LEVEL, type RevenueCardId } from "../levels/revenue";
import { fresh } from "../model";
import { gameReducer } from "../reducer";
import type { EndingId, GameState, LevelDefinition, ModelSlug } from "../types";

export type Id = RevenueCardId;
export type Level = LevelDefinition<Id, ModelSlug>;
export type Pick2 = readonly [Id, Id];
export type Path = readonly Pick2[];

const L: Level = REVENUE_LEVEL;

/** §20 A — honest, refuses the three orders, presents its data. */
export const PATH_A: Path = [["fullprice", "checkout"], ["downgrade", "present"], ["programs", "roundpacks"], ["trialmail", "present"]];
/** §20 B — honest, variant. */
export const PATH_B: Path = [["fullprice", "checkout"], ["downgrade", "programs"], ["roundpacks", "present"], ["renewmail", "present"]];
/** §20 C — obeys everything; the DGCCRF comes in the third quarter. */
export const PATH_C: Path = [["addon", "lootbox"], ["trial", "hiddensub"], ["express", "renewal"], ["fullprice", "trialmail"]];
/** §20 D — honest with nothing strong: fired in June. */
export const PATH_D: Path = [["checkout", "trialmail"], ["present", "roundpacks"]];
/** The three endings no reference year reaches — level 2's pinned years, by role — so they stay reachable. */
export const PATH_CLEAN_MISS: Path = [["checkout", "downgrade"], ["roundpacks", "present"], ["programs", "renewmail"], ["present", "trialmail"]];
export const PATH_REPENTANT: Path = [["roundpacks", "hiddensub"], ["pricing", "downgrade"], ["trialmail", "fullprice"], ["programs", "clean"]];
export const PATH_LABYRINTH: Path = [["checkout", "addon"], ["fullprice", "programs"], ["clean", "lootbox"], ["trial", "trialmail"]];
export const PATH_FIRED_DARK: Path = [["lootbox", "trialmail"], ["checkout", "downgrade"]];

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
