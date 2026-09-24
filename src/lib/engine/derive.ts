import type { StoredResult } from "@/lib/quiz/storage";
import { buildMirror } from "./bridge";
import { coverage } from "./coverage";
import { diagnose } from "./diagnose";
import { findings } from "./findings";
import type { UnitWords } from "./format";
import { buildPeloton } from "./peloton";
import { sanityChecks } from "./sanity";
import type { ResolvedBridge } from "./strings";
import type { EngineCalcContext, EngineDerived, EngineState } from "./types";
import { unitEconomics } from "./unit-economics";
import { currentSnapshot } from "./values";

/**
 * derive.ts — everything the board renders, in one pass (engine spec §4.2).
 *
 * The derived shapes are computed on every render and NEVER stored: a
 * stored diagnosis is one that can disagree with the numbers it was drawn
 * from. One function composes them so the board, the slides and the text
 * export read the same object, in the same order the findings need it
 * (findings are built from the rest, so they come last).
 *
 * `words` (the `units` slice of the resolved copy) is an addition to the P0
 * contract: the sanity checks and the findings carry their placeholders
 * already formatted, and a range needs its "{lo} à {hi}" template.
 *
 * The mirror is only built for the Tour result the state is LINKED to (D13):
 * the island passes the most recent result with answers, and if the link
 * points elsewhere — or the result was cleared from the device — there is no
 * mirror, and the board says so.
 */
export function deriveEngine(
  state: EngineState,
  ctx: EngineCalcContext,
  tourResult: StoredResult | null,
  bridges: ResolvedBridge[],
  words: UnitWords,
): EngineDerived {
  const mirror =
    state.tourLink && tourResult && tourResult.id === state.tourLink.resultId ? buildMirror(state, tourResult, bridges) : null;
  const partial: Omit<EngineDerived, "findings"> = {
    coverage: coverage(currentSnapshot(state)),
    peloton: buildPeloton(state, ctx),
    diagnosis: diagnose(state, ctx),
    unit: unitEconomics(state, ctx),
    sanity: sanityChecks(state, ctx, words),
    mirror,
  };
  return { ...partial, findings: findings(state, partial, ctx, words) };
}
