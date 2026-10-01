import type { EngineState, YearMonth } from "./types";
import { currentSnapshot } from "./values";

/**
 * pipeline.ts — sales-assisted pipeline coverage (engine spec §19.4, C32 Q8,
 * A14 T3.2): the quarter's open pipeline against the quarter's target of new
 * contracts, both in ACV.
 *
 * A leading indicator on the relays, and nothing more: never a sixteenth
 * number, never a stage the diagnosis can name, never priced in money,
 * never set against a published reference (C1) — the « 3× à 6× » of the
 * audit is no target of anyone's. Only the team's own threshold, when it
 * typed one, says « below ».
 *
 * Two numbers the team types: the open pipeline each month
 * (`snapshot.pipelineOpen`), the quarter's target once (`setup.pipeline`).
 * Without both, there is no coverage. A month read on its own (`monthView`)
 * reads its own open pipeline, so a past month keeps the coverage it had;
 * the month before's, when it had one, travels with it (§19.2).
 */

export interface PipelineCoverage {
  /** The quarter's open pipeline, in ACV, as typed this month. */
  open: number;
  /** The quarter's target of new contracts, in ACV (the setup's). */
  target: number;
  /** open ÷ target: 2.6 is « 2,6× l'objectif du trimestre ». */
  ratio: number;
  /** The team's threshold (2.5 = « 2,5× »), or null when none was typed. */
  threshold: number | null;
  /** A threshold exists and the coverage is under it. Never true without one. */
  below: boolean;
  /** The month before's coverage, on the same target, when it typed its open pipeline. */
  previous: { month: YearMonth; ratio: number } | null;
}

/** The coverage of the month the state reads, or null without the sales-assisted motion, an open pipeline or a target. */
export function pipelineCoverage(state: EngineState): PipelineCoverage | null {
  if (!state.setup.motions.slg) return null;
  const target = state.setup.pipeline?.quarterTarget;
  const open = currentSnapshot(state).pipelineOpen;
  if (target === undefined || !(target > 0) || open === undefined || !(open >= 0)) return null;
  const ratio = open / target;
  const threshold = state.setup.pipeline?.threshold;
  const before = state.snapshots.length > 1 ? state.snapshots[state.snapshots.length - 2]! : null;
  return {
    open,
    target,
    ratio,
    threshold: threshold !== undefined && threshold > 0 ? threshold : null,
    below: threshold !== undefined && threshold > 0 && ratio < threshold,
    previous: before?.pipelineOpen !== undefined && before.pipelineOpen >= 0 ? { month: before.referenceMonth, ratio: before.pipelineOpen / target } : null,
  };
}

/**
 * A coverage as a reader sees it: one decimal, « 2,6× » — never more precise
 * than the two numbers typed. `template` is the copy's `pipeline.ratio`, so
 * the sign is a reviewed word, not one the code writes.
 */
export function coverageText(ratio: number, format: (v: number) => string, template: string): string {
  return template.replace("{n}", format(Math.round(ratio * 10) / 10));
}
