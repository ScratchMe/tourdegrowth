import type { Metadata } from "next";
import { LegalPage } from "@/components/brand/LegalPage";
import { TERMS } from "@/content/legal";
import { tc } from "@/lib/i18n/translatable";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { breadcrumbSchema, CRUMBS, JsonLd } from "@/lib/seo/jsonld";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(resolved, "/terms", tc(TERMS.title, resolved), tc(TERMS.metaDescription, resolved));
}

/** `/terms` — REVIEW-02.md R2-03. Terms of use plus the LCEN art. 6 III-2 publisher/host notice; the copy is `content/legal.ts`. */
export default async function TermsPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [CRUMBS.terms(locale)])} />
      <LegalPage document={TERMS} path="/terms" locale={locale} />
    </>
  );
}
