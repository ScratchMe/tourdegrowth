import { CANDIDATE_IDS, METRIC_SHAPES, TEXT_LIMITS } from "@/lib/engine/catalog-shape";
import type { EngineAsk, EngineDerived, EngineState, MetricId, RepairScale, YearMonth } from "@/lib/engine/types";

/**
 * What the "What you're asking for" form starts from — engine spec §7 E5.
 * Pure, no copy, no clock: everything is read from the state and the
 * derived model, so the same engine always proposes the same ask.
 */

const REPAIR_ORDER: readonly RepairScale[] = ["meeting", "afternoon", "sprint", "quarter"];

/**
 * The missing numbers, cheapest to repair first, catalogue order breaking
 * ties. The first three are what "What to measure first" starts checked
 * with (§7 E5, EngineAsk.measureFirst): the argument a Head of Growth can
 * always make is the one that costs a meeting.
 */
export function missingByRepairCost(state: EngineState): MetricId[] {
  const entries = state.snapshots[0]?.metrics ?? {};
  return METRIC_SHAPES.map((shape, index) => ({ id: shape.id, index, repair: entries[shape.id]?.missing?.repair }))
    .filter((m): m is { id: MetricId; index: number; repair: RepairScale } =>
      entries[m.id]?.status === "missing" && m.repair !== undefined,
    )
    .sort((a, b) => REPAIR_ORDER.indexOf(a.repair) - REPAIR_ORDER.indexOf(b.repair) || a.index - b.index)
    .map((m) => m.id);
}

/**
 * The success metric and target the diagnosis already points at: the named
 * stage and the value its comparator sets — the team's target when there is
 * one, otherwise the low end of a designating reference (the most prudent
 * bound, the same one the "what if" starts from, §6.6-§6.7). Nothing when
 * the diagnosis names nothing: a suggested target without a named leak would
 * be the tool deciding for the user.
 */
export function suggestedSuccess(derived: EngineDerived): Pick<EngineAsk, "successMetric" | "successTarget"> {
  const { state, named, positions } = derived.diagnosis;
  if (state !== "clear" && state !== "shared") return {};
  const metric = named[0];
  if (!metric) return {};
  const comparator = positions[metric]?.comparator;
  if (!comparator) return { successMetric: metric };
  const target = comparator.kind === "target" || comparator.direction === "higher" ? comparator.lo : comparator.hi;
  return { successMetric: metric, successTarget: target };
}

/** An ask nobody has touched yet — the only one the defaults may be written into. */
export function isPristineAsk(ask: EngineAsk): boolean {
  return (
    ask.what.trim() === "" &&
    ask.bullets.every((b) => b.trim() === "") &&
    ask.measureFirst.length === 0 &&
    ask.successMetric === undefined &&
    ask.successTarget === undefined &&
    ask.cost === undefined &&
    ask.horizon === undefined
  );
}

/** The defaults for a pristine ask. Only the fields the engine can justify — never `what`, never a cost. */
export function askDefaults(state: EngineState, derived: EngineDerived): EngineAsk {
  return {
    ...state.deck.ask,
    ...suggestedSuccess(derived),
    measureFirst: missingByRepairCost(state).slice(0, TEXT_LIMITS.askMeasureFirst),
  };
}

/** The success metrics the form offers: the six rates a diagnosis can name (§6.6). */
export const SUCCESS_METRICS: readonly MetricId[] = CANDIDATE_IDS;

/**
 * The quarters the horizon offers: the eight that follow the flows' month.
 * Anchored on the snapshot, not on today's date, so a file reopened next
 * year still offers the quarters that made sense for its data.
 */
export function horizonOptions(referenceMonth: YearMonth, count = 8): { year: number; quarter: 1 | 2 | 3 | 4 }[] {
  const [yearText, monthText] = referenceMonth.split("-");
  let year = Number(yearText);
  // The quarter that contains the month AFTER the reference month: the
  // reference month is closed, so the earliest honest horizon is the next.
  let month = Number(monthText) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  let quarter = Math.ceil(month / 3);
  const out: { year: number; quarter: 1 | 2 | 3 | 4 }[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ year, quarter: quarter as 1 | 2 | 3 | 4 });
    quarter += 1;
    if (quarter > 4) {
      quarter = 1;
      year += 1;
    }
  }
  return out;
}
