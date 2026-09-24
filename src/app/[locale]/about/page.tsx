import type { Metadata } from "next";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProseActions, ProseList, ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { TrackedLink } from "@/components/brand/TrackedLink";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { ABOUT, REPO_URL } from "@/content/about";
import { ANTOINE_LINKS } from "@/content/antoine-credit";
import { QUESTIONS } from "@/content/copy-library";
import { PROFILE_CLICK_DETAILS } from "@/lib/analytics/goatcounter";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { aboutPageSchema, breadcrumbSchema, JsonLd } from "@/lib/seo/jsonld";
import { PILLARS } from "@/lib/scoring/pillars";
import own from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Named for readability; the array itself is shared with the GoatCounter
// funnel fetch so the two lists can't drift (lib/analytics/goatcounter.ts).
const [, , , , ABOUT_CV_DETAIL, ABOUT_LINKEDIN_DETAIL] = PROFILE_CLICK_DETAILS;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(resolved, "/about", tc(ABOUT.title, resolved), tc(ABOUT.metaDescription, resolved));
}

/**
 * `/about` — REVIEW-02.md R2-04. Until this page, nothing on the 36
 * indexable pages said who built the tool or why, the scoring rule was
 * explained in full only to a result's owner (R-12), and there was no page
 * a search engine could attach a Person entity to. Server Component, in the
 * same `ProsePage` frame as `/how-it-works`: the two are one family of prose
 * pages. The fifteen questions are rendered from the
 * copy library — no second copy of them to drift.
 */
export default async function AboutPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;

  return (
    <>
      <JsonLd data={aboutPageSchema(locale)} />
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(ABOUT.title, locale), path: "/about" }])} />
      <ProsePage locale={locale} path="/about" title={tc(ABOUT.title, locale)} lead={tc(ABOUT.intro, locale)}>
        <ProseSection heading={tc(ABOUT.questionsSection.title, locale)}>
          <ProseText>{tc(ABOUT.questionsSection.body, locale)}</ProseText>
          <div className={own.questionGroups}>
            {PILLARS.map((pillar) => (
              <Card key={pillar} elevation="flat" tone="paper" className={own.questionGroup}>
                <MetaLabel size="xs">{tc(UI_STRINGS.pillars[pillar], locale)}</MetaLabel>
                <ol className={own.questionList}>
                  {QUESTIONS.filter((q) => q.pillar === pillar).map((q) => (
                    <li key={q.id}>{tc(q.question, locale)}</li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </ProseSection>

        <ProseSection heading={tc(ABOUT.scoringSection.title, locale)}>
          <ProseList ordered>
            {ABOUT.scoringSection.rules.map((rule, i) => (
              <li key={i}>{tc(rule, locale)}</li>
            ))}
          </ProseList>
          <Card elevation="raised" className={own.example}>
            <MetaLabel size="xs">{tc(ABOUT.scoringSection.exampleLabel, locale)}</MetaLabel>
            <p className={own.exampleText}>{tc(ABOUT.scoringSection.example, locale)}</p>
          </Card>
        </ProseSection>

        <ProseSection heading={tc(ABOUT.aiSection.title, locale)}>
          <ProseText>{tc(ABOUT.aiSection.body, locale)}</ProseText>
        </ProseSection>

        <ProseSection heading={tc(ABOUT.openSection.title, locale)}>
          <ProseText>
            {tc(ABOUT.openSection.body, locale)}{" "}
            <a href={REPO_URL} target="_blank" rel="noopener" className={own.link}>
              {tc(ABOUT.openSection.repoLinkText, locale)}
            </a>
          </ProseText>
        </ProseSection>

        <ProseSection heading={tc(ABOUT.contactSection.title, locale)}>
          <ProseText>
            {tc(ABOUT.contactSection.body, locale)}
            <TrackedLink
              href={ANTOINE_LINKS.linkedin}
              target="_blank"
              rel="noopener"
              className={own.link}
              event="profile_click"
              detail={ABOUT_LINKEDIN_DETAIL}
            >
              {tc(ABOUT.contactSection.linkedinLinkText, locale)}
            </TrackedLink>
            {tc(ABOUT.contactSection.between, locale)}
            <TrackedLink
              href={ANTOINE_LINKS.cv}
              target="_blank"
              rel="noopener"
              className={own.link}
              event="profile_click"
              detail={ABOUT_CV_DETAIL}
            >
              {tc(ABOUT.contactSection.cvLinkText, locale)}
            </TrackedLink>
            {tc(ABOUT.contactSection.after, locale)}
          </ProseText>
        </ProseSection>

        <ProseActions>
          <Button size="lg" href="/quiz" hard>
            {tc(ABOUT.cta, locale)}
          </Button>
        </ProseActions>
      </ProsePage>
    </>
  );
}
