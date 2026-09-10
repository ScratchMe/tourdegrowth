import { UI_STRINGS } from "@/lib/i18n/dictionary";
import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * "Retention is where this growth stalls." — or, when no stage is behind,
 * "No single stage is stalling this growth."
 *
 * One function because there are FOUR surfaces that say this about the same
 * result, and they are seen together: the share image's bottom hook, the
 * `og:description` beside it in a link preview, the share card's alt text,
 * and the text the native share sheet puts in the user's own mouth. Each
 * built the sentence itself, and when `LEVEL_HEADLINE` closed the level gap
 * three of the four were swept — the share text was missed, so tapping Share
 * on a 100/100 result announced "Acquisition is where this growth stalls"
 * next to an image saying nothing was stalling.
 *
 * Pass `null` for a level board. The caller gets that from
 * `primaryBottleneck(resolveBottleneck(pillars))` — never from
 * `weakestPillar`, which still names the lowest pillar on a board where
 * every stage is strong.
 */
export function stallSentence(locale: Locale, stalling: Pillar | null): string {
  if (!stalling) return tc(UI_STRINGS.og.stallSentenceLevel, locale);
  return tc(UI_STRINGS.og.stallSentenceTemplate, locale).replace(
    "{pillar}",
    tc(UI_STRINGS.pillars[stalling], locale),
  );
}

/** The text the native share sheet carries — the score, the stall sentence, the hook. */
export function shareText(locale: Locale, total: number, stalling: Pillar | null): string {
  return tc(UI_STRINGS.share.textTemplate, locale)
    .replace("{total}", String(total))
    .replace("{stall}", stallSentence(locale, stalling));
}
