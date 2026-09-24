/**
 * The game's `localStorage` addresses, and the shape of the one record two
 * chunks share — plan §3.7.
 *
 * In their own module, deliberately tiny, because two readers need them at
 * different times: `storage.ts` (the save and the collection, owned by the
 * storage chunk) writes them, and the hub's `HubProgress` island only READS
 * the collection to show which ending a player reached. Importing `storage.ts`
 * into the hub would drag the level definition and its validation into a page
 * that plays nothing; importing a string from here costs nothing. One place
 * for the names also means a key renamed in one reader cannot silently leave
 * the other reading an empty slot.
 *
 * The `v1` suffix is the migration seam: a shape change gets a new key rather
 * than a parser that has to guess which shape it was handed.
 */
import type { EndingId, LevelSlug } from "./types";

/** One save per level: the year in progress (`{modelVersion, savedAt, state}`). */
export const GAME_SAVE_KEYS = {
  retention: "tdg.game.retention.v1",
} as const satisfies Record<LevelSlug, string>;

/**
 * What a player has collected across levels (GAME-BRIEF.md 9.4): written in
 * December, read by the hub. Kept from v1 even though the hub shows only the
 * endings for now, so the collection does not start empty the day it appears.
 */
export const GAME_COLLECTION_KEY = "tdg.game.collection.v1";

/** The ending a player last reached on a level, and when (ISO 8601). */
export interface StoredEnding {
  id: EndingId;
  at: string;
}

export interface GameCollection {
  patterns: Partial<Record<LevelSlug, { seen: string[]; used: string[] }>>;
  endings: Partial<Record<LevelSlug, StoredEnding>>;
}
