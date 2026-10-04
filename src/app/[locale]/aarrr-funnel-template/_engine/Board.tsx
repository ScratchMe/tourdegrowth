"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Disclosure } from "@/components/core/Disclosure";
import { Field } from "@/components/core/Field";
import { Segmented } from "@/components/core/Segmented";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { pelotonTitle } from "@/lib/engine/deck";
import { relaysTitle } from "@/lib/engine/deck-motions";
import { findingText } from "@/lib/engine/sentences";
import type { CandidateId, Interval, MetricId, Motion, MotionDerived, SlideTitle } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import { BoardBar, BoardNextStep, boardNextStep, type EngineControls, type SeriesControls } from "./BoardHead";
import type { CollectPlan } from "./collect";
import { Diagnosis } from "./Diagnosis";
import { Mirror } from "./Mirror";
import { Peloton } from "./Peloton";
import { Relays } from "./Relays";
import { previousLeakLine } from "./series-view";
import { SlgWhatIfPanel } from "./SlgWhatIfPanel";
import { BoardLever } from "./BoardLever";
import { BoardMoney } from "./BoardMoney";
import { BoardNumbers } from "./BoardNumbers";
import type { TablePreview } from "./csv";
import { TableEntry } from "./TableEntry";
import { PipelineBand } from "./PipelineBand";
import { TotalBand } from "./TotalBand";
import { Verdict } from "./Verdict";
import type { EngineActions, EngineView } from "./view";
import { WhatIfPanel } from "./WhatIfPanel";
import styles from "./Board.module.css";

type PlgDerived = Extract<MotionDerived, { motion: "plg" }>;
type SlgDerived = Extract<MotionDerived, { motion: "slg" }>;

/**
 * The board (spec §7 E2) — « la façon que tu as actuellement, quand tu
 * connais l'outil » (Antoine, 2026-09-25) — and, since A18 T3.b, the
 * step-by-step too, folded into it: each number's screen leads on. Top to
 * bottom (design system extension 07, A18 T2.a): the engine bar (what is on
 * screen, the settings, and the menu that holds the engines, the month and
 * the file), the verdict title (the board's h2 and its focus target), the
 * coverage in fractions, the next step — the screen's one primary — then
 * the diagnosis, the money (`BoardMoney`, design system extension 09, A20.d
 * T2), « et si » moved up under it (its card with the MRR's curve and its
 * panel folded, C51, C54, A20.d T3.a), the funnel in the screen's one raised
 * card, the five numbers, every stage in one list whose rows open each
 * number's screen (`BoardNumbers`, A18 T2.b), the declared × measured
 * mirror, what is left to go and get
 * (folded), the table entry (folded, opened from the menu), and the slides
 * as a quiet link while they are not the next step.
 *
 * Three layouts, by the motions the setup ticked (A7.3.c S3, §18.7):
 * - **self-serve alone**: the v1 board, unchanged to the character;
 * - **sales-assisted alone**: the same board, the relays in place of the
 *   peloton, its own diagnosis, list and « et si »;
 * - **the hybrid**, « deux moteurs, un total »: the total band once, at the
 *   top (`TotalBand`: its title is the board's heading), the next step, then
 *   « Moteur affiché » — one engine's board at a time, never two columns
 *   (A18 T5): its own verdict, diagnosis, money, lever, drawing and list, in
 *   the fixed order, never by value; the MRR in twelve months of both, with
 *   the what-ifs, sits in the card's total line, whichever is shown.
 *
 * Every visual is fed from the SAME derived object the verdict and the
 * slides read (`view.derived`): a diagnosis cannot name a stage its funnel
 * does not stamp.
 */
export function Board({
  view,
  actions,
  verdict,
  plan,
  returningFrom,
  openedAt,
  writeFailed,
  motionView,
  onMotion,
  onDeck,
  onSave,
  onImport,
  onErase,
  onSettings,
  onRename,
  onRequests,
  series,
  engines,
  onTemplate,
  onApplyTable,
}: {
  view: EngineView;
  actions: EngineActions;
  verdict: SlideTitle;
  plan: CollectPlan;
  returningFrom: string | null;
  /** The day the engine was opened (`engine-store`'s `openedAt`): what the last visit is counted to. */
  openedAt: string;
  writeFailed: boolean;
  /** The hybrid's « Moteur affiché » (§18.7, A18 T5): whose board shows. null: the default — self-serve. */
  motionView: Motion | null;
  onMotion: (motion: Motion) => void;
  onDeck: () => void;
  onSave: () => void;
  onImport: () => void;
  onErase: () => void;
  onSettings: () => void;
  /** The next step's « Demande tes {n} chiffres » (A18 T3.c): the requests' screen, with the numbers to ask for. */
  onRequests: (ids: readonly MetricId[]) => void;
  /** « Renommer », in the menu: the settings, at the company's name. */
  onRename: () => void;
  /** The monthly series (§19.2, A14 T2): the month selector, a past month read only or corrected, the next month. */
  series?: SeriesControls;
  /** The engines of the device (§19.1.5, A14 T5): switched and added from the menu, one deleted from « Fichier ». */
  engines?: EngineControls;
  /** « Saisie en tableau » (§19.6, A14 T5): the template's download, and the pasted table written in one go. */
  onTemplate?: () => void;
  onApplyTable?: (preview: TablePreview) => boolean;
}) {
  const { strings, state, ctx, derived } = view;
  // A past month on screen (§19.2.4): read only — no « Et si », no entry, no file actions — unless it is being corrected.
  const past = series ? series.shown !== series.months.length - 1 : false;
  const readOnly = past && !series?.correcting;
  // Opened from the menu (« Saisie en tableau »): the person asked for the move.
  const [tableOpen, setTableOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const next = boardNextStep(view, plan, writeFailed, past);
  const slidesNext = next.kind === "slides";
  const reveal = (id: string) =>
    requestAnimationFrame(() => {
      const summary = document.querySelector<HTMLElement>(`#${id} > summary`);
      summary?.focus();
      summary?.scrollIntoView({ block: "start" });
    });
  const { plg: hasPlg, slg: hasSlg } = state.setup.motions;
  const hybrid = hasPlg && hasSlg;
  const motion: Motion = hybrid ? (motionView ?? "plg") : hasPlg ? "plg" : "slg";
  const plgD = derived.motions.find((m): m is PlgDerived => m.motion === "plg");
  const slgD = derived.motions.find((m): m is SlgDerived => m.motion === "slg");

  // The diagnosis prints each named stage's value next to its comparator; the Diagnosis
  // object carries positions, not values. knownIn — the same reading the rows make.
  const candidateValues: Partial<Record<CandidateId, Interval>> = {};
  for (const id of [...candidatesOf("plg"), ...candidatesOf("slg")]) {
    const known = knownIn(state, id, ctx);
    if (known.kind === "known") candidateValues[id] = known.value;
  }
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  // « Sur 25 opportunités conclues, un de plus ou de moins bouge le taux de 4 points » — the finding's own sentence.
  const smallSample = derived.findings.find((f) => f.kind === "small-sample" && f.motion === "slg");
  const smallSampleText = smallSample ? findingText(smallSample, state, strings, view.metrics, view.derivedCopy, ctx.locale) : null;

  const pelotonOf = (compact: boolean) => (
    <Peloton
      peloton={plgD?.peloton ?? derived.peloton}
      strings={strings}
      locale={ctx.locale}
      cohortMonth={snapshot.cohortMonth}
      paidWindowDays={state.setup.paidWindowDays}
      diagnosis={plgD?.diagnosis ?? derived.diagnosis}
      cohortSignups={knownSharedCount(snapshot, "cohortSignups")?.value ?? null}
      compact={compact}
      title={strings.board.pelotonTitle}
    />
  );
  const relaysOf = (compact: boolean) =>
    slgD ? <Relays relays={slgD.relays} state={state} strings={strings} locale={ctx.locale} diagnosis={slgD.diagnosis} compact={compact} /> : null;

  // One lever first (design system extension 07, A18 T2.c); « Les {n} leviers » opens the full panel, as it was.
  const whatIf = (
    <>
      <BoardLever
        view={view}
        motion={motion}
        hybrid={hybrid}
        onChange={actions.setWhatIf}
        onAll={() => {
          setWhatIfOpen(true);
          reveal("engine-whatif-full");
        }}
      />
      <Disclosure summary={strings.lever.panel} open={whatIfOpen} onOpenChange={setWhatIfOpen} id="engine-whatif-full" data-testid="engine-board-whatif">
        <div className={styles.whatIf}>
          {motion === "plg" ? <WhatIfPanel view={view} onChange={actions.setWhatIf} /> : <SlgWhatIfPanel view={view} onChange={actions.setWhatIf} />}
        </div>
      </Disclosure>
    </>
  );
  const numbers = <BoardNumbers view={view} motion={motion} readOnly={readOnly} onOpen={actions.openMetric} />;

  // One engine's diagnosis and drawing: the board of a single motion, and the hybrid's engine shown (A18 T5).
  const slgBody = slgD ? (
    <>
      <Diagnosis diagnosis={slgD.diagnosis} strings={strings} locale={ctx.locale} metrics={view.metrics} values={candidateValues} previous={previousLeakLine(view, "slg")} />
      {/* The money, right after the diagnosis, then « Et si ? » under it (design system extension 09, C54). */}
      <BoardMoney view={view} motion="slg" hybrid={hybrid} />
      {past ? null : whatIf}
      <Card elevation="raised" className={styles.pelotonCard} data-testid="engine-board-relays">
        {relaysOf(false)}
        {/* Keyed by the month: a past month read on its own shows its own open pipeline (§19.2.4). */}
        <PipelineBand key={snapshot.id} view={view} actions={actions} readOnly={readOnly} />
      </Card>
      {/* In the hybrid, the caveat sits right under « Moteur affiché » instead (the return). */}
      {!hybrid && smallSampleText ? (
        <Callout tone="caveat" data-testid="engine-small-sample">
          <p>{smallSampleText}</p>
        </Callout>
      ) : null}
    </>
  ) : null;
  const plgBody = (
    <>
      <Diagnosis
        diagnosis={plgD?.diagnosis ?? derived.diagnosis}
        strings={strings}
        locale={ctx.locale}
        metrics={view.metrics}
        values={candidateValues}
        previous={previousLeakLine(view, "plg")}
      />
      {/* The money, right after the diagnosis (design system extension 09, C54): flat, so the peloton stays the one raised card.
          Then « Et si ? », moved up under it: move a lever, watch the ARR move right under the money. */}
      <BoardMoney view={view} motion="plg" hybrid={hybrid} />
      {past ? null : whatIf}
      {/* The screen's one raised card (Card's own rule): the peloton is what the board is about. */}
      <Card elevation="raised" className={styles.pelotonCard} data-testid="engine-board-peloton">
        {pelotonOf(false)}
      </Card>
      {(plgD?.peloton ?? derived.peloton).smallCohort ? (
        <Callout tone="caveat" data-testid="engine-small-cohort">
          <p>{strings.board.smallCohort}</p>
        </Callout>
      ) : null}
    </>
  );

  return (
    <div className={styles.board} data-testid="engine-board" data-motions={hybrid ? "hybrid" : motion}>
      <header className={styles.head}>
        <BoardBar
          view={view}
          series={series}
          engines={engines}
          past={past}
          correcting={Boolean(series?.correcting)}
          onSettings={onSettings}
          onRename={onRename}
          onSave={onSave}
          onImport={onImport}
          onErase={onErase}
          onTable={
            !past && onTemplate && onApplyTable
              ? () => {
                  setTableOpen(true);
                  reveal("engine-table");
                }
              : undefined
          }
        />
        {/* The hybrid's verdict is the total band's title. What is found, the list says (« Tes chiffres »). */}
        {hybrid ? null : <Verdict title={verdict} strings={strings} />}
      </header>

      {hybrid && plgD && slgD ? <TotalBand view={view} verdict={verdict} /> : null}

      <BoardNextStep
        choice={next}
        view={view}
        actions={actions}
        plan={plan}
        returningFrom={returningFrom}
        openedAt={openedAt}
        series={series}
        past={past}
        correcting={Boolean(series?.correcting)}
        onSave={onSave}
        onDeck={onDeck}
        onRequests={onRequests}
      />

      {hybrid && plgD && slgD ? (
        <>
          {/* « Moteur affiché » (A18 T5, the return's TotalBand): one engine's board at a time, never two columns —
              self-serve first, the order fixed whatever the values. */}
          <div className={styles.motionSelector} data-testid="engine-motion-selector">
            <Field group label={strings.hybrid.selectorLabel}>
              {({ labelId }) => (
                <Segmented<Motion>
                  labelledBy={labelId}
                  value={motion}
                  options={[
                    { id: "plg", label: strings.hybrid.motionName.plg },
                    { id: "slg", label: strings.hybrid.motionName.slg },
                  ]}
                  onChange={onMotion}
                />
              )}
            </Field>
          </div>
          {/* The small-sample caveat, under « Moteur affiché » when sales-assisted is shown (the return). */}
          {motion === "slg" && smallSampleText ? (
            <Callout tone="caveat" data-testid="engine-small-sample">
              <p>{smallSampleText}</p>
            </Callout>
          ) : null}
          <p className={styles.twoSegments} data-testid="engine-two-segments">
            {strings.hybrid.twoEngines}
          </p>
          {/* The engine's own verdict: its deck's own slide title (`pelotonTitle`, `relaysTitle`), the stencil's size. */}
          <Verdict
            title={motion === "plg" ? pelotonTitle(state, plgD.peloton, strings, view.metrics, ctx) : relaysTitle(state, slgD.relays, strings, view.metrics, ctx)}
            strings={strings}
            id="engine-motion-verdict"
          />
          {motion === "slg" ? slgBody : plgBody}
          {numbers}
        </>
      ) : motion === "slg" && slgD ? (
        <>
          {slgBody}
          {numbers}
        </>
      ) : (
        <>
          {plgBody}
          {numbers}
        </>
      )}

      {/* Declared × measured (§8.5): the linked Tour's mirror, or "that Tour is gone" when its
          result left the device; a Tour here and no link — taken after the engine was started, or
          unticked by mistake — offers to link it (C8, 2026-09-29); with no Tour at all, the
          invitation to take one. */}
      {state.tourLink ? (
        <Mirror
          mirror={derived.mirror}
          gone={derived.mirror === null}
          strings={strings}
          locale={ctx.locale}
          bridges={view.bridges}
          metrics={view.metrics}
          derived={view.derivedCopy}
        />
      ) : view.deviceTour ? (
        <Mirror
          mirror={null}
          unlinked={{
            takenAt: view.deviceTour.createdAt,
            total: view.deviceTour.total ?? null,
            onLink: () => actions.linkTour(view.deviceTour!.id),
          }}
          strings={strings}
          locale={ctx.locale}
          bridges={view.bridges}
          metrics={view.metrics}
          derived={view.derivedCopy}
        />
      ) : (
        <Mirror mirror={null} strings={strings} locale={ctx.locale} bridges={view.bridges} metrics={view.metrics} derived={view.derivedCopy} />
      )}

      {/* « À aller chercher » left the board with A18 T3.c: the requests are one screen (AskList), the rest is « Tes chiffres ». */}
      {/* A table also corrects what was typed (§19.6). Opened from the menu. */}
      {!past && onTemplate && onApplyTable ? (
        <TableEntry view={view} onTemplate={onTemplate} onApply={onApplyTable} open={tableOpen} onOpenChange={setTableOpen} id="engine-table" />
      ) : null}

      {/* The slides, quietly, while they are not the next step: then the next step carries them as its primary. */}
      {past || slidesNext ? null : (
        <div className={styles.slidesQuiet}>
          <Button variant="quiet" onClick={onDeck} data-testid="engine-open-deck">
            {strings.next.slidesQuiet}
          </Button>
        </div>
      )}
    </div>
  );
}
