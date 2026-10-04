/**
 * The referral level's reference years (GAME-BRIEF §19, `docs/game/referral.md`)
 * and the helpers that play them — shared by the model's fixtures
 * (`referral.test.ts`) and, once the level is wired, by the island's. They are
 * level 2's years (`paths-acquisition.ts`), card for card by role.
 *
 * Relative imports only: e2e specs may import this to build seeded saves.
 */
import { REFERRAL_LEVEL, type ReferralCardId } from "../levels/referral";
import { fresh } from "../model";
import { gameReducer } from "../reducer";
import type { EndingId, GameState, LevelDefinition, ModelSlug } from "../types";

export type Id = ReferralCardId;
export type Level = LevelDefinition<Id, ModelSlug>;
export type Pick2 = readonly [Id, Id];
export type Path = readonly Pick2[];

const L: Level = REFERRAL_LEVEL;

/** §19 A — honest, refuses the three orders, presents its data. */
export const PATH_A: Path = [["fairbonus", "guests"], ["recap", "present"], ["guestpage", "grouplink"], ["chosen", "present"]];
/** §19 B — honest, variant. */
export const PATH_B: Path = [["fairbonus", "guests"], ["recap", "guestpage"], ["grouplink", "present"], ["nobook", "present"]];
/** §19 C — obeys everything; the CNIL comes in the third quarter. */
export const PATH_C: Path = [["contacts", "bigshare"], ["autoinvite", "fakeinvite"], ["shadow", "bonus"], ["fairbonus", "chosen"]];
/** §19 D — honest with nothing strong: fired in June. */
export const PATH_D: Path = [["guests", "chosen"], ["present", "grouplink"]];
/** The four endings no reference year reaches, pinned so they stay reachable — level 2's years by role, but for the clean miss:
 * level 2's, played here, ends at 0,5959 and the tile's 0,60 is a win; this one is found by search (all-honest years). */
export const PATH_CLEAN_MISS: Path = [["fairbonus", "guests"], ["recap", "present"], ["guestpage", "present"], ["present", "chosen"]];
export const PATH_REPENTANT: Path = [["grouplink", "fakeinvite"], ["unlock", "recap"], ["chosen", "fairbonus"], ["guestpage", "clean"]];
export const PATH_LABYRINTH: Path = [["guests", "contacts"], ["fairbonus", "guestpage"], ["clean", "bigshare"], ["autoinvite", "chosen"]];
export const PATH_FIRED_DARK: Path = [["bigshare", "chosen"], ["guests", "recap"]];

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
