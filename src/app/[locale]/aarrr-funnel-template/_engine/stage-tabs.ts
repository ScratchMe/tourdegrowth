import { METRIC_SHAPES, metricsOfStage, shapeOf } from "@/lib/engine/catalog-shape";
import type { Diagnosis, MetricId, Snapshot } from "@/lib/engine/types";
import { statusOf } from "@/lib/engine/values";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { pillOf, type PillKind } from "./keys";

/**
 * The board's stage menu (Antoine, 2026-09-26: « le menu acquisition,
 * activation, etc. en horizontal ») — pure, so what each tab says and which
 * one opens first are unit-tested rather than read off a screenshot.
 *
 * A tab says what the old stage row's three pills said: one mark per number
 * of the stage, ★ first, and how many are FOUND out of those that apply —
 * "found" in the coverage line's sense (measured only: an estimate is
 * approximate, not found), so the five tabs add up to the line above them.
 */
export interface StageTab {
  stage: Pillar;
  /** One per number of the stage, in panel order (★ first). */
  marks: { id: MetricId; kind: PillKind }[];
  /** Measured numbers — the coverage line's "found". */
  found: number;
  /** The stage's numbers minus "not applicable" — the coverage line's denominator, per stage. */
  applicable: number;
  /** The diagnosis names one of this stage's numbers (`clear` or `shared`). */
  named: boolean;
}

/**
 * The stages the diagnosis names. Only `clear` and `shared` name anything —
 * the rule `Diagnosis` and the peloton's stamp follow: red is a diagnosis,
 * and neither `level` nor `not-enough` is one. ANY number of the stage
 * counts, not just its ★: churn is a candidate, and a diagnosis naming it
 * names the retention stage.
 */
export function namedStages(diagnosis: Diagnosis): ReadonlySet<Pillar> {
  const named = diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : [];
  return new Set(named.map((id) => shapeOf(id).stage));
}

export function stageTabs(snapshot: Snapshot, diagnosis: Diagnosis): StageTab[] {
  const named = namedStages(diagnosis);
  return PILLARS.map((stage) => {
    const marks = metricsOfStage(stage).map((shape) => ({ id: shape.id, kind: pillOf(statusOf(snapshot.metrics[shape.id])) }));
    return {
      stage,
      marks,
      found: marks.filter((m) => m.kind === "found").length,
      applicable: marks.filter((m) => m.kind !== "notApplicable").length,
      named: named.has(stage),
    };
  });
}

/**
 * The tab the board opens on when nobody chose (§7 E2): the stage the
 * diagnosis names, else the first stage with a number still to fill, else
 * acquisition.
 */
export function defaultStage(snapshot: Snapshot, diagnosis: Diagnosis): Pillar {
  const named = namedStages(diagnosis);
  const byDiagnosis = PILLARS.find((stage) => named.has(stage));
  if (byDiagnosis) return byDiagnosis;
  const firstTodo = METRIC_SHAPES.find((shape) => statusOf(snapshot.metrics[shape.id]) === "todo");
  return firstTodo?.stage ?? "acquisition";
}

/**
 * The WAI-ARIA tabs pattern's keys on a horizontal tab list: Left and Right
 * move to the previous and next tab and wrap around, Home and End go to the
 * ends. Any other key is not the tab list's (null), so Tab still leaves it.
 */
export function stageForKey(current: Pillar, key: string): Pillar | null {
  const i = PILLARS.indexOf(current);
  switch (key) {
    case "ArrowRight":
      return PILLARS[(i + 1) % PILLARS.length]!;
    case "ArrowLeft":
      return PILLARS[(i - 1 + PILLARS.length) % PILLARS.length]!;
    case "Home":
      return PILLARS[0];
    case "End":
      return PILLARS[PILLARS.length - 1]!;
    default:
      return null;
  }
}
