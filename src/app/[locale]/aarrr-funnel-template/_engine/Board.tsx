"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Card } from "@/components/core/Card";
import { Disclosure } from "@/components/core/Disclosure";
import { CANDIDATE_IDS } from "@/lib/engine/catalog-shape";
import type { CandidateId, Interval, MetricId, SlideTitle } from "@/lib/engine/types";
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
import { ResumeBand } from "./ResumeBand";
import { defaultStage } from "./stage-tabs";
import { StageTabs } from "./StageTabs";
import { fill, formatMonth } from "./text";
import { Verdict } from "./Verdict";
import type { EngineActions, EngineView } from "./view";
import { WhatIfPanel } from "./WhatIfPanel";
import styles from "./Board.module.css";

/**
 * The board (spec §7 E2) — « la façon que tu as actuellement, quand tu
 * connais l'outil » (Antoine, 2026-09-25), next to the step-by-step. Top to
 * bottom: the eyebrow with the settings and the way back to the steps, the
 * verdict title (the board's h2 and its focus target), the coverage in
 * fractions, the diagnosis, the peloton in the screen's one raised card, the
 * five stages as a menu with one panel of folded numbers under it
 * (`StageTabs`), « et si » on the whole funnel, the
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
  panelSeq,
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
  onSelect: (stage: Pillar) => void;
  /** Bumped when a number is opened from elsewhere, so the stage panel remounts with that number open. */
  panelSeq: number;
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
  // Nobody chose yet: the tab the diagnosis names, PINNED when the board mounts. Recomputed on
  // every render, it would jump under a person's hands the moment a save moved the diagnosis
  // or filled a stage's last number — and take the sheet they were typing in with it.
  const [initialStage] = useState(() => defaultStage(snapshot, derived.diagnosis));
  const current = selected ?? initialStage;

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

          <StageTabs
            view={view}
            actions={actions}
            current={current}
            onSelect={onSelect}
            panelKey={`${current}:${panelSeq}`}
            focusMetric={focusMetric}
          />

          {/* Folded on the board: the funnel it redraws is the one just above, and a
              second full funnel open by default made the longest page of the site
              longer (Antoine, 2026-09-25). The step-by-step shows it open. */}
          <Disclosure summary={strings.board.whatIfTitle} data-testid="engine-board-whatif">
            <div className={styles.whatIf}>
              <WhatIfPanel view={view} onChange={actions.setWhatIf} />
            </div>
          </Disclosure>

          {/* Declared × measured (§8.5): the linked Tour's mirror, or "that Tour is gone" when its
              result left the device; a Tour here and no link — taken after the engine started, or
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
