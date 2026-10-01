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
} from "./deck";
import { linkSentence, relaysTitle, totalBlocks, totalSums, totalTitle } from "./deck-motions";
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
  formatPerHundred,
  formatPerHundredCount,
  joinList,
  lowerFirst,
  roundSignificant,
} from "./format";
import { mapBounds, point } from "./interval";
import { fillSegments, positionLabel, subjectOf, unitInputsPhrase } from "./phrases";
import { buildSlgScenario, oppsCreated, oppsFromSelfServe, slgLeverAlone, type SlgScenario, type SlgScenarioKpis } from "./slg-scenario";
import { sanityText } from "./sentences";
import { STATUS_KEY } from "./strings";
import type { EngineStrings, ResolvedDerived, ResolvedMetric } from "./strings";
import { lostInAYear, marginIsCompanyWide } from "./unit-economics";
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
const SLG_KPI_ROWS = [
  ["mrr12", "kpiMrr12"],
  ["newMrr", "kpiNewMrr"],
  ["nrr", "kpiNrr12"],
  ["cac", "kpiCac"],
  ["ltv", "kpiLtv"],
  ["payback", "kpiPayback"],
] as const satisfies readonly (readonly [Exclude<keyof SlgScenarioKpis, "mrr" | "won">, keyof Words["scenario"]])[];

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
 * quarter — the opportunities created (only the link moves them), in the
 * hybrid how many came from self-serve, and the new customers. The
 * assumptions that applied are the footer, as on every what-if slide.
 */
function slgScenarioLines(state: EngineState, s: SlgScenario, rowTemplate: string, strings: Words, ctx: EngineCalcContext): Row[] {
  const printers = whatIfPrinters(state, strings, ctx);
  const w = strings.scenario;
  const lines: Row[] = SLG_KPI_ROWS.map(([id, label]) => changeRow("kpi", id, w[label], s.today[id], s.projected[id], printers.kpis[id], rowTemplate, strings));
  const people = printers.steps.signups;
  const o = oppsCreated(state);
  const l = oppsFromSelfServe(state, ctx);
  const link = s.levers.find((x) => x.id === "link.pql-handoff");
  const linkTarget = link?.target ?? null;
  if (o !== null) {
    const projected = linkTarget !== null && l ? { lo: o + linkTarget - l.hi, hi: o + linkTarget - l.lo } : point(o);
    lines.push(changeRow("funnelStep", "opps", w.opps, point(o), projected, people, rowTemplate, strings));
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
    return { id: `whatif:${lever.id}`, slide: { present: true, title, lines: slgScenarioLines(state, lever.alone, strings.slide.whatIfRowOne, strings, ctx), notes } };
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
 * The hybrid's unit-economics slide: one title for both motions, self-serve
 * first whichever side is known (§18.6.4), then five rows of two cells. A
 * figure that can't be computed says what is missing; the footer carries
 * the fixed sentence of §18.6.4 and whatever the reader must know before
 * quoting a cell — the lifetime cap, a company-wide margin standing in for a
 * motion's (C25 Q4), two CACs that count different spend.
 */
export function buildUnitBoth(
  state: EngineState,
  derived: EngineDerived,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): { present: boolean; title: SlideTitle; lines: Row[] } {
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

  // The title: both paybacks, one, or why neither.
  const pb = monthsText(plg.unit.payback, strings, ctx);
  const sb = monthsText(slg.unit.payback, strings, ctx);
  let title: SlideTitle;
  if (pb && sb) title = { key: "unitEconomicsBoth", values: { plg: pb, slg: sb } };
  else if (pb) title = { key: "unitEconomicsOneSidePlg", values: { m: pb, input: phrase(missingOf(slg.unit.payback)) } };
  else if (sb) title = { key: "unitEconomicsOneSideSlg", values: { m: sb, input: phrase(missingOf(plg.unit.payback)) } };
  else if (!known("rev.gross-margin") && !known("slg.rev.gross-margin")) title = { key: "unitEconomicsNoneMargins", values: {} };
  else title = { key: "unitEconomicsNoneDifferent", values: { plg: phrase(missingOf(plg.unit.payback)), slg: phrase(missingOf(slg.unit.payback)) } };

  const uncomputable = (d: DerivedValue) => (d.kind === "uncomputable" ? fillTemplate(s.unitUncomputable, { input: phrase(d.missing) }) : "");
  const variantOf = (id: "acq.cac" | "slg.acq.cac") => {
    const variant = currentSnapshot(state).metrics[id]?.variant;
    return metricOf(metrics, id).variants?.find((v) => v.id === variant)?.label ?? "";
  };
  const cac = (id: "acq.cac" | "slg.acq.cac") => {
    const value = money(known(id));
    return value ? [value, lowerFirst(variantOf(id))].filter(Boolean).join(" · ") : s.noNumber;
  };
  const ratio = (d: DerivedValue) => (d.kind === "known" ? fillTemplate(units.times, { n: formatInterval(d.value, "ratio", ctx, units) }) : uncomputable(d));
  const arpa = known("rev.arpa");
  const acv = known("slg.rev.acv");
  const lost = (motion: Motion) => {
    const d = lostInAYear(state, ctx, motion);
    if (d.kind !== "known") return s.noNumber;
    const annual = formatInterval(d.value, "percent", ctx, units);
    if (motion === "plg") {
      const churn = known("ret.logo-churn")!;
      return fillTemplate(s.unitLostPlg, { annual: fillTemplate(units.approx, { n: annual }), monthly: formatInterval(churn, "percent", ctx, units) });
    }
    return fillTemplate(slg.unit.renewalTerm === "monthly" ? s.unitLostSlgMonthly : s.unitLostSlg, { rate: annual });
  };

  const cells: [keyof Words["slide"]["unitRows"], string, string][] = [
    ["cac", cac("acq.cac"), cac("slg.acq.cac")],
    ["payback", pb || uncomputable(plg.unit.payback), sb || uncomputable(slg.unit.payback)],
    [
      "basket",
      arpa ? fillTemplate(s.unitBasketPlg, { arpa: money(arpa) }) : s.noNumber,
      acv ? fillTemplate(s.unitBasketSlg, { acv: money(acv), monthly: money(mapBounds(acv, (v) => Math.round(v / 12))) }) : s.noNumber,
    ],
    ["lostInAYear", lost("plg"), lost("slg")],
    ["ltvCac", ratio(plg.unit.ltvCac), ratio(slg.unit.ltvCac)],
  ];
  const names = strings.hybrid.motionName;
  const lines: Row[] = cells.map(([id, a, b]) => ({ row: "unitRow", id, label: s.unitRows[id], plg: a, slg: b, text: `${names.plg} ${a} · ${names.slg} ${b}` }));

  // The footer: what the two columns are, and what to know before quoting a cell.
  const wide = (["plg", "slg"] as const).filter((m) => marginIsCompanyWide(state, m));
  const variants = derived.sanity.find((c) => c.id === "cac-variants-differ");
  const footer = [
    strings.hybrid.twoSegments,
    plg.unit.ltv.kind === "known" || slg.unit.ltv.kind === "known" ? s.unitCap : "",
    wide.length === 2 ? s.unitCompanyWideBoth : wide.length === 1 ? fillTemplate(s.unitCompanyWide, { motion: strings.hybrid.motionSubject[wide[0]!] }) : "",
    variants ? sanityText(variants, strings, ctx.locale, metrics) : "",
  ].filter(Boolean);
  lines.push({ row: "footer", text: footer.join(" · ") });

  const present = [plg.unit.ltv, plg.unit.payback, plg.unit.ltvCac, slg.unit.ltv, slg.unit.payback, slg.unit.ltvCac].some((d) => d.kind === "known") || Boolean(known("acq.cac") || known("slg.acq.cac"));
  return { present, title, lines };
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
): { present: boolean; title: SlideTitle; lines: Row[] } {
  const { unit } = slg;
  const units = strings.units;
  const currency = state.setup.currency;
  const cac = knownIn(state, "slg.acq.cac", ctx);
  const present = cac.kind === "known" || [unit.ltv, unit.payback, unit.ltvCac].some((d) => d.kind === "known");
  const title: SlideTitle =
    unit.payback.kind === "known" && unit.ltvCac.kind === "known"
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
  const figure = (row: string, id: string, d: DerivedValue, value: string): Row => {
    const named = derivedNames.find((x) => x.id === id);
    const note = !value && d.kind === "uncomputable" && named ? fillTemplate(named.uncomputable, { input: unitInputsPhrase(d.missing, strings, metrics) }) : "";
    return { row, id, label: named?.name ?? "", value, note, text: [value, note].filter(Boolean).join(" · ") || strings.slide.noNumber };
  };
  const lines: Row[] = [
    { row: "cac", id: "slg.acq.cac", label: metricOf(metrics, "slg.acq.cac").name, value: cacValue, variant, text: cacValue ? [cacValue, lowerFirst(variant)].filter(Boolean).join(" · ") : strings.slide.noNumber },
    figure("payback", "slg.rev.cac-payback", unit.payback, monthsText(unit.payback, strings, ctx)),
    figure("ltv", "slg.rev.ltv", unit.ltv, unit.ltv.kind === "known" ? formatApproxMoneyInterval(unit.ltv.value, currency, ctx, units) : ""),
    figure("ltvCac", "slg.rev.ltv-cac", unit.ltvCac, unit.ltvCac.kind === "known" ? fillTemplate(units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, units) }) : ""),
  ];
  if (unit.ltv.kind === "known") lines.push({ row: "cap", text: strings.slide.unitCap });
  return { present, title, lines };
}
