import { div, mapBounds, mul, point, scale } from "./interval";
import { correlatedRatio, leverViews, type LeverView } from "./scenario";
import { knownSharedCount } from "./shared-counts";
import { renewalTermOf, wonPerQuarter } from "./slg-impact";
import type { EngineCalcContext, EngineState, Interval, LeverId, MetricId, SlgLeverId } from "./types";
import { slgLifetimeMonths } from "./unit-economics";
import { countsOf, currentSnapshot, entryOf, knownIn } from "./values";

/**
 * slg-scenario.ts — « Et si ? », sales-assisted (engine spec §18.5.5).
 *
 * The same panel and the same sliders as self-serve (`scenario.ts`), on the
 * sales-assisted levers, at steady state. Every rule is printed with the
 * result (`assumptions`):
 *
 * - W' = W × (t_lead ÷ r_lead) × (t_win ÷ r_win) × (O' ÷ O): the levers
 *   compound, as activation and conversion do in self-serve. The extra
 *   opportunities are signed at today's win rate; a new win rate applies to
 *   the same closed opportunities.
 * - New MRR a month = W' ÷ 3 × ACV' ÷ 12: the new ACV is the NEW contracts'.
 * - The base in twelve months = MRR × NRR', with NRR' = NRR + (t_ren − r_ren)
 *   points — « a point of renewal counts as a point of NRR; the contracts
 *   saved are worth the average ». Without the NRR, × the renewal itself, in
 *   logos for revenue.
 * - MRR in twelve months = that base + 12 × the new MRR a month: with
 *   annual contracts, none of the new ones comes up for renewal in the year.
 * - CAC' = the same spend ÷ W'. LTV' and the payback' by §18.5.6.
 *
 * **The link's lever** (C25 Q7, 2026-09-30), in the hybrid only: a slider
 * in WHOLE opportunities from self-serve per quarter. O' = O + (L' − L): the
 * other opportunities don't change, the new ones are signed at today's
 * rate, and the gain is written in sales-assisted and in the total.
 * **Nothing is ever taken from self-serve** — we don't know how many of
 * these accounts would have paid on their own — and this module reads no
 * self-serve number at all (the independence test holds it). The link is
 * never a candidate: no target on it names anything.
 *
 * No lever on the cycle (it brings signatures forward, it creates none), nor
 * on go-live (not priced, §18.5.2).
 */

/** The sales-assisted levers with a slider of the self-serve kind: three rates, then the ACV. */
const RATE_AND_MONEY_LEVERS = ["slg.acq.lead-to-opp", "slg.rev.win-rate", "slg.ret.renewal", "slg.rev.acv"] as const satisfies readonly Exclude<SlgLeverId, "link.pql-handoff">[];

export interface SlgScenarioKpis {
  /** The sales-assisted MRR at the end of the flows' month. */
  mrr: Interval | null;
  /** New MRR a month: a third of the quarter's new contracts, at their ACV ÷ 12. */
  newMrr: Interval | null;
  /** MRR twelve months on, at this quarter's pace. */
  mrr12: Interval | null;
  /** The 12-month NRR, in percent (moved by the renewal lever). */
  nrr: Interval | null;
  cac: Interval | null;
  ltv: Interval | null;
  payback: Interval | null;
  /** New customers over the three months. */
  won: Interval | null;
}

export type SlgScenarioAssumption =
  | "slg-lead-same-win-rate"
  | "slg-win-same-closed"
  | "slg-acv-new-contracts"
  | "slg-renewal-as-nrr"
  | "slg-logos-for-revenue"
  | "link-others-unchanged"
  | "link-same-win-rate"
  | "link-nothing-taken"
  | "slg-same-spend"
  | "slg-twelve-months";

export interface SlgScenario {
  levers: LeverView[];
  moved: SlgLeverId[];
  today: SlgScenarioKpis;
  projected: SlgScenarioKpis;
  assumptions: SlgScenarioAssumption[];
}

const ORDER: readonly SlgScenarioAssumption[] = [
  "slg-lead-same-win-rate",
  "slg-win-same-closed",
  "link-others-unchanged",
  "link-same-win-rate",
  "link-nothing-taken",
  "slg-acv-new-contracts",
  "slg-same-spend",
  "slg-renewal-as-nrr",
  "slg-logos-for-revenue",
  "slg-twelve-months",
];

function known(state: EngineState, id: MetricId, ctx: EngineCalcContext): Interval | null {
  const k = knownIn(state, id, ctx);
  return k.kind === "known" ? k.value : null;
}

/** O, the opportunities created over the three months (S6). */
export function oppsCreated(state: EngineState): number | null {
  const o = knownSharedCount(currentSnapshot(state), "slgOppsCreated");
  return o && o.value > 0 ? o.value : null;
}

/**
 * L, the opportunities from self-serve over the three months: the link's
 * numerator as counted, else its share × O. null without the link or O.
 */
export function oppsFromSelfServe(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const counts = countsOf(entryOf(currentSnapshot(state), "link.pql-handoff"));
  if (counts) return point(counts.numerator);
  const share = known(state, "link.pql-handoff", ctx);
  const o = oppsCreated(state);
  return share && o !== null ? scale(share, o / 100) : null;
}

/**
 * The link's slider (C25 Q7): whole opportunities, from 0 to at least twice
 * today's. No slider without L and O, nor outside the hybrid. A target that
 * is not a whole number of opportunities is ignored (`validate.ts` refuses it
 * in a file).
 */
function linkLever(state: EngineState, raw: number | undefined, ctx: EngineCalcContext): LeverView | null {
  if (!(state.setup.motions.plg && state.setup.motions.slg)) return null;
  const today = oppsCreated(state) === null ? null : oppsFromSelfServe(state, ctx);
  const base = { id: "link.pql-handoff" as const, direction: "higher" as const, unit: "count" as const, step: 1 };
  if (!today) return { ...base, today: null, target: null, min: 0, max: 0 };
  const target = raw !== undefined && Number.isInteger(raw) && raw >= 0 ? raw : null;
  const max = Math.max(2 * Math.ceil(today.hi), 10, target ?? 0);
  return { ...base, today, target, min: 0, max };
}

/** The sales-assisted MRR at the flows' month end: the ARPA's measured numerator, else ARPA × the customers. */
export function slgMrrToday(state: EngineState, ctx: EngineCalcContext): Interval | null {
  const snapshot = currentSnapshot(state);
  const counts = countsOf(entryOf(snapshot, "slg.rev.arpa"));
  if (counts) return point(counts.numerator);
  const arpa = known(state, "slg.rev.arpa", ctx);
  const customers = knownSharedCount(snapshot, "slgCustomers");
  return arpa && customers ? scale(arpa, customers.value) : null;
}

/** Twelve months of the NEW MRR a month: annual contracts keep all of it; monthly ones renew month after month. */
function twelveMonthsOfNew(newMrr: Interval, term: "annual" | "monthly" | null, renewal: Interval | null): Interval {
  if (term !== "monthly" || !renewal) return scale(newMrr, 12);
  const factor = (r: number) => {
    const q = Math.min(100, Math.max(0, r)) / 100;
    return q >= 1 ? 12 : (1 - Math.pow(q, 12)) / (1 - q);
  };
  return { lo: newMrr.lo * factor(renewal.lo), hi: newMrr.hi * factor(renewal.hi) };
}

/** What the base keeps over a year, as a factor: the NRR, else the renewal (logos for revenue), compounded for monthly contracts. */
function baseFactor(nrr: Interval | null, renewal: Interval | null, term: "annual" | "monthly" | null): Interval | null {
  if (nrr) return scale(nrr, 1 / 100);
  if (!renewal) return null;
  const f = (r: number) => (term === "monthly" ? Math.pow(r / 100, 12) : r / 100);
  return { lo: f(renewal.lo), hi: f(renewal.hi) };
}

/**
 * Today and the projection. `targets` is the state's `whatIf` (or a subset:
 * one lever alone gives its own slide); self-serve's targets in it are
 * ignored, as is the link's outside the hybrid.
 */
export function buildSlgScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): SlgScenario {
  const views = leverViews(state, targets, ctx, RATE_AND_MONEY_LEVERS);
  const link = linkLever(state, targets["link.pql-handoff"], ctx);
  const levers = link ? [...views, link] : views;
  const moved = levers.filter((l) => l.target !== null).map((l) => l.id as SlgLeverId);
  const assumptions = new Set<SlgScenarioAssumption>();
  const lever = (id: SlgLeverId) => levers.find((l) => l.id === id);
  const target = (id: SlgLeverId) => lever(id)?.target ?? null;
  const today = (id: SlgLeverId) => lever(id)?.today ?? null;

  const one = point(1);
  const w = wonPerQuarter(state);
  const o = oppsCreated(state);
  const mrr = slgMrrToday(state, ctx);
  const nrrToday = known(state, "slg.ret.nrr", ctx);
  const cacToday = known(state, "slg.acq.cac", ctx);
  const margin = known(state, "slg.rev.gross-margin", ctx);
  const term = renewalTermOf(state, ctx);

  // --- The factors on W, each lever's own effect -----------------------------------
  const rLead = today("slg.acq.lead-to-opp");
  const tLead = target("slg.acq.lead-to-opp");
  const fLead = rLead && tLead !== null ? correlatedRatio(rLead, () => tLead) : one;
  if (rLead && tLead !== null) assumptions.add("slg-lead-same-win-rate");

  const rWin = today("slg.rev.win-rate");
  const tWin = target("slg.rev.win-rate");
  const fWin = rWin && tWin !== null ? correlatedRatio(rWin, () => tWin) : one;
  if (rWin && tWin !== null) assumptions.add("slg-win-same-closed");

  // O' ÷ O = (O + L' − L) ÷ O: only the opportunities from self-serve move.
  const l = today("link.pql-handoff");
  const tLink = target("link.pql-handoff");
  const fLink = l && tLink !== null && o !== null ? { lo: (o + tLink - l.hi) / o, hi: (o + tLink - l.lo) / o } : one;
  if (l && tLink !== null && o !== null) {
    assumptions.add("link-others-unchanged");
    assumptions.add("link-same-win-rate");
    assumptions.add("link-nothing-taken");
  }
  const fWon = mapBounds(mul(mul(fLead, fWin), fLink), (v) => Math.max(0, v));

  function kpis(projected: boolean): SlgScenarioKpis {
    const won = w ? (projected ? mul(w, fWon) : w) : null;
    const acv = projected && target("slg.rev.acv") !== null ? point(target("slg.rev.acv")!) : today("slg.rev.acv");
    if (projected && target("slg.rev.acv") !== null) assumptions.add("slg-acv-new-contracts");
    const newMrr = won && acv ? scale(mul(won, acv), 1 / 36) : null;

    // The renewal moves the NRR point for point; without the NRR, the renewal stands in for it.
    const rRen = today("slg.ret.renewal");
    const tRen = target("slg.ret.renewal");
    const renewal = projected && tRen !== null ? point(tRen) : rRen;
    const nrr =
      nrrToday && projected && rRen && tRen !== null ? { lo: nrrToday.lo + (tRen - rRen.hi), hi: nrrToday.hi + (tRen - rRen.lo) } : nrrToday;
    if (projected && rRen && tRen !== null) assumptions.add("slg-renewal-as-nrr");
    const factor = baseFactor(nrr, renewal, term);
    if (!nrr && factor) assumptions.add("slg-logos-for-revenue");
    const newOverYear = newMrr ? twelveMonthsOfNew(newMrr, term, renewal) : null;
    const mrr12 = mrr && factor && newOverYear ? { lo: mrr.lo * factor.lo + newOverYear.lo, hi: mrr.hi * factor.hi + newOverYear.hi } : null;
    if (mrr12) assumptions.add("slg-twelve-months");

    // Same spend, more contracts: the CAC falls in the same proportion.
    const moves = projected && (fWon.lo !== 1 || fWon.hi !== 1);
    const cac = cacToday && moves ? div(cacToday, fWon) : cacToday;
    if (cacToday && moves) assumptions.add("slg-same-spend");
    const monthlyMargin = acv && margin ? mul(scale(acv, 1 / 12), scale(margin, 1 / 100)) : null;
    const lifetime = renewal && term ? slgLifetimeMonths(renewal, term) : null;
    const ltv = monthlyMargin && lifetime ? mul(monthlyMargin, lifetime) : null;
    const payback = cac && monthlyMargin ? div(cac, monthlyMargin) : null;
    return { mrr, newMrr, mrr12, nrr, cac, ltv, payback: payback && mapBounds(payback, (v) => Math.max(0, v)), won };
  }

  const result = { levers, moved, today: kpis(false), projected: kpis(true) };
  return { ...result, assumptions: ORDER.filter((a) => assumptions.has(a)) };
}

/** One moved sales-assisted lever on its own — what the deck prints one slide per lever for. */
export function slgLeverAlone(state: EngineState, id: SlgLeverId, ctx: EngineCalcContext): SlgScenario | null {
  const target = state.whatIf?.[id];
  if (target === undefined) return null;
  const scenario = buildSlgScenario(state, { [id]: target }, ctx);
  return scenario.moved.includes(id) ? scenario : null;
}
