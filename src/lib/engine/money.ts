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
 * What is NOT here, on purpose: the long-payback warning. Its trigger (a
 * runway typed by the team, a team target, or the glossary's references) is
 * Antoine's to decide (`CHANTIERS.md`, section C); only the two facts it
 * would read are computed.
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
  cash: CashTiedUp | null;
}
