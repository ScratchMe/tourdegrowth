import type { Metadata } from "next";
import { ComparisonView } from "../_comparison/ComparisonView";
import { COMPARISONS } from "@/content/comparisons";
import { tc } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";

const SLUG = "aarrr-vs-heart" as const;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const entry = COMPARISONS[SLUG];
  return contentMetadata(resolved, `/${SLUG}`, tc(entry.metaTitle, resolved), tc(entry.metaDescription, resolved));
}

/** Audit SEO v1 §3.1 — cinquième page du cluster ; le rendu est partagé, voir `_comparison/ComparisonView`. */
export default async function Page({ params }: PageProps) {
  return <ComparisonView slug={SLUG} locale={(await params).locale as Locale} />;
}
