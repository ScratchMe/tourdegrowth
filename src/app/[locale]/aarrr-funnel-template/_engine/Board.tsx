"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Segmented } from "@/components/core/Segmented";
import { METRIC_SHAPES, metricsOfStage } from "@/lib/engine/catalog-shape";
import type { MetricId, SlideTitle } from "@/lib/engine/types";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { BackupBar } from "./BackupBar";
import type { CollectPlan } from "./collect";
import { CollectHub } from "./CollectHub";
import { Coverage } from "./Coverage";
import { ResumeBand } from "./ResumeBand";
import { StageDrawer } from "./StageDrawer";
import { StageRow } from "./StageRow";
import { fill, formatMonth } from "./text";
import { Verdict } from "./Verdict";
import type { EngineActions, EngineView } from "./view";
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

export type BoardTab = "engine" | "collect";

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
 * The board (spec §7 E2), minus the peloton and the diagnosis — P5's —
 * whose slots are marked below so P7 can mount them without moving
 * anything else.
 *
 * Top to bottom: the eyebrow, the verdict title (the board's h2 and its
 * focus target), the coverage in fractions, the two tabs, then either the
 * five stage rows with their drawer or the collect plan, then the actions
 * and the backup band. On a phone the tabs sit under the coverage, as
 * everywhere else.
 */
export function Board({
  view,
  actions,
  verdict,
  plan,
  tab,
  onTab,
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
}: {
  view: EngineView;
  actions: EngineActions;
  verdict: SlideTitle;
  plan: CollectPlan;
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
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
}) {
  const { strings, state, ctx, derived } = view;
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
        <p className={styles.eyebrow}>{eyebrow}</p>
        <Verdict title={verdict} strings={strings} />
        <Coverage coverage={derived.coverage} strings={strings} />
        <Segmented
          className={styles.tabs}
          label={strings.workbench.tabsLabel}
          value={tab}
          options={[
            { id: "engine", label: strings.board.tabEngine },
            { id: "collect", label: fill(strings.board.tabCollect, { n: plan.count }) },
          ]}
          onChange={onTab}
        />
      </header>

      {writeFailed ? (
        <p className={styles.writeFailed} role="alert" data-testid="engine-write-failed">
          {strings.storage.writeFailed}
        </p>
      ) : null}

      {returningFrom ? <ResumeBand returningFrom={returningFrom} plan={plan} view={view} actions={actions} /> : null}

      {tab === "engine" ? (
        <>
          {/* P5 SLOT — Diagnosis (§8.4). P7 mounts Diagnosis.tsx here, between the tabs and the peloton. */}
          <div data-engine-slot="diagnosis" />
          {/* P5 SLOT — Peloton (§8.1), in a raised Card. P7 mounts Peloton.tsx here. */}
          <div data-engine-slot="peloton" />

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

          {/* P5 SLOT — Declared × measured (§8.5). P7 mounts Mirror.tsx here, under the stage rows. */}
          <div data-engine-slot="mirror" />
        </>
      ) : (
        <CollectHub plan={plan} view={view} actions={actions} />
      )}

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
