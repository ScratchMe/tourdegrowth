import type { Metadata } from "next";
import { LOCALES, type Locale } from "./locale";
import { contentAlternates } from "./routes";

/** Open Graph wants the territory form; the app only knows the language. */
const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR" };

/**
 * `generateMetadata` payload of a localized content page: `<title>` and
 * description in the page's own language, the hreflang/canonical set
 * (REVIEW.md R-13), and the Open Graph / Twitter text a share preview shows.
 *
 * The share IMAGE is not set here: `src/app/[locale]/opengraph-image.tsx`
 * is the file convention Next.js picks up for the whole `[locale]` subtree,
 * and it appends the `og:image`/`twitter:image` tags (with their cache-busting
 * hash) itself. Declaring an image URL by hand here would drift from that
 * hash — the same trap `next.config.mjs` documents for the result image.
 */
export function contentMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const alternates = contentAlternates(locale, path);
  return {
    title,
    description,
    alternates,
    openGraph: {
      type: "website",
      siteName: "Tour de Growth",
      title,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
