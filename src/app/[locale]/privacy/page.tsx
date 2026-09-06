import type { Metadata } from "next";
import { LegalPage } from "@/components/brand/LegalPage";
import { PRIVACY } from "@/content/legal";
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
  return contentMetadata(resolved, "/privacy", tc(PRIVACY.title, resolved), tc(PRIVACY.metaDescription, resolved));
}

/** `/privacy` — REVIEW-02.md R2-03. GDPR art. 13 information; the copy is `content/legal.ts`. */
export default async function PrivacyPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [CRUMBS.privacy(locale)])} />
      <LegalPage document={PRIVACY} path="/privacy" locale={locale} />
    </>
  );
}
