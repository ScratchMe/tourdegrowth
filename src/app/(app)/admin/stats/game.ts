import type { FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { GAME_LEVEL_SLUGS } from "@/lib/game/events";
import type { GrowthStats } from "@/lib/submissions/growth-stats";

/**
 * Result → game, per window — GAME-BRIEF.md §13.5: the one number the
 * decision rule on the result card turns on.
 *
 * Numerator: clicks on the result page's game card, every level and both
 * variants (with and without a Deep dive sit on the same page). Denominator:
 * results whose bottleneck group includes a stage with a level, i.e. the
 * results that card can appear on (GrowthStats.gameBottleneckResults) —
 * retention alone until level 2 opened acquisition too (2026-10-01, A12.f).
 *
 * Deliberately called "clicks per result", not a rate, for the reason A4
 * spelled out: a shared result is read by visitors, and they see the card
 * too, so one result can produce several clicks and this legitimately
 * exceeds 1. It is also the one mixed-source ratio on the page (GoatCounter
 * over Firestore), which understates it by however many readers block
 * scripts — the same caveat `conversionPerShare` carries.
 */
export interface GamePass {
  label: string;
  resultClicks: number;
  gameResults: number | null;
  clicksPerResult: number | null;
}

/**
 * The Firestore count for a GoatCounter window, matched by the label
 * `fetchFunnelStats` gives it. A window this page does not know gets no
 * denominator rather than a wrong one.
 */
function gameResultsFor(label: string, growth: Pick<GrowthStats, "gameBottleneckResults">): number | null {
  if (label === "All-time") return growth.gameBottleneckResults.allTime;
  if (label === "Last 30 days") return growth.gameBottleneckResults.last30Days;
  return null;
}

export function gamePass(window: FunnelWindow, growth: Pick<GrowthStats, "gameBottleneckResults">): GamePass | null {
  const game = window.stats?.game;
  if (!game) return null;
  const resultClicks = GAME_LEVEL_SLUGS.reduce(
    (n, slug) => n + game.entries[`result/${slug}`] + game.entries[`deep_dive/${slug}`],
    0,
  );
  const gameResults = gameResultsFor(window.label, growth);
  return {
    label: window.label,
    resultClicks,
    gameResults,
    clicksPerResult: gameResults ? resultClicks / gameResults : null,
  };
}
