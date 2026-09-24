import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, LOCALES } from "@/lib/i18n/locale";
import { renderContentShareImage, type HeadlineSegment } from "@/lib/og/content-frame";
import { loadOgFonts } from "@/lib/og/fonts";

/**
 * `GET /quiz/share/<locale>` — the share image of `/quiz`, SEO audit v1 §1.1.
 *
 * `/quiz` is the most-linked page of the site, and the launch posts
 * (GROWTH-PLAN.md wave 1) point at it to "try it now" — yet a link to it
 * unfurled with no picture at all. Same frame as the landing image
 * (`lib/og/content-frame.tsx`), with the questionnaire's own middle: its
 * document title and what you leave with.
 *
 * A route handler rather than the `opengraph-image.tsx` file convention, for
 * two reasons that are both about this folder:
 *
 * - `/quiz` has no locale in its URL (`lib/i18n/routes.ts`), so the
 *   convention would give one image for both languages while the title and
 *   description beside it follow the reader. Here the language is in the
 *   address, and `quiz/layout.tsx` points at the one that matches its text.
 * - Under a route group, the convention suffixes the URL with a build hash
 *   (`opengraph-image-1u74ed`, see `next.config.mjs`) — an address nobody
 *   chose, and one that moves when Next's algorithm does.
 *
 * Prerendered at build, once per language: nothing here reads the request,
 * so there is nothing to render per visit.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

/**
 * "The Tour — 15 questions" → "The Tour —" in ink, "15 questions" in red: the
 * same move as the landing's "stall?", because the red accent is one of the
 * three things that must survive at feed size (DESIGN-BRIEF.md §03). Split on
 * the document title's own dash rather than a second string to review; a
 * future title without one simply renders in ink.
 */
function splitHeadline(heading: string): HeadlineSegment[] {
  const cut = heading.lastIndexOf(" — ");
  if (cut < 0) return [{ text: heading }];
  return [{ text: heading.slice(0, cut + 2) }, { text: heading.slice(cut + 3), accent: true }];
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  return renderContentShareImage(
    locale,
    {
      headline: splitHeadline(tc(UI_STRINGS.meta.quizHeading, locale)),
      subtitle: tc(UI_STRINGS.landing.promise, locale),
    },
    await loadOgFonts(),
  );
}
