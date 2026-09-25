import { CANDIDATE_IDS, CLEAR_MARGIN, METRIC_SHAPES, UNPRICED_CANDIDATES, shapeOf } from "./catalog-shape";
import { isFlow, rankingImpact } from "./impact";
import type {
  CandidateId,
  Comparator,
  Diagnosis,
  EngineCalcContext,
  EngineState,
  Impact,
  Interval,
  MetricId,
  Position,
} from "./types";
import { currentSnapshot, knownIn, statusOf } from "./values";

/**
 * diagnose.ts — which stage holds the engine back, and whether the numbers
 * are allowed to say so (engine spec §6.6, D8, D9).
 *
 * The rules that make a named bottleneck defensible in front of a CODIR:
 *
 * - A stage is named only against a comparator that DESIGNATES: the team's
 *   own target (always), or one of the two references the product has
 *   approved for that job (activation 20-40 %, SMB logo churn 1-2 %/month).
 *   Every other reference is context — shown, never used to name anything.
 * - A value INSIDE its reference is never a leak against it. Only a target
 *   can make such a value a candidate, and the sentence then says "below
 *   your target", never "low end of the reference".
 * - Ranking needs at least two comparable stages. With one, it is reported
 *   and not ranked ("we can't say whether it's the biggest leak").
 * - Ranking is in money per month when N and ARPA are known — the only unit
 *   common to acquisition, activation, conversion and churn — and by the
 *   relative gap t/r otherwise, which orders the three flows identically
 *   (see impact.ts). `clear` needs `top.lo > second.hi × 1.25`; otherwise
 *   the WHOLE group within that margin is named, never capped at two (the
 *   same deliberate choice as lib/scoring/bottleneck.ts).
 */

function directionOf(id: CandidateId): Comparator["direction"] {
  return id === "ret.logo-churn" ? "lower" : "higher";
}

/** The comparator that may name this stage: the team target, else a designating reference, else none (§6.6). */
export function comparatorOf(state: EngineState, id: CandidateId): Comparator | undefined {
  const target = currentSnapshot(state).targets[id];
  const direction = directionOf(id);
  if (target !== undefined && Number.isFinite(target)) return { kind: "target", lo: target, hi: target, direction };
  const benchmark = shapeOf(id).benchmark;
  if (benchmark?.designates) return { kind: "reference", lo: benchmark.lo, hi: benchmark.hi, direction, term: benchmark.term };
  return undefined;
}

/**
 * Where an interval sits against a comparator. Written for "higher is
 * better" and applied to churn by reflection (negate both), so the two
 * directions cannot drift apart. `maybe-below` straddles the comparator's
 * low end: it is said in text, never stamped.
 */
export function positionOf(value: Interval, comparator: Comparator): Exclude<Position, "no-comparator" | "unknown"> {
  const [v, c] =
    comparator.direction === "higher"
      ? [value, comparator]
      : [{ lo: -value.hi, hi: -value.lo }, { lo: -comparator.hi, hi: -comparator.lo }];
  if (v.hi < c.lo) return "below";
  if (v.lo < c.lo) return "maybe-below";
  if (v.lo <= c.hi) return "within";
  return "above";
}

/** The target a `below` stage is measured to: the target itself, or the reference's CAUTIOUS bound (§6.6). */
export function impactTarget(comparator: Comparator): number {
  return comparator.direction === "higher" ? comparator.lo : comparator.hi;
}

/**
 * `a > b` beyond binary noise. The margin's own boundary is a spec'd case
 * (600 € against 480 € × 1.25 = 600 € is NOT clear, §6.6) and the exact
 * value arrives as 45 × (20/18 − 1) × 120 = 600.0000000000003: without the
 * tolerance, float residue — not the numbers — would name the bottleneck.
 */
function clearlyAbove(a: number, b: number): boolean {
  return a > b + Math.abs(b) * 1e-9;
}

/** The ★ of every stage plus churn: unknown, any of them may be where the real bottleneck hides. */
const BLIND_WATCH: readonly MetricId[] = [...METRIC_SHAPES.filter((s) => s.primary).map((s) => s.id), "ret.logo-churn"];

export function diagnose(state: EngineState, ctx: EngineCalcContext): Diagnosis {
  const positions = {} as Diagnosis["positions"];
  const measure = new Map<CandidateId, Interval>();

  // First pass: position every candidate; price the ones below.
  const priced: { id: CandidateId; mrr?: Interval; gap?: Interval }[] = [];
  for (const id of CANDIDATE_IDS) {
    const known = knownIn(state, id, ctx);
    const comparator = comparatorOf(state, id);
    if (known.kind === "unknown") {
      positions[id] = { position: "unknown", ...(comparator ? { comparator } : {}) };
      continue;
    }
    if (!comparator) {
      positions[id] = { position: "no-comparator" };
      continue;
    }
    const position = positionOf(known.value, comparator);
    positions[id] = { position, comparator };
    if (position === "below") {
      const r = rankingImpact(state, id, impactTarget(comparator), ctx);
      priced.push({ id, ...r });
    }
  }

  const comparable = CANDIDATE_IDS.filter((id) => !["unknown", "no-comparator"].includes(positions[id].position));
  const belows = CANDIDATE_IDS.filter((id) => positions[id].position === "below");
  const blind = BLIND_WATCH.filter((id) => {
    const status = statusOf(currentSnapshot(state).metrics[id]);
    return status !== "not-applicable" && knownIn(state, id, ctx).kind === "unknown";
  });

  // Every money impact the ranking used is attached to its position; the displayed chain is `whatIf`'s.
  for (const p of priced) {
    if (p.mrr) positions[p.id].impact = numericImpact(state, p.id, positions[p.id].comparator!, p.mrr, ctx);
  }

  const base = { blind, positions };
  if (comparable.length < 2) return { state: "not-enough", named: [], basis: "none", belowUnpriced: [], ...base };
  if (belows.length === 0) return { state: "level", named: [], basis: "none", belowUnpriced: [], ...base };

  // Money needs ARPA and N: when it is there for the flows, churn joins the ranking; otherwise the
  // flows rank by relative gap and churn stands apart ("not comparable without ARPA", §6.6).
  // N and ARPA are the same for every flow, so the flows are priced all together or not at all.
  const flowsBelow = priced.filter((p) => isFlow(p.id));
  const moneyPriced = flowsBelow.length > 0 ? flowsBelow.every((p) => p.mrr) : priced.some((p) => p.mrr);
  const basis: Diagnosis["basis"] = moneyPriced ? "mrr" : "relative-gap";
  for (const p of priced) {
    const value = basis === "mrr" ? p.mrr : p.id === "ret.logo-churn" ? undefined : p.gap;
    if (value) measure.set(p.id, value);
  }
  const rankable = belows.filter((id) => measure.has(id));
  const unrankable = belows.filter((id) => !measure.has(id));

  if (rankable.length === 0) {
    // Only unpriceable stages are below: one is named, several share it — none can be ranked.
    const state = unrankable.length === 1 ? "clear" : "shared";
    return { state, named: unrankable, basis: "none", belowUnpriced: [], ...base };
  }

  // Top = the greatest lower bound (ties by canonical order); clear only with the margin over EVERY other.
  const ordered = [...rankable].sort((a, b) => measure.get(b)!.lo - measure.get(a)!.lo || CANDIDATE_IDS.indexOf(a) - CANDIDATE_IDS.indexOf(b));
  const top = ordered[0]!;
  const topLo = measure.get(top)!.lo;
  const othersHi = Math.max(...ordered.slice(1).map((id) => measure.get(id)!.hi), -Infinity);
  if (ordered.length === 1 || clearlyAbove(topLo, othersHi * CLEAR_MARGIN)) {
    return { state: "clear", named: [top], basis, belowUnpriced: unrankable, ...base };
  }
  const group = ordered.filter((id) => !clearlyAbove(topLo / CLEAR_MARGIN, measure.get(id)!.hi));
  return { state: "shared", named: group, basis, belowUnpriced: unrankable, ...base };
}

/**
 * The ranking's numbers as an `Impact`, for the screens that list "what each
 * leak is worth". Exact and unrounded; `lines` is empty because the
 * displayed chain — the thing a reader recomputes — is `whatIf`'s job, and
 * it needs the words this function doesn't take.
 */
function numericImpact(state: EngineState, id: CandidateId, comparator: Comparator, mrr: Interval, ctx: EngineCalcContext): Impact {
  const known = knownIn(state, id, ctx);
  return {
    metric: id,
    kind: id === "ret.logo-churn" ? "retained-mrr" : "new-mrr",
    // Only called for a stage that was positioned, so its value is known.
    from: known.kind === "known" ? known.value : mrr,
    to: impactTarget(comparator),
    mrrPerMonth: mrr,
    lines: [],
  };
}

/** Never priced in v1 — exported so the screens word "not priced in €" from the same list the diagnosis uses. */
export { UNPRICED_CANDIDATES };
