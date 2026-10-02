import { isLocale, type Locale } from "@/lib/i18n/locale";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * The `generateImageMetadata` of every `[locale]` share image: one image,
 * whose id is the language — and NONE when the first segment is not a
 * language.
 *
 * The none is the guard. Next's generated `GET` for an image route answers
 * 404 by itself when the requested id is not in this list, before any
 * render. Without it, `/xx/game/opengraph-image/en` — any first segment that
 * is not `en` or `fr`, `/EN/…` included — rendered the English picture: the
 * proxy closes only what `splitLocalePath` recognises, and the layout's
 * `dynamicParams = false` does not reach a metadata route (Next's loader
 * drops it; NEXTJS.md §1.11). So the game's and the engine's images answered
 * while their pages were closed, and every new first segment cost a Satori
 * render. Found by the security review of T6.2 (2026-10-01).
 */
export async function localeShareImage(
  params: Promise<{ locale: string }>,
  alt: (locale: Locale) => string,
): Promise<{ id: Locale; size: typeof OG_SIZE; contentType: "image/png"; alt: string }[]> {
  const { locale } = await params;
  if (!isLocale(locale)) return [];
  return [{ id: locale, size: OG_SIZE, contentType: "image/png", alt: alt(locale) }];
}
