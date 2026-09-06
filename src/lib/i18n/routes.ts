import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./locale";

/**
 * Which URLs carry a locale prefix, and which never do — REVIEW.md R-13.
 *
 * **Content pages are prefixed** (`/en`, `/fr/glossary/cac`). They exist to be
 * indexed, and one URL cannot be indexed in two languages: before this, the
 * same address served French or English depending on a cookie, so Googlebot
 * only ever saw one of them and the entire French glossary was invisible —
 * the exact content the growth plan's SEO phase depends on.
 *
 * **App pages are never prefixed** (`/quiz`, `/r/<id>`, `/deep-dive/<id>`,
 * `/admin`, `/api`). Two reasons, both deliberate:
 *
 *  - `/r/<id>` links are already shared in the wild and must keep working
 *    indefinitely (SPEC.md §12: "un lien qui meurt casse la boucle de
 *    croissance des mois après le partage"). Prefixing them would mean
 *    redirecting every existing share.
 *  - A result has no language of its own — R-09 made it render in the
 *    READER's language. Putting a language in its URL would undo that.
 */

/** First path segments that are localized. Everything else at the root is an app route. */
const LOCALIZED_ROOTS = ["how-it-works", "glossary", "about"] as const;

export function localePath(locale: Locale, path = "/"): string {
  if (path === "/" || path === "") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `/fr/glossary/cac` → `{ locale: "fr", rest: "/glossary/cac" }`. `null` when the path has no locale prefix. */
export function splitLocalePath(pathname: string): { locale: Locale; rest: string } | null {
  const [, first = "", ...others] = pathname.split("/");
  if (!isLocale(first)) return null;
  const rest = others.length > 0 ? `/${others.join("/")}` : "/";
  return { locale: first, rest };
}

/**
 * Whether an unprefixed path is a content URL that should be redirected to its
 * localized form. Covers the addresses this site published before R-13, so
 * anything already linked or indexed keeps resolving.
 */
export function isLocalizableContentPath(pathname: string): boolean {
  if (pathname === "/") return true;
  const [, first = ""] = pathname.split("/");
  return (LOCALIZED_ROOTS as readonly string[]).includes(first);
}

/**
 * `alternates` for a localized content page — the `hreflang` set plus this
 * page's own canonical (REVIEW.md R-13). Paths, not absolute URLs: Next
 * resolves them against `metadataBase` (see the root layout).
 *
 * `x-default` points at English, the app's `DEFAULT_LOCALE` — it is what a
 * search engine shows when it has no better match for the user's language.
 */
export function contentAlternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
  };
}
