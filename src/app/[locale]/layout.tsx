import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isLocale, LOCALES } from "@/lib/i18n/locale";

/**
 * Guards the whole localized subtree — REVIEW.md R-13.
 *
 * `[locale]` is a dynamic segment at the root, so it matches any first path
 * segment that isn't one of the app's static folders (`quiz`, `r`,
 * `deep-dive`, `admin`, `api`). Without this check, `/nonsense` would quietly
 * render the landing page in the default language instead of a 404.
 */
export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}
