import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GLOSSARY } from "@/content/glossary";
import { breadcrumbSchema, CRUMBS, definedTermSetSchema, JsonLd } from "@/lib/seo/jsonld";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { localePath } from "@/lib/i18n/routes";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(
    resolved,
    "/glossary",
    tc(UI_STRINGS.meta.glossaryTitle, resolved),
    tc(UI_STRINGS.meta.glossaryDescription, resolved),
  );
}

/**
 * `/glossary` index — SPEC-ADDENDUM-02.md §3.1: the glossary content
 * already written for the in-app definition popovers (content/glossary.ts)
 * doubles as long-tail SEO content once each term has its own indexable
 * page. Server Component, same locale-resolution pattern as
 * `/how-it-works` — no interactivity needed here either.
 */
export default async function GlossaryIndexPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const t = UI_STRINGS.glossaryPage;

  return (
    <>
      {/* REVIEW-02.md R2-15: the glossary as one vocabulary, and its place in the site. */}
      <JsonLd data={definedTermSetSchema(locale)} />
      <JsonLd data={breadcrumbSchema(locale, [CRUMBS.glossary(locale)])} />
      <ContentHeader locale={locale} path="/glossary" />

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{tc(t.indexTitle, locale)}</h1>
          <p className={styles.subtitle}>{tc(t.indexIntro, locale)}</p>
        </div>

        <div className={styles.list}>
          {Object.entries(GLOSSARY).map(([id, entry]) => (
            <Link key={id} href={localePath(locale, `/glossary/${id}`)} className={styles.itemLink}>
              <Card elevation="flat" tone="paper" className={styles.item}>
                <h2 className={styles.term}>{tc(entry.term, locale)}</h2>
                <p className={styles.definition}>{tc(entry.definition, locale)}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className={styles.ctaWrap}>
          <Button size="lg" href="/quiz">
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
