import { GAME_META } from "@/content/game/meta";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { loadOgFonts } from "@/lib/og/fonts";
import { renderGameHubShareImage } from "@/lib/og/game-frame";
import { gameHubShareText } from "@/lib/og/game-hub-share-text";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * Share image of `/{locale}/game`, the hub of « Le côté obscur » — its own
 * picture rather than the landing's: a link to a game that unfurls as the
 * Tour's questionnaire promises the wrong thing (plan §3.9).
 *
 * Same mechanics as `src/app/[locale]/opengraph-image.tsx`: one image per
 * language, chosen by the `[locale]` segment, because a crawler sends no
 * cookie and the URL is the only language signal it gives. Next.js does not
 * inherit this file down the tree, so the level carries its own
 * (`retention/opengraph-image.tsx`).
 *
 * Closed game, closed image: `/fr/game/opengraph-image/fr` is a game path, so
 * the proxy rewrites it to the 404 like the page itself when the game is
 * closed and no preview cookie is set. The page's metadata declares this
 * file's address only through the file convention (`ownShareImage`), never
 * the landing's in config — config would replace it (lib/i18n/meta.ts).
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return [{ id: resolved, size, contentType, alt: tc(GAME_META.hub.shareImageAlt, resolved) }];
}

export default async function GameHubShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return renderGameHubShareImage(gameHubShareText(resolved), await loadOgFonts());
}
