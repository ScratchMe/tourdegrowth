import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { renderContentShareImage } from "@/lib/og/content-frame";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_SIZE } from "@/lib/og/tokens";

/**
 * Share image of the content pages (landing, How it works, glossary) — the
 * one a LinkedIn or Slack preview of `/fr` or `/en` shows. Until now only
 * result pages had one; a share of the landing came out as a bare link.
 *
 * The frame lives in `lib/og/content-frame.tsx`, shared with `/quiz`; what
 * is the landing's own is the middle: the hero headline in the display
 * stencil with its red accent (`--display-hero`, screen 01) and the subtitle.
 *
 * One image per language, chosen by the `[locale]` segment: a crawler sends
 * no cookie, so the URL is the only language signal it gives us.
 */
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return [{ id: resolved, size, contentType, alt: tc(UI_STRINGS.meta.shareImageAlt, resolved) }];
}

export default async function LandingShareImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const t = UI_STRINGS.landing;
  const line2 = tc(t.h1Line2, resolved).trim();

  return renderContentShareImage(
    resolved,
    {
      headline: [
        { text: tc(t.h1Line1, resolved) },
        // FR has no plain lead-in on line 2 (see `landing.h1Line2`).
        ...(line2 ? [{ text: line2 }] : []),
        { text: tc(t.h1Accent, resolved), accent: true },
      ],
      subtitle: tc(t.subtitle, resolved),
    },
    await loadOgFonts(),
  );
}
