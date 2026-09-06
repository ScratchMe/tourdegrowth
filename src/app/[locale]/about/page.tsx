import type { Metadata } from "next";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
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
import { aboutPageSchema, breadcrumbSchema, CRUMBS, JsonLd } from "@/lib/seo/jsonld";
import { PILLARS } from "@/lib/scoring/pillars";
import styles from "../how-it-works/page.module.css";
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
 * a search engine could attach a Person entity to. Server Component, same
 * shell as `/how-it-works`, whose stylesheet it deliberately shares: the two
 * are one family of prose pages. The fifteen questions are rendered from the
 * copy library — no second copy of them to drift.
 */
export default async function AboutPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;

  return (
    <>
      <JsonLd data={aboutPageSchema(locale)} />
      <JsonLd data={breadcrumbSchema(locale, [CRUMBS.about(locale)])} />
      <ContentHeader locale={locale} path="/about" />

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>{tc(ABOUT.title, locale)}</h1>
          <p className={styles.subtitle}>{tc(ABOUT.intro, locale)}</p>
        </div>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(ABOUT.questionsSection.title, locale)}</h2>
          <p className={styles.sectionBody}>{tc(ABOUT.questionsSection.body, locale)}</p>
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
        </section>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(ABOUT.scoringSection.title, locale)}</h2>
          <ol className={own.rules}>
            {ABOUT.scoringSection.rules.map((rule, i) => (
              <li key={i} className={styles.sectionBody}>
                {tc(rule, locale)}
              </li>
            ))}
          </ol>
          <Card elevation="raised" className={own.example}>
            <MetaLabel size="xs">{tc(ABOUT.scoringSection.exampleLabel, locale)}</MetaLabel>
            <p className={own.exampleText}>{tc(ABOUT.scoringSection.example, locale)}</p>
          </Card>
        </section>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(ABOUT.aiSection.title, locale)}</h2>
          <p className={styles.sectionBody}>{tc(ABOUT.aiSection.body, locale)}</p>
        </section>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(ABOUT.openSection.title, locale)}</h2>
          <p className={styles.sectionBody}>
            {tc(ABOUT.openSection.body, locale)}{" "}
            <a href={REPO_URL} target="_blank" rel="noopener" className={own.link}>
              {tc(ABOUT.openSection.repoLinkText, locale)}
            </a>
          </p>
        </section>

        <section className={styles.proseSection}>
          <h2 className={styles.sectionTitle}>{tc(ABOUT.contactSection.title, locale)}</h2>
          <p className={styles.sectionBody}>
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
          </p>
        </section>

        <div className={styles.ctaWrap}>
          <Button size="lg" href="/quiz">
            {tc(ABOUT.cta, locale)}
          </Button>
        </div>
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}
