"use client";

import { useState } from "react";
import { Button } from "@/components/button/Button";
import { PillarTag } from "@/components/pillar-tag/PillarTag";
import { ScoreCard } from "@/components/score-card/ScoreCard";
import { StampedTag } from "@/components/stamped-tag/StampedTag";
import { VerdictCard } from "@/components/verdict-card/VerdictCard";
import { Wordmark } from "@/components/wordmark/Wordmark";
import { trackEvent } from "@/lib/analytics/goatcounter";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { clearStoredAnswers } from "@/lib/quiz/storage";
import type { Tone } from "@/lib/quiz/tone";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { rankPillarsAscending } from "@/lib/scoring/rank";
import type { Verdict } from "@/lib/submissions/types";
import styles from "./ResultView.module.css";

interface ResultViewProps {
  /** This result's own id — used to attribute whoever starts their own Tour from here (SPEC.md §7). Omitted for the fixed sample (no real submission to attribute to). */
  id?: string;
  total: number;
  pillars: { pillar: Pillar; score: number }[];
  weakestPillar: Pillar;
  verdicts: { neutral: Verdict; roast: Verdict };
  /** The tone selected during the quiz — which verdict shows first. */
  initialTone: Tone;
  /** SPEC.md §12: the fixed sample must be visibly marked so it's never mistaken for a real result. */
  isSample?: boolean;
}

/** Result page — DESIGN-BRIEF.md §02 (Straight up) / §04 (Roast). Same layout, same components; only the accent (and which verdict/CTAs show) changes with `tone`. */
export function ResultView({ id, total, pillars, weakestPillar, verdicts, initialTone, isSample = false }: ResultViewProps) {
  const { locale } = useLocale();
  const [tone, setTone] = useState<Tone>(initialTone);
  const [copied, setCopied] = useState(false);
  const roast = tone === "roast";
  const verdict = verdicts[tone];
  const t = UI_STRINGS.result;

  const ranked = rankPillarsAscending(pillars);
  const weakestName = ranked[0]?.pillar;
  const secondWeakestName = ranked[1]?.pillar;
  const strongestTwo = [...ranked].reverse().slice(0, 2); // strongest first
  const weakestTwo = ranked.slice(0, 2); // weakest first

  async function handleShare() {
    if (typeof window === "undefined") return;
    const shareData = { url: window.location.href, title: "Tour de Growth" };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackEvent("share", tone); // SPEC.md §8: one custom event per share
        return;
      }
    } catch {
      // user cancelled the native share sheet — fall through to clipboard as a backup, not an error
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackEvent("share", tone);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing more we can do without a real UI affordance here (step 8 revisits sharing)
    }
  }

  return (
    <>
      <header className={`${styles.header} ${roast ? styles.headerRoast : ""}`}>
        <div className={styles.headerInner}>
          <Wordmark />
          {roast ? (
            <span className={styles.roastBadge}>{tc(t.roastBadge, locale)}</span>
          ) : (
            <span className={styles.mono}>
              {tc(t.finishedLabel, locale)}
              <span className={styles.desktopOnly}>{tc(t.answeredSuffixTemplate, locale).replace("{n}", "15")}</span>
            </span>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {isSample && <p className={styles.sampleBadge}>{tc(t.sampleBadge, locale)}</p>}

        <div className={styles.layout}>
          <div className={styles.left}>
            <ScoreCard
              total={total}
              pillars={pillars}
              weakestPillar={weakestPillar}
              locale={locale}
              size="full"
              roast={roast}
              headline={verdict.headline}
              showTags={false}
            />

            <div className={styles.pillarGrid}>
              {PILLARS.map((pillar) => {
                const entry = pillars.find((p) => p.pillar === pillar);
                if (!entry) return null;
                const spanFull = pillar === "revenue" || (roast && pillar === weakestName);

                if (roast && pillar === weakestName) {
                  return (
                    <div key={pillar} className={spanFull ? styles.spanFull : ""}>
                      <StampedTag pillar={pillar} score={entry.score} locale={locale} />
                    </div>
                  );
                }

                const isWeak = pillar === weakestPillar || (roast && pillar === secondWeakestName);
                return (
                  <div key={pillar} className={spanFull ? styles.spanFull : ""}>
                    <PillarTag pillar={pillar} score={entry.score} locale={locale} weak={isWeak} showMax fullLabel stretch />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.right}>
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>{tc(roast ? t.strengthsTitleRoast : t.strengthsTitle, locale)}</h2>
              <div className={styles.cardGrid}>
                {(roast ? strongestTwo.slice(0, 1) : strongestTwo).map((p, i) => (
                  <VerdictCard
                    key={p.pillar}
                    pillar={p.pillar}
                    score={p.score}
                    sentence={verdict.strengths[i] ?? verdict.strengths[0]}
                    locale={locale}
                  />
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>{tc(t.weaknessesTitle, locale)}</h2>
              <div className={styles.cardGrid}>
                {weakestTwo.map((p, i) => (
                  <VerdictCard
                    key={p.pillar}
                    pillar={p.pillar}
                    score={p.score}
                    sentence={verdict.weaknesses[i] ?? verdict.weaknesses[0]}
                    locale={locale}
                    weak
                  />
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>{tc(t.recommendationTitle, locale)}</h2>
              <p className={styles.recommendation}>{verdict.recommendation}</p>
            </section>

            <div className={styles.ctaRow}>
              <Button onClick={handleShare}>
                {copied ? "✓" : tc(roast ? t.ctaShareRoast : t.ctaShare, locale)}
              </Button>
              {roast ? (
                <Button variant="secondary" onClick={() => setTone("neutral")}>
                  {tc(t.ctaSwitchToNeutral, locale)}
                </Button>
              ) : (
                <Button
                  href={id ? `/quiz?ref=${id}` : "/quiz"}
                  variant="secondary"
                  onClick={() => clearStoredAnswers()}
                >
                  {tc(t.ctaAgain, locale)}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
