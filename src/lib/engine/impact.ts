import { UNPRICED_CANDIDATES } from "./catalog-shape";
import {
  formatApproxMoneyInterval,
  formatCountInterval,
  formatInterval,
  formatMoney,
  roundDisplay,
  roundMoney,
  type UnitWords,
} from "./format";
import { interval, mapBounds, mul, point } from "./interval";
import { cohortIsSmall } from "./peloton";
import type { CandidateId, EngineCalcContext, EngineState, Impact, ImpactLine, Interval } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * impact.ts — what closing one gap would be worth, "all else being equal"
 * (engine spec §6.6, §6.7, D9).
 *
 * Two computations live here and they are kept apart on purpose:
 *
 * - `rankingImpact` is the EXACT value, unrounded, the one `diagnose` ranks
 *   with. For the three flows it is `N × (t/r − 1)` (× ARPA): the same N
 *   and the same ARPA for all three, so ranking by money is ranking by the
 *   relative gap t/r — an identity a unit test pins over a grid, and the
 *   reason the ranking needs no ARPA to hold between flows.
 * - `whatIf` is the DISPLAYED chain, built from the numbers the reader sees:
 *   "Today · 18 % → 42 new payers" → "If · 20 %" → "Then · 42 × 20/18 = 47
 *   (+5)" → "× ARPA · 120 € → ~600 €". Each line recomputes on a calculator
 *   from the one above (tested), which the exact 4.67 × 120 = 560 would not.
 *   Its `customersPerMonth` and `mrrPerMonth` are the displayed numbers, so
 *   anything that formats them prints what the chain prints. The slide
 *   `leak` takes its title AND its body from one `whatIf` result (§6.7).
 *
 * Retention at day 30 and the referred share are never priced in money in
 * v1 (§6.6): it would take a retention model and a loop model the engine
 * doesn't have. `whatIf` returns null for them.
 */

const FLOWS: readonly CandidateId[] = ["acq.signup-rate", "act.rate", "rev.paid-conversion"];

export function isFlow(candidate: CandidateId): boolean {
  return FLOWS.includes(candidate);
}

/**
 * N, the new paying customers per month (§6.6): the measured denominator of
 * the CAC when the user entered it as counts — "42 new payers in August" —
 * otherwise the month's sign-ups × the paid conversion, approximate,
 * otherwise unknown.
 */
export function newPayersPerMonth(state: EngineState, ctx: EngineCalcContext): { value: Interval; measured: boolean } | null {
  const snapshot = currentSnapshot(state);
  const cac = countsOf(entryOf(snapshot, "acq.cac"));
  if (cac && cac.denominator > 0) return { value: point(cac.denominator), measured: true };
  const signups = countsOf(entryOf(snapshot, "acq.signup-rate"))?.numerator;
  const paid = knownIn(state, "rev.paid-conversion", ctx);
  if (signups !== undefined && paid.kind === "known") return { value: mapBounds(paid.value, (p) => (signups * p) / 100), measured: false };
  return null;
}

/** The paying base on the 1st of the month: the churn's denominator, else ARPA's (paying customers). */
export function payingBase(state: EngineState): number | null {
  const snapshot = currentSnapshot(state);
  return countsOf(entryOf(snapshot, "ret.logo-churn"))?.denominator ?? countsOf(entryOf(snapshot, "rev.arpa"))?.denominator ?? null;
}

function knownValue(state: EngineState, id: Parameters<typeof knownIn>[1], ctx: EngineCalcContext): Interval | null {
  const known = knownIn(state, id, ctx);
  return known.kind === "known" ? known.value : null;
}

const floorAtZero = (i: Interval): Interval => mapBounds(i, (v) => Math.max(0, v));

/**
 * The exact value `diagnose` ranks a candidate with, against target `t`.
 * `gap` = t/r − 1 for a flow (relative gap, no ARPA needed); `mrr` = the
 * money per month when N (or the paying base) and ARPA are known. Floored
 * at 0: a target the value already meets is worth nothing, never a loss.
 */
export function rankingImpact(
  state: EngineState,
  candidate: CandidateId,
  target: number,
  ctx: EngineCalcContext,
): { gap?: Interval; mrr?: Interval } {
  const r = knownValue(state, candidate, ctx);
  if (!r || UNPRICED_CANDIDATES.includes(candidate)) return {};
  const arpa = knownValue(state, "rev.arpa", ctx);

  if (candidate === "ret.logo-churn") {
    const base = payingBase(state);
    if (base === null || !arpa) return {};
    const kept = floorAtZero({ lo: (base * (r.lo - target)) / 100, hi: (base * (r.hi - target)) / 100 });
    return { mrr: mul(kept, arpa) };
  }

  if (r.lo <= 0) return {};
  const gap = floorAtZero({ lo: target / r.hi - 1, hi: target / r.lo - 1 });
  const n = newPayersPerMonth(state, ctx);
  return n && arpa ? { gap, mrr: mul(mul(n.value, gap), arpa) } : { gap };
}

/** Σ_{k=0}^{11} (1 − churn)^k — twelve months of a monthly amount that erodes at `churnPercent`. */
function twelveMonthFactor(churnPercent: number): number {
  const c = churnPercent / 100;
  return c <= 0 ? 12 : (1 - Math.pow(1 - c, 12)) / c;
}

/**
 * The displayed "what if" chain for one candidate and one target (§6.7) —
 * the same function for the drawer's slider and the `leak` slide. null
 * when nothing can be priced: an unpriced candidate, an unknown value, or
 * a target that is not an improvement on what the reader sees (no gain is
 * shown until the slider moves).
 *
 * Line values are already formatted; each line's template is chosen by the
 * consumer from `line.key` and `impact.metric` (flows: `whatIf.todayFlow`,
 * `ifFlow`, `thenFlow`, `timesFlow`; churn: `todayChurn`, `ifFlow`,
 * `thenChurn`, `timesChurn`; then `annual` and `lessThanOne`). The `if` line
 * carries `{target}` only: the stage's name and the target's wording (team
 * target or low end of the reference) are copy the consumer adds.
 */
export function whatIf(
  state: EngineState,
  candidate: CandidateId,
  target: number,
  ctx: EngineCalcContext,
  words: UnitWords,
): Impact | null {
  if (UNPRICED_CANDIDATES.includes(candidate)) return null;
  const r = knownValue(state, candidate, ctx);
  if (!r) return null;

  const snapshot = currentSnapshot(state);
  const noDecimals = candidate !== "ret.logo-churn" && candidate !== "acq.signup-rate" && cohortIsSmall(snapshot);
  const pct = (i: Interval) => formatInterval(i, "percent", ctx, words, { noDecimals });
  const bare = (i: Interval) => formatInterval(i, "ratio", ctx, words); // a displayed rate without its sign, for "20/18"
  const currency = state.setup.currency;

  const rD = mapBounds(r, (v) => roundDisplay(v, { noDecimals }));
  const tD = roundDisplay(target, { noDecimals });
  const arpa = knownValue(state, "rev.arpa", ctx);
  const arpaD = arpa ? mapBounds(arpa, roundMoney) : null;
  const churn = knownValue(state, "ret.logo-churn", ctx);

  const lines: ImpactLine[] = [];
  const priced = (customers: Interval, decayChurnPercent: number | null): Pick<Impact, "mrrPerMonth" | "mrrAfter12Months"> => {
    if (customers.hi < 1) {
      lines.push({ key: "less-than-one", values: {} });
      return {};
    }
    if (!arpaD) return {};
    const amount = mul(customers, arpaD);
    lines.push({
      key: "times",
      values: { arpa: formatInterval(arpaD, "money", ctx, words, { currency }), amount: formatApproxMoneyInterval(amount, currency, ctx, words) },
    });
    if (decayChurnPercent === null) return { mrrPerMonth: amount };
    // Decay with the churn that applies AFTER the change: today's for a flow, the target for churn itself.
    const annual = { lo: amount.lo * twelveMonthFactor(decayChurnPercent), hi: amount.hi * twelveMonthFactor(decayChurnPercent) };
    lines.push({ key: "annual", values: { amount: formatApproxMoneyInterval(annual, currency, ctx, words) } });
    return { mrrPerMonth: amount, mrrAfter12Months: annual };
  };

  if (candidate === "ret.logo-churn") {
    const base = payingBase(state);
    if (base === null || !(tD < rD.hi) || tD < 0) return null;
    const kept = mapBounds(floorAtZero({ lo: (base * (rD.lo - tD)) / 100, hi: (base * (rD.hi - tD)) / 100 }), Math.round);
    lines.push(
      { key: "today", values: { churn: pct(rD), base: formatCountInterval(point(base), ctx, words) } },
      { key: "if", values: { target: pct(point(tD)) } },
      {
        key: "then",
        values: { base: formatCountInterval(point(base), ctx, words), churn: pct(rD), target: pct(point(tD)), n: formatCountInterval(kept, ctx, words) },
        count: kept,
      },
    );
    const money = priced(kept, tD);
    return {
      metric: candidate,
      kind: arpaD ? "retained-mrr" : "customers",
      from: r,
      to: target,
      customersPerMonth: kept,
      ...money,
      lines,
    };
  }

  if (!(rD.lo > 0) || !(tD > rD.lo)) return null;
  const n = newPayersPerMonth(state, ctx);

  if (n) {
    const nD = mapBounds(n.value, Math.round);
    // Per bound, from the displayed numbers: the fewest payers with the highest rate, the most with the lowest.
    const mD = { lo: Math.round((nD.lo * tD) / rD.hi), hi: Math.round((nD.hi * tD) / rD.lo) };
    const delta = floorAtZero({ lo: mD.lo - nD.lo, hi: mD.hi - nD.hi });
    lines.push(
      { key: "today", values: { rate: pct(rD), n: formatCountInterval(nD, ctx, words) }, count: nD },
      { key: "if", values: { target: pct(point(tD)) } },
      {
        key: "then",
        values: {
          n: formatCountInterval(nD, ctx, words),
          target: bare(point(tD)),
          rate: bare(rD),
          m: formatCountInterval(mD, ctx, words),
          delta: formatCountInterval(delta, ctx, words),
        },
        count: delta,
      },
    );
    const money = priced(delta, churn ? roundDisplay(churn.hi) : null);
    return {
      metric: candidate,
      kind: arpaD ? "new-mrr" : "customers",
      from: r,
      to: target,
      customersPerMonth: delta,
      ...money,
      lines,
    };
  }

  // No monthly volume: say it per 100 sign-ups — which needs the paid conversion, and means nothing upstream of sign-up.
  if (candidate === "acq.signup-rate") return null;
  const paid = candidate === "rev.paid-conversion" ? rD : knownValue(state, "rev.paid-conversion", ctx);
  if (!paid) return null;
  const pD = mapBounds(paid, (v) => roundDisplay(v, { noDecimals }));
  const mD =
    candidate === "rev.paid-conversion"
      ? point(tD) // the rate itself: at target, `target` pay out of 100
      : mapBounds({ lo: (pD.lo * tD) / rD.hi, hi: (pD.hi * tD) / rD.lo }, (v) => roundDisplay(v));
  const delta = floorAtZero(
    candidate === "rev.paid-conversion" ? { lo: tD - rD.hi, hi: tD - rD.lo } : { lo: mD.lo - pD.lo, hi: mD.hi - pD.hi },
  );
  const deltaD = mapBounds(delta, (v) => roundDisplay(v));
  lines.push(
    // Per 100 sign-ups, not per month: the consumer prints this line with `whatIf.todayPerHundred`.
    { key: "today", values: { rate: pct(rD), n: bare(pD) }, count: pD },
    { key: "if", values: { target: pct(point(tD)) } },
    { key: "then", values: { n: bare(pD), target: bare(point(tD)), rate: bare(rD), m: bare(mD), delta: bare(deltaD) }, count: deltaD },
  );
  return { metric: candidate, kind: "per-hundred", from: r, to: target, lines };
}

/**
 * The formatted figure a slide title quotes, read from the SAME chain its
 * body prints (§6.7): the amount, else the customers. `count` is that
 * figure as printed, for the noun that agrees with it ("1 client payant").
 */
export function impactHeadline(impact: Impact): { amount?: string; n?: string; count?: Interval } {
  const times = impact.lines.find((l) => l.key === "times");
  const then = impact.lines.find((l) => l.key === "then");
  if (times?.values.amount) return { amount: times.values.amount };
  if (impact.metric === "ret.logo-churn") return { n: then?.values.n, count: then?.count };
  return { n: then?.values.delta, count: then?.count };
}

/** Where the "what if" slider starts (§6.7): the target; else the reference's cautious bound when the value is under it; else the value — no gain until the user moves. */
export function sliderStart(value: Interval, comparator: { kind: "target" | "reference"; lo: number; hi: number; direction: "higher" | "lower" } | undefined): number {
  if (!comparator) return value.hi;
  if (comparator.kind === "target") return comparator.lo;
  if (comparator.direction === "higher") return value.hi < comparator.lo ? comparator.lo : value.hi;
  return value.lo > comparator.hi ? comparator.hi : value.lo;
}

/** The slider's step (§6.7): one point above 10 %, a tenth below. */
export function sliderStep(value: number): number {
  return value >= 10 ? 1 : 0.1;
}

/** Used by the recompute test and by screens that print a single amount. */
export function formatAmount(v: number, state: EngineState, ctx: EngineCalcContext): string {
  return formatMoney(v, state.setup.currency, ctx.locale);
}

/** Guards `interval` against a caller passing inverted bounds: exported so the test can show there is no scalar escape hatch. */
export const safeInterval = interval;
