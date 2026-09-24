import type { Metadata } from "next";
import Link from "next/link";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProseActions, ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
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
      <ProsePage
        locale={locale}
        path="/how-it-works"
        title={tc(HOW_IT_WORKS.title, locale)}
        lead={tc(HOW_IT_WORKS.intro, locale)}
      >
        {/* ds-critique M-1: these were five raised cards — "one loud thing per
            screen" broken five times, on the page that explains the system.
            They are five steps of one sequence, so they read as one: a dashed
            route rule between them and no shadow at all. */}
        <div className={styles.pillarStack}>
          {HOW_IT_WORKS.pillars.map((block, index) => {
            const example = QUESTIONS.find((q) => q.id === block.exampleQuestionId);
            return (
              <div key={block.pillar} className={styles.pillarStep}>
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
                <ProseText>{tc(block.explanation, locale)}</ProseText>
                {example && (
                  <div className={styles.exampleBox}>
                    <MetaLabel size="xs">{tc(UI_STRINGS.howItWorksPage.exampleQuestionLabel, locale)}</MetaLabel>
                    <p className={styles.exampleQuestion}>{tc(example.question, locale)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ProseSection heading={tc(HOW_IT_WORKS.scoringSection.title, locale)}>
          <ProseText>{tc(HOW_IT_WORKS.scoringSection.body, locale)}</ProseText>
        </ProseSection>

        <ProseSection heading={tc(HOW_IT_WORKS.tonesSection.title, locale)}>
          {/* ds-critique M-5: sunken + a solid ink edge + radius 8 is exactly an
              AnswerOption at rest, so these two read as buttons to press. They
              describe the tones; they are not the control that picks one. */}
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
        </ProseSection>

        {/* GROWTH-PLAN.md 2.4 : chaque nouvelle page reçoit un lien depuis au
            moins deux pages existantes. Cette page explique le cadre ; les
            deux autres donnent la liste et la méthode. */}
        <ProseSection>
          <ProseText>
            {tc(UI_STRINGS.openDoor.checklistLead, locale)}{" "}
            <Link href={localePath(locale, "/growth-audit-checklist")} data-testid="checklist-link">
              {tc(UI_STRINGS.openDoor.checklistLink, locale)}
            </Link>
          </ProseText>
          <ProseText>
            {tc(UI_STRINGS.openDoor.diagnosticLead, locale)}{" "}
            <Link href={localePath(locale, "/startup-growth-diagnostic")} data-testid="diagnostic-link">
              {tc(UI_STRINGS.openDoor.diagnosticLink, locale)}
            </Link>
          </ProseText>
        </ProseSection>

        {/* GROWTH-PLAN.md 2.3 : le cluster « frameworks comparés » est lié
            depuis ici parce que c'est LA page qui explique AARRR — quatre
            liens y sont du sujet, pas du remplissage. Le pied de page, lui,
            porte déjà six liens : un septième n'en mettrait plus aucun en
            avant. Les quatre pages se lient aussi entre elles, donc le
            cluster se parcourt depuis n'importe laquelle de ses entrées. */}
        <ProseSection data-testid="framework-comparisons">
          <ProseText>{tc(UI_STRINGS.comparisonPage.fromHowItWorks, locale)}</ProseText>
          <div className={styles.comparisonLinks}>
            {COMPARISON_ORDER.map((slug) => (
              <Link key={slug} href={localePath(locale, `/${slug}`)} className={styles.comparisonLink}>
                {tc(COMPARISON_TITLES[slug], locale)}
              </Link>
            ))}
          </div>
        </ProseSection>

        {/* The one thing to know before taking the score seriously — a caveat,
            not a diagnosis, so ink and dashed rather than red (ds-critique M-2). */}
        <Callout tone="caveat">
          <p>{tc(HOW_IT_WORKS.limitationNotice.long, locale)}</p>
        </Callout>

        <ProseActions>
          <Button size="lg" href="/quiz" hard>
            {tc(HOW_IT_WORKS.cta, locale)}
          </Button>
        </ProseActions>
      </ProsePage>
    </>
  );
}
