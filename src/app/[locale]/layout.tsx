import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isLocale, LOCALES } from "@/lib/i18n/locale";
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
 * it matches any first path segment that isn't one of the app's static
 * folders (`quiz`, `r`, `deep-dive`, `admin`, `api`). Without this check,
 * `/nonsense` would quietly render the landing page in the default language
 * instead of a 404.
 */
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
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <RootShell locale={locale}>{children}</RootShell>;
}
