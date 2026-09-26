"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Disclosure } from "@/components/core/Disclosure";
import { CANDIDATE_IDS, METRIC_SHAPES, metricsOfStage } from "@/lib/engine/catalog-shape";
import type { CandidateId, Interval, MetricId, SlideTitle } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { knownSharedCount } from "@/lib/engine/shared-counts";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { BackupBar } from "./BackupBar";
import type { CollectPlan } from "./collect";
import { CollectHub } from "./CollectHub";
import { Coverage } from "./Coverage";
import { Diagnosis } from "./Diagnosis";
import { Mirror } from "./Mirror";
import { Peloton } from "./Peloton";
import { ResumeBand } from "./ResumeBand";
import { StageDrawer } from "./StageDrawer";
import { StageRow } from "./StageRow";
import { fill, formatMonth } from "./text";
import { Verdict } from "./Verdict";
import type { EngineActions, EngineView } from "./view";
import { WhatIfPanel } from "./WhatIfPanel";
import styles from "./Board.module.css";

/**
 * The layout switch, in ONE place for CSS and script alike: from this width
 * the board breaks out of the reading column and the drawer becomes a
 * sticky side column (Board.module.css uses the same 960px). Below it the
 * drawer unfolds under its row.
 */
const WIDE_QUERY = "(min-width: 960px)";

function subscribeWide(callback: () => void) {
  const media = window.matchMedia(WIDE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** Where the wide drawer opens when nobody chose (§7 E2): the stage the diagnosis names, else the first with a number to fill. */
export function defaultStage(view: EngineView): Pillar {
  const named = view.derived.diagnosis.named;
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const byDiagnosis = PILLARS.find((stage) => named.includes(metricsOfStage(stage)[0]!.id as (typeof named)[number]));
  if (byDiagnosis) return byDiagnosis;
  const firstTodo = METRIC_SHAPES.find((s) => (snapshot.metrics[s.id]?.status ?? "todo") === "todo");
  return firstTodo?.stage ?? "acquisition";
}

/**
 * The board (spec §7 E2) — « la façon que tu as actuellement, quand tu
 * connais l'outil » (Antoine, 2026-09-25), next to the step-by-step. Top to
 * bottom: the eyebrow with the settings and the way back to the steps, the
 * verdict title (the board's h2 and its focus target), the coverage in
 * fractions, the diagnosis, the peloton in the screen's one raised card, the
 * five stage rows with their drawer, « et si » on the whole funnel, the
 * declared × measured mirror, what is left to go and get (folded — it used to
 * be a second tab, and two tabs on a long page was one navigation too many),
 * then the actions and the backup band.
 *
 * The four visuals are P5's components, fed here from the SAME derived object
 * the verdict and the slides read (`view.derived`): the diagnosis cannot name
 * a stage the peloton does not stamp.
 */
export function Board({
  view,
  actions,
  verdict,
  plan,
  selected,
  onSelect,
  drawerSeq,
  focusMetric,
  returningFrom,
  writeFailed,
  onDeck,
  onSave,
  onImport,
  onErase,
  onSettings,
  onSteps,
}: {
  view: EngineView;
  actions: EngineActions;
  verdict: SlideTitle;
  plan: CollectPlan;
  selected: Pillar | null;
  onSelect: (stage: Pillar | null) => void;
  /** Bumped when a number is opened from elsewhere, so the drawer remounts with that number open. */
  drawerSeq: number;
  focusMetric: MetricId | null;
  returningFrom: string | null;
  writeFailed: boolean;
  onDeck: () => void;
  onSave: () => void;
  onImport: () => void;
  onErase: () => void;
  onSettings: () => void;
  onSteps: () => void;
}) {
  const { strings, state, ctx, derived } = view;
  // The diagnosis prints each named stage's value next to its comparator; the Diagnosis
  // object carries positions, not values. knownIn — the same reading the rows make.
  const candidateValues: Partial<Record<CandidateId, Interval>> = {};
  for (const id of CANDIDATE_IDS) {
    const known = knownIn(state, id, ctx);
    if (known.kind === "known") candidateValues[id] = known.value;
  }
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE_QUERY).matches, () => false);
  const current = wide ? (selected ?? defaultStage(view)) : selected;

  const eyebrow = fill(strings.board.eyebrow, {
    model: strings.workbench.modelShort[state.setup.profile],
    cohort: formatMonth(snapshot.cohortMonth, ctx.locale),
    month: formatMonth(snapshot.referenceMonth, ctx.locale),
  });

  return (
    <div className={styles.board} data-testid="engine-board">
      <header className={styles.head}>
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
        <Verdict title={verdict} strings={strings} />
        <Coverage coverage={derived.coverage} strings={strings} />
      </header>

      {writeFailed ? (
        <p className={styles.writeFailed} role="alert" data-testid="engine-write-failed">
          {strings.storage.writeFailed}
        </p>
      ) : null}

      {returningFrom ? <ResumeBand returningFrom={returningFrom} plan={plan} view={view} actions={actions} /> : null}

      <>
          <Diagnosis diagnosis={derived.diagnosis} strings={strings} locale={ctx.locale} metrics={view.metrics} values={candidateValues} />
          {/* The screen's one raised card (Card's own rule): the peloton is what the board is about. */}
          <Card elevation="raised" className={styles.pelotonCard} data-testid="engine-board-peloton">
            <Peloton
              peloton={derived.peloton}
              strings={strings}
              locale={ctx.locale}
              cohortMonth={snapshot.cohortMonth}
              paidWindowDays={state.setup.paidWindowDays}
              diagnosis={derived.diagnosis}
              cohortSignups={knownSharedCount(snapshot, "cohortSignups")?.value ?? null}
            />
          </Card>

          {derived.peloton.smallCohort ? (
            <Callout tone="caveat" data-testid="engine-small-cohort">
              <p>{strings.board.smallCohort}</p>
            </Callout>
          ) : null}

          <div className={styles.stages} data-testid="engine-stages">
            {PILLARS.map((stage, i) => {
              const drawerId = `engine-drawer-${stage}`;
              return (
                <StageBlock
                  key={stage}
                  stage={stage}
                  index={i + 1}
                  open={current === stage}
                  drawerId={drawerId}
                  view={view}
                  actions={actions}
                  onToggle={() => onSelect(current === stage && !wide ? null : stage)}
                  onClose={wide ? undefined : () => onSelect(null)}
                  drawerKey={`${stage}:${drawerSeq}`}
                  focusMetric={focusMetric}
                />
              );
            })}
          </div>

          {/* Folded on the board: the funnel it redraws is the one just above, and a
              second full funnel open by default made the longest page of the site
              longer (Antoine, 2026-09-25). The step-by-step shows it open. */}
          <Disclosure summary={strings.board.whatIfTitle} data-testid="engine-board-whatif">
            <div className={styles.whatIf}>
              <WhatIfPanel view={view} />
            </div>
          </Disclosure>

          {/* Declared × measured (§8.5): the linked Tour's mirror, or "that Tour is gone" when its
              result left the device, or — with no Tour here at all — the invitation to take one.
              A Tour on the device the person chose not to link: nothing (their choice, D13). */}
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
          ) : !view.tourOnDevice ? (
            <Mirror mirror={null} strings={strings} locale={ctx.locale} bridges={view.bridges} metrics={view.metrics} derived={view.derivedCopy} />
          ) : null}
      </>

      {plan.count > 0 ? (
        <Disclosure summary={fill(strings.board.collectTitle, { n: plan.count })} data-testid="engine-collect-disclosure">
          <CollectHub plan={plan} view={view} actions={actions} />
        </Disclosure>
      ) : null}

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

      <BackupBar state={state} strings={strings} locale={ctx.locale} onSave={onSave} />
    </div>
  );
}

/** A row and, when it is the open one, its drawer right after it — the DOM order a keyboard user follows at every width. */
function StageBlock({
  stage,
  index,
  open,
  drawerId,
  view,
  actions,
  onToggle,
  onClose,
  drawerKey,
  focusMetric,
}: {
  stage: Pillar;
  index: number;
  open: boolean;
  drawerId: string;
  view: EngineView;
  actions: EngineActions;
  onToggle: () => void;
  onClose?: () => void;
  drawerKey: string;
  focusMetric: MetricId | null;
}) {
  const inStage = focusMetric && metricsOfStage(stage).some((s) => s.id === focusMetric) ? focusMetric : null;
  return (
    <>
      <StageRow
        stage={stage}
        index={index}
        state={view.state}
        diagnosis={view.derived.diagnosis}
        expanded={open}
        drawerId={drawerId}
        onToggle={onToggle}
        metrics={view.metrics}
        strings={view.strings}
        ctx={view.ctx}
      />
      {open ? (
        <StageDrawer
          key={drawerKey}
          id={drawerId}
          stage={stage}
          index={index}
          view={view}
          actions={actions}
          initiallyOpen={inStage}
          onClose={onClose}
        />
      ) : null}
    </>
  );
}
