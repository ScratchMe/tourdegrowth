import { fillTemplate, formatApproxMoneyInterval, formatDurationInterval, formatInterval, formatMonth, formatNumber } from "@/lib/engine/format";
import { sub } from "@/lib/engine/interval";
import type { MoneyKpis } from "@/lib/engine/money";
import { unitInputsPhrase } from "@/lib/engine/phrases";
import { findingText } from "@/lib/engine/sentences";
import type { EngineStrings, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { Currency, EngineCalcContext, EngineDerived, EngineState, Interval, MetricId, Motion } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { KPI_INPUTS, SLG_KPI_INPUTS, scenarioFor, slgScenarioFor } from "./scenario-view";

/**
 * The money on the board (design system extension 09, `MoneyBlock`, A20.d
 * T2) — the view model, pure, so the rules that keep it honest are tested
 * rather than eyeballed:
 *
 * - every figure is TODAY's, from the scenario the panel reads
 *   (`scenarioFor`, `slgScenarioFor`, no lever moved): the block, the card
 *   and the slides can never disagree;
 * - the loss is said once, as money, in the finding's own sentence
 *   (`findings()`'s `unit-econ-loss`, C48); its months are its figure, never
 *   a second piece of news; never red;
 * - an unknown is « ? » and says what is missing, never 0; nothing is
 *   computed on revenue;
 * - facts (the MRR, a typed CAC, the month's spend) print to the unit,
 *   estimates and projections at two significant digits with « ~ »;
 * - the warning (C49) comes from `money.ts#paybackWarning`, against the
 *   team's runway or the 30-month floor; never with a certain loss.
 *
 * No copy lives here: words come in as `EngineStrings`.
 */

type MoneyKpisWithBase = MoneyKpis & { mrr: Interval | null; cac: Interval | null; ltv: Interval | null; payback: Interval | null };

export interface MoneyBarsView {
  cost: { label: string; value: string; amount: Interval };
  brings: { label: string; value: string; amount: Interval | null; unknown?: string };
  gap?: { label: string; kind: "short" | "more" | "maybe" };
}

export interface MoneyView {
  motion: Motion;
  eyebrow: string;
  /** MRR then ARR — null in the hybrid, whose total band carries them. */
  figures: { key: "mrr" | "arr"; label: string; value: string }[] | null;
  worth: {
    title: string;
    tag: { label: string; maybe: boolean } | null;
    finding: string;
    bars: MoneyBarsView | null;
    months: string | null;
    /** The months after payback are said: their « ? » follows the sentence. */
    monthsTerm: boolean;
    note: string | null;
  };
  cash: {
    title: string;
    spend: { label: string; value: string | null; missing: string | null };
    tied: { label: string; value: string | null; missing: string | null };
    line: string;
    warning: { text: string; maybe: boolean } | null;
    assumptions: string | null;
  };
}

/** A fact to the unit; a range (an estimate) as one, at two significant digits. */
function factMoney(i: Interval, currency: Currency, ctx: EngineCalcContext, strings: EngineStrings): string {
  return i.lo === i.hi ? formatInterval(i, "money", ctx, strings.units, { currency }) : formatApproxMoneyInterval(i, currency, ctx, strings.units);
}

const abs = (i: Interval): Interval => (i.hi <= 0 ? { lo: -i.hi, hi: -i.lo } : i);

/**
 * The block for one motion. `hybrid`: no MRR and ARR of its own — the total
 * band says the sum (TotalBand, A20.d T3).
 */
export function moneyView(
  input: { state: EngineState; derived: EngineDerived; ctx: EngineCalcContext; strings: EngineStrings; metrics: ResolvedMetric[]; derivedCopy?: ResolvedDerived[] },
  motion: Motion,
  hybrid = false,
): MoneyView {
  const { state, derived, ctx, strings, metrics } = input;
  const w = strings.money;
  const u = strings.units;
  const currency = state.setup.currency;
  const k: MoneyKpisWithBase = motion === "plg" ? scenarioFor(state, {}, ctx).today.kpis : slgScenarioFor(state, {}, ctx).today;
  const money = (i: Interval) => factMoney(i, currency, ctx, strings);
  const approx = (i: Interval) => formatApproxMoneyInterval(i, currency, ctx, u);
  const months = (i: Interval) => formatDurationInterval(i, "months", ctx, u);
  const approxMonths = (i: Interval) => fillTemplate(u.approx, { n: months(i) });

  const inputs = motion === "plg" ? KPI_INPUTS : SLG_KPI_INPUTS;
  const absent = (ids: readonly MetricId[]) => ids.filter((id) => knownIn(state, id, ctx).kind !== "known");
  const phrase = (ids: readonly MetricId[]) => unitInputsPhrase(ids, strings, metrics);
  const marginId: MetricId = motion === "plg" ? "rev.gross-margin" : "slg.rev.gross-margin";

  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const eyebrow = fillTemplate(w.eyebrow, { month: formatMonth(snapshot.referenceMonth, ctx.locale) });
  const figures =
    hybrid || !k.mrr
      ? null
      : [
          { key: "mrr" as const, label: w.mrr, value: money(k.mrr) },
          { key: "arr" as const, label: w.arr, value: money(k.arr ?? k.mrr) },
        ];

  // --- What one new customer is worth -----------------------------------------------
  const lossFinding = derived.findings.find((f) => f.motion === motion && (f.kind === "unit-econ-loss" || f.kind === "unit-econ-loss-maybe"));
  const verdict = k.loss?.verdict ?? null;
  let finding: string;
  let tag: MoneyView["worth"]["tag"] = null;
  let bars: MoneyBarsView | null = null;
  let note: string | null = null;
  const ltvMissing = absent(inputs.ltv);
  const cacMissing = absent(inputs.cac);
  const cost = k.cac ? { label: w.costs, value: money(k.cac), amount: k.cac } : null;
  if (!k.ltv) {
    finding = fillTemplate(w.noLtv, { input: phrase(ltvMissing.length > 0 ? ltvMissing : inputs.ltv) });
    if (cost) bars = { cost, brings: { label: w.brings, value: "?", amount: null, unknown: fillTemplate(w.missing, { input: phrase(ltvMissing) }) } };
    if (ltvMissing.includes(marginId)) note = w.noMarginNote;
  } else if (!k.cac || !k.loss) {
    finding = fillTemplate(w.noCac, { ltv: approx(k.ltv), input: phrase(cacMissing.length > 0 ? cacMissing : inputs.cac) });
  } else {
    const gap = sub(k.ltv, k.cac);
    const brings = { label: w.brings, value: approx(k.ltv), amount: k.ltv };
    if (verdict === "loss" || verdict === "maybe") {
      // The finding's own sentence: one source for the board, the slides and any export.
      finding = lossFinding ? findingText(lossFinding, state, strings, metrics, input.derivedCopy ?? [], ctx.locale) : "";
      tag = { label: verdict === "loss" ? w.tagLoss : w.tagMaybe, maybe: verdict === "maybe" };
      bars = {
        cost: cost!,
        brings,
        gap: verdict === "loss" ? { label: fillTemplate(w.short, { gap: approx(abs(gap)) }), kind: "short" } : { label: w.overlap, kind: "maybe" },
      };
      if (verdict === "maybe") note = w.maybeWhy;
    } else {
      finding = fillTemplate(w.healthy, { cac: money(k.cac), ltv: approx(k.ltv), gap: approx(gap) });
      bars = { cost: cost!, brings, gap: { label: fillTemplate(w.more, { gap: approx(gap) }), kind: "more" } };
    }
  }

  // The finding's figure in time: the lifetime against the payback (§20.5).
  let monthsText: string | null = null;
  let monthsTerm = false;
  if (k.lifetime && k.payback && verdict) {
    if (verdict === "loss") monthsText = fillTemplate(w.monthsLoss, { life: approxMonths(k.lifetime), payback: months(k.payback) });
    else if (verdict === "maybe") monthsText = fillTemplate(w.monthsMaybe, { life: approxMonths(k.lifetime), payback: months(k.payback) });
    else if (k.afterPayback) {
      monthsText = fillTemplate(w.monthsHealthy, { payback: months(k.payback), life: approxMonths(k.lifetime), after: approxMonths(k.afterPayback) });
      monthsTerm = true;
    }
  }
  if (motion === "slg" && verdict === "none") {
    const unit = derived.motions.find((m) => m.motion === "slg");
    if (unit?.motion === "slg" && unit.unit.renewalTerm === "annual") note = w.slgAnnual;
  }

  // --- Cash -------------------------------------------------------------------------
  const paybackMissing = absent(inputs.payback);
  const missingText = (ids: readonly MetricId[]) => (ids.length > 0 ? fillTemplate(w.missing, { input: phrase(ids) }) : null);
  const line = !k.cash ? w.lineNone : verdict === "loss" ? w.lineLoss : verdict === "maybe" ? w.lineMaybe : w.lineHealthy;
  const assumptions = !k.cash ? null : motion === "plg" ? (k.cash.floor ? w.assumePlg : w.assumePlgOutpaced) : k.cash.floor ? w.assumeSlg : w.assumeSlgOutpaced;
  let warning: MoneyView["cash"]["warning"] = null;
  if (k.warning && k.payback) {
    const runway = k.warning.limit.kind === "runway";
    const maybe = k.warning.verdict === "maybe";
    const template = runway ? (maybe ? w.warnRunwayMaybe : w.warnRunway) : maybe ? w.warnFloorMaybe : w.warnFloor;
    warning = { text: fillTemplate(template, { payback: months(k.payback), n: formatNumber(k.warning.limit.months, ctx.locale) }), maybe };
  }

  return {
    motion,
    eyebrow,
    figures,
    worth: { title: w.worthTitle, tag, finding, bars, months: monthsText, monthsTerm, note },
    cash: {
      title: w.cashTitle,
      spend: { label: w.spend, value: k.spend ? money(k.spend) : null, missing: k.spend ? null : missingText(absent(inputs.cac)) },
      tied: { label: w.tied, value: k.cash ? approx(k.cash.tiedUp) : null, missing: k.cash ? null : missingText(paybackMissing) },
      line,
      warning,
      assumptions,
    },
  };
}
