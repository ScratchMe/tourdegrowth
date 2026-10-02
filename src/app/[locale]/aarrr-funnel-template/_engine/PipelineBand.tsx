"use client";

import { useState } from "react";
import { NumberField } from "@/components/core/NumberField";
import { formatMonth, formatNumber } from "@/lib/engine/format";
import { isUnreadableNumber } from "@/lib/forms/number";
import { coverageText, pipelineCoverage } from "@/lib/engine/pipeline";
import { currentSnapshot } from "@/lib/engine/values";
import { moneyUnit } from "./sources";
import { fill } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Relays.module.css";

/**
 * Pipeline coverage under the relays (engine spec §19.4, C32 Q8, A14 T3.2):
 * « Couverture : 2,6× l'objectif du trimestre », « sous ton seuil de 3× »
 * when the team typed a threshold it doesn't hold, and the month before's.
 *
 * The open pipeline is typed here, each month, saved when the box is left
 * (as a target is, A15.2: a typo writes nothing); the quarter's target and
 * the threshold live in the Settings. A past month read on its own shows its
 * coverage and no box (`readOnly`). Without the target, one sentence says
 * where to add it — the coverage never borrows a published range (C1).
 */
export function PipelineBand({ view, actions, readOnly }: { view: EngineView; actions: EngineActions; readOnly?: boolean }) {
  const { state, strings, ctx } = view;
  const p = strings.pipeline;
  const stored = currentSnapshot(state).pipelineOpen;
  const [open, setOpen] = useState<number | null>(stored ?? null);
  if (!state.setup.motions.slg) return null;

  const coverage = pipelineCoverage(state);
  const ratio = (r: number) => coverageText(r, (v) => formatNumber(v, ctx.locale), p.ratio);
  const line = coverage
    ? coverage.below && coverage.threshold !== null
      ? fill(p.coverageBelow, { ratio: ratio(coverage.ratio), threshold: ratio(coverage.threshold) })
      : fill(p.coverage, { ratio: ratio(coverage.ratio) })
    : null;
  const previous = coverage?.previous ? fill(p.previous, { month: formatMonth(coverage.previous.month, ctx.locale), ratio: ratio(coverage.previous.ratio) }) : null;
  const noTarget = !state.setup.pipeline?.quarterTarget;
  if (readOnly && !line) return null;

  return (
    <div className={styles.pipeline} data-testid="engine-pipeline" data-below={coverage?.below ? "true" : undefined}>
      <p className={styles.pipelineTitle}>{p.title}</p>
      {line ? (
        <p className={styles.pipelineLine} data-testid="engine-pipeline-coverage">
          {line}
        </p>
      ) : null}
      {previous ? (
        <p className={styles.pipelinePrevious} data-testid="engine-pipeline-previous">
          {previous}
        </p>
      ) : null}
      {noTarget && !readOnly ? (
        <p className={styles.pipelinePrevious} data-testid="engine-pipeline-no-target">
          {p.noTarget}
        </p>
      ) : null}
      {readOnly ? null : (
        <NumberField
          size="sm"
          id="engine-pipeline-open"
          data-testid="engine-pipeline-open"
          label={p.openLabel}
          hint={p.openHint}
          optional={strings.workbench.optional}
          value={open}
          onChange={setOpen}
          onBlur={(event) => {
            if (isUnreadableNumber(event.target.value, ctx.locale)) return;
            if ((open ?? undefined) !== stored) actions.setPipelineOpen(open);
          }}
          locale={ctx.locale}
          {...moneyUnit(state.setup.currency, ctx.locale)}
          parseError={strings.workbench.notANumber}
        />
      )}
    </div>
  );
}
