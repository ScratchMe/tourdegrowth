import type { ReactNode } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n/locale";
import { RootShell, rootMetadata } from "../root-shell";

export const metadata = rootMetadata;

/**
 * Root layout for the localized content pages — REVIEW.md R-13 (one URL per
 * language) and R-24 (statically rendered).
 *
 * It is a *root* layout, not a nested one: there is no `app/layout.tsx` any
 * more, so this renders `<html>`/`<body>` itself. That is precisely what buys
 * the static rendering — the language comes from the route param, so nothing
 * here reads a header or a cookie and every page beneath can be prerendered
 * at build time and served from the CDN.
 *
 * It also guards the subtree. `[locale]` is a dynamic segment at the root, so
 * it would otherwise match any first path segment that isn't one of the app's
 * static folders (`quiz`, `r`, `deep-dive`, `admin`, `api`), and `/nonsense`
 * would quietly render the landing page in the default language.
 *
 * `dynamicParams = false` is how that is refused, and the choice matters
 * (REVIEW.md R-26). The guard used to be a `notFound()` call in the body
 * below — which works, but makes `/nonsense` a route that MATCHED and then
 * threw, and a thrown `notFound()` from a root layout has no boundary to
 * render in: Next fell back to its own bare error document. Refusing the
 * match outright turns it into an ordinary routing miss, which
 * `global-not-found.tsx` handles with the product's own chrome.
 */
export const dynamicParams = false;

export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Narrowing only: `dynamicParams = false` already guarantees this is one of
  // LOCALES, so the fallback is unreachable rather than a real default.
  const { locale } = await params;
  return <RootShell locale={isLocale(locale) ? locale : DEFAULT_LOCALE}>{children}</RootShell>;
}
