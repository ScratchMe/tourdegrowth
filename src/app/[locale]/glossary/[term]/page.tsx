import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { localePath } from "@/lib/i18n/routes";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string; term: string }>;
}

function isGlossaryTermId(value: string): value is GlossaryTermId {
  return Object.hasOwn(GLOSSARY, value);
}

/** All 15 terms × both locales — a fixed, known set (content/glossary.ts), not user input. */
export function generateStaticParams(): { locale: string; term: string }[] {
  return LOCALES.flatMap((locale) => Object.keys(GLOSSARY).map((term) => ({ locale, term })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, term } = await params;
  if (!isGlossaryTermId(term)) return {};

  const entry = GLOSSARY[term];
  const resolved = isLocale(locale) ? locale : "en";
  return contentMetadata(
    resolved,
    `/glossary/${term}`,
    `${tc(entry.term, resolved)} — ${tc(UI_STRINGS.meta.glossaryTermSuffix, resolved)}`,
    tc(entry.definition, resolved),
  );
}

/**
 * `/glossary/[term]` — SPEC-ADDENDUM-02.md §3.1: one fine, indexable page
 * per glossary term, targeting long-tail searches ("what is CAC", "c'est
 * quoi un growth loop") the landing page and How it works page don't.
 */
export default async function GlossaryTermPage({ params }: PageProps) {
  const { locale: rawLocale, term } = await params;
  if (!isGlossaryTermId(term)) notFound();

  const entry = GLOSSARY[term];
  const locale = rawLocale as Locale;
  const t = UI_STRINGS.glossaryPage;

  return (
    <>
      <ContentHeader locale={locale} path={`/glossary/${term}`} />

      <main className={styles.main}>
        <Link href={localePath(locale, "/glossary")} className={styles.backLink}>
          {tc(t.backToIndex, locale)}
        </Link>

        <h1 className={styles.title}>{tc(entry.term, locale)}</h1>

        <Card elevation="raised">
          <p className={styles.definition}>{tc(entry.definition, locale)}</p>
        </Card>

        <section className={styles.extendedSection}>
          <h2 className={styles.sectionLabel}>{tc(t.inPracticeLabel, locale)}</h2>
          <p className={styles.extended}>{tc(entry.extended, locale)}</p>
        </section>

        {entry.related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.sectionLabel}>{tc(t.relatedLabel, locale)}</h2>
            <div className={styles.relatedList}>
              {entry.related.map((relatedId) => (
                <Link key={relatedId} href={localePath(locale, `/glossary/${relatedId}`)} className={styles.relatedLink}>
                  {tc(GLOSSARY[relatedId].term, locale)}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className={styles.ctaRow}>
          <Button size="lg" href="/quiz">
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
          <Button size="lg" variant="secondary" href={localePath(locale, "/how-it-works")}>
            {tc(UI_STRINGS.nav.howItWorks, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
