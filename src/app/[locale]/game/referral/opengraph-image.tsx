import { REFERRAL_CONTENT } from "@/content/game/referral";
import { REFERRAL_INTRO, GAME_META } from "@/content/game/meta";
import { REFERRAL_LEVEL } from "@/lib/game/levels/referral";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { loadOgFonts } from "@/lib/og/fonts";
import { renderGameLevelShareImage } from "@/lib/og/game-frame";
import { gameLevelShareText } from "@/lib/og/game-level-share-text";
import { localeShareImage } from "@/lib/og/image-metadata";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * Share image of `/{locale}/game/referral`, level 4 « S'ils vous recommandent »
 * (A24, REF-3, 2026-10-05): the same picture as level 1's
 * (`retention/opengraph-image.tsx`) — the viral coefficient at its January
 * figure, trust and the regulator's radar as the two counters the dashboard
 * does not show. Its own file: Next.js does not inherit `opengraph-image`
 * from a parent segment, nor from a sibling.
 *
 * One image per language, chosen by `[locale]` (a crawler sends no cookie).
 * Like the page, the image is behind the game's flag: the proxy rewrites this
 * game path to the 404 when the game is closed and no preview cookie is set.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  // No image for a first segment that is not a language: Next then answers 404 (lib/og/image-metadata.ts).
  return localeShareImage(params, (l) => tc(GAME_META.referral.shareImageAlt, l));
}

export default async function GameLevelShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const text = gameLevelShareText(resolved, { intro: REFERRAL_INTRO, dashboard: REFERRAL_CONTENT.dashboard, level: REFERRAL_LEVEL });
  return renderGameLevelShareImage(text, await loadOgFonts());
}
