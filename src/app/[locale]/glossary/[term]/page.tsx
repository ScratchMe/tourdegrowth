import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProseActions, ProseList, ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GLOSSARY, type GlossaryTermId } from "@/content/glossary";
import { QUESTIONS } from "@/content/copy-library";
import { GLOSSARY_DEEP, type DeepGlossaryContent } from "@/content/glossary-deep";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { breadcrumbSchema, definedTermSchema, JsonLd } from "@/lib/seo/jsonld";
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
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: tc(UI_STRINGS.glossaryPage.indexTitle, locale), path: "/glossary" },
          { name: tc(entry.term, locale), path: `/glossary/${term}` },
        ])}
      />
      <ProsePage
        locale={locale}
        path={`/glossary/${term}`}
        title={tc(entry.term, locale)}
        titleSize="term"
        kicker={
          <Link href={localePath(locale, "/glossary")} className={styles.backLink}>
            {tc(t.backToIndex, locale)}
          </Link>
        }
      >
        {/* The one raised card on the page: the definition is what the reader
            came for. The worked example below used to be raised too — two
            loud things on 48 pages (ds-critique M-1). */}
        <Card elevation="raised">
          <p className={styles.definition}>{tc(entry.definition, locale)}</p>
        </Card>

        <ProseSection heading={tc(t.inPracticeLabel, locale)} headingStyle="label">
          <ProseText>{tc(entry.extended, locale)}</ProseText>
        </ProseSection>

        {GLOSSARY_DEEP[term] && <DeepSections deep={GLOSSARY_DEEP[term]} locale={locale} />}

        {entry.related.length > 0 && (
          <ProseSection heading={tc(t.relatedLabel, locale)} headingStyle="label">
            <div className={styles.relatedList}>
              {entry.related.map((relatedId) => (
                <Link key={relatedId} href={localePath(locale, `/glossary/${relatedId}`)} className={styles.relatedLink}>
                  {tc(GLOSSARY[relatedId].term, locale)}
                </Link>
              ))}
            </div>
          </ProseSection>
        )}

        <ProseActions>
          <Button size="lg" href="/quiz" hard>
            {tc(UI_STRINGS.landing.ctaPrimary, locale)}
          </Button>
          <Button size="lg" variant="secondary" href={localePath(locale, "/how-it-works")}>
            {tc(UI_STRINGS.nav.howItWorks, locale)}
          </Button>
        </ProseActions>
      </ProsePage>
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
      <ProseSection heading={tc(t.formulaLabel, locale)} headingStyle="label">
        <p className={styles.formula}>{tc(deep.formula.expression, locale)}</p>
        <dl className={styles.formulaTerms}>
          {deep.formula.terms.map((term, i) => (
            <div key={i} className={styles.formulaTerm}>
              <dt className={styles.formulaSymbol}>{tc(term.symbol, locale)}</dt>
              <dd>
                <ProseText>{tc(term.meaning, locale)}</ProseText>
              </dd>
            </div>
          ))}
        </dl>
        {deep.formula.note && <ProseText>{tc(deep.formula.note, locale)}</ProseText>}
      </ProseSection>

      {/* ds-critique M-1/M-5: a worked example is quoted material, so it is
          recessed — sunken, no edge, no shadow. It was a second raised card. */}
      <ProseSection heading={tc(t.exampleLabel, locale)} headingStyle="label">
        <div className={styles.example}>
          <p className={styles.exampleTitle}>{tc(deep.example.title, locale)}</p>
          <ProseList ordered>
            {deep.example.steps.map((step, i) => (
              <li key={i}>{tc(step, locale)}</li>
            ))}
          </ProseList>
          <ProseText>
            <strong>{tc(deep.example.takeaway, locale)}</strong>
          </ProseText>
        </div>
      </ProseSection>

      <ProseSection heading={tc(t.benchmarkLabel, locale)} headingStyle="label">
        <ProseList>
          {deep.benchmark.map((item, i) => (
            <li key={i}>{tc(item, locale)}</li>
          ))}
        </ProseList>
      </ProseSection>

      <ProseSection heading={tc(t.improveLabel, locale)} headingStyle="label">
        <ProseList>
          {deep.howToImprove.map((item, i) => (
            <li key={i}>{tc(item, locale)}</li>
          ))}
        </ProseList>
      </ProseSection>

      <ProseSection heading={tc(t.inTheTourLabel, locale)} headingStyle="label" data-testid="in-the-tour">
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
        <ProseText>{tc(deep.inTheTour.body, locale)}</ProseText>
      </ProseSection>

      <ProseSection heading={tc(t.faqLabel, locale)} headingStyle="label" data-testid="faq">
        <div className={styles.faqList}>
          {deep.faq.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{tc(item.question, locale)}</h3>
              <ProseText>{tc(item.answer, locale)}</ProseText>
            </div>
          ))}
        </div>
      </ProseSection>
    </>
  );
}
