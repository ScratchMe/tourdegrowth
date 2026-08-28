"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { PillarChip } from "@/components/result/PillarChip";
import { ScoreDisplay } from "@/components/result/ScoreDisplay";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { saveRefId } from "@/lib/quiz/storage";
import { SAMPLE_RESULT } from "@/lib/submissions/sample";
import styles from "./page.module.css";

// Landing page — DESIGN-BRIEF.md screen 01. Nav links ("Examples", "Roast
// mode") stay cut from the MVP per SPEC.md §12 — SPEC-ADDENDUM-01.md §1.3
// reintroduces just "How it works", now that there's a real page behind it.
export default function LandingPage() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const t = UI_STRINGS.landing;

  // SPEC.md §7: a visitor arriving via a shared result's `?ref=<id>` is
  // captured here (or on /quiz, whichever they land on first) and carried
  // through the whole questionnaire in localStorage — see quiz/storage.ts.
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) saveRefId(ref);
  }, [searchParams]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark />
          <nav className={styles.nav}>
            <Button href="/how-it-works" variant="quiet" className={styles.navLink}>
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

            <div className={styles.ctaRow}>
              <Button size="lg" href="/quiz">
                {tc(t.ctaPrimary, locale)}
              </Button>
              <Button size="lg" href="/r/sample" variant="secondary">
                {tc(t.ctaSecondary, locale)}
              </Button>
            </div>
          </div>

          <div className={styles.heroRight}>
            <Card elevation="raised" className={styles.previewCard}>
              <div className={styles.previewTopRow}>
                <MetaLabel size="xs">
                  {tc(UI_STRINGS.scoreCard.label, locale)} — {tc(UI_STRINGS.sample.caption, locale)}
                </MetaLabel>
                <MetaLabel size="xs">{tc(UI_STRINGS.sample.stageLabel, locale)}</MetaLabel>
              </div>

              <ScoreDisplay score={SAMPLE_RESULT.total} size="mobile" />

              <div className={styles.previewTags}>
                {SAMPLE_RESULT.pillars.map((p) => (
                  <PillarChip
                    key={p.pillar}
                    pillar={tc(UI_STRINGS.pillars[p.pillar], locale)}
                    score={p.score}
                    size="mobile"
                    weak={p.pillar === SAMPLE_RESULT.weakestPillar}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
