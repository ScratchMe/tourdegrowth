import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitcher } from "@/components/brand/LocaleSwitcher";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { PillarChip } from "@/components/result/PillarChip";
import { ScoreDisplay } from "@/components/result/ScoreDisplay";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { localePath } from "@/lib/i18n/routes";
import { LANDING_PULL } from "@/content/about";
import { LastResult } from "./LastResult";
import { RefCapture } from "./RefCapture";
import { JsonLd, webApplicationSchema } from "@/lib/seo/jsonld";
import { SAMPLE_RESULT } from "@/lib/submissions/sample";
import styles from "./page.module.css";

// Landing page — DESIGN-BRIEF.md screen 01. Nav links ("Examples", "Roast
// mode") stay cut from the MVP per SPEC.md §12 — SPEC-ADDENDUM-01.md §1.3
// reintroduces just "How it works", now that there's a real page behind it.
interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  return contentMetadata(
    resolved,
    "/",
    tc(UI_STRINGS.meta.landingTitle, resolved),
    tc(UI_STRINGS.landing.subtitle, resolved),
  );
}

/**
 * Landing page — DESIGN-BRIEF.md screen 01, now a Server Component
 * (REVIEW.md R-13). It was `"use client"` in its entirety only to capture
 * `?ref=`; that one effect now lives in its own island.
 */
export default async function LandingPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const t = UI_STRINGS.landing;

  return (
    <>
      {/* useSearchParams needs a Suspense boundary in a Server Component tree. */}
      <Suspense fallback={null}>
        <RefCapture />
      </Suspense>
      {/* SPEC-ADDENDUM-02.md §3.2 — built per language, with the author node; see lib/seo/jsonld.tsx (REVIEW-02.md R2-15). */}
      <JsonLd data={webApplicationSchema(locale)} />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <WordmarkLink locale={locale} />
          <nav className={styles.nav}>
            <LocaleSwitcher locale={locale} path="/" />
            <Button href={localePath(locale, "/glossary")} variant="quiet" className={styles.navLink}>
              {tc(UI_STRINGS.nav.glossary, locale)}
            </Button>
            <Button href={localePath(locale, "/how-it-works")} variant="quiet" className={styles.navLink}>
              {tc(UI_STRINGS.nav.howItWorks, locale)}
            </Button>
            <Button href="/quiz" size="md" compact className={styles.headerCta}>
              {tc(t.ctaPrimary, locale)}
            </Button>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.bibTag}>{tc(t.bibTag, locale)}</span>

            <h1 className={styles.h1}>
              {tc(t.h1Line1, locale)}
              <br />
              {tc(t.h1Line2, locale)}
              <span className={styles.h1Accent}>{tc(t.h1Accent, locale)}</span>
            </h1>

            <p className={styles.subtitle}>{tc(t.subtitle, locale)}</p>

            {/* REVIEW-03.md B1 — the H1 poses the problem, this says what you
                leave with. Kept as its own line rather than folded into the
                subtitle: the subtitle describes the framework, this is the
                promise, and they are two different jobs. */}
            <p className={styles.promise} data-testid="landing-promise">
              {tc(t.promise, locale)}
            </p>

            <div className={styles.ctaRow}>
              <Button size="lg" href="/quiz" data-testid="hero-cta">
                {tc(t.ctaPrimary, locale)}
              </Button>
              <Button size="lg" href="/r/sample" variant="secondary">
                {tc(t.ctaSecondary, locale)}
              </Button>
            </div>

            {/* Renders nothing unless this device already took a Tour. */}
            <LastResult
              withScore={tc(UI_STRINGS.lastResult.withScore, locale)}
              withoutScore={tc(UI_STRINGS.lastResult.withoutScore, locale)}
              progression={{
                up: tc(UI_STRINGS.progression.landingUp, locale),
                down: tc(UI_STRINGS.progression.landingDown, locale),
                flat: tc(UI_STRINGS.progression.landingFlat, locale),
              }}
            />
          </div>

          <div className={styles.heroRight}>
            <Card elevation="raised" className={styles.previewCard} data-testid="preview-card">
              <div className={styles.previewTopRow}>
                <MetaLabel size="xs">
                  {tc(UI_STRINGS.scoreCard.label, locale)} — {tc(UI_STRINGS.sample.caption, locale)}
                </MetaLabel>
                <MetaLabel size="xs">{tc(UI_STRINGS.sample.stageLabel, locale)}</MetaLabel>
              </div>

              <ScoreDisplay score={SAMPLE_RESULT.total} size="mobile" />

              <div className={styles.previewTags}>
                {/* REVIEW-02.md R2-13: each chip is a link to its pillar's glossary
                    page — the landing is the strongest page on the site and
                    passed nothing to any term page. */}
                {SAMPLE_RESULT.pillars.map((p) => (
                  <Link
                    key={p.pillar}
                    href={localePath(locale, `/glossary/${p.pillar}`)}
                    className={styles.previewChipLink}
                    aria-label={tc(UI_STRINGS.pillars[p.pillar], locale)}
                  >
                    <PillarChip
                      pillar={tc(UI_STRINGS.pillars[p.pillar], locale)}
                      score={p.score}
                      size="mobile"
                      weak={p.pillar === SAMPLE_RESULT.weakestPillar}
                    />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* REVIEW-03.md B3 — below the fold on purpose: a visitor who is going
            to start the Tour has already left above. This is for the one who
            scrolled, and it is the only place on the landing that says a
            person is behind the tool. */}
        <aside className={styles.founder} data-testid="landing-founder">
          <blockquote className={styles.founderQuote}>
            {tc(LANDING_PULL.quote, locale)}
          </blockquote>
          <p className={styles.founderMeta}>
            {tc(LANDING_PULL.attribution, locale)} —{" "}
            <Link href={localePath(locale, "/about")} className={styles.founderLink}>
              {tc(LANDING_PULL.cta, locale)}
            </Link>
          </p>
        </aside>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
