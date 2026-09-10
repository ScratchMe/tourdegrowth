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
import { Bottleneck } from "@/components/result/Bottleneck";
import { Disclaimer } from "@/components/result/Disclaimer";
import { InsightCard } from "@/components/result/InsightCard";
import { PillarChip } from "@/components/result/PillarChip";
import { PriorityMove } from "@/components/result/PriorityMove";
import { ScoreDisplay } from "@/components/result/ScoreDisplay";
import { ShareCard } from "@/components/result/ShareCard";
import { StampedPillar } from "@/components/result/StampedPillar";
import { ANTOINE_LINKS, DEEP_DIVE_CREDIT, QUICK_CREDIT } from "@/content/antoine-credit";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { PROFILE_CLICK_DETAILS, trackEvent } from "@/lib/analytics/goatcounter";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { useLocale } from "@/lib/i18n/locale-context";
import { localePath } from "@/lib/i18n/routes";
import { progressionFor, type Progression } from "@/lib/quiz/progression";
import { progressionSentence } from "@/lib/quiz/progression-copy";
import { clearStoredAnswers, findStoredResult, loadStoredResults } from "@/lib/quiz/storage";
import type { Tone } from "@/lib/quiz/tone";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { rankPillarsAscending } from "@/lib/scoring/rank";
import type { BottleneckView } from "@/lib/scoring/bottleneck";
import type { QuickVerdict } from "@/lib/scoring/verdict";
import type { Answers } from "@/lib/scoring/score";
import type { DeepDiveView } from "@/lib/submissions/types";
import { SEGMENT_MODELS, SEGMENT_STAGES } from "@/content/segments";
import type { Benchmark } from "@/lib/submissions/benchmark";
import type { SegmentAnswers } from "@/lib/submissions/segment";
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
  /** Which stage is holding this product back, and how honestly we can say so — resolved on the server (`lib/scoring/bottleneck.ts`), because deciding is not the same job as wording. */
  bottleneck: BottleneckView<{ pillar: Pillar; score: number }>;
  /** The one free action, already resolved in the reader's language. Server-side: the answers it is derived from never leave the server (REVIEW.md R-02), and a visitor has none of their own to derive it from. */
  nextMove: string;
  /** The tone selected during the quiz — which verdict shows first. */
  initialTone: Tone;
  /** SPEC.md §12: the fixed sample must be visibly marked so it's never mistaken for a real result. */
  isSample?: boolean;
  /** Deep dive enrichment (SPEC-ADDENDUM-01.md §2) — null on a plain Quick result. Display-safe subset only: the free-text context and the 10 context answers never leave the server (REVIEW.md R-02). */
  deepDive?: DeepDiveView | null;
  /** Questions and per-pillar raw points behind the score (REVIEW.md R-12) — public content; the owner's answers come from their own device, never from here. */
  breakdown?: BreakdownData | null;
  /** Average score across every Tour taken (REVIEW.md R-20), or null when there aren't enough yet — and never on the fixed sample, whose numbers aren't real. */
  /** REVIEW-02.md R2-26 — the average, and whose average it is. */
  benchmark?: Benchmark | null;
  /** The reader's own segment, only used to name it in the line above. */
  segment?: SegmentAnswers | null;
}

/**
 * "Average for B2B, first customers: 61/100" once the reader's own segment
 * has enough Tours of its own, "Average of every Tour" until then
 * (REVIEW-02.md R2-26). Built here rather than on the server because the
 * label needs the reader's locale and the number does not.
 */
function benchmarkLine(benchmark: Benchmark, segment: SegmentAnswers | null, locale: Locale): string {
  const score = String(benchmark.score);
  const globalLine = () => tc(UI_STRINGS.benchmark.line, locale).replace("{score}", score);
  if (benchmark.scope !== "segment" || !segment) return globalLine();

  const stage = SEGMENT_STAGES.find((o) => o.value === segment.stage);
  const model = SEGMENT_MODELS.find((o) => o.value === segment.model);
  // A segment-scoped average only exists when both axes were answered, but a
  // stored value could still be unknown to a later options list.
  if (!stage || !model) return globalLine();

  const label = tc(UI_STRINGS.benchmark.segmentJoin, locale)
    .replace("{model}", tc(model.label, locale))
    .replace("{stage}", tc(stage.label, locale).toLocaleLowerCase(locale));
  return tc(UI_STRINGS.benchmark.segmentLine, locale).replace("{segment}", label).replace("{score}", score);
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
  bottleneck,
  nextMove,
  initialTone,
  isSample = false,
  deepDive = null,
  breakdown = null,
  benchmark = null,
  segment = null,
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
  /** REVIEW-02.md R2-27 — anchored on THIS result, not on the newest one. */
  const [progress, setProgress] = useState<Progression | null>(null);

  useEffect(() => {
    if (!id) return;
    const stored = findStoredResult(id);
    // Deliberate: the server cannot know who is looking, so ownership is
    // only knowable after mount (see the comment on `isOwner` above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOwner(stored !== null);
    setOwnAnswers(stored?.answers ?? null);
    setProgress(stored ? progressionFor(loadStoredResults(), id) : null);
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
  // Already bottleneck-first: `ranked` is ascending, so [0] is the stage the
  // block above names. The composition doc asks for that order explicitly;
  // it was already true, and this comment is what stops a future sort from
  // quietly breaking it.
  const weakestTwo = ranked.slice(0, 2);

  /** The one stage the action belongs to. Null when nothing is behind. */
  const bottleneckPrimary = bottleneck.pillars[0] ?? null;

  /**
   * No stage is behind — so nothing on this page may present one as a
   * problem. `weakestPillar` still exists on a level board (something has to
   * be lowest) and used to drive four separate treatments: the red chip, the
   * roast stamp, the red "Where you're losing time" cards and that section's
   * title. All four asserted a stall the scores don't support, under a block
   * that had just said none does — the same defect as the headline, in four
   * more places on the same screen.
   */
  const level = bottleneck.sharpness === "level";

  /**
   * The sharpness line. The server decided WHICH claim the scores support;
   * this only says it in the reader's language, with the count when more
   * than one stage is tied at the bottom.
   */
  const bottleneckLabel =
    bottleneck.sharpness === "level"
      ? tc(UI_STRINGS.bottleneck.level, locale)
      : bottleneck.sharpness === "clear"
        ? tc(UI_STRINGS.bottleneck.clear, locale)
        : tc(UI_STRINGS.bottleneck.shared, locale).replace("{n}", String(bottleneck.pillars.length));

  /** Rewritten by `next.config.mjs` to the hashed metadata route (REVIEW.md R-24). */
  const shareImageSrc = id ? `/r/${id}/opengraph-image` : "/r/sample/opengraph-image";
  const shareImageAlt = bottleneckPrimary
    ? tc(t.shareCardAltTemplate, locale)
        .replace("{total}", String(total))
        .replace("{pillar}", tc(UI_STRINGS.pillars[bottleneckPrimary.pillar], locale))
    : tc(t.shareCardAltLevelTemplate, locale).replace("{total}", String(total));

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
      <header className={styles.header}>
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
            <Card
              elevation="raised"
              className={[styles.slotScore, roast ? styles.scoreCardRoast : ""].filter(Boolean).join(" ")}
            >
              <ScoreDisplay score={total} label={tc(UI_STRINGS.scoreCard.label, locale)} />
              {/* Design system extension 03 §1. This REPLACES the verdict line
                  that used to float under the numeral — the verdict sentence
                  is now this block's last line, so the stage that is holding
                  the reader back gets the position it was already the
                  subject of. `sharpness` is what says whether naming one
                  stage is a claim the scores support. */}
              <Bottleneck
                data-testid="bottleneck"
                sharpness={bottleneck.sharpness}
                label={bottleneckLabel}
                pillars={bottleneck.pillars.map((p) => ({
                  pillar: tc(UI_STRINGS.pillars[p.pillar], locale),
                  score: p.score,
                }))}
                verdict={verdict.headline}
                tone={roast ? "roast" : "straight"}
              />
              {/* REVIEW.md R-20 — one line, under the score it qualifies and
                  above the credit. Absent entirely below the minimum sample
                  and on the sample result, rather than shown as a zero or a
                  dash: a benchmark you can't trust is worse than none on a
                  screen whose promise is a score you can re-explain. */}
              {benchmark !== null ? (
                <p className={styles.benchmark} data-testid="benchmark">
                  {benchmarkLine(benchmark, segment, locale)}
                </p>
              ) : null}
              {/* REVIEW-02.md R2-27 — the owner's own trajectory, next to the
                  benchmark's "everyone else", under the score both qualify.
                  Owner-only by construction: it is read from this device's
                  stored results, so a visitor has nothing to read. */}
              {progress ? (
                <p className={styles.progression} data-testid="result-progression">
                  {progressionSentence(progress, {
                    up: tc(UI_STRINGS.progression.resultUp, locale),
                    down: tc(UI_STRINGS.progression.resultDown, locale),
                    flat: tc(UI_STRINGS.progression.resultFlat, locale),
                  })}
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

            <div className={`${styles.pillarGrid} ${styles.slotPillars}`}>
              {PILLARS.map((pillar) => {
                const entry = pillars.find((p) => p.pillar === pillar);
                if (!entry) return null;
                const spanFull = pillar === "revenue" || (roast && !level && pillar === weakestName);
                const label = tc(UI_STRINGS.pillars[pillar], locale);

                if (roast && !level && pillar === weakestName) {
                  return (
                    <div key={pillar} className={spanFull ? styles.spanFull : ""}>
                      <StampedPillar pillar={label} score={entry.score} suffix={tc(t.stampedSuffix, locale)} />
                    </div>
                  );
                }

                const isWeak = !level && (pillar === weakestPillar || (roast && pillar === secondWeakestName));
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

            {/* Design system extension 03 §3 — the picture of the result, under
                the result. Sunken paper: an artefact OF the result, not a
                surface of it, and the one raised card on this screen is
                already spent on the score. It absorbs "Share this result",
                which leaves the CTA row below. */}
            <ShareCard
              className={styles.slotShare}
              data-testid="share-card"
              src={shareImageSrc}
              alt={shareImageAlt}
              caption={tc(t.shareCardCaption, locale)}
              /* Same control, same test id as when it lived in the CTA row —
                 the specs that cover cancelled shares and the desktop
                 clipboard fallback are about behaviour that did not change. */
              shareTestId="share-button"
              shareLabel={copied ? tc(t.ctaShareCopied, locale) : tc(t.ctaShareResult, locale)}
              saveLabel={tc(t.shareCardSave, locale)}
              onShare={handleShare}
              saveHref={shareImageSrc}
              saveFileName={`tour-de-growth-${total}.png`}
            />
          </div>

          <div className={styles.right}>
            {/* Design system extension 03 §2 — the free action, for everyone,
                at the top of the column. The reader goes numeral →
                bottleneck → action, and the strengths and weaknesses below
                are the evidence. It FILLS the slot the empty "locked" card
                used to occupy: since REVIEW-03.md A2 the Quick result has a
                real action of its own (`content/next-moves.ts`), so the Deep
                dive no longer unlocks the slot, it sharpens what is in it.

                A visitor sees it too. They are the numerator of the whole
                sharing loop, and an action is what makes a shared link worth
                opening — an empty slot was never going to do that. */}
            <PriorityMove
              className={styles.slotMove}
              data-testid="priority-move"
              label={tc(deepVerdict ? dd.priorityMoveLabel : t.nextMoveLabel, locale)}
              pillar={bottleneckPrimary ? tc(UI_STRINGS.pillars[bottleneckPrimary.pillar], locale) : undefined}
              score={bottleneckPrimary?.score}
              upgrade={
                /* Owner only (REVIEW.md R-01): every recipient of a shared
                   link used to see this button, and clicking it filled the
                   SHARER's result with the clicker's own context —
                   irreversibly. It also disappears once the Deep dive has
                   been done, because there is nothing left to offer. */
                !deepVerdict && !isSample && id && isOwner ? (
                  <>
                    <p className={styles.upgradeText}>{tc(dd.upgradeText, locale)}</p>
                    <Button variant="secondary" href={`/deep-dive/${id}`} data-testid="deep-dive-cta">
                      {tc(dd.upgradeCta, locale)}
                    </Button>
                  </>
                ) : undefined
              }
            >
              {deepVerdict ? deepVerdict.priorityAction : nextMove}
            </PriorityMove>

            <section className={`${styles.section} ${styles.slotStrengths}`}>
              <MetaLabel wide>{tc(roast ? t.strengthsTitleRoast : t.strengthsTitle, locale)}</MetaLabel>
              <div className={styles.cardGrid}>
                {(roast ? strongestTwo.slice(0, 1) : strongestTwo).map((p) => (
                  <InsightCard key={p.pillar} pillar={tc(UI_STRINGS.pillars[p.pillar], locale)} score={p.score} kind="strength">
                    {sentenceFor(p.pillar)}
                  </InsightCard>
                ))}
              </div>
            </section>

            <section className={`${styles.section} ${styles.slotWeaknesses}`}>
              <MetaLabel wide>{tc(level ? t.roomTitle : t.weaknessesTitle, locale)}</MetaLabel>
              <div className={styles.cardGrid}>
                {weakestTwo.map((p) => (
                  <InsightCard
                    key={p.pillar}
                    pillar={tc(UI_STRINGS.pillars[p.pillar], locale)}
                    score={p.score}
                    /* The two lowest of a level board are still strong, and
                       their sentences come from the strong band — so they read
                       as praise. In the alert treatment that was praise inside
                       a red card under an alarming title. */
                    kind={level ? "strength" : "weakness"}
                  >
                    {sentenceFor(p.pillar)}
                  </InsightCard>
                ))}
              </div>
            </section>

            {/* SPEC-ADDENDUM-02.md §2.2: the assertive credit placement —
                real engagement (25 answers, maybe free text) earns a real
                card, not just the §2.1 footer line. Still gated on a
                completed Deep dive, and still never under the free action
                alone. No hard shadow, so it doesn't compete with the score. */}
            {deepVerdict ? (
              <Card tone="paper" elevation="flat" className={`${styles.antoineCard} ${styles.slotCredit}`}>
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
            ) : null}

            {/* Whose CTAs these are still depends on who is looking
                (REVIEW-02.md R2-02): a visitor's primary is their own Tour,
                the owner's is taking it again. `isOwner` is only known after
                mount, so the visitor arrangement is also the first paint —
                the right default on a page mostly reached through a shared
                link.

                What changed with design system extension 03 §3: sharing
                leaves this row for `ShareCard` in the left column, where the
                image makes it a block rather than a button, and the row holds
                the primary alone.

                Two things the design return did not cover, decided here and
                deliberately not silent:

                - Which button is the owner's primary. Sharing was theirs
                  before; with it gone from the row, "Take the Tour again"
                  is promoted. Making the ShareCard's button primary instead
                  was tried and reverted: `ShareCard.prompt.md` says "never
                  primary", and the design's own mobile order puts the CTA row
                  ABOVE the share block, so a primary in the card would sit
                  below a secondary. The image is what sells the share here,
                  not a filled button. Worth Antoine's eye all the same — it
                  makes "retake" the loudest thing on an owner's result.
                - A roast owner keeps "Switch to straight up". Removing it
                  would take away the only way back from a tone, and that
                  reassurance is precisely what step 7 promised when it
                  refused a symmetric toggle (reaffirmed by Antoine at R-23).
                  Sharing left the row; the way back did not. */}
            {isOwner ? (
              <div className={`${styles.ctaRow} ${styles.slotCta}`}>
                <Button
                  href="/quiz"
                  data-testid="take-again-cta"
                  onClick={() => clearStoredAnswers()}
                >
                  {tc(t.ctaAgain, locale)}
                </Button>
                {roast ? (
                  <Button variant="secondary" onClick={() => setTone("neutral")}>
                    {tc(t.ctaSwitchToNeutral, locale)}
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className={`${styles.ctaBlock} ${styles.slotCta}`}>
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
                </div>
              </div>
            )}

            <Disclaimer align="left" className={`${styles.disclaimer} ${styles.slotDisclaimer}`}>
              {disclaimerSplit[0]}
              <Link href={localePath(locale, "/how-it-works")}>{disclaimerLinkText}</Link>
              {disclaimerSplit[1]}
            </Disclaimer>

            {/* Owner only, and closed by default: the screen the design brief
                specified is unchanged until someone asks for the detail. */}
            {isOwner && breakdown && ownAnswers && (
              <ScoreBreakdown
                locale={locale}
                data={breakdown}
                answers={ownAnswers}
                pillars={pillars}
                className={styles.slotBreakdown}
              />
            )}
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
