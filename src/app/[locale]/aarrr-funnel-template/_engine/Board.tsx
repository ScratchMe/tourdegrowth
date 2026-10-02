"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Disclosure } from "@/components/core/Disclosure";
import { Field } from "@/components/core/Field";
import { Segmented } from "@/components/core/Segmented";
import { candidatesOf, shapeOf } from "@/lib/engine/catalog-shape";
import { periodRangeOf } from "@/lib/engine/cohort";
import { totalIn12 } from "@/lib/engine/deck-motions";
import { formatMonthRange } from "@/lib/engine/format";
import { findingText } from "@/lib/engine/sentences";
import type { CandidateId, Interval, MetricId, Motion, MotionDerived, SlideTitle } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import type { Pillar } from "@/lib/scoring/pillars";
import { BackupBar } from "./BackupBar";
import type { CollectPlan } from "./collect";
import { CollectHub } from "./CollectHub";
import { Coverage } from "./Coverage";
import { Diagnosis } from "./Diagnosis";
import { Mirror } from "./Mirror";
import { Peloton } from "./Peloton";
import { Relays } from "./Relays";
import { MonthBar, NextMonthBand, type SeriesControls } from "./MonthBar";
import { ResumeBand } from "./ResumeBand";
import { previousLeakLine } from "./series-view";
import { SlgWhatIfPanel } from "./SlgWhatIfPanel";
import { defaultStage } from "./stage-tabs";
import { StageTabs } from "./StageTabs";
import type { TablePreview } from "./csv";
import { TableEntry } from "./TableEntry";
import { fill, formatMonth } from "./text";
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
 * bottom: the eyebrow with the settings and the way back to the steps, the
 * verdict title (the board's h2 and its focus target), the coverage in
 * fractions, the diagnosis, the funnel in the screen's one raised card, the
 * five stages as a menu with one panel of folded numbers under it
 * (`StageTabs`), « et si », the declared × measured mirror, what is left to
 * go and get (folded), then the actions and the backup band.
 *
 * Three layouts, by the motions the setup ticked (A7.3.c S3, §18.7):
 * - **self-serve alone**: the v1 board, unchanged to the character;
 * - **sales-assisted alone**: the same board, the relays in place of the
 *   peloton, its own diagnosis, tabs and « et si »;
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
  selected,
  onSelect,
  panelSeq,
  focusMetric,
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
  series,
  switcher,
  onTemplate,
  onApplyTable,
}: {
  view: EngineView;
  actions: EngineActions;
  verdict: SlideTitle;
  plan: CollectPlan;
  selected: Pillar | null;
  onSelect: (stage: Pillar) => void;
  /** Bumped when a number is opened from elsewhere, so the stage panel remounts with that number open. */
  panelSeq: number;
  focusMetric: MetricId | null;
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
  /** The monthly series (§19.2, A14 T2): the month selector, a past month read only or corrected, the next month. */
  series?: SeriesControls;
  /** « Moteur : {nom} », the engines of the device (§19.1.5, A14 T5), at the head of the board. */
  switcher?: ReactNode;
  /** « Saisie en tableau » (§19.6, A14 T5): the template's download, and the pasted table written in one go. */
  onTemplate?: () => void;
  onApplyTable?: (preview: TablePreview) => boolean;
}) {
  const { strings, state, ctx, derived } = view;
  // A past month on screen (§19.2.4): read only — no « Et si », no entry, no file actions — unless it is being corrected.
  const past = series ? series.shown !== series.months.length - 1 : false;
  const readOnly = past && !series?.correcting;
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
  // Nobody chose yet: the tab the diagnosis names, PINNED when the board mounts — one per motion. Recomputed
  // on every render, it would jump under a person's hands the moment a save moved the diagnosis or filled a
  // stage's last number — and take the sheet they were typing in with it.
  const [initialStages] = useState<Record<Motion, Pillar>>(() => ({
    plg: defaultStage(snapshot, plgD?.diagnosis ?? derived.diagnosis, "plg"),
    slg: slgD ? defaultStage(snapshot, slgD.diagnosis, "slg") : "acquisition",
  }));
  const current = selected ?? initialStages[motion];

  // Sales-assisted alone reads three months of flows (C25 Q2): its eyebrow says which. The hybrid's, the flows' month.
  const flows = periodRangeOf(shapeOf("slg.rev.win-rate"), undefined, snapshot, state.setup, ctx.today);
  const eyebrow = !hasSlg
    ? fill(strings.board.eyebrow, {
        model: strings.workbench.modelShort.selfserve,
        cohort: formatMonth(snapshot.cohortMonth, ctx.locale),
        month: formatMonth(snapshot.referenceMonth, ctx.locale),
      })
    : fill(strings.board.eyebrowNoCohort, {
        model: hybrid ? strings.workbench.modelShort.hybrid : strings.workbench.modelShort.salesAssisted,
        month: hybrid || !flows ? formatMonth(snapshot.referenceMonth, ctx.locale) : formatMonthRange(flows, ctx.locale, strings.units),
      });

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

  const whatIf = (
    <Disclosure summary={strings.board.whatIfTitle} data-testid="engine-board-whatif">
      <div className={styles.whatIf}>
        {motion === "plg" ? <WhatIfPanel view={view} onChange={actions.setWhatIf} /> : <SlgWhatIfPanel view={view} onChange={actions.setWhatIf} />}
      </div>
    </Disclosure>
  );
  const tabs = (
    <StageTabs
      view={view}
      actions={actions}
      current={current}
      onSelect={onSelect}
      panelKey={`${current}:${panelSeq}`}
      focusMetric={focusMetric}
      motion={motion}
      readOnly={readOnly}
    />
  );

  return (
    <div className={styles.board} data-testid="engine-board" data-motions={hybrid ? "hybrid" : motion}>
      <header className={styles.head}>
        {switcher}
        <div className={styles.eyebrowRow}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <div className={styles.headActions}>
            <Button variant="quiet" onClick={onSteps} data-testid="engine-open-steps">
              {strings.board.steps}
            </Button>
            <Button variant="quiet" onClick={onSettings} data-testid="engine-open-settings">
              {strings.board.settings}
            </Button>
          </div>
        </div>
        {/* The hybrid's verdict is the total band's title; its coverage, each column's own. */}
        {hybrid ? null : (
          <>
            <Verdict title={verdict} strings={strings} />
            <Coverage coverage={derived.coverage} strings={strings} />
          </>
        )}
      </header>

      {writeFailed ? (
        <p className={styles.writeFailed} role="alert" data-testid="engine-write-failed">
          {strings.storage.writeFailed}
        </p>
      ) : null}

      {series ? <MonthBar series={series} strings={strings} /> : null}
      {series && !past ? <NextMonthBand next={series.next} onStart={series.onStart} onRemind={series.onRemind} strings={strings} /> : null}

      {returningFrom && !past ? <ResumeBand returningFrom={returningFrom} plan={plan} view={view} actions={actions} /> : null}

      {hybrid && plgD && slgD ? (
        <>
          <TotalBand view={view} verdict={verdict} />
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
          {tabs}
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
          {tabs}
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

          {tabs}

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
        <Disclosure summary={fill(strings.board.collectTitle, { n: plan.count })} data-testid="engine-collect-disclosure">
          <CollectHub plan={plan} view={view} actions={actions} />
        </Disclosure>
      ) : null}

      {/* Beside the collection, even once it is done: a table also corrects what was typed (§19.6). */}
      {!past && onTemplate && onApplyTable ? <TableEntry view={view} onTemplate={onTemplate} onApply={onApplyTable} /> : null}

      {past ? null : (
        <div className={styles.actions} data-testid="engine-actions">
          <Button onClick={onDeck} data-testid="engine-open-deck">
            {strings.actions.deck}
          </Button>
          <Button variant="secondary" onClick={onSave} data-testid="engine-save-json">
            {strings.actions.save}
          </Button>
          <Button variant="quiet" onClick={onImport} data-testid="engine-import-open-screen">
            {strings.actions.import}
          </Button>
          <Button variant="quiet" onClick={onErase} data-testid="engine-erase-open">
            {strings.actions.erase}
          </Button>
        </div>
      )}

      <BackupBar state={state} strings={strings} locale={ctx.locale} onSave={onSave} />
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
