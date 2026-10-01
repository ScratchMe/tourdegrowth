import { isLocale, type Locale } from "@/lib/i18n/locale";
import { renderEngineShareImage } from "@/lib/og/engine-frame";
import { engineShareText } from "@/lib/og/engine-share-text";
import { loadOgFonts } from "@/lib/og/fonts";
import { localeShareImage } from "@/lib/og/image-metadata";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * Share image of `/{locale}/aarrr-funnel-template`, the growth engine — its
 * own picture rather than the landing's: a link to a tool you fill with your
 * numbers that unfurled as the Tour's fifteen questions promised the wrong
 * thing (engine spec §19.11, design brief 06).
 *
 * Same mechanics as the game's (`game/opengraph-image.tsx`): one image per
 * language, chosen by the `[locale]` segment, because a crawler sends no
 * cookie and the URL is the only language signal it gives.
 *
 * Closed engine, closed image: `/fr/aarrr-funnel-template/opengraph-image/fr`
 * is under the engine's path, so the proxy rewrites it to the 404 like the
 * page itself when the engine is closed and no preview cookie is set
 * (`isEnginePath`). The page declares this file's address only through the
 * file convention (`ownShareImage`), never the landing's in config — config
 * would replace it (lib/i18n/meta.ts).
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  // No image for a first segment that is not a language: Next then answers 404 (lib/og/image-metadata.ts).
  return localeShareImage(params, (l) => engineShareText(l).alt);
}

export default async function EngineShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return renderEngineShareImage(engineShareText(resolved), await loadOgFonts());
}
