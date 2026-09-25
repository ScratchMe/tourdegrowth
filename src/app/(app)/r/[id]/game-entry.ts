import type { GameEntryView } from "@/components/game/GameEntry";
import { GAME_ENTRY_COPY } from "@/content/game/entry";
import type { GameAccess } from "@/lib/game/access";
import { GAME_ENTRY_EVENT, type GameEntryDetail } from "@/lib/game/events";
import { formatPct } from "@/lib/game/format";
import { gameEntryFor, GAME_LEVELS_BY_PILLAR, type BottleneckLike, type GameLevelTable } from "@/lib/game/levels";
import { RETENTION_LEVEL } from "@/lib/game/levels/retention";
import type { LevelSlug } from "@/lib/game/types";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { tc } from "@/lib/i18n/translatable";

/**
 * The result page's game card, from bottleneck to display strings — game plan
 * §3.10, GAME-BRIEF.md 13.3 A. Server only: it reads the entry copy and the
 * level model, and hands the client strings (the payload carries one card's
 * worth of text in one language, never the copy module or the engine).
 *
 * The ONE place the page gets its card from, and the card exists only through
 * `gameEntryFor` — so the three reasons it can be absent are decided in one
 * pure function and nowhere else: the game is closed (flag and preview
 * cookie), the board is "level", or no stage of the bottleneck group has an
 * enabled level. `src/__tests__/game-entry-wiring.test.ts` holds the page to
 * this path.
 */

/**
 * The number on the band, read from each level's model rather than written
 * in the copy: the card must not quote a churn the game does not start from.
 * `Record<LevelSlug, …>` so a new level does not compile without one.
 */
const STARTING_CHURN: Record<LevelSlug, number> = {
  retention: RETENTION_LEVEL.constants.churn0,
};

export function resultGameEntry({
  bottleneck,
  access,
  locale,
  hasDeepDive,
  levels = GAME_LEVELS_BY_PILLAR,
}: {
  bottleneck: BottleneckLike;
  access: GameAccess;
  locale: Locale;
  /** A completed Deep dive changes the card's first sentence (13.3), and the door it counts as. */
  hasDeepDive: boolean;
  levels?: GameLevelTable;
}): GameEntryView | null {
  const target = gameEntryFor({ bottleneck, access, levels });
  if (!target) return null;

  const from = hasDeepDive ? "deep_dive" : "result";
  // Typed against the closed vocabulary (`GAME_ENTRY_DETAILS`): a level added
  // to `LevelSlug` without its two entry paths in `events.ts` does not
  // compile — which is the only way to learn it before /admin/stats silently
  // counts zero for it (R-11).
  const detail: GameEntryDetail = `${from}/${target.slug}`;

  const copy = GAME_ENTRY_COPY[target.slug];
  const opening = tc(hasDeepDive ? copy.opening.deepDive : copy.opening.result, locale);

  return {
    href: `${localePath(locale, `/game/${target.slug}`)}?from=${from}`,
    title: tc(copy.title, locale),
    body: `${opening} ${tc(copy.body, locale)}`,
    cta: tc(copy.cta, locale),
    meta: tc(copy.meta, locale),
    band: {
      churn: tc(copy.band.churn, locale).replace("{churn}", formatPct(locale, STARTING_CHURN[target.slug])),
      trust: tc(copy.band.trust, locale),
      notOnDashboard: tc(copy.band.notOnDashboard, locale),
    },
    event: { name: GAME_ENTRY_EVENT, detail },
  };
}
