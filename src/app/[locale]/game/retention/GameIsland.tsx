"use client";

/**
 * « S'ils reviennent » — the year, played (game plan §2.8, §3.5, chantier G8a).
 *
 * The night band of the level page: the quarter timeline, the dashboard, then
 * the desk — one slot that holds the video call, the quarter's report or the
 * resume prompt, the phone with its clicks pill beside it, and the hand with
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
import { ClickPill } from "@/components/game/ClickPill";
import { Dashboard } from "@/components/game/Dashboard";
import { DgFace } from "@/components/game/DgFace";
import { EndingCharts } from "@/components/game/EndingCharts";
import { EndingHero } from "@/components/game/EndingHero";
import { GameJournal } from "@/components/game/GameJournal";
import { Hand } from "@/components/game/Hand";
import { NextLevel } from "@/components/game/NextLevel";
import { NightSurface } from "@/components/game/NightSurface";
import { PatternCatalogue } from "@/components/game/PatternCatalogue";
import { PhoneMock } from "@/components/game/PhoneMock";
import { Playbook } from "@/components/game/Playbook";
import { QuarterReport } from "@/components/game/QuarterReport";
import { QuarterTimeline } from "@/components/game/QuarterTimeline";
import { ResumePrompt } from "@/components/game/ResumePrompt";
import { RevealCells } from "@/components/game/RevealCells";
import { ShareRow } from "@/components/game/ShareRow";
import { TourLoop } from "@/components/game/TourLoop";
import { VideoCall } from "@/components/game/VideoCall";
import { RETENTION_LEVEL } from "@/lib/game/levels/retention";
import { moodNow } from "@/lib/game/model";
import { actionBarVisible, callViewFor, handHint, handVisible } from "@/lib/game/phases";
import { TYPE_CHARS_PER_TICK, TYPE_TICK_MS, VOICES_WAIT_MS } from "@/lib/game/ui-timing";
import { clicksFor, clicksOverLaw, phoneIds, phoneView, voiceLang, voiceParams } from "@/lib/game/view";
import type { Locale } from "@/lib/i18n/locale";
import {
  bossMessage,
  clicksLabel,
  dashboardProps,
  decemberContent,
  handView,
  journalEntries,
  quarterPeriod,
  reportContent,
  resumeContent,
  shareText,
  timelineSegments,
  yearClosedView,
  type IslandContext,
  type IslandCopy,
} from "./island-view";
import { useGame } from "./useGame";
import styles from "./GameIsland.module.css";

const L = RETENTION_LEVEL;

export interface GameIslandProps {
  /** The level's copy in the page's language — everything but the intro, which the page renders itself. */
  copy: IslandCopy;
  locale: Locale;
}

export function GameIsland({ copy, locale }: GameIslandProps) {
  const ctx: IslandContext = useMemo(() => ({ copy, locale }), [copy, locale]);
  const callRef = useRef<HTMLElement>(null);
  const handRef = useRef<HTMLHeadingElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLHeadingElement>(null);
  const decemberRef = useRef<HTMLHeadingElement>(null);
  const resumeRef = useRef<HTMLHeadingElement>(null);
  const g = useGame(ctx, {
    call: callRef,
    hand: handRef,
    dashboard: dashboardRef,
    report: reportRef,
    december: decemberRef,
    resume: resumeRef,
  });
  const { game, phase, desk } = g;

  const mood = moodNow(L, desk);
  const callView = callViewFor(phase);
  const ids = phoneIds(desk);
  const clicks = clicksFor(L, ids);
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
  } else if (phase.kind === "report") {
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
        boss={{ line: report.bossLine, mood: report.mood, face: <DgFace mood={report.mood} size="avatar" /> }}
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

  const december = phase.kind === "december" && game.over && game.ending ? decemberContent(ctx, game) : null;
  const reveal = december ? (g.enteredDecember ? "revealing" : "shown") : "hidden";
  const closed = phase.kind === "december" && game.over ? yearClosedView(ctx, game) : null;
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
              <PhoneMock items={phoneView(L, ids)} labels={copy.phone} />
              {/* Silent here: the island says a new count in its own region (plan E5). */}
              <ClickPill clicks={clicks} overLaw={clicksOverLaw(clicks)} labels={copy.clicks} announce={false} />
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
                    clicks={clicksLabel(ctx, clicks)}
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
              churn={december.churnChart}
              trust={december.trustChart}
              monthInitials={copy.monthInitials}
              data={{
                toggle: copy.december.dataToggle,
                month: copy.december.table.month,
                churn: copy.december.table.churn,
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
            <NextLevel eyebrow={copy.nextLevel.eyebrow} title={copy.nextLevel.title} status={copy.nextLevel.status} />
            <TourLoop question={copy.tourLoop.question} cta={copy.tourLoop.cta} onClick={g.tourLoop} />
          </div>
        </div>
      ) : null}
    </>
  );
}
