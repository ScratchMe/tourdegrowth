import { UNPRICED_CANDIDATES } from "./catalog-shape";
import { formatApproxMoneyInterval, formatCountInterval, formatInterval, roundDisplay, roundMoney, roundSignificant, type UnitWords } from "./format";
import { mapBounds, mul, point, scale } from "./interval";
import { slgNoDecimals } from "./relays";
import { knownSharedCount } from "./shared-counts";
import type { EngineCalcContext, EngineState, Impact, ImpactLine, Interval, SlgCandidateId } from "./types";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * slg-impact.ts — what closing a sales-assisted gap would be worth, over the
 * quarter and then a month (engine spec §18.5.3).
 *
 * The same two computations as `impact.ts`, kept apart for the same reason:
 *
 * - `slgRankingImpact` is EXACT, the value `diagnose(…, "slg")` ranks with.
 *   For the two flows it is `W × (t/r − 1) × ACV ÷ 12 ÷ 3` a month: the
 *   same W and the same ACV for both, so ranking in money IS ranking by the
 *   relative gap — the identity D9 pins in self-serve, pinned here too.
 * - `slgWhatIf` is the DISPLAYED chain, each line recomputed on a calculator
 *   from the numbers of the line above: « 18 × 32/24 = 24 (+6) », then
 *   « 6 × 2 000 € = 12 000 € de MRR nouveau par trimestre », then « soit
 *   ~4 000 € par mois ». The slide's title reads its amount off the
 *   `per-month` line of the same object (`impactHeadline`).
 *
 * Why a quarter first: everything sales-assisted is read over three months
 * (C25 Q2) — W is the quarter's new customers, D the quarter's contracts up
 * for renewal. A month is a third of what the chain counted, and says so.
 *
 * Never priced: go-live and the referred share (§18.5.2), the cycle (it
 * brings signatures forward without creating any), the NRR, the reference
 * customers, and the link — whose « Et si » is in `slg-scenario.ts`.
 */

/** The two flows: lead → opportunity, and closed → signed. The renewal is priced on the contracts up for renewal. */
const SLG_FLOWS: readonly SlgCandidateId[] = ["slg.acq.lead-to-opp", "slg.rev.win-rate"];

export function isSlgFlow(candidate: SlgCandidateId): boolean {
  return SLG_FLOWS.includes(candidate);
}

/**
 * W, the new sales-assisted customers over the three months (§18.5.3): the
 * deals won as counted — the win rate's numerator, the ACV's or the CAC's
 * denominator, or the base where the person typed it once (S6). A win rate
 * entered as counts IS « closed opportunities × the win rate », so there is
 * no second, approximate route: without a count, W is unknown.
 */
export function wonPerQuarter(state: EngineState): Interval | null {
  const won = knownSharedCount(currentSnapshot(state), "slgDealsWon");
  return won && won.value > 0 ? point(won.value) : null;
}

/** D, the contracts up for renewal over the three months: the renewal's measured denominator. */
export function contractsUpForRenewal(state: EngineState): number | null {
  const d = countsOf(entryOf(currentSnapshot(state), "slg.ret.renewal"))?.denominator;
  return d !== undefined && d > 0 ? d : null;
}

function knownValue(state: EngineState, id: Parameters<typeof knownIn>[1], ctx: EngineCalcContext): Interval | null {
  const known = knownIn(state, id, ctx);
  return known.kind === "known" ? known.value : null;
}

const floorAtZero = (i: Interval): Interval => mapBounds(i, (v) => Math.max(0, v));

/**
 * The exact value `diagnose(…, "slg")` ranks a candidate with, against
 * target `t`, per MONTH. `gap` = t/r − 1 for a flow; `mrr` when W and the
 * ACV (flows) or D and the sales-assisted ARPA (renewal) are known. Floored
 * at 0: a target already met is worth nothing, never a loss.
 */
export function slgRankingImpact(
  state: EngineState,
  candidate: SlgCandidateId,
  target: number,
  ctx: EngineCalcContext,
): { gap?: Interval; mrr?: Interval } {
  const r = knownValue(state, candidate, ctx);
  if (!r || UNPRICED_CANDIDATES.includes(candidate)) return {};

  if (candidate === "slg.ret.renewal") {
    const d = contractsUpForRenewal(state);
    const arpa = knownValue(state, "slg.rev.arpa", ctx);
    if (d === null || !arpa) return {};
    const kept = floorAtZero({ lo: (d * (target - r.hi)) / 100, hi: (d * (target - r.lo)) / 100 });
    return { mrr: scale(mul(kept, arpa), 1 / 3) };
  }

  if (r.lo <= 0) return {};
  const gap = floorAtZero({ lo: target / r.hi - 1, hi: target / r.lo - 1 });
  const w = wonPerQuarter(state);
  const acv = knownValue(state, "slg.rev.acv", ctx);
  return w && acv ? { gap, mrr: scale(mul(mul(w, gap), acv), 1 / 36) } : { gap };
}

/** Σ_{k=0}^{11} q^k — twelve months of a monthly amount kept at a monthly renewal rate of q. */
function twelveMonthFactor(renewalPercent: number): number {
  const q = Math.min(100, Math.max(0, renewalPercent)) / 100;
  return q >= 1 ? 12 : (1 - Math.pow(q, 12)) / (1 - q);
}

/** The renewal's variant, when the renewal is known: an annual contract renews once a year (§18.5.6). */
export function renewalTermOf(state: EngineState, ctx: EngineCalcContext): "annual" | "monthly" | null {
  if (knownIn(state, "slg.ret.renewal", ctx).kind !== "known") return null;
  return entryOf(currentSnapshot(state), "slg.ret.renewal")?.variant === "monthly" ? "monthly" : "annual";
}

/**
 * The displayed chain for one sales-assisted candidate and one target
 * (§18.5.3) — the drawer's slider and the `slg:leak` slide alike. null when
 * nothing can be priced: an unpriced candidate, an unknown value, or a target
 * that is not an improvement on what the reader sees.
 *
 * Line values are already formatted. The consumer picks each template from
 * `line.key` and `impact.metric` (`phrases.ts#chainTemplate`): flows print
 * `{rate}`, `{n}`, `{m}`, `{delta}`, `{acvMonthly}`, `{quarter}`; the renewal
 * `{rate}`, `{d}`, `{kept}`, `{arpa}`, `{quarter}`; then `per-month` and
 * `annual` carry `{amount}`.
 */
export function slgWhatIf(
  state: EngineState,
  candidate: SlgCandidateId,
  target: number,
  ctx: EngineCalcContext,
  words: UnitWords,
): Impact | null {
  if (UNPRICED_CANDIDATES.includes(candidate)) return null;
  const r = knownValue(state, candidate, ctx);
  if (!r) return null;

  const snapshot = currentSnapshot(state);
  const noDecimals = slgNoDecimals(snapshot, candidate);
  const pct = (i: Interval) => formatInterval(i, "percent", ctx, words, { noDecimals });
  const bare = (i: Interval) => formatInterval(i, "ratio", ctx, words); // a displayed rate without its sign, for "32/24"
  const count = (i: Interval) => formatCountInterval(i, ctx, words);
  const currency = state.setup.currency;
  const money = (i: Interval) => formatInterval(i, "money", ctx, words, { currency });

  const rD = mapBounds(r, (v) => roundDisplay(v, { noDecimals }));
  const tD = roundDisplay(target, { noDecimals });
  // Only an improvement prices anything: every sales-assisted candidate reads « higher is better ».
  if (!(tD > rD.lo) || tD > 100) return null;

  const term = renewalTermOf(state, ctx);
  const lines: ImpactLine[] = [];

  /**
   * The money of the quarter, then a month, then a year (§18.5.3). `quarter`
   * is a whole count × a displayed amount, exact; `{amount}` is its third at
   * two significant digits; the year line is that amount × 12 for annual
   * contracts (none of them renews within the year), or kept month after
   * month at the monthly renewal rate for monthly ones.
   */
  const priced = (
    units: Interval,
    unitAmount: Interval | null,
    timesValues: (quarter: string) => Record<string, string>,
    decayRenewal: number | null,
  ): Pick<Impact, "mrrPerQuarter" | "mrrPerMonth" | "mrrAfter12Months"> => {
    if (units.hi < 1) {
      lines.push({ key: "less-than-one", values: {} });
      return {};
    }
    if (!unitAmount) return {};
    const quarter = mul(units, unitAmount);
    lines.push({ key: "times", values: timesValues(money(quarter)) });
    const perMonth = scale(quarter, 1 / 3);
    lines.push({ key: "per-month", values: { amount: formatApproxMoneyInterval(perMonth, currency, ctx, words) } });
    const result = { mrrPerQuarter: quarter, mrrPerMonth: perMonth };
    if (term === null) return result;
    const shown = mapBounds(perMonth, (v) => roundSignificant(v, 2));
    const annual = term === "annual" ? scale(shown, 12) : scale(shown, twelveMonthFactor(decayRenewal ?? 100));
    lines.push({ key: "annual", values: { amount: formatApproxMoneyInterval(annual, currency, ctx, words) } });
    return { ...result, mrrAfter12Months: annual };
  };

  if (candidate === "slg.ret.renewal") {
    const d = contractsUpForRenewal(state);
    if (d === null) return perHundred(candidate, r, target, rD, tD, pct, bare, lines, "renewals");
    // Per bound, from the displayed numbers: the fewest kept with the highest rate today.
    const kept = mapBounds(floorAtZero({ lo: (d * (tD - rD.hi)) / 100, hi: (d * (tD - rD.lo)) / 100 }), Math.round);
    lines.push(
      { key: "today", values: { rate: pct(rD), d: count(point(d)) }, count: point(d) },
      { key: "if", values: { target: pct(point(tD)) } },
      { key: "then", values: { d: count(point(d)), target: pct(point(tD)), rate: pct(rD), kept: count(kept) }, count: kept },
    );
    const arpa = knownValue(state, "slg.rev.arpa", ctx);
    const arpaD = arpa ? mapBounds(arpa, roundMoney) : null;
    const amounts = priced(kept, arpaD, (quarter) => ({ kept: count(kept), arpa: money(arpaD!), quarter }), tD);
    return {
      metric: candidate,
      kind: arpaD ? "retained-mrr" : "customers",
      from: r,
      to: target,
      customersPerQuarter: kept,
      ...amounts,
      lines,
    };
  }

  // A flow at 0 has no « × t/r »: nothing to scale from.
  if (!(rD.lo > 0)) return null;
  const w = wonPerQuarter(state);
  if (!w) {
    const lead = entryOf(snapshot, "slg.acq.lead-to-opp")?.variant === "mql" ? "mql" : "leads";
    return perHundred(candidate, r, target, rD, tD, pct, bare, lines, candidate === "slg.acq.lead-to-opp" ? lead : "closedOpps");
  }
  const nD = mapBounds(w, Math.round);
  const mD = { lo: Math.round((nD.lo * tD) / rD.hi), hi: Math.round((nD.hi * tD) / rD.lo) };
  const delta = floorAtZero({ lo: mD.lo - nD.lo, hi: mD.hi - nD.hi });
  lines.push(
    { key: "today", values: { rate: pct(rD), n: count(nD) }, count: nD },
    { key: "if", values: { target: pct(point(tD)) } },
    { key: "then", values: { n: count(nD), target: bare(point(tD)), rate: bare(rD), m: count(mD), delta: count(delta) }, count: delta },
  );
  const acv = knownValue(state, "slg.rev.acv", ctx);
  // ACV ÷ 12 in whole currency units: the line « 6 × 2 000 € » recomputes on a calculator.
  const acvMonthly = acv ? mapBounds(acv, (v) => Math.round(v / 12)) : null;
  const renewalToday = knownValue(state, "slg.ret.renewal", ctx);
  const amounts = priced(delta, acvMonthly, (quarter) => ({ delta: count(delta), acvMonthly: money(acvMonthly!), quarter }), renewalToday ? roundDisplay(renewalToday.lo) : null);
  return {
    metric: candidate,
    kind: acvMonthly ? "new-mrr" : "customers",
    from: r,
    to: target,
    customersPerQuarter: delta,
    ...amounts,
    lines,
  };
}

/**
 * Without W (or D): « pour 100 » on the relay's own base, never a chain —
 * « +3 opportunités pour 100 leads », « +8 signatures pour 100 opportunités
 * conclues », « +4 contrats gardés pour 100 contrats échus ».
 */
function perHundred(
  candidate: SlgCandidateId,
  r: Interval,
  target: number,
  rD: Interval,
  tD: number,
  pct: (i: Interval) => string,
  bare: (i: Interval) => string,
  lines: ImpactLine[],
  base: NonNullable<Impact["perHundredBase"]>,
): Impact {
  const delta = floorAtZero({ lo: tD - rD.hi, hi: tD - rD.lo });
  const deltaD = mapBounds(delta, (v) => roundDisplay(v));
  lines.push(
    { key: "today", values: { rate: pct(rD), n: bare(rD) }, count: rD },
    { key: "if", values: { target: pct(point(tD)) } },
    { key: "then", values: { n: bare(rD), target: bare(point(tD)), rate: bare(rD), m: bare(point(tD)), delta: bare(deltaD) }, count: deltaD },
  );
  return { metric: candidate, kind: "per-hundred", from: r, to: target, perHundredBase: base, lines };
}
