import type { Metadata } from "next";
import { LOCALES, type Locale } from "./locale";
import { contentAlternates } from "./routes";
import { OG_SIZE } from "@/lib/og/tokens";
import { tc, UI_STRINGS } from "./dictionary";
import type { Translatable } from "./translatable";

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
 * **The share image, as a fallback.** `src/app/[locale]/opengraph-image.tsx`
 * is the landing's image, and Next.js does NOT inherit it down the tree: a
 * segment gets an `og:image` only if it carries its own file (the landing,
 * How it works and the glossary re-export it). Every other content page —
 * About, the two open-door pages, the comparison cluster, the legal pages —
 * unfurled with no picture at all, the same hole the SEO audit found on
 * `/quiz`. So the landing image is declared here by its address.
 *
 * **A page that carries its own file must say so** (`ownShareImage`).
 * Measured on the build, against what the docs suggest: an image declared in
 * the config REPLACES the file-based one rather than yielding to it. Those
 * pages would lose the cache-busting hash the file convention appends — the
 * thing that makes a platform re-fetch the picture when its copy changes.
 * Opting out rather than in keeps the safe default for the next page: one
 * that forgets gets a picture, not none.
 *
 * Pointing at the image rather than giving each page a re-export file is
 * deliberate: every file is one more image route counted in Functions Storage
 * on every deploy (VERCEL.md), for the very same picture.
 */
export function contentMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  { ownShareImage = false }: { ownShareImage?: boolean } = {},
): Metadata {
  const alternates = contentAlternates(locale, path);
  const shared = shareText(locale, alternates.canonical, title, description);
  if (ownShareImage) return { title, description, alternates, ...shared };
  const images = [
    { url: `/${locale}/opengraph-image/${locale}`, ...OG_SIZE, alt: tc(UI_STRINGS.meta.shareImageAlt, locale), type: "image/png" },
  ];
  return {
    title,
    description,
    alternates,
    openGraph: { ...shared.openGraph, images },
    twitter: { ...shared.twitter, images },
  };
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

/**
 * The search-snippet window every indexable page is held to — SEO audit v1
 * §1.2/§1.3. Past ~60 characters a title starts being cut in a result (Google
 * measures pixels, not characters, so this is the safe side of it); outside
 * 70-160 a description is truncated mid-phrase or rewritten from the page,
 * and the page loses the one line it chose for itself. The content modules
 * are checked against these in `content/__tests__/page-meta.test.ts`, and the
 * rendered HTML of every sitemap URL in `e2e/share-previews.spec.ts`.
 */
export const SEARCH_TITLE_MAX = 60;
export const SEARCH_DESCRIPTION_MIN = 70;
export const SEARCH_DESCRIPTION_MAX = 160;

/**
 * `<title>` of `/glossary/[term]`: the term (or its shorter `metaTitle` in
 * that language), then the glossary's name. One builder for the page and the
 * length test, so the test measures what the page renders.
 */
export function glossaryTermTitle(entry: { term: Translatable; metaTitle?: Partial<Translatable> }, locale: Locale): string {
  return `${entry.metaTitle?.[locale] ?? tc(entry.term, locale)} — ${tc(UI_STRINGS.meta.glossaryTermSuffix, locale)}`;
}
