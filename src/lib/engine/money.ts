import { mul, scale, sub } from "./interval";
import type { Interval } from "./types";

/**
 * money.ts — what the engine says about money (engine spec §20, A20).
 *
 * The film « Le moteur » showed the money a founder, a board or an investor
 * asks about first: the ARR, a customer who costs more than they bring in,
 * and the cash a long CAC payback keeps out of the bank. This module holds
 * the arithmetic, in intervals like everything else; `scenario.ts` and
 * `slg-scenario.ts` feed it each motion's own figures, today and with the
 * what-ifs. Nothing here is a reference (C1): every figure is computed from
 * the team's own numbers, and none of them names a stage.
 *
 * The long-payback warning (§20.8) is here too, behind the rule Antoine set
 * on 2026-10-03 (C49): the team's runway when it is typed, a fixed floor of
 * 30 months when it is not. Never a published reference.
 */

/** ARR = MRR × 12: a year of recurring revenue at this month's rate — not a turnover (§20.1). */
export function arrOf(mrr: Interval | null): Interval | null {
  return mrr ? scale(mrr, 12) : null;
}

/**
 * Whether a new customer costs more than they bring in (§20.4):
 * - `loss`: every reading of the LTV is under every reading of the CAC (LTV.hi < CAC.lo);
 * - `none`: every reading of the LTV covers every reading of the CAC (LTV.lo ≥ CAC.hi) — break-even included;
 * - `maybe`: the two ranges overlap, a loss is possible and not certain.
 *
 * With the LTV capped at 36 months (`lifetimeMonths`), `loss` is exactly « the
 * customer leaves before paying their CAC back » (§20.5): the same three
 * numbers, read as money here and as time there.
 */
export type LossVerdict = "loss" | "maybe" | "none";

export interface LossCheck {
  verdict: LossVerdict;
  /** LTV − CAC, per new customer. Below 0: the customer's counted margin doesn't cover what winning them cost. */
  gap: Interval;
}

/** null when the LTV or the CAC is unknown: nothing is said about a figure the engine can't compute (§20.4). */
export function lossCheck(ltv: Interval | null, cac: Interval | null): LossCheck | null {
  if (!ltv || !cac) return null;
  const verdict: LossVerdict = ltv.hi < cac.lo ? "loss" : ltv.lo >= cac.hi ? "none" : "maybe";
  return { verdict, gap: sub(ltv, cac) };
}

/**
 * Months of margin left once the CAC is paid back: the customer's counted
 * lifetime minus the payback (§20.5). Below 0, the customer leaves first.
 */
export function afterPayback(lifetime: Interval | null, payback: Interval | null): Interval | null {
  return lifetime && payback ? sub(lifetime, payback) : null;
}

/**
 * The rules the cash figure relies on, printed with it (§20.6). Fixed order;
 * only those that apply:
 * - `cash-linear`: a customer's monthly margin pays their CAC back in equal parts;
 * - `cash-steady-pace`: at this month's pace, once it has lasted as long as the payback;
 * - `cash-losses-not-counted`: churn and contraction, which stretch the return, are not counted — a floor;
 * - `cash-expansion-outpaces`: expansion may outpace them (NRR above 100 %): it shortens the return, and the figure is no longer a floor;
 * - `cash-billed-monthly`: paid month by month; a year paid up front comes back sooner.
 */
export type CashAssumption = "cash-linear" | "cash-steady-pace" | "cash-losses-not-counted" | "cash-expansion-outpaces" | "cash-billed-monthly";

export interface CashTiedUp {
  /** A month of acquisition: the month's new customers × the CAC. The same with the what-ifs (same spend). */
  spend: Interval;
  /** What this pace keeps tied up before it comes back: spend × payback ÷ 2. */
  tiedUp: Interval;
  /** A floor: true unless expansion may outpace churn and contraction (§20.6). */
  floor: boolean;
  assumptions: CashAssumption[];
}

/** A month of acquisition: new customers in the month × the CAC. */
export function acquisitionSpend(newCustomersPerMonth: Interval | null, cac: Interval | null): Interval | null {
  return newCustomersPerMonth && cac ? mul(newCustomersPerMonth, cac) : null;
}

/**
 * The cash the month's pace of acquisition keeps tied up (§20.6). Each
 * month's spend S comes back linearly over the payback P: what is still out
 * of a cohort t months on is S × (1 − t/P). With a cohort every month, the
 * sum over the cohorts still repaying is ∫₀ᴾ S × (1 − t/P) dt = S × P ÷ 2.
 * `expansionMayOutpace`: the motion's NRR may be above 100 %.
 */
export function cashTiedUp(spend: Interval | null, payback: Interval | null, expansionMayOutpace: boolean): CashTiedUp | null {
  if (!spend || !payback) return null;
  const floor = !expansionMayOutpace;
  return {
    spend,
    tiedUp: scale(mul(spend, payback), 1 / 2),
    floor,
    assumptions: ["cash-linear", "cash-steady-pace", floor ? "cash-losses-not-counted" : "cash-expansion-outpaces", "cash-billed-monthly"],
  };
}

/**
 * C49 (Antoine, 2026-10-03): with no runway typed, a CAC payback of 30
 * months or more — two and a half years — still warns. A floor of the
 * product's own, not a published reference (C1): those are 12 and 18-24.
 */
export const PAYBACK_FLOOR_MONTHS = 30;

/** The longest runway the setup accepts: twenty years. Past it the figure says nothing a payback can be held against. */
export const RUNWAY_MAX_MONTHS = 240;

/**
 * What the payback is held against (§20.8): the team's runway when it typed
 * one (`setup.runwayMonths`), otherwise the floor. Per company: the two
 * motions of a hybrid face the same runway.
 */
export type PaybackLimit = { kind: "runway"; months: number } | { kind: "floor"; months: number };

export function paybackLimit(runwayMonths: number | undefined): PaybackLimit {
  return runwayMonths !== undefined ? { kind: "runway", months: runwayMonths } : { kind: "floor", months: PAYBACK_FLOOR_MONTHS };
}

/**
 * The long-payback warning: « you make money, but late — maybe after your
 * cash runs out ». A warning, not an alarm (never the leak's red), and never
 * a cause.
 * - `long`: every reading of the payback is past the limit;
 * - `maybe`: the payback's range straddles it.
 */
export interface PaybackWarning {
  verdict: "long" | "maybe";
  limit: PaybackLimit;
}

/**
 * Past the runway means longer than it (« plus que ton runway ») ; the floor
 * counts from 30 months included (« 30 mois ou plus »). null without a
 * payback, and null when the loss is certain: a customer who leaves before
 * paying back is the loss, not a late return — the loss alone speaks (§20.5).
 */
export function paybackWarning(payback: Interval | null, loss: LossCheck | null, limit: PaybackLimit): PaybackWarning | null {
  if (!payback || loss?.verdict === "loss") return null;
  const past = (v: number) => (limit.kind === "runway" ? v > limit.months : v >= limit.months);
  if (past(payback.lo)) return { verdict: "long", limit };
  if (past(payback.hi)) return { verdict: "maybe", limit };
  return null;
}

/**
 * The money a motion's « Et si » carries beyond the v1 figures (§20): read
 * from the figures the scenario already computed, so the panel, the slides
 * and the board can never disagree with them.
 */
export interface MoneyKpis {
  /** ARR = MRR × 12, today's MRR. */
  arr: Interval | null;
  /** ARR in twelve months = the MRR in twelve months × 12. */
  arr12: Interval | null;
  /** The MRR month by month, 13 points: [0] is the MRR, [12] the MRR in twelve months — one loop for both (§20.2). */
  mrrPath: Interval[] | null;
  ltvCac: Interval | null;
  /** Months a customer is counted for — the LTV's own lifetime, capped at 36 (§20.5). */
  lifetime: Interval | null;
  afterPayback: Interval | null;
  loss: LossCheck | null;
  /** A month of acquisition at today's spend (§20.6) — known without a margin, unlike the cash it ties up. */
  spend: Interval | null;
  cash: CashTiedUp | null;
  /** The long-payback warning (C49), against the runway or the 30-month floor. */
  warning: PaybackWarning | null;
}
