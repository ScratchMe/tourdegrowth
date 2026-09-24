/**
 * Which pillar has a level of « Le côté obscur », and whether a result page
 * should offer it — GAME-BRIEF.md 13.4 and 13.3 A.
 *
 * One table, read by three places: the result page's entry card, the hub and
 * the sitemap. Adding a level is adding an entry here; a level declared
 * `enabled: false` shows on the hub as « bientôt » and never triggers the
 * entry card.
 *
 * Relative imports inside `lib/game`, types only from `@/` (plan §3.1): the
 * e2e specs import the engine to build states, and Playwright does not
 * resolve the `@/` alias.
 */
import type { Pillar } from "@/lib/scoring/pillars";
import type { Sharpness } from "@/lib/scoring/bottleneck";
import type { GameAccess } from "./access";
import type { LevelSlug } from "./types";

export interface GameLevelEntry {
  slug: LevelSlug;
  enabled: boolean;
}

export type GameLevelTable = Partial<Record<Pillar, GameLevelEntry>>;

export const GAME_LEVELS_BY_PILLAR: GameLevelTable = {
  retention: { slug: "retention", enabled: true },
};

/** The level a result page may point to — resolved into copy and an href by the caller (G5b). */
export interface GameEntryTarget {
  pillar: Pillar;
  slug: LevelSlug;
}

/**
 * The shape of a bottleneck this function needs — `BottleneckView` narrowed to
 * what it reads, so a caller can pass the view it already has without the
 * scores (which have no business here).
 */
export interface BottleneckLike {
  sharpness: Sharpness;
  pillars: readonly { pillar: Pillar }[];
}

/**
 * The entry card's condition, pure (série G, test G6).
 *
 * - A "level" board names no stage, so it offers no level: the card would be
 *   pointing at a weakness the same page says does not exist.
 * - Closed access offers nothing — the flag, or a preview cookie, decides.
 * - Otherwise the first stage OF THE BOTTLENECK GROUP, lowest first, that has
 *   an enabled level. Orchestrator decision 2 (2026-09-24): a "shared"
 *   bottleneck that includes retention shows the card too — retention is in
 *   the lot holding this product back, and `pillars[0]` alone would hide it
 *   whenever a tie put another stage first in AARRR order, which is an
 *   artefact of declaration order, not a diagnosis.
 */
export function gameEntryFor({
  bottleneck,
  access,
  levels = GAME_LEVELS_BY_PILLAR,
}: {
  bottleneck: BottleneckLike;
  access: GameAccess;
  levels?: GameLevelTable;
}): GameEntryTarget | null {
  if (access !== "open") return null;
  if (bottleneck.sharpness === "level") return null;
  for (const { pillar } of bottleneck.pillars) {
    const level = levels[pillar];
    if (level?.enabled) return { pillar, slug: level.slug };
  }
  return null;
}

/** The slugs a player can actually open today, in the table's order. */
export function enabledLevelSlugs(levels: GameLevelTable = GAME_LEVELS_BY_PILLAR): LevelSlug[] {
  return Object.values(levels)
    .filter((level): level is GameLevelEntry => level?.enabled === true)
    .map((level) => level.slug);
}
