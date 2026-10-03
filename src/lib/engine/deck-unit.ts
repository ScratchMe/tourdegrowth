import { ALL_DERIVED_SHAPES, LTV_CAP_MONTHS } from "./catalog-shape";
import { fillTemplate, formatApproxMoneyInterval, formatChange, formatDuration, formatDurationInterval, formatInterval, formatNumber } from "./format";
import type { MoneyKpis } from "./money";
import { unitInputsPhrase } from "./phrases";
import type { EngineStrings, ResolvedMetric } from "./strings";
import type { DerivedValue, EngineCalcContext, EngineState, Interval, MetricId, SlidePaybackChart, SlideTitle } from "./types";

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

/** The commonly cited references, read from the catalogue shapes rather than retyped (§5.7). */
function benchmarkLo(id: string): number | null {
  return ALL_DERIVED_SHAPES.find((s) => s.id === id)?.benchmark?.lo ?? null;
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
    rows.push({ row: "warning", maybe: maybe ? "true" : "", text: fillTemplate(template, { payback: months(k.payback), n: formatNumber(k.warning.limit.months, ctx.locale) }) });
  }

  // --- What the cash figure assumes, printed with it ---
  if (k.cash) {
    const text = slg ? (k.cash.floor ? w.unitAssumeSlg : w.unitAssumeSlgOutpaced) : k.cash.floor ? w.unitAssume : w.unitAssumeOutpaced;
    rows.push({ row: "assume", text });
  }

  // --- The LTV:CAC's context ---
  const ratio = benchmarkLo(slg ? "slg.rev.ltv-cac" : "rev.ltv-cac");
  const ratioNote = ratio !== null ? fillTemplate(w.unitRatioReference, { n: formatNumber(ratio, ctx.locale) }) : "";

  // --- The picture: one customer, month by month ---
  let chart: SlidePaybackChart | null = null;
  if (k.cac) {
    const reference = benchmarkLo(slg ? "slg.rev.cac-payback" : "rev.cac-payback");
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
