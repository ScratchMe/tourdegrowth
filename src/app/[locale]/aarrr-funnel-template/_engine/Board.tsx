"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Disclosure } from "@/components/core/Disclosure";
import { Field } from "@/components/core/Field";
import { Segmented } from "@/components/core/Segmented";
import { candidatesOf } from "@/lib/engine/catalog-shape";
import { totalIn12 } from "@/lib/engine/deck-motions";
import { findingText } from "@/lib/engine/sentences";
import type { CandidateId, Interval, Motion, MotionDerived, SlideTitle } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import { BoardBar, BoardNextStep, boardNextStep, type EngineControls, type SeriesControls } from "./BoardHead";
import type { CollectPlan } from "./collect";
import { CollectHub } from "./CollectHub";
import { Diagnosis } from "./Diagnosis";
import { Mirror } from "./Mirror";
import { Peloton } from "./Peloton";
import { Relays } from "./Relays";
import { previousLeakLine } from "./series-view";
import { SlgWhatIfPanel } from "./SlgWhatIfPanel";
import { BoardLever } from "./BoardLever";
import { BoardNumbers } from "./BoardNumbers";
import type { TablePreview } from "./csv";
import { TableEntry } from "./TableEntry";
import { fill } from "./text";
import { MotionColumns } from "./MotionColumns";
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
 * connais l'outil » (Antoine, 2026-09-25), next to the step-by-step. Top to
 * bottom (design system extension 07, A18 T2.a): the engine bar (what is on
 * screen, the settings, and the menu that holds the engines, the month and
 * the file), the verdict title (the board's h2 and its focus target), the
 * coverage in fractions, the next step — the screen's one primary — then
 * the diagnosis, the funnel in the screen's one raised card, the five
 * numbers, every stage in one list whose rows open each number's screen
 * (`BoardNumbers`, A18 T2.b),
 * « et si », the declared × measured mirror, what is left to go and get
 * (folded), the table entry (folded, opened from the menu), and the slides
 * as a quiet link while they are not the next step.
 *
 * Three layouts, by the motions the setup ticked (A7.3.c S3, §18.7):
 * - **self-serve alone**: the v1 board, unchanged to the character;
 * - **sales-assisted alone**: the same board, the relays in place of the
 *   peloton, its own diagnosis, list and « et si »;
 * - **the hybrid**, « deux moteurs, un total »: the total band (the verdict
 *   is its title), then the two motions side by side — coverage, diagnosis,
 *   compact funnel — in the fixed order, never by value; a selector picks
 *   whose stages and « et si » show below; the MRR in twelve months of both
 *   stays under the panel whichever is picked.
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
  writeFailed,
  motionView,
  onMotion,
  onDeck,
  onSave,
  onImport,
  onErase,
  onSettings,
  onSteps,
  onRename,
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
  writeFailed: boolean;
  /** The hybrid's selector (§18.7): whose stages and « et si » show. null: the default — self-serve. */
  motionView: Motion | null;
  onMotion: (motion: Motion) => void;
  onDeck: () => void;
  onSave: () => void;
  onImport: () => void;
  onErase: () => void;
  onSettings: () => void;
  onSteps: () => void;
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
  // Opened from the next step (« Copier tes {n} demandes ») and from the menu (« Saisie en tableau »): the person asked for the move.
  const [collectOpen, setCollectOpen] = useState(false);
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
          onSteps={onSteps}
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
        series={series}
        past={past}
        correcting={Boolean(series?.correcting)}
        onSave={onSave}
        onDeck={onDeck}
        onRequests={() => {
          setCollectOpen(true);
          reveal("engine-collect");
        }}
      />

      {hybrid && plgD && slgD ? (
        <>
          <MotionColumns view={view} actions={actions} readOnly={readOnly} />
          {smallSampleText ? (
            <Callout tone="caveat" data-testid="engine-small-sample">
              <p>{smallSampleText}</p>
            </Callout>
          ) : null}

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
          {numbers}
          {past ? null : whatIf}
          <TotalIn12 view={view} />
        </>
      ) : motion === "slg" && slgD ? (
        <>
          <Diagnosis diagnosis={slgD.diagnosis} strings={strings} locale={ctx.locale} metrics={view.metrics} values={candidateValues} previous={previousLeakLine(view, "slg")} />
          <Card elevation="raised" className={styles.pelotonCard} data-testid="engine-board-relays">
            {relaysOf(false)}
            {/* Keyed by the month: a past month read on its own shows its own open pipeline (§19.2.4). */}
            <PipelineBand key={snapshot.id} view={view} actions={actions} readOnly={readOnly} />
          </Card>
          {smallSampleText ? (
            <Callout tone="caveat" data-testid="engine-small-sample">
              <p>{smallSampleText}</p>
            </Callout>
          ) : null}
          {numbers}
          {past ? null : whatIf}
        </>
      ) : (
        <>
          <Diagnosis diagnosis={derived.diagnosis} strings={strings} locale={ctx.locale} metrics={view.metrics} values={candidateValues} previous={previousLeakLine(view, "plg")} />
          {/* The screen's one raised card (Card's own rule): the peloton is what the board is about. */}
          <Card elevation="raised" className={styles.pelotonCard} data-testid="engine-board-peloton">
            {pelotonOf(false)}
          </Card>

          {derived.peloton.smallCohort ? (
            <Callout tone="caveat" data-testid="engine-small-cohort">
              <p>{strings.board.smallCohort}</p>
            </Callout>
          ) : null}

          {numbers}

          {/* Folded on the board: the funnel it redraws is the one just above, and a
              second full funnel open by default made the longest page of the site
              longer (Antoine, 2026-09-25). The step-by-step shows it open. */}
          {past ? null : whatIf}
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

      {plan.count > 0 && !past ? (
        <Disclosure
          summary={fill(strings.board.collectTitle, { n: plan.count })}
          open={collectOpen}
          onOpenChange={setCollectOpen}
          id="engine-collect"
          data-testid="engine-collect-disclosure"
        >
          <CollectHub plan={plan} view={view} actions={actions} />
        </Disclosure>
      ) : null}

      {/* Beside the collection, even once it is done: a table also corrects what was typed (§19.6). Opened from the menu. */}
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

/**
 * The hybrid's one line under the « et si » panel, whichever motion it shows
 * (§18.5.5): the total MRR in twelve months, today and with the what-ifs of
 * both panels. A sum, not a comparison. Nothing when either motion can't
 * project its MRR — a partial total is no total (S9).
 */
function TotalIn12({ view }: { view: EngineView }) {
  const { strings, state, ctx } = view;
  const line = totalIn12(state, strings, ctx);
  if (!line) return null;
  const value = line.projected ? fill(strings.scenario.totalIn12Row, { today: line.today, projected: line.projected }) : line.today;
  return (
    <p className={styles.twoSegments} data-testid="engine-total-in12">
      <strong>{strings.scenario.totalIn12}</strong> · {value}
    </p>
  );
}
