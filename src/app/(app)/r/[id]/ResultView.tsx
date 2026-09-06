"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { LocaleSwitcher } from "@/components/brand/LocaleSwitcher";
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
import { localePath } from "@/lib/i18n/routes";
import { clearStoredAnswers, findStoredResult } from "@/lib/quiz/storage";
import type { Tone } from "@/lib/quiz/tone";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { rankPillarsAscending } from "@/lib/scoring/rank";
import type { QuickVerdict } from "@/lib/scoring/verdict";
import type { Answers } from "@/lib/scoring/score";
import type { DeepDiveView } from "@/lib/submissions/types";
import { ScoreBreakdown, type BreakdownData } from "./ScoreBreakdown";
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
  /** Questions and per-pillar raw points behind the score (REVIEW.md R-12) — public content; the owner's answers come from their own device, never from here. */
  breakdown?: BreakdownData | null;
  /** Average score across every Tour taken (REVIEW.md R-20), or null when there aren't enough yet — and never on the fixed sample, whose numbers aren't real. */
  benchmark?: number | null;
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
  breakdown = null,
  benchmark = null,
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
  /** The owner's own answers, read from this device — see ScoreBreakdown (REVIEW.md R-12). */
  const [ownAnswers, setOwnAnswers] = useState<Answers | null>(null);

  useEffect(() => {
    if (!id) return;
    const stored = findStoredResult(id);
    // Deliberate: the server cannot know who is looking, so ownership is
    // only knowable after mount (see the comment on `isOwner` above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOwner(stored !== null);
    setOwnAnswers(stored?.answers ?? null);
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

  /**
   * This page's URL minus `?lang=` — REVIEW.md R-10. That parameter records
   * the READER's language choice; carrying it into a shared link would
   * impose the sharer's language on everyone who opens it, which is exactly
   * what R-09 just stopped the stored verdict from doing.
   */
  function shareUrl(): string {
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    return url.toString();
  }

  async function handleShare() {
    if (typeof window === "undefined") return;

    const url = shareUrl();
    // Without this, the native share sheet opened with a bare link: the score
    // and the weak pillar only existed inside the OG image, so the text next
    // to it said nothing (REVIEW.md R-10).
    const text = tc(UI_STRINGS.share.textTemplate, locale)
      .replace("{total}", String(total))
      .replace("{pillar}", tc(UI_STRINGS.pillars[weakestPillar], locale));

    try {
      if (navigator.share) {
        await navigator.share({ url, title: "Tour de Growth", text });
        trackEvent("share", `${tone}/native`); // SPEC.md §8: one custom event per share
        return;
      }
    } catch (err) {
      // Closing the sheet is a decision, not a failure: don't quietly write
      // to the user's clipboard instead, and don't count it as a share.
      // (The old code fell through on every error, so a cancelled share was
      // tracked as one — contradicting what CLAUDE.md said it did.)
      if (err instanceof Error && err.name === "AbortError") return;
      // Anything else means the sheet couldn't open at all — fall through.
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("share", `${tone}/copy`);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable (insecure context, permission denied) — nothing
      // useful left to try, and failing silently beats an error the user
      // can't act on
    }
  }

  /**
   * A visitor's way into their own Tour. It carries the referral id — that
   * is the growth loop (SPEC.md §7). The owner's "take it again" link below
   * never does: crediting yourself for re-taking your own Tour inflates the
   * K-factor, the one number SPEC.md §1 says the project exists to quote
   * (REVIEW.md R-03).
   */
  const ownTourHref = id ? `/quiz?ref=${id}` : "/quiz";

  const disclaimerShort = tc(HOW_IT_WORKS.limitationNotice.short, locale);
  const disclaimerLinkText = "How it works"; // the exact trailing phrase both locales' short notice ends with — see content/how-it-works.ts
  const disclaimerSplit = disclaimerShort.split(disclaimerLinkText);

  return (
    <>
      <header className={`${styles.header} ${roast ? styles.headerRoast : ""}`}>
        <div className={styles.headerInner}>
          <WordmarkLink locale={locale} />
          <div className={styles.headerRight}>
            {/* The reader's language switch. This page renders in the
                READER's language since R-09, but until now nothing let them
                say what it was — a shared result opened by a French speaker
                stayed English unless their browser had already asked for
                French. No locale prefix here (see `lib/i18n/routes.ts`), so
                the switch goes through `?lang=`, which the proxy folds into
                the cookie — the choice then carries on to `/quiz`. */}
            <LocaleSwitcher locale={locale} />
            {deepDive && <ModeTag mode="deep">{tc(dd.badge, locale)}</ModeTag>}
            {/* Design system extension 01 drops the "Stage 5/5 — Finished ·
                15/15 answered" meta line from this header: the score below is
                the proof it is finished. The roast badge and the Deep dive tag
                stay — those are state, not a progress read-out, and each has
                its own component in the system. */}
            {roast && <span className={styles.roastBadge}>{tc(t.roastBadge, locale)}</span>}
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
              {/* REVIEW.md R-20 — one line, under the score it qualifies and
                  above the credit. Absent entirely below the minimum sample
                  and on the sample result, rather than shown as a zero or a
                  dash: a benchmark you can't trust is worse than none on a
                  screen whose promise is a score you can re-explain. */}
              {benchmark !== null ? (
                <p className={styles.benchmark} data-testid="benchmark">
                  {tc(UI_STRINGS.benchmark.line, locale).replace("{score}", String(benchmark))}
                </p>
              ) : null}
              {/* SPEC-ADDENDUM-02.md §2.1: sober "built by" credit, in the
                  score card's own footer — stays visible on Deep dive
                  results too (§2.3), additive to the §2.2 card below, not
                  replaced by it. */}
              <p className={styles.builtByCredit}>
                {tc(QUICK_CREDIT.prefix, locale)}
                <a
                  href={ANTOINE_LINKS.cv}
                  target="_blank"
                  rel="noopener"
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
                        moreLabel={tc(UI_STRINGS.glossary.moreLabel, locale)}
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
                      rel="noopener"
                      onClick={() => trackEvent("profile_click", CARD_CV_DETAIL)}
                    >
                      {tc(DEEP_DIVE_CREDIT.cvLinkText, locale)}
                    </a>
                    {" · "}
                    <a
                      href={ANTOINE_LINKS.linkedin}
                      target="_blank"
                      rel="noopener"
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

            {/* REVIEW-02.md R2-02. Two CTAs, always (step 7's rule) — but WHOSE
                two depends on who is looking. The owner shares and can take
                it again. A visitor — someone who just opened a shared link,
                the numerator of the K-factor — used to get the owner's pair:
                "Share my score" in primary and "Take the Tour AGAIN" for a
                Tour they never took. Now their primary is their own Tour,
                with one line saying what that is; sharing stays, secondary.
                `isOwner` is only known after mount, so the visitor pair is
                also the first paint — the right default on a page that is
                mostly reached through a shared link. */}
            {isOwner ? (
              <div className={styles.ctaRow}>
                {/* On desktop there is no native share sheet, so this label is
                    the only confirmation anything happened — it used to be a
                    mute "✓" (REVIEW.md R-10). aria-live so the change is
                    announced, not just seen. */}
                <Button onClick={handleShare} aria-live="polite" data-testid="share-button">
                  {copied ? tc(t.ctaShareCopied, locale) : tc(roast ? t.ctaShareRoast : t.ctaShare, locale)}
                </Button>
                {roast ? (
                  <Button variant="secondary" onClick={() => setTone("neutral")}>
                    {tc(t.ctaSwitchToNeutral, locale)}
                  </Button>
                ) : (
                  <Button href="/quiz" variant="secondary" onClick={() => clearStoredAnswers()}>
                    {tc(t.ctaAgain, locale)}
                  </Button>
                )}
              </div>
            ) : (
              <div className={styles.ctaBlock}>
                <p className={styles.visitorPitch} data-testid="visitor-pitch">
                  {tc(t.visitorPitch, locale)}
                </p>
                <div className={styles.ctaRow}>
                  <Button
                    href={ownTourHref}
                    data-testid="own-tour-cta"
                    onClick={() => {
                      clearStoredAnswers();
                      trackEvent("take_own_tour"); // the click this page exists to produce, until now unmeasured
                    }}
                  >
                    {tc(t.ctaOwnTour, locale)}
                  </Button>
                  <Button variant="secondary" onClick={handleShare} aria-live="polite" data-testid="share-button">
                    {copied ? tc(t.ctaShareCopied, locale) : tc(t.ctaShareResult, locale)}
                  </Button>
                </div>
              </div>
            )}

            <Disclaimer align="left" className={styles.disclaimer}>
              {disclaimerSplit[0]}
              <Link href={localePath(locale, "/how-it-works")}>{disclaimerLinkText}</Link>
              {disclaimerSplit[1]}
            </Disclaimer>

            {/* Owner only, and closed by default: the screen the design brief
                specified is unchanged until someone asks for the detail. */}
            {isOwner && breakdown && ownAnswers && (
              <ScoreBreakdown locale={locale} data={breakdown} answers={ownAnswers} pillars={pillars} />
            )}
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
