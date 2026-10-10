import { displayDerivedShapeOf } from "./business-type";
import { LTV_CAP_MONTHS } from "./catalog-shape";
import { fillTemplate, formatApproxMoneyInterval, formatChange, formatDuration, formatDurationInterval, formatInterval, formatNumber } from "./format";
import type { MoneyKpis } from "./money";
import { unitInputsPhrase } from "./phrases";
import type { EngineStrings, ResolvedMetric } from "./strings";
import type { ScenarioKpis } from "./scenario";
import type { BusinessType, DerivedId, DerivedValue, EngineCalcContext, EngineState, Interval, MetricId, SlideInstallChart, SlidePaybackChart, SlideTitle } from "./types";

/**
 * deck-unit.ts — the money on the unit-economics slide (design system
 * extension 09, Q12, A20.d T4.c), for self-serve alone and sales-assisted
 * alone. The slide keeps its v1 rows — the CAC, the payback, the LTV, the
 * LTV:CAC, the cap — and gains, from the same scenario as the board's money
 * block (`buildScenario`, `buildSlgScenario`, nothing moved), so the board and
 * the slide can never disagree:
 *
 * - two tiles: the months after payback (below zero, the customer leaves
 *   first: the loss, said in months) and the cash the month's acquisition
 *   keeps tied up;
 * - self-serve: GRR and NRR in one line, which were two tiles — they explain
 *   the lifetime, and print their approximation with them;
 * - the long-payback warning (C49), in the slide's « nous »;
 * - what the cash figure assumes, printed with it;
 * - the picture (`PaybackChart`): one customer, month by month;
 * - with a certain loss, the slide's title (C48): the loss, in ink (C53).
 *
 * Nothing here is a reference (C1): the LTV:CAC's « about 3:1 » and the
 * chart's dotted 12 months situate, printed in context, never a verdict.
 *
 * A consumer app's slide is `appUnitMoney`, below: what it adds to the
 * rows `buildUnitEconomics` writes is its own (§21.7.3), and `unitMoney` does
 * not know it.
 */

type Words = EngineStrings;
type Row = Record<string, string>;

/** Today's money for one motion, as the scenario computes it. */
export type UnitKpis = MoneyKpis & { cac: Interval | null; ltv: Interval | null; payback: Interval | null };

export interface UnitMoney {
  /** The rows the slide gains, in print order: after, cash, then retention, warning, assume — those that apply. */
  rows: Row[];
  /** The LTV:CAC's context line, when it is known (« repère couramment cité : environ 3 pour 1 »). */
  ratioNote: string;
  chart: SlidePaybackChart | null;
  /** A certain loss titles the slide (C48); null otherwise. */
  lossTitle: SlideTitle | null;
}

const abs = (i: Interval): Interval => (i.hi <= 0 ? { lo: -i.hi, hi: -i.lo } : i);
const mid = (i: Interval) => (i.lo + i.hi) / 2;
const tuple = (i: Interval): [number, number] => [i.lo, i.hi];
const missingOf = (d: DerivedValue | undefined): readonly MetricId[] => (d && d.kind === "uncomputable" ? d.missing : []);

/**
 * The commonly cited references, read from the catalogue shapes rather than retyped (§5.7), as the engine's type shows
 * them (§21.4.3). A consumer app's slide has its own variant (§21.7.3) and does not read these.
 */
function benchmarkLo(id: DerivedId, type: BusinessType): number | null {
  return displayDerivedShapeOf(id, type).benchmark?.lo ?? null;
}

export function unitMoney(input: {
  state: EngineState;
  k: UnitKpis;
  slg: boolean;
  /** The derived figures, for what each lacks: the LTV, the payback; self-serve's GRR and NRR. */
  unit: { ltv: DerivedValue; payback: DerivedValue; grr?: DerivedValue; nrr?: DerivedValue };
  strings: Words;
  metrics: ResolvedMetric[];
  ctx: EngineCalcContext;
}): UnitMoney {
  const { state, k, slg, unit, strings, metrics, ctx } = input;
  const w = strings.slide;
  const u = strings.units;
  const currency = state.setup.currency;
  const money = (i: Interval) => formatInterval(i, "money", ctx, u, { currency });
  const approx = (i: Interval) => formatApproxMoneyInterval(i, currency, ctx, u);
  const months = (i: Interval) => formatDurationInterval(i, "months", ctx, u);
  const approxMonths = (i: Interval) => fillTemplate(u.approx, { n: months(i) });
  const phrase = (ids: readonly MetricId[]) => unitInputsPhrase(ids, strings, metrics);
  const missingText = (ids: readonly MetricId[]) => (ids.length > 0 ? fillTemplate(w.unitMissing, { input: phrase(ids) }) : "");
  const verdict = k.loss?.verdict ?? null;
  const rows: Row[] = [];

  // --- The months after payback: the loss, said in months (§20.5) ---
  const afterMissing = [...new Set([...missingOf(unit.payback), ...missingOf(unit.ltv)])];
  let afterValue = "";
  let afterNote = "";
  if (k.afterPayback && verdict) {
    if (verdict === "none") afterValue = approxMonths(k.afterPayback);
    else {
      afterValue = formatChange(k.afterPayback, months, u);
      afterNote = verdict === "loss" ? fillTemplate(w.unitLeavesBefore, { n: approxMonths(abs(k.afterPayback)) }) : w.unitMayLeaveBefore;
    }
  } else afterNote = missingText(afterMissing);
  rows.push({ row: "after", id: "after", label: strings.scenario.rowAfter, value: afterValue, note: afterNote, text: [afterValue, afterNote].filter(Boolean).join(" · ") || w.noNumber });

  // --- The cash the month's acquisition keeps tied up (§20.6) ---
  let cashValue = "";
  let cashNote = "";
  if (k.cash) {
    cashValue = approx(k.cash.tiedUp);
    cashNote =
      verdict === "loss"
        ? w.unitNotAllBack
        : verdict === "maybe"
          ? w.unitMayNotAllBack
          : k.cash.floor
            ? slg
              ? w.unitFloorSlg
              : w.unitFloor
            : slg
              ? w.unitBilledSlg
              : w.unitBilled;
  } else cashNote = missingText(missingOf(unit.payback));
  rows.push({ row: "cash", id: "cash", label: strings.scenario.rowCash, value: cashValue, note: cashNote, text: [cashValue, cashNote].filter(Boolean).join(" · ") || w.noNumber });

  // --- Self-serve's GRR and NRR, one line: they explain the lifetime ---
  if (!slg && unit.grr && unit.nrr) {
    const percent = (d: DerivedValue) => (d.kind === "known" ? formatInterval(d.value, "percent", ctx, u) : "");
    const grr = percent(unit.grr);
    const nrr = percent(unit.nrr);
    const missing = [...new Set([...missingOf(unit.grr), ...missingOf(unit.nrr)])];
    let text: string;
    if (!grr && !nrr) text = fillTemplate(w.unitRetentionUnknown, { input: phrase(missing) });
    else {
      text = fillTemplate(w.unitRetention, { grr: grr || "?", nrr: nrr || "?" });
      if (missing.length > 0) text = `${text} ${fillTemplate(w.unitRetentionMissing, { input: phrase(missing) })}`;
    }
    rows.push({ row: "retention", text });
  }

  // --- The long-payback warning (C49): against the runway, or the 30-month floor ---
  if (k.warning && k.payback) {
    const maybe = k.warning.verdict === "maybe";
    const template = k.warning.limit.kind === "runway" ? (maybe ? w.unitWarnRunwayMaybe : w.unitWarnRunway) : maybe ? w.unitWarnFloorMaybe : w.unitWarnFloor;
    rows.push({ row: "warning", maybe: maybe ? "true" : "", text: fillTemplate(template, { payback: months(k.payback), n: formatDuration(k.warning.limit.months, "months", ctx, u) }) });
  }

  // --- What the cash figure assumes, printed with it ---
  if (k.cash) {
    const text = slg ? (k.cash.floor ? w.unitAssumeSlg : w.unitAssumeSlgOutpaced) : k.cash.floor ? w.unitAssume : w.unitAssumeOutpaced;
    rows.push({ row: "assume", text });
  }

  // --- The LTV:CAC's context ---
  const ratio = benchmarkLo(slg ? "slg.rev.ltv-cac" : "rev.ltv-cac", state.setup.type);
  const ratioNote = ratio !== null ? fillTemplate(w.unitRatioReference, { n: formatNumber(ratio, ctx.locale) }) : "";

  // --- The picture: one customer, month by month ---
  let chart: SlidePaybackChart | null = null;
  if (k.cac) {
    const reference = benchmarkLo(slg ? "slg.rev.cac-payback" : "rev.cac-payback", state.setup.type);
    const known = Boolean(k.monthlyMargin && k.lifetime);
    // Loss, or pays back: the verdict decides; a possible loss is drawn by its middles, and its labels say « may ».
    const leavesFirst = verdict === "loss" || (verdict === "maybe" && k.payback !== null && k.lifetime !== null && mid(k.payback) > mid(k.lifetime));
    const gap = k.loss ? abs(k.loss.gap) : null;
    const life = k.lifetime ? months(k.lifetime) : "";
    const payback = k.payback ? months(k.payback) : "";
    chart = {
      monthlyMargin: known ? tuple(k.monthlyMargin!) : null,
      cac: tuple(k.cac),
      lifetime: known ? tuple(k.lifetime!) : null,
      payback: k.payback ? tuple(k.payback) : null,
      story: !known ? "unknown" : leavesFirst ? "loss" : "pays-back",
      reference,
      labels: {
        start: formatNumber(0, ctx.locale),
        end: formatDuration(LTV_CAP_MONTHS, "months", ctx, u),
        reference: reference !== null ? `${formatDuration(reference, "months", ctx, u)} · ${w.unitReference}` : "",
        cost: w.chartCost,
        unknown: missingText(missingOf(unit.ltv)),
        // At the cap, the customer doesn't leave: it is counted no further (§5.7).
        leaves: !known ? "" : k.lifetime!.lo >= LTV_CAP_MONTHS ? fillTemplate(w.chartCounted, { life }) : fillTemplate(w.chartLeaves, { life }),
        paysBack: known && payback ? fillTemplate(leavesFirst ? w.chartWouldPayBack : w.chartPaysBack, { payback }) : "",
        short: verdict === "loss" && gap ? fillTemplate(strings.money.short, { gap: approx(gap) }) : strings.money.overlap,
        after: verdict === "none" && k.afterPayback ? fillTemplate(w.chartAfter, { after: approxMonths(k.afterPayback) }) : strings.money.overlap,
        // Compact (the hybrid): the months in one line on the axis row, the plot keeping only its marks and the gap.
        time: !known || !payback
          ? ""
          : leavesFirst
            ? fillTemplate(k.lifetime!.lo >= LTV_CAP_MONTHS ? w.chartTimeCounted : w.chartTimeLoss, { life, payback })
            : verdict === "none" && k.afterPayback
              ? fillTemplate(w.chartTimeHealthy, { payback, after: approxMonths(k.afterPayback) })
              : fillTemplate(w.chartPaysBack, { payback }),
      },
      summary: !known
        ? fillTemplate(w.chartSummaryNone, { cac: money(k.cac), input: phrase(missingOf(unit.ltv)) })
        : fillTemplate(verdict === "loss" ? w.chartSummaryLoss : verdict === "maybe" ? w.chartSummaryMaybe : w.chartSummaryHealthy, {
            mm: approx(k.monthlyMargin!),
            life,
            gap: gap ? approx(gap) : "",
            cac: money(k.cac),
            payback,
          }),
    };
  }

  // --- A certain loss titles the slide (C48), its figures in ink (C53) ---
  const lossTitle: SlideTitle | null =
    verdict === "loss" && k.loss && k.cac && k.ltv ? { key: "unitEconomicsLoss", values: { cac: money(k.cac), ltv: approx(k.ltv), gap: approx(abs(k.loss.gap)) } } : null;

  return { rows, ratioNote, chart, lossTitle };
}

// --- A consumer app's unit economics (engine spec §21.7.3, A22 APP-9) -------------------------------------

/**
 * What an app's unit-economics slide gains beyond its five figure rows (`cac`, `value12`, `ltv`, `ltvCac`, `payback`),
 * from the app's scenario, nothing moved (`scenarioOf`, like the board's money block). An install's margin falls month
 * by month, so there is no « months after payback » and no cash tied up (D11), and no reference to situate it (C60):
 * only the subscriptions' GRR and NRR (with subscriptions), the long-payback warning (C49), what the picture assumes,
 * the picture itself (`InstallPaybackChart`: the install's cumulative margin against its cost) and, for a certain loss,
 * the slide's title (C48).
 */
export interface AppUnitMoney {
  /** The rows the slide gains, in print order: retention, warning, assume — those that apply. */
  rows: Row[];
  chart: SlideInstallChart | null;
  /** A certain loss titles the slide (C48); null otherwise. */
  lossTitle: SlideTitle | null;
}

export function appUnitMoney(input: {
  state: EngineState;
  k: ScenarioKpis;
  /** The derived figures: the subscriptions' GRR and NRR. */
  unit: { grr?: DerivedValue; nrr?: DerivedValue };
  /** The app's monetization shows the subscriptions' GRR and NRR only when they are ticked. */
  subscriptions: boolean;
  strings: Words;
  metrics: ResolvedMetric[];
  ctx: EngineCalcContext;
}): AppUnitMoney {
  const { state, k, unit, subscriptions, strings, metrics, ctx } = input;
  const w = strings.slide;
  const u = strings.units;
  const currency = state.setup.currency;
  const money = (i: Interval) => formatInterval(i, "money", ctx, u, { currency });
  const approx = (i: Interval) => formatApproxMoneyInterval(i, currency, ctx, u);
  const months = (i: Interval) => formatDurationInterval(i, "months", ctx, u);
  const phrase = (ids: readonly MetricId[]) => unitInputsPhrase(ids, strings, metrics);
  const verdict = k.loss?.verdict ?? null;
  const rows: Row[] = [];

  // --- The subscriptions' GRR and NRR, one line (they explain the subscribers' share of the margin) ---
  if (subscriptions && unit.grr && unit.nrr) {
    const percent = (d: DerivedValue) => (d.kind === "known" ? formatInterval(d.value, "percent", ctx, u) : "");
    const grr = percent(unit.grr);
    const nrr = percent(unit.nrr);
    const missing = [...new Set([...missingOf(unit.grr), ...missingOf(unit.nrr)])];
    let text: string;
    if (!grr && !nrr) text = fillTemplate(w.unitRetentionUnknown, { input: phrase(missing) });
    else {
      text = fillTemplate(w.unitRetention, { grr: grr || "?", nrr: nrr || "?" });
      if (missing.length > 0) text = `${text} ${fillTemplate(w.unitRetentionMissing, { input: phrase(missing) })}`;
    }
    rows.push({ row: "retention", text });
  }

  // --- The long-payback warning (C49): against the runway, or the 30-month floor ---
  if (k.warning && k.payback) {
    const maybe = k.warning.verdict === "maybe";
    const template = k.warning.limit.kind === "runway" ? (maybe ? w.unitWarnRunwayMaybe : w.unitWarnRunway) : maybe ? w.unitWarnFloorMaybe : w.unitWarnFloor;
    rows.push({ row: "warning", maybe: maybe ? "true" : "", text: fillTemplate(template, { payback: months(k.payback), n: formatDuration(k.warning.limit.months, "months", ctx, u) }) });
  }

  // --- The picture: one install, month by month; absent without a margin or a cost ---
  let chart: SlideInstallChart | null = null;
  const curve = k.app?.curve ?? null;
  if (curve && k.cac) {
    const story = k.payback === null ? "loss" : "pays-back";
    const gap = k.loss ? abs(k.loss.gap) : null;
    const cost = money(k.cac);
    chart = {
      curve,
      cost: tuple(k.cac),
      payback: k.payback ? tuple(k.payback) : null,
      story,
      labels: {
        start: formatNumber(0, ctx.locale),
        end: formatDuration(LTV_CAP_MONTHS, "months", ctx, u),
        cost: w.chartCost,
        // Each story says its own words only: « pas remboursée, il manque … » over a healthy install would be false.
        paysBack: story === "pays-back" && k.payback ? fillTemplate(w.installChartPaysBack, { payback: months(k.payback) }) : "",
        loss: story === "loss" && gap ? fillTemplate(w.installChartLoss, { gap: approx(gap) }) : "",
      },
    };
    // The words of a picture, never a sentence with a hole (§21.6.6): a loss with no `{ltv}` or no `{gap}` has no summary.
    if (story === "pays-back") chart.summary = fillTemplate(w.installChartSummaryHealthy, { cpi: cost, payback: months(k.payback!) });
    else if (k.ltv && gap) chart.summary = fillTemplate(w.installChartSummaryLoss, { cpi: cost, ltv: approx(k.ltv), gap: approx(gap) });
  }

  // --- What the picture assumes, printed with it ---
  if (chart) rows.push({ row: "assume", text: w.unitAssumeApp });

  // --- A certain loss titles the slide (C48), its figures in ink (C53) ---
  const lossTitle: SlideTitle | null =
    verdict === "loss" && k.loss && k.cac && k.ltv ? { key: "unitEconomicsLoss", values: { cac: money(k.cac), ltv: approx(k.ltv), gap: approx(abs(k.loss.gap)) } } : null;

  return { rows, chart, lossTitle };
}
