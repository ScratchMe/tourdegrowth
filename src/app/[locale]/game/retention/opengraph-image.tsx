import { GAME_META } from "@/content/game/meta";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { loadOgFonts } from "@/lib/og/fonts";
import { renderGameLevelShareImage } from "@/lib/og/game-frame";
import { gameLevelShareText } from "@/lib/og/game-level-share-text";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * Share image of `/{locale}/game/retention`, level 1 « S'ils reviennent »:
 * the level's title over the three dashboard tiles — churn at its January
 * figure, trust and the regulator's radar as the two counters the dashboard
 * does not show (plan §3.9). Its own file, not a re-export of the hub's:
 * Next.js does not inherit `opengraph-image` from a parent segment, and a
 * level deserves a picture of the level.
 *
 * One image per language, chosen by `[locale]` (a crawler sends no cookie).
 * Like the page, the image is behind the game's flag: the proxy rewrites this
 * game path to the 404 when the game is closed and no preview cookie is set.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return [{ id: resolved, size, contentType, alt: tc(GAME_META.retention.shareImageAlt, resolved) }];
}

export default async function GameLevelShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return renderGameLevelShareImage(gameLevelShareText(resolved), await loadOgFonts());
}
