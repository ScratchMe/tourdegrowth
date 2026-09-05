"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ModeTag } from "@/components/brand/ModeTag";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { GlossaryTerm } from "@/components/glossary/GlossaryTerm";
import { Disclaimer } from "@/components/result/Disclaimer";
import { InsightCard } from "@/components/result/InsightCard";
import { PillarChip } from "@/components/result/PillarChip";
import { PriorityMove } from "@/components/result/PriorityMove";
import { ScoreDisplay } from "@/components/result/ScoreDisplay";
import { StampedPillar } from "@/components/result/StampedPillar";
import { ANTOINE_LINKS, DEEP_DIVE_CREDIT, QUICK_CREDIT } from "@/content/antoine-credit";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { PROFILE_CLICK_DETAILS, trackEvent } from "@/lib/analytics/goatcounter";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";
import { clearStoredAnswers, isOwnResult } from "@/lib/quiz/storage";
import type { Tone } from "@/lib/quiz/tone";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { rankPillarsAscending } from "@/lib/scoring/rank";
import type { QuickVerdict } from "@/lib/scoring/verdict";
import type { DeepDiveView } from "@/lib/submissions/types";
import styles from "./ResultView.module.css";

// Named for readability at the trackEvent() call sites below — the array
// itself (and the order) is shared with lib/analytics/goatcounter-api.ts's
// server-side funnel fetch, so the two can never drift apart.
const [FOOTER_CV_DETAIL, CARD_CV_DETAIL, CARD_LINKEDIN_DETAIL] = PROFILE_CLICK_DETAILS;

interface ResultViewProps {
  /** This result's own id — used to attribute whoever starts their own Tour from here (SPEC.md §7), and to link to the Deep dive flow. Omitted for the fixed sample (no real submission to attribute to, and no Deep dive on a sample — SPEC.md §12: "jamais recalculé"). */
  id?: string;
  total: number;
  pillars: { pillar: Pillar; score: number }[];
  weakestPillar: Pillar;
  verdicts: { neutral: QuickVerdict; roast: QuickVerdict };
  /** The tone selected during the quiz — which verdict shows first. */
  initialTone: Tone;
  /** SPEC.md §12: the fixed sample must be visibly marked so it's never mistaken for a real result. */
  isSample?: boolean;
  /** Deep dive enrichment (SPEC-ADDENDUM-01.md §2) — null on a plain Quick result. Display-safe subset only: the free-text context and the 10 context answers never leave the server (REVIEW.md R-02). */
  deepDive?: DeepDiveView | null;
}

/**
 * Result page — DESIGN-BRIEF.md §02 (Straight up) / §04 (Roast), enriched by
 * SPEC-ADDENDUM-01.md §2 once a Deep dive is completed. Same layout, same
 * components; only the accent (and which verdict/CTAs show) changes with
 * `tone`, and the per-pillar sentences swap from the static copy library to
 * Gemini's Deep dive recommendations once `deepDive` is present — the score
 * itself never changes either way.
 */
export function ResultView({
  id,
  total,
  pillars,
  weakestPillar,
  verdicts,
  initialTone,
  isSample = false,
  deepDive = null,
}: ResultViewProps) {
  const { locale } = useLocale();
  const [tone, setTone] = useState<Tone>(initialTone);
  const [copied, setCopied] = useState(false);
  const [openGlossaryId, setOpenGlossaryId] = useState<string | null>(null);
  // REVIEW.md R-01. Read from localStorage AFTER mount, never in the initial
  // state: the server can't know who is looking, so rendering this on the
  // server would guarantee a hydration mismatch (CLAUDE.md, step 4's
  // lesson). Starting at `false` also means the safe state — no Deep dive
  // offer — is what a visitor briefly sees, not the other way round.
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) setIsOwner(isOwnResult(id));
  }, [id]);
  const roast = tone === "roast";
  const verdict = verdicts[tone];
  const deepVerdict = deepDive ? deepDive.verdicts[tone] : null;
  const t = UI_STRINGS.result;
  const dd = UI_STRINGS.deepDive;

  const ranked = rankPillarsAscending(pillars);
  const weakestName = ranked[0]?.pillar;
  const secondWeakestName = ranked[1]?.pillar;
  const strongestTwo = [...ranked].reverse().slice(0, 2); // strongest first
  const weakestTwo = ranked.slice(0, 2); // weakest first

  /** The Deep dive's longer, specific recommendation once it exists; otherwise the static copy-library sentence — same pillar, same slot, richer text (SPEC-ADDENDUM-01.md §2.5). */
  function sentenceFor(pillar: Pillar): string {
    return deepVerdict ? deepVerdict.pillarRecommendations[pillar] : verdict.pillarSentences[pillar];
  }

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

  const disclaimerShort = tc(HOW_IT_WORKS.limitationNotice.short, locale);
  const disclaimerLinkText = "How it works"; // the exact trailing phrase both locales' short notice ends with — see content/how-it-works.ts
  const disclaimerSplit = disclaimerShort.split(disclaimerLinkText);

  return (
    <>
      <header className={`${styles.header} ${roast ? styles.headerRoast : ""}`}>
        <div className={styles.headerInner}>
          <WordmarkLink />
          <div className={styles.headerRight}>
            {deepDive && <ModeTag mode="deep">{tc(dd.badge, locale)}</ModeTag>}
            {roast ? (
              <span className={styles.roastBadge}>{tc(t.roastBadge, locale)}</span>
            ) : (
              <MetaLabel size="sm">
                {tc(t.finishedLabel, locale)}
                <span className={styles.desktopOnly}>{tc(t.answeredSuffixTemplate, locale).replace("{n}", "15")}</span>
              </MetaLabel>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {isSample && (
          <MetaLabel size="xs" wide tone="alert" className={styles.sampleBadge}>
            {tc(t.sampleBadge, locale)}
          </MetaLabel>
        )}

        <div className={styles.layout}>
          <div className={styles.left}>
            <Card elevation="raised" className={roast ? styles.scoreCardRoast : undefined}>
              <ScoreDisplay
                score={total}
                label={tc(UI_STRINGS.scoreCard.label, locale)}
                verdict={verdict.headline}
              />
              {/* SPEC-ADDENDUM-02.md §2.1: sober "built by" credit, in the
                  score card's own footer — stays visible on Deep dive
                  results too (§2.3), additive to the §2.2 card below, not
                  replaced by it. */}
              <p className={styles.builtByCredit}>
                {tc(QUICK_CREDIT.prefix, locale)}
                <a
                  href={ANTOINE_LINKS.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("profile_click", FOOTER_CV_DETAIL)}
                >
                  {QUICK_CREDIT.name}
                </a>
                {tc(QUICK_CREDIT.suffix, locale)}
              </p>
            </Card>

            <div className={styles.pillarGrid}>
              {PILLARS.map((pillar) => {
                const entry = pillars.find((p) => p.pillar === pillar);
                if (!entry) return null;
                const spanFull = pillar === "revenue" || (roast && pillar === weakestName);
                const label = tc(UI_STRINGS.pillars[pillar], locale);

                if (roast && pillar === weakestName) {
                  return (
                    <div key={pillar} className={spanFull ? styles.spanFull : ""}>
                      <StampedPillar pillar={label} score={entry.score} suffix={tc(t.stampedSuffix, locale)} />
                    </div>
                  );
                }

                const isWeak = pillar === weakestPillar || (roast && pillar === secondWeakestName);
                return (
                  <div key={pillar} className={spanFull ? styles.spanFull : ""}>
                    <PillarChip pillar={label} score={entry.score} weak={isWeak} stretch>
                      <GlossaryTerm
                        id={pillar}
                        locale={locale}
                        openId={openGlossaryId}
                        onOpenChange={setOpenGlossaryId}
                        tone={isWeak ? "alert" : "muted"}
                        closeLabel={tc(UI_STRINGS.glossary.closeLabel, locale)}
                        labelTemplate={tc(UI_STRINGS.glossary.definitionLabelTemplate, locale)}
                      />
                    </PillarChip>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.right}>
            <section className={styles.section}>
              <MetaLabel wide>{tc(roast ? t.strengthsTitleRoast : t.strengthsTitle, locale)}</MetaLabel>
              <div className={styles.cardGrid}>
                {(roast ? strongestTwo.slice(0, 1) : strongestTwo).map((p) => (
                  <InsightCard key={p.pillar} pillar={tc(UI_STRINGS.pillars[p.pillar], locale)} score={p.score} kind="strength">
                    {sentenceFor(p.pillar)}
                  </InsightCard>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <MetaLabel wide>{tc(t.weaknessesTitle, locale)}</MetaLabel>
              <div className={styles.cardGrid}>
                {weakestTwo.map((p) => (
                  <InsightCard key={p.pillar} pillar={tc(UI_STRINGS.pillars[p.pillar], locale)} score={p.score} kind="weakness">
                    {sentenceFor(p.pillar)}
                  </InsightCard>
                ))}
              </div>
            </section>

            {deepVerdict ? (
              <>
                <PriorityMove label={tc(dd.priorityMoveLabel, locale)}>{deepVerdict.priorityAction}</PriorityMove>
                {/* SPEC-ADDENDUM-02.md §2.2: the assertive placement — real
                    engagement (25 answers, maybe free text) earns a real
                    card, not just the §2.1 footer line. No hard shadow, so
                    it doesn't compete with Priority move just above it. */}
                <Card tone="paper" elevation="flat" className={styles.antoineCard}>
                  <MetaLabel wide>{tc(DEEP_DIVE_CREDIT.eyebrow, locale)}</MetaLabel>
                  <p className={styles.antoineBio}>
                    {tc(DEEP_DIVE_CREDIT.bio, locale)}
                    <a
                      href={ANTOINE_LINKS.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("profile_click", CARD_CV_DETAIL)}
                    >
                      {tc(DEEP_DIVE_CREDIT.cvLinkText, locale)}
                    </a>
                    {" · "}
                    <a
                      href={ANTOINE_LINKS.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("profile_click", CARD_LINKEDIN_DETAIL)}
                    >
                      {tc(DEEP_DIVE_CREDIT.linkedinLinkText, locale)}
                    </a>
                  </p>
                </Card>
              </>
            ) : !isSample && id && isOwner ? (
              // Locked preview of the SAME card, same slot: completing the
              // Deep dive doesn't add a new element to the layout, it fills
              // this exact one in — the emptiness is the incentive, per
              // Antoine's steer (2026-08-28).
              //
              // Owner only (REVIEW.md R-01): every recipient of a shared link
              // used to see this button, and clicking it filled the SHARER's
              // result with the clicker's own context — irreversibly. A
              // visitor now simply doesn't get the offer; the CTA row below
              // is what invites them to run their own Tour.
              <PriorityMove label={tc(dd.priorityMoveLockedLabel, locale)}>
                <p className={styles.lockedText}>{tc(dd.teaserText, locale)}</p>
                <Button variant="secondary" href={`/deep-dive/${id}`} className={styles.lockedCta}>
                  {tc(dd.teaserCta, locale)}
                </Button>
              </PriorityMove>
            ) : null}

            <div className={styles.ctaRow}>
              <Button onClick={handleShare}>{copied ? "✓" : tc(roast ? t.ctaShareRoast : t.ctaShare, locale)}</Button>
              {roast ? (
                <Button variant="secondary" onClick={() => setTone("neutral")}>
                  {tc(t.ctaSwitchToNeutral, locale)}
                </Button>
              ) : (
                <Button href={id ? `/quiz?ref=${id}` : "/quiz"} variant="secondary" onClick={() => clearStoredAnswers()}>
                  {tc(t.ctaAgain, locale)}
                </Button>
              )}
            </div>

            <Disclaimer align="left" className={styles.disclaimer}>
              {disclaimerSplit[0]}
              <Link href="/how-it-works">{disclaimerLinkText}</Link>
              {disclaimerSplit[1]}
            </Disclaimer>
          </div>
        </div>
      </main>
    </>
  );
}
