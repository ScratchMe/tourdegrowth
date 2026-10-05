"use client";

/**
 * A level's year, played (game plan §2.8, §3.5, chantier G8a) — the same
 * island for every level since CHANTIERS.md A12.d (2026-10-01): a level
 * brings its model, its copy, the format of its number and its phone
 * (`sides.tsx`), and nothing else.
 *
 * The night band of the level page: the quarter timeline, the dashboard, then
 * the desk — one slot that holds the video call, the quarter's report or the
 * resume prompt, the level's phone with its pill beside it, and the hand with
 * its action bar under the slot — and the year's journal. December follows on
 * paper once the year is over.
 *
 * Every word arrives as ONE prop, resolved on the server in the page's
 * language (plan E3): this file imports the engine and the presentation
 * components, never `content/**` (C7, `game-bundles.test.ts`). The mapping
 * from the engine's state to props lives in `island-view.ts`, pure and
 * unit-tested; the gestures and their side effects in `useGame.ts`.
 */
import { useMemo, useRef, type ReactNode } from "react";
import { ActionBar } from "@/components/game/ActionBar";
import { Dashboard } from "@/components/game/Dashboard";
import { DgFace } from "@/components/game/DgFace";
import { EndingCharts } from "@/components/game/EndingCharts";
import { EndingHero } from "@/components/game/EndingHero";
import { GameJournal } from "@/components/game/GameJournal";
import { Hand } from "@/components/game/Hand";
import { NextLevel } from "@/components/game/NextLevel";
import { NightSurface } from "@/components/game/NightSurface";
import { PatternCatalogue } from "@/components/game/PatternCatalogue";
import { Playbook } from "@/components/game/Playbook";
import { QuarterNews } from "@/components/game/QuarterNews";
import { QuarterReport } from "@/components/game/QuarterReport";
import { QuarterTimeline } from "@/components/game/QuarterTimeline";
import { ResumePrompt } from "@/components/game/ResumePrompt";
import { RevealCells } from "@/components/game/RevealCells";
import { ShareRow } from "@/components/game/ShareRow";
import { TourLoop } from "@/components/game/TourLoop";
import { VideoCall } from "@/components/game/VideoCall";
import { GAME_LEVELS_BY_PILLAR, nextLevelFor } from "@/lib/game/levels";
import { ACQUISITION_LEVEL } from "@/lib/game/levels/acquisition";
import { ACTIVATION_LEVEL } from "@/lib/game/levels/activation";
import { RETENTION_LEVEL } from "@/lib/game/levels/retention";
import { moodNow } from "@/lib/game/model";
import { actionBarVisible, callViewFor, handHint, handVisible } from "@/lib/game/phases";
import { finishedLevels, loadCollection } from "@/lib/game/storage";
import { TYPE_CHARS_PER_TICK, TYPE_TICK_MS, VOICES_WAIT_MS } from "@/lib/game/ui-timing";
import type { LevelDefinition, LevelSlug } from "@/lib/game/types";
import { phoneIds, voiceLang, voiceParams } from "@/lib/game/view";
import type { Locale } from "@/lib/i18n/locale";
import type { NextLevelLink } from "../_level/LevelPage";
import {
  bossMessage,
  dashboardProps,
  decemberContent,
  handView,
  journalEntries,
  newsContent,
  quarterPeriod,
  reportContent,
  resumeContent,
  shareText,
  timelineSegments,
  yearClosedView,
  islandContext,
} from "./island-view";
import { ISLAND_SIDES, type IslandCopies } from "./sides";
import { useGame } from "./useGame";
import styles from "./GameIsland.module.css";

/** The model of each playable level. Data only, a few kilobytes: every level ships in the island's bundle. */
const LEVELS: { [S in LevelSlug]: LevelDefinition<string> } = {
  acquisition: ACQUISITION_LEVEL,
  activation: ACTIVATION_LEVEL,
  retention: RETENTION_LEVEL,
};

/**
 * Generic over the level, so its slug, its copy and its side stay correlated
 * through `ISLAND_SIDES[slug]`: a page cannot hand level 1's copy to level 2's
 * phone.
 */
export interface GameIslandProps<S extends LevelSlug> {
  /** Which level this island plays. */
  slug: S;
  /** The level's copy in the page's language — everything but the intro and the footer, which the page renders itself. */
  copy: IslandCopies[S];
  locale: Locale;
  /**
   * Every other open level, with its page and the line that announces it
   * (`nextLevelLinks`, computed by the page on the server). December's last
   * block links to the one `nextLevelFor` picks from what the player has
   * finished — read in the browser, so the server cannot choose (C75).
   */
  nextLevels: Partial<Record<LevelSlug, NextLevelLink>>;
}

export function GameIsland<S extends LevelSlug>({ slug, copy, locale, nextLevels }: GameIslandProps<S>) {
  const L = LEVELS[slug];
  const side = ISLAND_SIDES[slug];
  const ctx = useMemo(() => islandContext(L, copy, locale), [L, copy, locale]);
  const callRef = useRef<HTMLElement>(null);
  const handRef = useRef<HTMLHeadingElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLButtonElement>(null);
  const reportRef = useRef<HTMLHeadingElement>(null);
  const decemberRef = useRef<HTMLHeadingElement>(null);
  const resumeRef = useRef<HTMLHeadingElement>(null);
  const played = useMemo(
    () => ({ level: L, announceTick: (before: readonly string[], after: readonly string[]) => side.announce({ before, after, copy, locale }) }),
    [L, side, copy, locale],
  );
  const g = useGame(ctx, played, {
    call: callRef,
    hand: handRef,
    dashboard: dashboardRef,
    news: newsRef,
    report: reportRef,
    december: decemberRef,
    resume: resumeRef,
  });
  const { game, phase, desk } = g;

  const mood = moodNow(L, desk);
  const callView = callViewFor(phase);
  const ids = phoneIds(desk);
  const hand = handView(ctx, desk, handHint(desk.picks.length, L.constants.picksPerQuarter));

  let slot: ReactNode = null;
  if (phase.kind === "resumePrompt" && g.saved) {
    const resume = resumeContent(ctx, g.saved.state);
    slot = (
      <ResumePrompt
        title={resume.title}
        previously={resume.previously}
        accept={{ label: resume.accept, onClick: g.acceptResume }}
        restart={{ label: resume.restart, onClick: g.restartFromPrompt }}
        titleRef={resumeRef}
      />
    );
  } else if (phase.kind === "report" || phase.kind === "news") {
    // Under the news screen the report is already drawn: closing the news
    // reveals it in place, and nothing on the desk moves.
    const report = reportContent(ctx, game, phase.q);
    slot = (
      <QuarterReport
        key={report.q}
        q={report.q}
        period={report.period}
        headingRef={reportRef}
        picked={report.picked}
        figures={report.figures}
        effectsHeading={report.effectsHeading}
        effects={report.effects}
        notes={report.notes}
        drivers={report.drivers}
        mail={report.mail}
        clippings={report.clippings}
        boss={{ line: report.bossLine, mood: report.mood, face: <DgFace mood={report.mood} framing="avatar" /> }}
        next={{ label: report.nextLabel, onClick: g.next }}
      />
    );
  } else if (callView) {
    slot = (
      <VideoCall
        ref={callRef}
        state={callView}
        mood={mood}
        message={bossMessage(ctx, desk)}
        ringingEyebrow={callView === "ringing" ? quarterPeriod(ctx, game.q) : undefined}
        labels={copy.visio}
        animateCaption={g.typedCall}
        typingPace={{ charsPerTick: TYPE_CHARS_PER_TICK, tickMs: TYPE_TICK_MS[mood] }}
        voice={{ lang: voiceLang(locale), ...voiceParams(mood) }}
        voiceWaitMs={VOICES_WAIT_MS}
        callKey={g.callKey}
        onHangUp={g.hangUp}
        onPickUp={g.pickUp}
        onListen={g.listen}
      />
    );
  }

  const news = phase.kind === "news" ? newsContent(ctx, game, phase.q) : null;
  const december = phase.kind === "december" && game.over && game.ending ? decemberContent(ctx, game) : null;
  const reveal = december ? (g.enteredDecember ? "revealing" : "shown") : "hidden";
  const closed = phase.kind === "december" && game.over ? yearClosedView(ctx, game) : null;
  // The level the closing block announces: the first open one the player has not
  // finished (C75). Read from the save, in the browser, in December only —
  // December is never prerendered (the island arrives after a click, or after a
  // resume read from localStorage once mounted), so hydration never sees it.
  const inDecember = december !== null;
  const nextSlug = useMemo(
    () => (inDecember ? nextLevelFor(slug, finishedLevels(loadCollection()), GAME_LEVELS_BY_PILLAR) : null),
    [inDecember, slug],
  );
  const next = nextSlug ? nextLevels[nextSlug] : undefined;
  // December is only ever drawn after mount — the prerendered page is the
  // first call — so the address is the browser's, in the page's language.
  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}`;

  return (
    <>
      <NightSurface as="div" className={styles.band} data-testid="game-island">
        <div className={styles.inner}>
          <QuarterTimeline label={copy.timeline.label} segments={timelineSegments(ctx, desk)} />

          {/* The quarter happens here while its months scroll: the focus comes
              to it, never by Tab (a region, not a control). */}
          <div ref={dashboardRef} tabIndex={-1} className={styles.dashboard} data-testid="game-dashboard">
            <Dashboard {...dashboardProps(ctx, g.dash.state, g.dash.prev, reveal)} />
          </div>

          <div className={styles.desk} data-testid="game-desk" data-phase={phase.kind}>
            <div className={styles.slot}>{slot}</div>

            <div className={styles.side}>
              {/* The level's phone and pill; the pill is silent here: the island says a change in its own region (plan E5). */}
              {side.render({ ids, copy, locale })}
            </div>

            {handVisible(phase) ? (
              // The action bar is a direct sibling of the hand: on a phone it
              // sticks to the bottom of the screen while THIS wrapper is on it,
              // and not beyond — past the hand, it rests under the last card.
              <div className={styles.handWrap}>
                <Hand
                  title={hand.title}
                  headingRef={handRef}
                  count={hand.count}
                  label={copy.a11y.handLabel}
                  hint={hand.hint}
                  cards={hand.cards}
                  orderLabel={copy.hand.order}
                  unlockedLabel={copy.hand.unlocked}
                  chosenLabel={copy.hand.chosen}
                  production={hand.production}
                  onToggle={g.toggle}
                />
                {actionBarVisible(phase) ? (
                  <ActionBar
                    count={hand.count}
                    pill={side.pill({ ids, copy, locale })}
                    runLabel={copy.hand.run}
                    canRun={hand.canRun}
                    onRun={g.run}
                  />
                ) : null}
              </div>
            ) : null}

            {closed ? (
              // Where the hand stood: the year is closed, and December is
              // further down (brief §7.2 P9). No card, nothing to run.
              <section
                className={styles.yearClosed}
                aria-labelledby="game-year-closed-title"
                data-testid="game-year-closed"
                data-fired={closed.fired ? "true" : "false"}
              >
                <h2 id="game-year-closed-title" className={styles.yearClosedTitle}>
                  {closed.title}
                </h2>
                <p className={styles.yearClosedHint}>{closed.hint}</p>
              </section>
            ) : null}
          </div>

          <GameJournal title={copy.journal.title} entries={journalEntries(ctx, desk)} />
        </div>

        {news ? (
          // Inside the night band in the DOM, so the dialog reads the night
          // tokens; `showModal` lifts it into the top layer over everything.
          <QuarterNews
            key={news.q}
            q={news.q}
            eyebrow={news.eyebrow}
            period={news.period}
            items={news.items.map((item) =>
              item.kind === "boss" ? { ...item, face: <DgFace mood={item.mood} framing="avatar" /> } : item,
            )}
            progress={news.progress}
            labels={{ next: copy.news.next, finish: copy.news.finish, skip: copy.news.skip }}
            primaryRef={newsRef}
            onDone={g.closeNews}
          />
        ) : null}

        {/* The one live region (plan E5): what a gesture did, said once. Present
            from the first render — a region that appears with its message is
            not announced. */}
        <p className="tdg-visually-hidden" role="status" aria-live="polite" data-testid="game-live">
          {g.live}
        </p>
      </NightSurface>

      {december ? (
        <div data-world="paper" className={styles.december} data-testid="game-december">
          <div className={styles.decemberInner}>
            <EndingHero
              eyebrow={december.hero.eyebrow}
              title={december.hero.title}
              text={december.hero.text}
              win={december.hero.win}
              stamp={g.enteredDecember}
              titleRef={decemberRef}
            />
            <RevealCells
              figures={december.figures}
              labels={december.cellLabels}
              note={december.note}
              revealing={g.enteredDecember}
            />
            <EndingCharts
              view={december.view}
              figures={december.figures}
              metric={december.metricChart}
              trust={december.trustChart}
              monthInitials={copy.monthInitials}
              data={{
                toggle: copy.december.dataToggle,
                month: copy.december.table.month,
                metric: copy.december.table.metric,
                trust: copy.december.table.trust,
                rows: december.rows,
              }}
              animate={g.enteredDecember}
            />
            <Playbook {...december.playbook} />
            <PatternCatalogue
              eyebrow={copy.catalogue.eyebrow}
              title={copy.catalogue.title}
              lead={copy.catalogue.lead}
              groups={{ used: copy.catalogue.groupUsed, refused: copy.catalogue.groupRefused, unseen: copy.catalogue.groupUnseen }}
              labels={{
                hiddenEffect: copy.catalogue.hiddenEffectLabel,
                law: copy.catalogue.lawLabel,
                cas: copy.catalogue.caseLabel,
                tell: copy.catalogue.tellLabel,
              }}
              entries={december.catalogue}
              onOpen={g.openPattern}
            />
            <ShareRow
              replayLabel={copy.share.replay}
              onReplay={g.replay}
              copyLabel={copy.share.copy}
              copiedLabel={copy.share.copied}
              shareText={shareText(ctx, game, shareUrl)}
              onShare={g.share}
            />
            {next ? (
              <NextLevel
                eyebrow={copy.nextLevel.eyebrow}
                title={next.title}
                status={copy.nextLevel.status}
                href={next.href}
              />
            ) : null}
            <TourLoop question={copy.tourLoop.question} cta={copy.tourLoop.cta} onClick={g.tourLoop} />
          </div>
        </div>
      ) : null}
    </>
  );
}
