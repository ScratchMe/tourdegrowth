import { CANDIDATE_IDS, CLEAR_MARGIN, METRIC_SHAPES, SLG_CANDIDATE_IDS, SLG_METRIC_SHAPES, UNPRICED_CANDIDATES } from "./catalog-shape";
import { isFlow, rankingImpact } from "./impact";
import { isSlgFlow, slgRankingImpact } from "./slg-impact";
import type {
  CandidateId,
  Comparator,
  Diagnosis,
  EngineCalcContext,
  EngineState,
  Impact,
  Interval,
  MetricId,
  Motion,
  PlgCandidateId,
  Position,
  SlgCandidateId,
  SlgDiagnosis,
} from "./types";
import { currentSnapshot, knownIn, statusOf } from "./values";

/**
 * diagnose.ts — which stage holds the engine back, and whether the numbers
 * are allowed to say so (engine spec §6.6, D8, D9).
 *
 * The rules that make a named bottleneck defensible in front of a CODIR:
 *
 * - A stage is named only against the team's own TARGET. No published
 *   reference names anything — they are context, shown with their caveat
 *   (decision 5, reversed by Antoine on 2026-09-29, `CHANTIERS.md` C1: 1-2 %
 *   logo churn is high-ticket B2B SaaS, and 20-40 % activation has no
 *   primary source; the §6.0 example's churn was flagged against a range
 *   that was never its own). Without targets, the diagnosis says so
 *   (`not-enough`) rather than borrow somebody else's.
 * - Ranking needs at least two comparable stages. With one, it is reported
 *   and not ranked ("we can't say whether it's the biggest leak").
 * - Ranking is in money per month when N and ARPA are known — the only unit
 *   common to acquisition, activation, conversion and churn — and by the
 *   relative gap t/r otherwise, which orders the three flows identically
 *   (see impact.ts). `clear` needs `top.lo > second.hi × 1.25`; otherwise
 *   the WHOLE group within that margin is named, never capped at two (the
 *   same deliberate choice as lib/scoring/bottleneck.ts).
 *
 * Sales-assisted (§18.5.2) follows the SAME rules on its own five candidates,
 * priced over the quarter by `slg-impact.ts`: W and the ACV for the two
 * flows, D and the sales-assisted ARPA for the renewal.
 */

export function directionOf(id: CandidateId): Comparator["direction"] {
  return id === "ret.logo-churn" ? "lower" : "higher";
}

/** The comparator that may name this stage: the team's target, or none (§6.6, C1). */
export function comparatorOf(state: EngineState, id: CandidateId): Comparator | undefined {
  const target = currentSnapshot(state).targets[id];
  if (target === undefined || !Number.isFinite(target)) return undefined;
  return { lo: target, hi: target, direction: directionOf(id) };
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

/** The value a `below` stage is measured to: the team's target (§6.6). */
export function impactTarget(comparator: Comparator): number {
  return comparator.lo;
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

/**
 * What differs between the two motions' diagnoses, and nothing else (§18.5.2):
 * their candidates, how a gap is priced, which ones are flows, and the one
 * priced on the customer base instead (churn, the renewal) — which ranks
 * only in money. The rule that names a stage is ONE function below, so the
 * two motions cannot drift apart, and no function ever sees the candidates
 * of both: there is no « biggest leak of the two engines » (§18.6.1).
 */
interface MotionRules<C extends CandidateId> {
  motion: Motion;
  candidates: readonly C[];
  price: (state: EngineState, id: C, target: number, ctx: EngineCalcContext) => { gap?: Interval; mrr?: Interval };
  isFlow: (id: C) => boolean;
  retention: C;
  /** The ★ (and churn): unknown, any of them may be where the real bottleneck hides. */
  blindWatch: readonly MetricId[];
}

const PLG_RULES: MotionRules<PlgCandidateId> = {
  motion: "plg",
  candidates: CANDIDATE_IDS,
  price: rankingImpact,
  isFlow,
  retention: "ret.logo-churn",
  blindWatch: [...METRIC_SHAPES.filter((s) => s.primary).map((s) => s.id), "ret.logo-churn"],
};

/** The five ★ ARE the five candidates: nothing to add, as churn is added in self-serve (§18.5.2). */
const SLG_RULES: MotionRules<SlgCandidateId> = {
  motion: "slg",
  candidates: SLG_CANDIDATE_IDS,
  price: slgRankingImpact,
  isFlow: isSlgFlow,
  retention: "slg.ret.renewal",
  blindWatch: SLG_METRIC_SHAPES.filter((s) => s.primary).map((s) => s.id),
};

/**
 * One motion's diagnosis, against its own targets only. Self-serve by
 * default, the v1 call every screen makes; `"slg"` reads the sales-assisted
 * candidates and nothing of self-serve's (the independence test holds both
 * directions).
 */
export function diagnose(state: EngineState, ctx: EngineCalcContext, motion?: "plg"): Diagnosis<PlgCandidateId>;
export function diagnose(state: EngineState, ctx: EngineCalcContext, motion: "slg"): SlgDiagnosis;
export function diagnose(state: EngineState, ctx: EngineCalcContext, motion: Motion = "plg"): Diagnosis<PlgCandidateId> | SlgDiagnosis {
  return motion === "plg" ? diagnoseWith(PLG_RULES, state, ctx) : diagnoseWith(SLG_RULES, state, ctx);
}

function diagnoseWith<C extends CandidateId>(rules: MotionRules<C>, state: EngineState, ctx: EngineCalcContext): Diagnosis<C> {
  const { candidates } = rules;
  const positions = {} as Diagnosis<C>["positions"];
  const measure = new Map<C, Interval>();

  // First pass: position every candidate; price the ones below.
  const priced: { id: C; mrr?: Interval; gap?: Interval }[] = [];
  for (const id of candidates) {
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
      const r = rules.price(state, id, impactTarget(comparator), ctx);
      priced.push({ id, ...r });
    }
  }

  const comparable = candidates.filter((id) => !["unknown", "no-comparator"].includes(positions[id].position));
  const belows = candidates.filter((id) => positions[id].position === "below");
  const blind = rules.blindWatch.filter((id) => {
    const status = statusOf(currentSnapshot(state).metrics[id]);
    return status !== "not-applicable" && knownIn(state, id, ctx).kind === "unknown";
  });

  // Every money impact the ranking used is attached to its position; the displayed chain is `whatIf`'s.
  for (const p of priced) {
    if (p.mrr) positions[p.id].impact = numericImpact(state, p.id, rules.retention, positions[p.id].comparator!, p.mrr, ctx);
  }

  const base = { motion: rules.motion, blind, positions };
  if (comparable.length < 2) return { state: "not-enough", named: [], basis: "none", belowUnpriced: [], ...base };
  if (belows.length === 0) return { state: "level", named: [], basis: "none", belowUnpriced: [], ...base };

  // Money needs the volume and the price: when it is there for the flows, churn (the renewal) joins
  // the ranking; otherwise the flows rank by relative gap and it stands apart ("not comparable
  // without ARPA", §6.6). The volume and the price are the same for every flow, so the flows are
  // priced all together or not at all.
  const flowsBelow = priced.filter((p) => rules.isFlow(p.id));
  const moneyPriced = flowsBelow.length > 0 ? flowsBelow.every((p) => p.mrr) : priced.some((p) => p.mrr);
  const basis: Diagnosis["basis"] = moneyPriced ? "mrr" : "relative-gap";
  for (const p of priced) {
    const value = basis === "mrr" ? p.mrr : p.id === rules.retention ? undefined : p.gap;
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
  const ordered = [...rankable].sort((a, b) => measure.get(b)!.lo - measure.get(a)!.lo || candidates.indexOf(a) - candidates.indexOf(b));
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
function numericImpact(state: EngineState, id: CandidateId, retention: CandidateId, comparator: Comparator, mrr: Interval, ctx: EngineCalcContext): Impact {
  const known = knownIn(state, id, ctx);
  return {
    metric: id,
    kind: id === retention ? "retained-mrr" : "new-mrr",
    // Only called for a stage that was positioned, so its value is known.
    from: known.kind === "known" ? known.value : mrr,
    to: impactTarget(comparator),
    mrrPerMonth: mrr,
    lines: [],
  };
}

/** Never priced in v1 — exported so the screens word "not priced in €" from the same list the diagnosis uses. */
export { UNPRICED_CANDIDATES };
