import type { Metadata } from "next";
import { LOCALES, type Locale } from "./locale";
import { contentAlternates } from "./routes";
import { OG_SIZE } from "@/lib/og/tokens";

/** Open Graph wants the territory form; the app only knows the language. */
const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR" };

/** The share-preview text both helpers below build the same way. */
function shareText(locale: Locale, url: string, title: string, description: string) {
  return {
    openGraph: {
      type: "website" as const,
      siteName: "Tour de Growth",
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

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
  return { title, description, alternates, ...shareText(locale, alternates.canonical, title, description) };
}

/**
 * The same payload for an APP page — one with no locale in its URL
 * (`lib/i18n/routes.ts`), whose text follows the reader. SEO audit v1 §1.1
 * and §1.4: `/quiz` built `{ title, description }` by hand and so had no
 * share preview at all and no canonical, while being the most-linked page
 * of the site.
 *
 * Differences with `contentMetadata`, both deliberate:
 *
 * - **No hreflang.** There is one URL for both languages, so there is no
 *   alternate to declare; the canonical is the bare path itself.
 * - **The image is declared here.** App pages have no `[locale]` segment for
 *   an `opengraph-image` file to key on, so the page owns an explicit,
 *   per-language address (`/quiz/share/<locale>`) and passes it in — the
 *   one that matches the language of the text beside it.
 */
export function appMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  image: { url: string; alt: string },
): Metadata {
  const shared = shareText(locale, path, title, description);
  const images = [{ url: image.url, ...OG_SIZE, alt: image.alt, type: "image/png" }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...shared.openGraph, images },
    twitter: { ...shared.twitter, images },
  };
}
