import type { NumberStatus } from "@/components/engine/EngineProgress";
import { metricsOfStageIn, shapeOf, type SetupShapes } from "@/lib/engine/catalog-shape";
import type { AnyDiagnosis } from "@/lib/engine/phrases";
import { candidatesFor } from "@/lib/engine/scenario-of";
import type { CandidateId, EngineCalcContext, EngineState, Interval, MetricId, MetricStatus, Motion, Snapshot } from "@/lib/engine/types";
import { knownIn, statusOf } from "@/lib/engine/values";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";

/**
 * « Tes chiffres », the board's list of every number by stage (design system
 * extension 07, C41, A18 T2.b) — pure, so what each stage says, which one is
 * red and what remains are unit-tested rather than read off a screenshot.
 * It replaces the stage tabs (2026-09-26), and keeps what they said: one mark
 * per number, how many are FOUND out of those that apply — « found » in the
 * coverage line's sense (measured only: an estimate is not found) — and the
 * stage the diagnosis names.
 */

/** A number's answer as the list draws it. `na`: it doesn't apply — no mark, no count, a neutral tag. */
export type RowStatus = NumberStatus | "na";

export function rowStatusOf(status: MetricStatus): RowStatus {
  switch (status) {
    case "measured":
      return "found";
    case "estimated":
    case "conflicting":
      return "est";
    case "requested":
      return "asked";
    case "missing":
      return "cant";
    case "not-applicable":
      return "na";
    default:
      return "todo";
  }
}

export interface ListStage {
  stage: Pillar;
  /** The stage's numbers, in the catalogue's order (★ first), each with its answer. */
  rows: { id: MetricId; status: RowStatus }[];
  /** One mark per number that applies, in the rows' order. */
  marks: NumberStatus[];
  /** Measured numbers — the coverage line's « found ». */
  found: number;
  /** The stage's numbers minus « not applicable » — the coverage line's denominator, per stage. */
  applicable: number;
  /** The diagnosis names one of this stage's numbers (`clear` or `shared`): since C1, only a team target does. */
  holdsBack: boolean;
}

/**
 * The stages the diagnosis names. Only `clear` and `shared` name anything —
 * the rule `Diagnosis` and the peloton's stamp follow: red is a diagnosis,
 * and neither `level` nor `not-enough` is one. ANY number of the stage
 * counts, not just its ★: churn is a candidate, and a diagnosis naming it
 * names the retention stage.
 */
export function namedStages(diagnosis: AnyDiagnosis): ReadonlySet<Pillar> {
  const named = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];
  return new Set(named.map((id) => shapeOf(id).stage));
}

/**
 * The value of every candidate the setup's diagnosis positions, when known: what `Diagnosis` prints next to its comparator
 * (« 90 %, sous ta cible »). The candidates are the setup's own — an app's include the actives' retention (§21.5.4) —
 * for both motions, as the hybrid shows either.
 */
export function candidateValuesOf(state: EngineState, ctx: EngineCalcContext): Partial<Record<CandidateId, Interval>> {
  const values: Partial<Record<CandidateId, Interval>> = {};
  for (const id of [...candidatesFor(state.setup, "plg"), ...candidatesFor(state.setup, "slg")]) {
    const known = knownIn(state, id, ctx);
    if (known.kind === "known") values[id] = known.value;
  }
  return values;
}

/**
 * One motion's five stages (A7.3.c S3): its own numbers and its own diagnosis — the hybrid shows one motion's at a time.
 * `setup`: an app's self-serve lists its own numbers, the replaced and the hidden ones left out (§21.6.4, D3); absent,
 * the SaaS's, as before.
 */
export function listStages(snapshot: Snapshot, diagnosis: AnyDiagnosis, motion: Motion = "plg", setup?: SetupShapes): ListStage[] {
  const named = namedStages(diagnosis);
  return PILLARS.map((stage) => {
    const rows = metricsOfStageIn(stage, motion, setup).map((shape) => ({ id: shape.id, status: rowStatusOf(statusOf(snapshot.metrics[shape.id])) }));
    const marks = rows.flatMap((r) => (r.status === "na" ? [] : [r.status]));
    return {
      stage,
      rows,
      marks,
      found: marks.filter((m) => m === "found").length,
      applicable: marks.length,
      holdsBack: named.has(stage),
    };
  });
}

/** What remains, first (EngineProgress): the numbers with no answer, then the answers by kind. */
export interface ListProgress {
  remaining: number;
  found: number;
  est: number;
  asked: number;
  cant: number;
}

export function listProgress(stages: readonly ListStage[]): ListProgress {
  const marks = stages.flatMap((s) => s.marks);
  const count = (status: NumberStatus) => marks.filter((m) => m === status).length;
  return { remaining: count("todo"), found: count("found"), est: count("est"), asked: count("asked"), cant: count("cant") };
}
