import { SLG_LEVER_IDS } from "./catalog-shape";
import {
  type BuiltSlide,
  changeOf,
  changeRow,
  isPricedGain,
  metricOf,
  type Print,
  type Row,
  sourceLabel,
  whatIfPrinters,
  slideCurve,
  slideLeverSum,
  withDrawings,
  WHATIF_KPI_IDS,
  whatIfKpi,
  whatIfKpiLabel,
} from "./deck";
import { linkSentence, relaysTitle, totalBlocks, totalSums, totalTitle } from "./deck-motions";
import { unitMoney } from "./deck-unit";
import {
  capitalise,
  fillTemplate,
  formatApproxMoneyInterval,
  formatChange,
  formatCountInterval,
  formatDurationInterval,
  formatInterval,
  formatMonth,
  formatMonthRange,
  formatNumber,
  formatPerHundred,
  formatPerHundredCount,
  joinList,
  lowerFirst,
  roundSignificant,
} from "./format";
import { mapBounds, point } from "./interval";
import { fillSegments, positionLabel, subjectOf, unitInputsPhrase } from "./phrases";
import { coverageText, pipelineCoverage } from "./pipeline";
import { buildScenario } from "./scenario";
import { buildSlgScenario, oppsCreated, oppsFromSelfServe, slgLeverAlone, type SlgScenario } from "./slg-scenario";
import { sanityText } from "./sentences";
import { STATUS_KEY } from "./strings";
import type { EngineStrings, ResolvedDerived, ResolvedMetric } from "./strings";
import { marginIsCompanyWide } from "./unit-economics";
import type {
  DerivedValue,
  EngineCalcContext,
  EngineDerived,
  EngineState,
  Interval,
  MetricId,
  Motion,
  MotionDerived,
  RelayColumn,
  SanityCheck,
  SlgLeverId,
  SlideId,
  SlidePaybackChart,
  SlideTitle,
} from "./types";
import { currentSnapshot, entryOf, knownIn, statusOf } from "./values";

/**
 * deck-slg.ts — the slides the sales-assisted motion and the hybrid add to
 * the deck (engine spec §18.8, A7.3.c S4): the relays, sales-assisted's
 * « Et si » slides, « deux moteurs, un total », and the unit economics side
 * by side. `deck.ts` picks and orders them; this module only writes them,
 * with the same contract as every slide (deck.ts header): each row says
 * what it is in `row`, its words finished, `id` a machine id.
 *
 * Self-serve's slides are not here and don't change: a self-serve-only
 * engine prints the v1 deck to the character (golden-v1.test.ts).
 */

type Words = EngineStrings;
type SlgDerived = Extract<MotionDerived, { motion: "slg" }>;
type PlgDerived = Extract<MotionDerived, { motion: "plg" }>;

export function motionOf<M extends Motion>(derived: EngineDerived, motion: M): Extract<MotionDerived, { motion: M }> | null {
  return (derived.motions.find((m) => m.motion === motion) as Extract<MotionDerived, { motion: M }> | undefined) ?? null;
}

// --- slg:peloton — the relays (§18.8.2) ------------------------------------------

const RELAY_LABEL: Record<RelayColumn["metric"], "leadToOpp" | "winRate" | "goLive"> = {
  "slg.acq.lead-to-opp": "leadToOpp",
  "slg.rev.win-rate": "winRate",
  "slg.act.go-live": "goLive",
};

/**
 * The relays' slide body: the upstream line, then one row per relay — its
 * base of 100 and its three months, the numeral over its grid ("" when
 * nobody measures it, never « 0 »), what it counts, its source, and the stamp
 * when the diagnosis names it. The footer says each grid has its own base:
 * nothing on this slide multiplies one relay into the next.
 */
export function buildRelaysSlide(state: EngineState, slg: SlgDerived, sanity: readonly SanityCheck[], strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): BuiltSlide {
  const { relays, diagnosis } = slg;
  const r = strings.relays;
  const units = strings.units;
  const snapshot = currentSnapshot(state);
  const lead = relays.leadNoun === "mql" ? r.label.mql : r.label.leads;
  const baseLabel: Record<RelayColumn["base"], string> = { leads: lead, "closed-opps": r.label.closedOpps, "new-customers": r.label.newCustomers };
  const named = new Set<string>(diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : []);

  const first = relays.columns[0]!;
  const perMonth = relays.leadsPerMonth;
  const upstream =
    perMonth && first.period
      ? fillSegments(r.upstream, {
          label: lead,
          n: formatCountInterval(mapBounds(perMonth, (v) => roundSignificant(v, 2)), ctx, units),
          source: first.source ? sourceLabel(first.source, strings) : lowerFirst(strings.status.estimated),
          months: formatMonthRange(first.period, ctx.locale, units),
        })
      : fillTemplate(r.upstreamUnknown, { label: lead });
  const lines: Row[] = [{ row: "upstream", text: upstream }];

  const sources: string[] = [];
  const notes: string[] = [];
  for (const column of relays.columns) {
    const k = knownIn(state, column.metric, ctx);
    const status = statusOf(entryOf(snapshot, column.metric));
    const where = column.source ? sourceLabel(column.source, strings) : k.kind === "known" ? lowerFirst(strings.status[STATUS_KEY[status]]) : "";
    if (column.source && !sources.includes(where)) sources.push(where);
    const period = column.period ? formatMonthRange(column.period, ctx.locale, units) : "";
    const perHundred = column.perHundred;
    const value = !perHundred ? "" : perHundred.hi > 0 && perHundred.hi < 0.5 ? strings.visual.lessThanOne : formatPerHundredCount(perHundred, ctx, units);
    const at = diagnosis.positions[column.metric];
    const stamp = named.has(column.metric) && at ? (positionLabel(at.position, at.comparator, strings) ?? "") : "";
    const base = [baseLabel[column.base], period].filter(Boolean).join(" · ");
    lines.push({
      row: "relay",
      id: column.metric,
      base,
      value,
      label: fillTemplate(r.label[RELAY_LABEL[column.metric]], { n: String(state.setup.goLiveWindowDays) }),
      source: where,
      stamp,
      text: perHundred ? [base, formatPerHundred(perHundred, ctx, units), where].filter(Boolean).join(" · ") : [base, strings.slide.noNumber].join(" · "),
    });
    // One note per measured relay: where it comes from, over which three months.
    if (column.source && column.period) {
      notes.push(
        fillTemplate(strings.notes.sourceSlg, {
          metric: metricOf(metrics, column.metric).name,
          tool: sourceLabel(column.source, strings),
          period: formatMonthRange(column.period, ctx.locale, units, "from"),
        }),
      );
    }
  }
  // Pipeline coverage (§19.4, A14 T3.2): a leading indicator under the relays, never a stage — and no « ton » on a slide.
  const coverage = pipelineCoverage(state);
  if (coverage) {
    const p = strings.pipeline;
    const ratio = (v: number) => coverageText(v, (n) => formatNumber(n, ctx.locale), p.ratio);
    const line =
      coverage.below && coverage.threshold !== null
        ? fillTemplate(p.coverageBelowSlide, { ratio: ratio(coverage.ratio), threshold: ratio(coverage.threshold) })
        : fillTemplate(p.coverage, { ratio: ratio(coverage.ratio) });
    lines.push({ row: "coverage", text: line });
    // The month before's goes to the notes: on the slide, the line keeps to the legend's one line.
    if (coverage.previous) notes.push(fillTemplate(p.previousNote, { month: formatMonth(coverage.previous.month, ctx.locale), ratio: ratio(coverage.previous.ratio) }));
  }
  lines.push({ row: "footer", text: fillSegments(r.slideFooter, { sources: joinList(sources, strings.grammar) }) });

  notes.push(strings.notes.whyThreeMonths);
  const cycle = knownIn(state, "slg.acq.cycle", ctx);
  if (cycle.kind === "known") {
    const c = formatDurationInterval(cycle.value, "days", ctx, units);
    notes.push(fillTemplate(sanity.some((s) => s.id === "slg-cycle-long") ? strings.notes.cycleLong : strings.notes.cycle, { c }));
  }
  return { present: true, title: relaysTitle(state, relays, strings, metrics, ctx), lines, notes };
}

// --- Sales-assisted « Et si » (§18.5.5) -------------------------------------------

/** The growth figures of sales-assisted's table, in the panel's order. No GRR: nobody types one. */
interface MovedSlgLever {
  id: SlgLeverId;
  from: string;
  to: string;
  alone: SlgScenario;
}

/** Sales-assisted's moved levers, in lever order — the link last (`SLG_LEVER_IDS`) — each printing a visible move. */
function movedSlgLevers(state: EngineState, strings: Words, ctx: EngineCalcContext): MovedSlgLever[] {
  return SLG_LEVER_IDS.flatMap((id) => {
    const alone = slgLeverAlone(state, id, ctx);
    const lever = alone?.levers.find((l) => l.id === id);
    if (!alone || !lever?.today || lever.target === null) return [];
    // The link counts whole opportunities (C25 Q7); the others are percents and money.
    const print: Print = (i) => formatInterval(i, lever.unit === "count" ? "ratio" : lever.unit, ctx, strings.units, { currency: state.setup.currency });
    const from = print(lever.today);
    const to = print(point(lever.target));
    return from === to ? [] : [{ id, from, to, alone }];
  });
}

function slgMrrGain(s: SlgScenario): Interval | null {
  return s.today.mrr12 && s.projected.mrr12 ? changeOf(s.today.mrr12, s.projected.mrr12) : null;
}

/**
 * Sales-assisted's two tables for one scenario: the growth figures, then its
 * quarter — the opportunities created (the link and the referred share move them), in the
 * hybrid how many came from self-serve, and the new customers. The
 * assumptions that applied are the footer, as on every what-if slide.
 */
function slgScenarioLines(state: EngineState, s: SlgScenario, rowTemplate: string, strings: Words, ctx: EngineCalcContext): Row[] {
  const printers = whatIfPrinters(state, strings, ctx);
  const w = strings.scenario;
  // The same rows as self-serve's (extension 09, A20.d T4.b): the MRR and ARR in twelve months, the NRR, one new customer, the cash.
  const lines: Row[] = WHATIF_KPI_IDS.map((id) =>
    changeRow("kpi", id, whatIfKpiLabel(id, strings, true), whatIfKpi(s.today, id), whatIfKpi(s.projected, id), printers.kpis[id], rowTemplate, strings),
  );
  const people = printers.steps.signups;
  const o = oppsCreated(state);
  const l = oppsFromSelfServe(state, ctx);
  const link = s.levers.find((x) => x.id === "link.pql-handoff");
  const linkTarget = link?.target ?? null;
  if (o !== null) {
    lines.push(changeRow("funnelStep", "opps", w.opps, s.today.opps ?? point(o), s.projected.opps ?? point(o), people, rowTemplate, strings));
    if (link && l) lines.push(changeRow("funnelStep", "fromSelfServe", w.oppsFromSelfServe, l, linkTarget !== null ? point(linkTarget) : l, people, rowTemplate, strings));
  }
  lines.push(changeRow("funnelStep", "won", w.won, s.today.won, s.projected.won, people, rowTemplate, strings));
  if (s.assumptions.length) lines.push({ row: "footer", text: s.assumptions.map((a) => w.slgAssumption[a]).join(" ") });
  return lines;
}

/** Sales-assisted's what-if slides: each moved lever alone, then — two or more — all of them together (`slg:scenario`). */
export function buildSlgWhatIfSlides(state: EngineState, strings: Words, ctx: EngineCalcContext): { id: SlideId; slide: BuiltSlide }[] {
  const levers = movedSlgLevers(state, strings, ctx);
  const { approxMoney, roundMoney } = whatIfPrinters(state, strings, ctx);
  const notes = [strings.notes.whatIf];

  const slides: { id: SlideId; slide: BuiltSlide }[] = levers.map((lever) => {
    const gain = slgMrrGain(lever.alone);
    const values = { stage: strings.leverSubject[lever.id], from: lever.from, to: lever.to };
    const title: SlideTitle = isPricedGain(gain) ? { key: "whatIfLever", values: { ...values, gain: approxMoney(gain) } } : { key: "whatIfLeverPlain", values };
    const curve = slideCurve(lever.alone.today, lever.alone.projected, strings.slide.curveWhatifOne, state, strings, ctx);
    return {
      id: `whatif:${lever.id}`,
      slide: { present: true, title, lines: slgScenarioLines(state, lever.alone, strings.slide.whatIfRowOne, strings, ctx), notes, ...(curve ? { curve } : {}) },
    };
  });
  if (levers.length < 2) return slides;

  const targets: Partial<Record<SlgLeverId, number>> = Object.fromEntries(levers.map((l) => [l.id, state.whatIf![l.id]!]));
  const all = buildSlgScenario(state, targets, ctx);
  const gain = slgMrrGain(all);
  const n = String(levers.length);
  const leverRows: Row[] = levers.map((lever) => {
    const alone = slgMrrGain(lever.alone);
    const own = alone ? formatChange(alone, roundMoney, strings.units) : "";
    return {
      row: "lever",
      id: lever.id,
      label: capitalise(strings.leverSubject[lever.id]),
      from: lever.from,
      to: lever.to,
      gain: own,
      text: fillSegments(strings.slide.whatIfLeverRow, { from: lever.from, to: lever.to, gain: own }),
    };
  });
  const together: Row[] = [];
  if (gain) {
    const sum = levers.map((l) => slgMrrGain(l.alone)!).reduce((acc, g) => ({ lo: acc.lo + g.lo, hi: acc.hi + g.hi }), { lo: 0, hi: 0 });
    const extra = changeOf(sum, gain);
    const total = formatChange(gain, roundMoney, strings.units);
    together.push({
      row: "together",
      text:
        gain.lo > 0 && extra.lo >= 1
          ? fillTemplate(strings.scenario.together, { total, extra: approxMoney(extra) })
          : fillTemplate(strings.scenario.togetherNoExtra, { total }),
    });
  }
  slides.push({
    id: "slg:scenario",
    slide: {
      present: true,
      title: isPricedGain(gain) ? { key: "scenario", values: { n, gain: approxMoney(gain) } } : { key: "scenarioPlain", values: { n } },
      lines: [...leverRows, ...together, ...slgScenarioLines(state, all, strings.slide.whatIfRowAll, strings, ctx)],
      notes,
      ...withDrawings(
        slideCurve(all.today, all.projected, fillTemplate(strings.slide.curveWhatifAll, { n }), state, strings, ctx),
        slideLeverSum(
          levers.map((l) => ({ id: l.id, label: capitalise(strings.leverSubject[l.id]), from: l.from, to: l.to, gain: slgMrrGain(l.alone) })),
          gain,
          state,
          strings,
          ctx,
        ),
      ),
    },
  });
  return slides;
}

// --- total — « deux moteurs, un total » (§18.6.2, §18.8.2) -----------------------

/**
 * The total slide's body: the two blocks, self-serve then sales-assisted —
 * the MRR and the new MRR of the month as the sum prints them, and the stage
 * each diagnosis names with the slide it is on (`stageOf`, filled once the
 * slides are numbered) — the link between them with what it is not, then
 * the sums. The footer prints rule S8: who counts where.
 */
export function buildTotalSlide(
  state: EngineState,
  derived: EngineDerived,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
  slideOf: (motion: Motion) => number | null,
  tools: string,
): BuiltSlide {
  const total = derived.total!;
  const t = strings.total;
  const blocks = totalBlocks(total, state, strings, ctx);
  const lines: Row[] = blocks.map((b) => {
    const stage = stageOf(derived, b.motion, strings, metrics, slideOf(b.motion));
    const label = strings.hybrid.motionName[b.motion];
    const figures = [b.mrr ? `${t.mrr} ${b.mrr}` : "", b.newMrr ? `${t.newMrr} ${b.newMrr}` : ""].filter(Boolean);
    return { row: "totalBlock", id: b.motion, label, mrr: b.mrr, newMrr: b.newMrr, stage, text: [...figures, stage].filter(Boolean).join(" · ") };
  });
  const link = linkSentence(total, state, strings, ctx);
  if (link) lines.push({ row: "link", text: link, note: t.linkNote });
  for (const sum of totalSums(total, state, strings, ctx)) lines.push({ row: "sum", id: sum.key, text: sum.text });
  const month = formatMonth(currentSnapshot(state).referenceMonth, ctx.locale);
  lines.push({ row: "footer", text: fillSegments(t.footer, { month, tools }) });
  return { present: true, title: totalTitle(total, state, strings, ctx), lines, notes: [] };
}

/**
 * A block's stage line: the stage its diagnosis names, « (slide n) » when its
 * leak slide is in the deck; « rien ne freine » or « pas assez de cibles »
 * otherwise. Never a comparison with the other block (§18.6.4).
 */
function stageOf(derived: EngineDerived, motion: Motion, strings: Words, metrics: ResolvedMetric[], slide: number | null): string {
  const m = motionOf(derived, motion);
  if (!m) return "";
  const d = m.diagnosis;
  const t = strings.total;
  if (d.state === "level") return t.stageLevel;
  if (d.state === "not-enough") return t.stageNotEnough;
  const stage = capitalise(joinList((d.named as MetricId[]).map((id) => subjectOf(id, strings, metrics)), strings.grammar));
  return slide === null ? stage : fillTemplate(t.stageNamed, { stage, i: String(slide) });
}

// --- unit-economics — the two motions side by side (§18.8.2) ----------------------

const monthsText = (d: DerivedValue, strings: Words, ctx: EngineCalcContext) => (d.kind === "known" ? formatDurationInterval(d.value, "months", ctx, strings.units) : "");

/**
 * The hybrid's unit-economics slide (§18.8.2), side by side since design
 * system extension 09 (Q12, A20.d T4.d): self-serve then sales-assisted, two
 * columns, never summed and never sorted — the LTV, the payback, the loss
 * belong to one engine (§18.6.4, C4). Each column: its five tiles (the CAC
 * with its variant, the LTV, the LTV:CAC, the payback, the cash tied up) and
 * its picture (`PaybackChart`, compact: its months on the axis row), from the
 * same scenarios as the board's money blocks. One note under both: GRR and NRR
 * for self-serve, the renewal for sales-assisted, what the cash assumes, the
 * dotted reference. The footer stays the model's: the two segments, the
 * lifetime cap, a company-wide margin standing in for a motion's (C25 Q4),
 * two CACs that count different spend.
 *
 * The title: both paybacks, one, or why neither (§18.6.4) — and, when a loss
 * is certain on either side, what each side says (C48): « Libre-service : on
 * perd ~400 € par nouveau client. Assisté : remboursé en 19 mois. » In ink
 * (C53), self-serve first.
 */
export function buildUnitBoth(
  state: EngineState,
  derived: EngineDerived,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): { present: boolean; title: SlideTitle; lines: Row[]; paybackCharts: { plg?: SlidePaybackChart; slg?: SlidePaybackChart }; loss: boolean } {
  const plg = motionOf(derived, "plg") as PlgDerived;
  const slg = motionOf(derived, "slg") as SlgDerived;
  const units = strings.units;
  const currency = state.setup.currency;
  const s = strings.slide;
  const known = (id: MetricId) => {
    const k = knownIn(state, id, ctx);
    return k.kind === "known" ? k.value : null;
  };
  const money = (i: Interval | null) => (i ? formatInterval(i, "money", ctx, units, { currency }) : "");
  const missingOf = (d: DerivedValue) => (d.kind === "uncomputable" ? d.missing : []);
  const phrase = (ids: readonly MetricId[]) => unitInputsPhrase(ids, strings, metrics);
  // Today's money, each engine's own, from the scenarios the board's money blocks read: nothing moved.
  const plgMoney = unitMoney({ state, k: buildScenario(state, {}, ctx).today.kpis, slg: false, unit: plg.unit, strings, metrics, ctx });
  const slgMoney = unitMoney({ state, k: buildSlgScenario(state, {}, ctx).today, slg: true, unit: slg.unit, strings, metrics, ctx });

  // The title: both paybacks, one, or why neither.
  const pb = monthsText(plg.unit.payback, strings, ctx);
  const sb = monthsText(slg.unit.payback, strings, ctx);
  let title: SlideTitle;
  if (pb && sb) title = { key: "unitEconomicsBoth", values: { plg: pb, slg: sb } };
  else if (pb) title = { key: "unitEconomicsOneSidePlg", values: { m: pb, input: phrase(missingOf(slg.unit.payback)) } };
  else if (sb) title = { key: "unitEconomicsOneSideSlg", values: { m: sb, input: phrase(missingOf(plg.unit.payback)) } };
  else if (!known("rev.gross-margin") && !known("slg.rev.gross-margin")) title = { key: "unitEconomicsNoneMargins", values: {} };
  else title = { key: "unitEconomicsNoneDifferent", values: { plg: phrase(missingOf(plg.unit.payback)), slg: phrase(missingOf(slg.unit.payback)) } };
  // A certain loss on either side: what each side says (C48).
  const loss = Boolean(plgMoney.lossTitle || slgMoney.lossTitle);
  if (loss) {
    const side = (m: typeof plgMoney, payback: string) =>
      m.lossTitle ? fillTemplate(s.unitSideLoss, { gap: m.lossTitle.values.gap ?? "" }) : payback ? fillTemplate(s.unitSideRepaid, { m: payback }) : s.unitSideUnknown;
    title = { key: "unitEconomicsSides", values: { plg: side(plgMoney, pb), slg: side(slgMoney, sb) } };
  }

  // Each engine's five tiles, its cash note and its warning: the column's rows, tagged with their engine (`motion`).
  const uncomputable = (d: DerivedValue) => (d.kind === "uncomputable" ? fillTemplate(s.unitMissing, { input: phrase(d.missing) }) : "");
  const variantOf = (id: "acq.cac" | "slg.acq.cac") => {
    const variant = currentSnapshot(state).metrics[id]?.variant;
    return metricOf(metrics, id).variants?.find((v) => v.id === variant)?.label ?? "";
  };
  const names = strings.hybrid.motionName;
  const column = (motion: Motion, m: typeof plgMoney, unit: { ltv: DerivedValue; payback: DerivedValue; ltvCac: DerivedValue }, cacId: "acq.cac" | "slg.acq.cac"): Row[] => {
    const tile = (row: string, id: string, label: string, value: string, note: string): Row => ({
      row,
      motion,
      id,
      label,
      value,
      note,
      // The export says what is missing, never a bare « ? »: the slide draws the « ? », the text explains it.
      text: [names[motion], value || (note ? "" : s.noNumber), note].filter(Boolean).join(" · "),
    });
    const cac = money(known(cacId));
    const variant = variantOf(cacId);
    const cash = m.rows.find((r) => r.row === "cash");
    return [
      { row: "cac", motion, id: cacId, label: strings.scenario.kpiCac, value: cac, variant, text: [names[motion], cac || s.noNumber, cac ? lowerFirst(variant) : ""].filter(Boolean).join(" · ") },
      tile("ltv", "ltv", strings.scenario.kpiLtv, unit.ltv.kind === "known" ? formatApproxMoneyInterval(unit.ltv.value, currency, ctx, units) : "", uncomputable(unit.ltv)),
      tile("ltvCac", "ltvCac", strings.scenario.rowLtvCac, unit.ltvCac.kind === "known" ? fillTemplate(units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, units) }) : "", uncomputable(unit.ltvCac)),
      tile("payback", "payback", strings.scenario.kpiPayback, monthsText(unit.payback, strings, ctx), uncomputable(unit.payback)),
      // The cash's note only when it reads without the chart: « ne revient pas toute », or what is missing.
      tile("cash", "cash", strings.scenario.rowCash, cash?.value ?? "", cash && (!cash.value || m.lossTitle) ? (cash.note ?? "") : ""),
      ...m.rows.filter((r) => r.row === "warning").map((r) => ({ ...r, motion })),
    ];
  };
  const lines: Row[] = [...column("plg", plgMoney, plg.unit, "acq.cac"), ...column("slg", slgMoney, slg.unit, "slg.acq.cac")];

  // One note under both: self-serve's GRR and NRR, sales-assisted's renewal, what the cash assumes, the reference.
  const percent = (d: DerivedValue | Interval | null) => (!d ? "" : "kind" in d ? (d.kind === "known" ? formatInterval(d.value, "percent", ctx, units) : "") : formatInterval(d, "percent", ctx, units));
  const grr = percent(plg.unit.grr);
  const nrr = percent(plg.unit.nrr);
  const renewal = percent(known("slg.ret.renewal"));
  const cashes = [plgMoney, slgMoney].map((m) => m.rows.find((r) => r.row === "assume")).filter(Boolean);
  const outpaced = [buildScenario(state, {}, ctx).today.kpis.cash, buildSlgScenario(state, {}, ctx).today.cash].some((c) => c && !c.floor);
  const note = [
    grr || nrr ? fillTemplate(s.unitBothRetention, { grr: grr || "?", nrr: nrr || "?" }) : "",
    renewal ? fillTemplate(slg.unit.renewalTerm === "monthly" ? s.unitBothRenewalMonthly : s.unitBothRenewal, { rate: renewal }) : "",
    cashes.length > 0 ? (outpaced ? s.unitBothCashOutpaced : s.unitBothCash) : "",
    plgMoney.chart?.reference != null || slgMoney.chart?.reference != null ? s.unitBothReference : "",
  ].filter(Boolean);
  if (note.length > 0) lines.push({ row: "assume", text: note.join(" ") });

  // The footer: what the two columns are, and what to know before quoting a cell.
  const wide = (["plg", "slg"] as const).filter((m) => marginIsCompanyWide(state, m));
  const variants = derived.sanity.find((c) => c.id === "cac-variants-differ");
  const footer = [
    strings.hybrid.twoEngines,
    plg.unit.ltv.kind === "known" || slg.unit.ltv.kind === "known" ? s.unitCap : "",
    wide.length === 2 ? s.unitCompanyWideBoth : wide.length === 1 ? fillTemplate(s.unitCompanyWide, { motion: strings.hybrid.motionSubject[wide[0]!] }) : "",
    variants ? sanityText(variants, strings, ctx.locale, metrics) : "",
  ].filter(Boolean);
  lines.push({ row: "footer", text: footer.join(" · ") });

  const present = [plg.unit.ltv, plg.unit.payback, plg.unit.ltvCac, slg.unit.ltv, slg.unit.payback, slg.unit.ltvCac].some((d) => d.kind === "known") || Boolean(known("acq.cac") || known("slg.acq.cac"));
  const paybackCharts = { ...(plgMoney.chart ? { plg: plgMoney.chart } : {}), ...(slgMoney.chart ? { slg: slgMoney.chart } : {}) };
  return { present, title, lines, paybackCharts, loss };
}

/**
 * Sales-assisted alone: the v1 slide's title and tiles, on its own figures —
 * the CAC with its variant, the payback, the LTV and LTV:CAC, the lifetime
 * cap. No GRR or NRR tile: the NRR is a number sales-assisted types (§18.5.4).
 */
export function buildUnitSlg(
  state: EngineState,
  slg: SlgDerived,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
  derivedNames: readonly ResolvedDerived[],
): { present: boolean; title: SlideTitle; lines: Row[]; paybackChart: SlidePaybackChart | null; loss: boolean } {
  const { unit } = slg;
  const units = strings.units;
  const currency = state.setup.currency;
  const cac = knownIn(state, "slg.acq.cac", ctx);
  // Today's money, from the scenario the board's money block reads (A20.d T4.c): nothing moved.
  const money = unitMoney({ state, k: buildSlgScenario(state, {}, ctx).today, slg: true, unit, strings, metrics, ctx });
  const present = cac.kind === "known" || [unit.ltv, unit.payback, unit.ltvCac].some((d) => d.kind === "known");
  // A certain loss titles the slide (C48); otherwise the v1 title.
  const title: SlideTitle = money.lossTitle
    ? money.lossTitle
    : unit.payback.kind === "known" && unit.ltvCac.kind === "known"
      ? {
          key: "unitEconomics",
          values: {
            m: formatDurationInterval(unit.payback.value, "months", ctx, units),
            x: fillTemplate(units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, units) }),
          },
        }
      : {
          key: "unitEconomicsUnknown",
          values: {
            input: unitInputsPhrase(
              [...new Set([...(unit.payback.kind === "uncomputable" ? unit.payback.missing : []), ...(unit.ltvCac.kind === "uncomputable" ? unit.ltvCac.missing : [])])],
              strings,
              metrics,
            ),
          },
        };

  const variantId = currentSnapshot(state).metrics["slg.acq.cac"]?.variant;
  const cacValue = cac.kind === "known" ? formatInterval(cac.value, "money", ctx, units, { currency }) : "";
  const variant = metricOf(metrics, "slg.acq.cac").variants?.find((v) => v.id === variantId)?.label ?? "";
  const figure = (row: string, id: string, d: DerivedValue, value: string, caveat = ""): Row => {
    const named = derivedNames.find((x) => x.id === id);
    const note = !value && d.kind === "uncomputable" && named ? fillTemplate(named.uncomputable, { input: unitInputsPhrase(d.missing, strings, metrics) }) : value ? caveat : "";
    return { row, id, label: named?.name ?? "", value, note, text: [value, note].filter(Boolean).join(" · ") || strings.slide.noNumber };
  };
  const lines: Row[] = [
    { row: "cac", id: "slg.acq.cac", label: metricOf(metrics, "slg.acq.cac").name, value: cacValue, variant, text: cacValue ? [cacValue, lowerFirst(variant)].filter(Boolean).join(" · ") : strings.slide.noNumber },
    figure("payback", "slg.rev.cac-payback", unit.payback, monthsText(unit.payback, strings, ctx)),
    figure("ltv", "slg.rev.ltv", unit.ltv, unit.ltv.kind === "known" ? formatApproxMoneyInterval(unit.ltv.value, currency, ctx, units) : ""),
    figure("ltvCac", "slg.rev.ltv-cac", unit.ltvCac, unit.ltvCac.kind === "known" ? fillTemplate(units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, units) }) : "", money.ratioNote),
    // The months after payback, the cash, the warning, what the cash assumes (A20.d T4.c). No GRR or NRR: see above.
    ...money.rows,
  ];
  if (unit.ltv.kind === "known") lines.push({ row: "cap", text: strings.slide.unitCap });
  return { present, title, lines, paybackChart: money.chart, loss: money.lossTitle !== null };
}
