import { ACQUISITION_CONTENT } from "@/content/game/acquisition";
import { ACQUISITION_INTRO, GAME_META } from "@/content/game/meta";
import { ACQUISITION_LEVEL } from "@/lib/game/levels/acquisition";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { loadOgFonts } from "@/lib/og/fonts";
import { renderGameLevelShareImage } from "@/lib/og/game-frame";
import { gameLevelShareText } from "@/lib/og/game-level-share-text";
import { localeShareImage } from "@/lib/og/image-metadata";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * Share image of `/{locale}/game/acquisition`, level 2 « Comment les gens
 * vous trouvent » (A12.f, 2026-10-01): the same picture as level 1's
 * (`retention/opengraph-image.tsx`) — new customers at their January figure,
 * trust and the regulator's radar as the two counters the dashboard does not
 * show. Its own file: Next.js does not inherit `opengraph-image` from a
 * parent segment, nor from a sibling.
 *
 * One image per language, chosen by `[locale]` (a crawler sends no cookie).
 * Like the page, the image is behind the game's flag: the proxy rewrites this
 * game path to the 404 when the game is closed and no preview cookie is set.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  // No image for a first segment that is not a language: Next then answers 404 (lib/og/image-metadata.ts).
  return localeShareImage(params, (l) => tc(GAME_META.acquisition.shareImageAlt, l));
}

export default async function GameLevelShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const text = gameLevelShareText(resolved, { intro: ACQUISITION_INTRO, dashboard: ACQUISITION_CONTENT.dashboard, level: ACQUISITION_LEVEL });
  return renderGameLevelShareImage(text, await loadOgFonts());
}
