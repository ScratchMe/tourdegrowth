import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { QUESTIONS } from "@/content/copy-library";
import { COMPARISON_ORDER, COMPARISON_TITLES } from "@/content/comparison-index";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
import { contentMetadata } from "@/lib/i18n/meta";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  // Title/description in the page's own language, hreflang set (REVIEW.md
  // R-13), Open Graph text. The description is its own field since the SEO
  // audit v1 (§1.2): the intro, reused until then, ran past 160 characters.
  return contentMetadata(
    resolved,
    "/how-it-works",
    tc(UI_STRINGS.meta.howItWorksTitle, resolved),
    tc(HOW_IT_WORKS.metaDescription, resolved),
    { ownShareImage: true },
  );
}

/**
 * "How it works" — SPEC-ADDENDUM-01.md §1.3. Server Component: nothing here
 * is interactive (no glossary popovers on this page — its whole point is to
 * spell things out in full prose instead), so it resolves locale the same
 * way not-found.tsx and the sample result page do, no client JS needed.
 */
export default async function HowItWorksPage({ params }: PageProps) {
  // The URL is the language here — no cookie or header involved.
  const locale = (await params).locale as Locale;

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(HOW_IT_WORKS.title, locale), path: "/how-it-works" }])} />
      <ContentHeader locale={locale} path="/how-it-works" />

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{tc(HOW_IT_WORKS.title, locale)}</h1>
          <p className={styles.subtitle}>{tc(HOW_IT_WORKS.intro, locale)}</p>
        </div>

        <div className={styles.pillarStack}>
          {HOW_IT_WORKS.pillars.map((block, index) => {
            const example = QUESTIONS.find((q) => q.id === block.exampleQuestionId);
            return (
              <Card key={block.pillar} elevation="raised" className={styles.pillarCard}>
                {/* REVIEW-02.md R2-17: this used to repeat the pillar name the
                    <h2> below already carries ("ACQUISITION / Acquisition").
                    The stage number is the one thing the heading doesn't say. */}
                <MetaLabel size="xs">
                  {tc(UI_STRINGS.howItWorksPage.stageEyebrowTemplate, locale).replace("{n}", String(index + 1))}
                </MetaLabel>
                {/* REVIEW-02.md R2-13: the pillar ids ARE the glossary term ids, and this
                    page explained all five without linking a single term page. */}
                <h2 className={styles.pillarName}>
                  <Link href={localePath(locale, `/glossary/${block.pillar}`)} className={styles.pillarLink}>
                    {tc(UI_STRINGS.pillars[block.pillar], locale)}
                  </Link>
                </h2>
                <p className={styles.pillarExplanation}>{tc(block.explanation, locale)}</p>
                {example && (
                  <div className={styles.exampleBox}>
                    <MetaLabel size="xs" className={styles.exampleLabel}>
                      {tc(UI_STRINGS.howItWorksPage.exampleQuestionLabel, locale)}
                    </MetaLabel>
                    <p className={styles.exampleQuestion}>{tc(example.question, locale)}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(HOW_IT_WORKS.scoringSection.title, locale)}</h2>
          <p className={styles.sectionBody}>{tc(HOW_IT_WORKS.scoringSection.body, locale)}</p>
        </section>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(HOW_IT_WORKS.tonesSection.title, locale)}</h2>
          <div className={styles.toneGrid}>
            <div className={styles.toneBlock}>
              <h3 className={styles.toneTitle}>{tc(HOW_IT_WORKS.tonesSection.straightUp.label, locale)}</h3>
              <p className={styles.toneBody}>{tc(HOW_IT_WORKS.tonesSection.straightUp.body, locale)}</p>
            </div>
            <div className={styles.toneBlock}>
              <h3 className={styles.toneTitle}>{tc(HOW_IT_WORKS.tonesSection.roast.label, locale)} 🔥</h3>
              <p className={styles.toneBody}>{tc(HOW_IT_WORKS.tonesSection.roast.body, locale)}</p>
            </div>
          </div>
        </section>

        {/* GROWTH-PLAN.md 2.4 : chaque nouvelle page reçoit un lien depuis au
            moins deux pages existantes. Cette page explique le cadre ; les
            deux autres donnent la liste et la méthode. */}
        <section className={styles.proseSection}>
          <p className={styles.sectionBody}>
            {tc(UI_STRINGS.openDoor.checklistLead, locale)}{" "}
            <Link href={localePath(locale, "/growth-audit-checklist")} data-testid="checklist-link">
              {tc(UI_STRINGS.openDoor.checklistLink, locale)}
            </Link>
          </p>
          <p className={styles.sectionBody}>
            {tc(UI_STRINGS.openDoor.diagnosticLead, locale)}{" "}
            <Link href={localePath(locale, "/startup-growth-diagnostic")} data-testid="diagnostic-link">
              {tc(UI_STRINGS.openDoor.diagnosticLink, locale)}
            </Link>
          </p>
        </section>

        {/* GROWTH-PLAN.md 2.3 : le cluster « frameworks comparés » est lié
            depuis ici parce que c'est LA page qui explique AARRR — quatre
            liens y sont du sujet, pas du remplissage. Le pied de page, lui,
            porte déjà six liens : un septième n'en mettrait plus aucun en
            avant. Les quatre pages se lient aussi entre elles, donc le
            cluster se parcourt depuis n'importe laquelle de ses entrées. */}
        <section className={styles.proseSection} data-testid="framework-comparisons">
          <p className={styles.sectionBody}>{tc(UI_STRINGS.comparisonPage.fromHowItWorks, locale)}</p>
          <div className={styles.comparisonLinks}>
            {COMPARISON_ORDER.map((slug) => (
              <Link key={slug} href={localePath(locale, `/${slug}`)} className={styles.comparisonLink}>
                {tc(COMPARISON_TITLES[slug], locale)}
              </Link>
            ))}
          </div>
        </section>

        <Card tone="paper" className={styles.limitationCard}>
          <p className={styles.limitationText}>{tc(HOW_IT_WORKS.limitationNotice.long, locale)}</p>
        </Card>

        <div className={styles.ctaWrap}>
          <Button size="lg" href="/quiz" hard>
            {tc(HOW_IT_WORKS.cta, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
