"use client";

import { Button } from "@/components/button/Button";
import { ScoreCard } from "@/components/score-card/ScoreCard";
import { Wordmark } from "@/components/wordmark/Wordmark";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { SAMPLE_RESULT } from "@/lib/scoring/sample-result";
import styles from "./page.module.css";

// Landing page — DESIGN-BRIEF.md screen 01. Nav links ("How it works",
// "Examples", "Roast mode") are cut from the MVP per SPEC.md §12 — the
// header keeps just the wordmark and a compact CTA.
//
// "Start your Tour" and "See a sample result" point at /quiz and /r/sample,
// which don't exist yet (steps 4 and 10 of the build plan) — clicking them
// hits Next.js's default 404 for now, that's expected at this stage.
export default function LandingPage() {
  const { locale } = useLocale();
  const t = UI_STRINGS.landing;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
          <Button href="/quiz" size="compact" className={styles.headerCta}>
            {tc(t.ctaPrimary, locale)}
          </Button>
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

            <div className={styles.ctaRow}>
              <Button href="/quiz">{tc(t.ctaPrimary, locale)}</Button>
              <Button href="/r/sample" variant="secondary">
                {tc(t.ctaSecondary, locale)}
              </Button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <ScoreCard
              total={SAMPLE_RESULT.total}
              pillars={SAMPLE_RESULT.pillars}
              weakestPillar={SAMPLE_RESULT.weakestPillar}
              locale={locale}
              caption={tc(UI_STRINGS.sample.caption, locale)}
              stageLabel={tc(UI_STRINGS.sample.stageLabel, locale)}
              size="preview"
            />
          </div>
        </div>
      </main>
    </>
  );
}
