import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { QUESTIONS } from "@/content/copy-library";
import type { DeepGlossaryContent } from "@/content/glossary-deep";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { breadcrumbSchema, CRUMBS, definedTermSchema, JsonLd } from "@/lib/seo/jsonld";
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
    tc(entry.metaDescription ?? entry.definition, resolved),
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
      {/* REVIEW-02.md R2-15: the term, its set, and the trail that leads here. */}
      <JsonLd data={definedTermSchema(locale, term)} />
      <JsonLd data={breadcrumbSchema(locale, [CRUMBS.glossary(locale), CRUMBS.term(locale, term)])} />
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

        {entry.deep && <DeepSections deep={entry.deep} locale={locale} />}

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

/**
 * The long-form half of a term page — REVIEW-02.md R2-11. Rendered only for
 * terms that have it (`content/glossary-deep.ts`); the others keep the short
 * page. "In the Tour" pulls the actual question and its three answers from
 * the copy library, so the page can never misquote the questionnaire.
 */
function DeepSections({ deep, locale }: { deep: DeepGlossaryContent; locale: Locale }) {
  const t = UI_STRINGS.glossaryPage;
  const question = QUESTIONS.find((q) => q.id === deep.inTheTour.questionId);

  return (
    <>
      <section className={styles.deepSection}>
        <h2 className={styles.sectionLabel}>{tc(t.formulaLabel, locale)}</h2>
        <p className={styles.formula}>{tc(deep.formula.expression, locale)}</p>
        <dl className={styles.formulaTerms}>
          {deep.formula.terms.map((term, i) => (
            <div key={i} className={styles.formulaTerm}>
              <dt className={styles.formulaSymbol}>{tc(term.symbol, locale)}</dt>
              <dd className={styles.body}>{tc(term.meaning, locale)}</dd>
            </div>
          ))}
        </dl>
        {deep.formula.note && <p className={styles.body}>{tc(deep.formula.note, locale)}</p>}
      </section>

      <section className={styles.deepSection}>
        <h2 className={styles.sectionLabel}>{tc(t.exampleLabel, locale)}</h2>
        <Card elevation="raised" className={styles.exampleCard}>
          <p className={styles.exampleTitle}>{tc(deep.example.title, locale)}</p>
          <ol className={styles.steps}>
            {deep.example.steps.map((step, i) => (
              <li key={i} className={styles.body}>
                {tc(step, locale)}
              </li>
            ))}
          </ol>
          <p className={styles.takeaway}>{tc(deep.example.takeaway, locale)}</p>
        </Card>
      </section>

      <section className={styles.deepSection}>
        <h2 className={styles.sectionLabel}>{tc(t.benchmarkLabel, locale)}</h2>
        <ul className={styles.bullets}>
          {deep.benchmark.map((item, i) => (
            <li key={i} className={styles.body}>
              {tc(item, locale)}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.deepSection}>
        <h2 className={styles.sectionLabel}>{tc(t.improveLabel, locale)}</h2>
        <ul className={styles.bullets}>
          {deep.howToImprove.map((item, i) => (
            <li key={i} className={styles.body}>
              {tc(item, locale)}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.deepSection} data-testid="in-the-tour">
        <h2 className={styles.sectionLabel}>{tc(t.inTheTourLabel, locale)}</h2>
        {question && (
          <Card tone="outlineAlert" className={styles.tourCard}>
            <MetaLabel size="xs">{tc(t.inTheTourQuestionLabel, locale)}</MetaLabel>
            <p className={styles.tourQuestion}>{tc(question.question, locale)}</p>
            <ul className={styles.tourOptions}>
              {question.options.map((option, i) => (
                <li key={i} className={styles.tourOption}>
                  <span>{tc(option.label, locale)}</span>
                  <span className={styles.tourPoints}>
                    {tc(UI_STRINGS.breakdown.pointsTemplate, locale).replace("{n}", String(option.points))}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <p className={styles.body}>{tc(deep.inTheTour.body, locale)}</p>
      </section>

      <section className={styles.deepSection} data-testid="faq">
        <h2 className={styles.sectionLabel}>{tc(t.faqLabel, locale)}</h2>
        <div className={styles.faqList}>
          {deep.faq.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{tc(item.question, locale)}</h3>
              <p className={styles.body}>{tc(item.answer, locale)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
