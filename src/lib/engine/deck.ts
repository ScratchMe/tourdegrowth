import { CANDIDATE_IDS, METRIC_SHAPES, PELOTON_METRICS, shapeOf } from "./catalog-shape";
import { nextMonth, currentMonth, periodOf, windowDaysOf } from "./cohort";
import { comparatorOf, impactTarget } from "./diagnose";
import { CHAIN_VERB, formatComparator } from "./findings";
import {
  capitalise,
  fillTemplate,
  formatApproxMoneyInterval,
  formatCountInterval,
  formatDay,
  formatDuration,
  formatDurationInterval,
  formatInterval,
  formatMoney,
  formatMonth,
  formatPerHundredCount,
  joinList,
  lowerFirst,
  roundSignificant,
} from "./format";
import { impactHeadline, whatIf } from "./impact";
import { mapBounds, point } from "./interval";
import { BASIS_KEY, CAUSE_KEY, REPAIR_KEY, ROLE_KEY, STATUS_KEY } from "./strings";
import type { EngineStrings, ResolvedMetric } from "./strings";
import { SLIDE_ORDER } from "./types";
import type {
  CandidateId,
  Comparator,
  DeckModel,
  DeckSlide,
  EngineCalcContext,
  EngineDerived,
  EngineState,
  Impact,
  ImpactLine,
  MetricId,
  Peloton,
  RepairScale,
  SlideId,
  SlideTitle,
  SourceRef,
} from "./types";
import { confidenceOf, currentSnapshot, entryOf, knownIn, statusOf } from "./values";

/**
 * deck.ts — the CODIR deck as a MODEL (engine spec §6.12, §9).
 *
 * This module picks the slides, their order, the key of each title template
 * and every number already formatted; the slide components only place the
 * strings. Two consequences are the point of the design:
 *
 * - **A title and its body come from the same object.** The `leak` title
 *   quotes the amount the "× ARPA" line of the same `whatIf` chain prints —
 *   read from that line, not recomputed — so the CODIR prototype's "+2 à
 *   +3 k€" over "+1 400 à +2 600 €" can't happen (a test holds it).
 * - **Data titles are not editable** (D10). A retitled slide can contradict
 *   its own body; the text export is where someone rewrites in their deck.
 *
 * Every `lines` row carries a `row` key naming its kind and, where the slide
 * prints a sentence, a `text` already filled — the slide places, the text
 * export copies, neither assembles copy.
 */

type Words = EngineStrings;

const DEFAULT_INCLUDE: Record<SlideId, boolean> = {
  peloton: true,
  leak: true,
  visibility: true,
  "unit-economics": true,
  // The Tour is a self-assessment: shown only when the gap is the argument (D13, decision 4).
  mirror: false,
  ask: true,
  annex: true,
};

const REPAIR_ORDER: readonly RepairScale[] = ["meeting", "afternoon", "sprint", "quarter"];

/** The title template filled, `**…**` kept: the slide renders it as the red accent, Markdown as bold. */
export function renderTitle(title: SlideTitle, strings: Words): string {
  return fillTemplate(strings.slideTitles[title.key], title.values);
}

function metricOf(metrics: ResolvedMetric[], id: MetricId): ResolvedMetric {
  const m = metrics.find((x) => x.id === id);
  if (!m) throw new Error(`No resolved prose for engine metric ${id}`);
  return m;
}

/**
 * How a stage is named mid-sentence. The three peloton columns have their
 * own phrase with its article ("l'activation"); the others fall back to the
 * metric's name, lower-cased. See the report: the copy has no article-ful
 * phrase for sign-up rate, referred share and churn yet.
 */
export function stagePhrase(id: MetricId, strings: Words, metrics: ResolvedMetric[]): string {
  if ((PELOTON_METRICS as readonly string[]).includes(id)) return strings.peloton.unmeasured[CHAIN_VERB[id as (typeof PELOTON_METRICS)[number]]];
  return lowerFirst(metricOf(metrics, id).name);
}

/** A source as its label: a tool's name, a role, or "other" — never a person's name. */
export function sourceLabel(source: SourceRef | null | undefined, strings: Words): string {
  if (!source) return "";
  if (source.kind === "tool") return strings.tools[source.tool];
  if (source.kind === "person") return strings.role[ROLE_KEY[source.role]];
  return strings.source.other;
}

/** "a, b et c" with empty parts dropped — for templates whose segments are joined by " · ". */
function tidy(text: string): string {
  return text
    .split(" · ")
    .filter((part) => part.trim() !== "")
    .join(" · ");
}

// --- Slide 1: the peloton ----------------------------------------------------

/**
 * The peloton's verdict title (§9.3 slide 1) — the same function for the
 * board's verdict (§7 E2) and the slide, so screen and slide can't word one
 * engine two ways. Counts are formatted from each column's RAW rate, so
 * "fewer than 1 in 100 (4 in 1,000)" survives where the grid rounds to 0.
 */
export function pelotonTitle(state: EngineState, peloton: Peloton, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): SlideTitle {
  const count = (id: MetricId) => {
    const k = knownIn(state, id, ctx);
    return k.kind === "known" ? formatPerHundredCount(k.value, ctx, strings.units) : null;
  };
  const [a, r, p] = PELOTON_METRICS.map(count);
  if (peloton.chain === "complete") return { key: "pelotonComplete", values: { a: a!, r: r!, p: p! } };
  if (peloton.chain === "empty") return { key: "pelotonEmpty", values: {} };

  const clauseKeys = { "act.rate": "clauseActivated", "ret.d30": "clauseD30", "rev.paid-conversion": "clausePaid" } as const;
  const placeholder = { "act.rate": "a", "ret.d30": "r", "rev.paid-conversion": "p" } as const;
  const clauses: string[] = [];
  const unknown: string[] = [];
  PELOTON_METRICS.forEach((id, i) => {
    const n = [a, r, p][i];
    if (n) clauses.push(fillTemplate(strings.peloton[clauseKeys[id]], { [placeholder[id]]: n }));
    else unknown.push(stagePhrase(id, strings, metrics));
  });
  const one = unknown.length === 1;
  const key = peloton.chain === "gap" ? (one ? "pelotonGapOne" : "pelotonGap") : one ? "pelotonTailBreakOne" : "pelotonTailBreak";
  return { key, values: { clauses: joinList(clauses, strings.grammar), stages: joinList(unknown, strings.grammar) } };
}

// --- Slide 2: the leak -------------------------------------------------------

const LINE_TEMPLATE = {
  flow: { today: "todayFlow", if: "ifFlow", then: "thenFlow", times: "timesFlow" },
  churn: { today: "todayChurn", if: "ifFlow", then: "thenChurn", times: "timesChurn" },
} as const;

/** "20 % (low end of the commonly cited range)" or "30 % (your target)" — the target's own words (§9.3). */
export function targetPhrase(comparator: Comparator, id: CandidateId, state: EngineState, strings: Words, ctx: EngineCalcContext): string {
  const value = formatInterval(point(impactTarget(comparator)), shapeOf(id).unit, ctx, strings.units, { currency: state.setup.currency });
  if (comparator.kind === "target") return fillTemplate(strings.whatIf.targetTeam, { value });
  // For churn the cautious bound is the HIGH end, and the copy only says "low end": the value alone, rather than a false parenthesis.
  return comparator.direction === "higher" ? fillTemplate(strings.whatIf.targetReference, { value }) : value;
}

/** One chain line as the sentence the slide prints; `label` is the line's lead-in ("Aujourd'hui", "Si"…). */
export function chainLine(line: ImpactLine, impact: Impact, stage: string, target: string, strings: Words): Record<string, string> {
  const set = impact.metric === "ret.logo-churn" ? LINE_TEMPLATE.churn : LINE_TEMPLATE.flow;
  const values = { ...line.values, stage, target: line.key === "if" ? target : (line.values.target ?? "") };
  switch (line.key) {
    case "today":
      // Per 100 sign-ups has no monthly volume: the copy's "new paying customers a month" would be false there.
      return { row: "calc", key: line.key, label: strings.whatIf.today, text: impact.kind === "per-hundred" ? line.values.rate! : fillTemplate(strings.whatIf[set.today], values) };
    case "if":
      return { row: "calc", key: line.key, label: strings.whatIf.if, text: fillTemplate(strings.whatIf[set.if], values) };
    case "then":
      return { row: "calc", key: line.key, label: strings.whatIf.then, text: fillTemplate(strings.whatIf[set.then], { ...line.values }) };
    case "times":
      return { row: "calc", key: line.key, label: strings.whatIf.times, text: fillTemplate(strings.whatIf[set.times], line.values) };
    case "annual":
      return { row: "calc", key: line.key, label: "", text: fillTemplate(strings.whatIf.annual, line.values) };
    default:
      return { row: "calc", key: line.key, label: "", text: strings.whatIf.lessThanOne };
  }
}

function positionText(id: CandidateId, derived: Omit<EngineDerived, "findings">, amount: string | null, strings: Words): string {
  switch (derived.diagnosis.positions[id].position) {
    case "within":
      return strings.slide.withinReference;
    case "above":
      return strings.diagnosis.above;
    case "maybe-below":
      return strings.diagnosis.maybeBelowShort;
    case "no-comparator":
      return strings.diagnosis.noComparator;
    case "unknown":
      return strings.slide.cannotExclude;
    default:
      return amount ?? (derived.diagnosis.positions[id].comparator?.kind === "target" ? strings.diagnosis.stampTarget : strings.diagnosis.stampReference);
  }
}

interface LeakBuild {
  present: boolean;
  title: SlideTitle;
  lines: Record<string, string>[];
  notes: string[];
}

function buildLeak(state: EngineState, derived: Omit<EngineDerived, "findings">, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): LeakBuild {
  const { diagnosis } = derived;
  const absent: LeakBuild = { present: false, title: { key: "leakLevel", values: {} }, lines: [], notes: [] };
  const phrase = (id: MetricId) => stagePhrase(id, strings, metrics);
  const firstBelow = CANDIDATE_IDS.find((id) => diagnosis.positions[id].position === "below");

  const amountOf = (id: CandidateId): string | null => {
    const comparator = diagnosis.positions[id].comparator;
    if (!comparator || diagnosis.positions[id].position !== "below") return null;
    const impact = whatIf(state, id, impactTarget(comparator), ctx, strings.units);
    const head = impact ? impactHeadline(impact) : null;
    return head?.amount ?? null;
  };

  const lines: Record<string, string>[] = [];
  const notes: string[] = [];
  let title: SlideTitle;

  if (diagnosis.state === "clear") {
    const id = diagnosis.named[0]!;
    const comparator = diagnosis.positions[id].comparator;
    const impact = comparator ? whatIf(state, id, impactTarget(comparator), ctx, strings.units) : null;
    // An unpriced stage (day-30 retention, referred share) or a gain under one customer has no title the copy can say truthfully.
    if (!comparator || !impact || impact.lines.some((l) => l.key === "less-than-one")) return absent;
    const stage = phrase(id);
    const target = targetPhrase(comparator, id, state, strings, ctx);
    const head = impactHeadline(impact);
    if (head.amount) title = { key: impact.kind === "retained-mrr" ? "leakClearMrrRetained" : "leakClearMrrNew", values: { stage, target, amount: head.amount } };
    else title = { key: impact.kind === "per-hundred" ? "leakClearPerHundred" : "leakClearCustomers", values: { stage, target, n: head.n ?? "" } };
    for (const line of impact.lines) lines.push(chainLine(line, impact, stage, target, strings));
    if (id === "act.rate") lines.push({ row: "assumption", text: strings.whatIf.assumptionActivation });
    const caveat = comparator.kind === "reference" ? (metricOf(metrics, id).benchmarkCaveat ?? "") : "";
    lines.push({
      row: "footer",
      text: tidy(fillTemplate(strings.slide.leakFooter, { assumption: id === "act.rate" ? strings.whatIf.assumptionActivation : "", caveat })),
    });
    notes.push(fillTemplate(strings.notes.compared, { comparator: target }));
  } else if (diagnosis.state === "shared") {
    const names = diagnosis.named.map(phrase);
    title = { key: "leakShared", values: { n: String(diagnosis.named.length), list: joinList(names, strings.grammar) } };
  } else if (diagnosis.state === "level") {
    title = { key: "leakLevel", values: {} };
  } else if (firstBelow) {
    title = { key: "leakNotEnoughBelow", values: { stage: capitalise(phrase(firstBelow)) } };
  } else {
    return absent;
  }

  // Alongside: every other candidate, where it stands — "within the reference", "no reference", "can't be ruled out".
  for (const id of CANDIDATE_IDS) {
    if (diagnosis.state === "clear" && id === diagnosis.named[0]) continue;
    const text = positionText(id, derived, amountOf(id), strings);
    lines.push({ row: "aside", metric: metricOf(metrics, id).name, text });
    if (diagnosis.state === "clear") notes.push(fillTemplate(strings.notes.whyNot, { stage: phrase(id), ranking: text }));
  }
  if (diagnosis.blind.length > 0) {
    const key = diagnosis.blind.length === 1 ? "blindOne" : "blind";
    lines.push({ row: "blind", text: fillTemplate(strings.diagnosis[key], { stages: capitalise(joinList(diagnosis.blind.map(phrase), strings.grammar)) }) });
  }
  notes.push(strings.notes.seasonal);
  return { present: true, title, lines, notes };
}

// --- Slide 3: visibility -----------------------------------------------------

function buildVisibility(state: EngineState, derived: Omit<EngineDerived, "findings">, strings: Words, metrics: ResolvedMetric[]): { title: SlideTitle; lines: Record<string, string>[] } {
  const snapshot = currentSnapshot(state);
  const { coverage } = derived;
  const n = coverage.found + coverage.approximate;
  const N = coverage.denominator;
  const k = N - n;

  // What is not documented, cheapest repair first: a missing number's own estimate, else the catalogue's default.
  const undocumented = METRIC_SHAPES.filter((s) => ["todo", "requested", "missing"].includes(statusOf(entryOf(snapshot, s.id)))).map((s) => {
    const entry = entryOf(snapshot, s.id);
    return { id: s.id, entry, repair: entry?.missing?.repair ?? s.defaultRepair };
  });
  undocumented.sort((a, b) => REPAIR_ORDER.indexOf(a.repair) - REPAIR_ORDER.indexOf(b.repair));
  const repairs = undocumented.map((u) => u.repair);
  const min = repairs[0];
  const max = repairs[repairs.length - 1];
  const repair =
    min === undefined || max === undefined
      ? ""
      : min === max
        ? fillTemplate(strings.slide.repairSingle, { repair: strings.repair[REPAIR_KEY[min]] })
        : fillTemplate(strings.slide.repairBetween, { min: strings.repair[REPAIR_KEY[min]], max: strings.repair[REPAIR_KEY[max]] });

  const title: SlideTitle =
    k === 0
      ? { key: "visibilityAllDocumented", values: { N: String(N) } }
      : { key: k === 1 ? "visibilityOne" : "visibility", values: { n: String(n), N: String(N), k: String(k), repair } };

  const lines: Record<string, string>[] = METRIC_SHAPES.map((s) => ({
    row: "metric",
    stage: s.stage,
    metric: metricOf(metrics, s.id).name,
    status: strings.status[STATUS_KEY[statusOf(entryOf(snapshot, s.id))]],
  }));
  for (const u of undocumented) {
    const status = statusOf(u.entry);
    lines.push({
      row: "missing",
      metric: metricOf(metrics, u.id).name,
      cause: status === "missing" && u.entry?.missing ? strings.cause[CAUSE_KEY[u.entry.missing.cause]] : strings.status[STATUS_KEY[status]],
      // A role, never a person (§9.1).
      role: u.entry?.missing?.ownerRole ? strings.role[ROLE_KEY[u.entry.missing.ownerRole]] : u.entry?.request ? strings.role[ROLE_KEY[u.entry.request.role]] : "",
      repair: strings.repair[REPAIR_KEY[u.repair]],
    });
  }
  return { title, lines };
}

// --- Slide 4: unit economics ------------------------------------------------

function buildUnitEconomics(state: EngineState, derived: Omit<EngineDerived, "findings">, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): { present: boolean; title: SlideTitle; lines: Record<string, string>[] } {
  const { unit } = derived;
  const cac = knownIn(state, "acq.cac", ctx);
  const currency = state.setup.currency;
  const present = cac.kind === "known" || [unit.ltv, unit.payback, unit.ltvCac].some((d) => d.kind === "known");

  let title: SlideTitle;
  if (unit.payback.kind === "known" && unit.ltvCac.kind === "known") {
    title = {
      key: "unitEconomics",
      values: {
        m: formatDurationInterval(unit.payback.value, "months", ctx, strings.units),
        x: fillTemplate(strings.units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, strings.units) }),
      },
    };
  } else {
    const missing = [...new Set([...(unit.payback.kind === "uncomputable" ? unit.payback.missing : []), ...(unit.ltvCac.kind === "uncomputable" ? unit.ltvCac.missing : [])])];
    title = { key: "unitEconomicsUnknown", values: { input: joinList(missing.map((id) => lowerFirst(metricOf(metrics, id).name)), strings.grammar) } };
  }

  const variantId = currentSnapshot(state).metrics["acq.cac"]?.variant;
  const lines: Record<string, string>[] = [
    {
      row: "cac",
      value: cac.kind === "known" ? formatInterval(cac.value, "money", ctx, strings.units, { currency }) : "",
      // Always written: "media-only CAC" and "fully loaded CAC" are two numbers that print the same.
      variant: metricOf(metrics, "acq.cac").variants?.find((v) => v.id === variantId)?.label ?? "",
    },
    { row: "payback", value: unit.payback.kind === "known" ? formatDurationInterval(unit.payback.value, "months", ctx, strings.units) : "" },
    { row: "ltv", value: unit.ltv.kind === "known" ? formatApproxMoneyInterval(unit.ltv.value, currency, ctx, strings.units) : "" },
    { row: "ltvCac", value: unit.ltvCac.kind === "known" ? fillTemplate(strings.units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, strings.units) }) : "" },
    { row: "cap", text: strings.slide.unitCap },
  ];
  return { present, title, lines };
}

// --- Slide 6: the ask --------------------------------------------------------

function buildAsk(state: EngineState, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): { title: SlideTitle; lines: Record<string, string>[] } {
  const snapshot = currentSnapshot(state);
  const ask = state.deck.ask;
  const currency = state.setup.currency;
  const metricText = (id: MetricId, value: number | undefined) =>
    value === undefined ? "" : formatInterval(point(value), shapeOf(id).unit, ctx, strings.units, { currency });

  // The cheapest missing number to repair — the honest default when the diagnosis can't conclude.
  const missing = METRIC_SHAPES.filter((s) => statusOf(entryOf(snapshot, s.id)) === "missing")
    .map((s) => ({ id: s.id, repair: entryOf(snapshot, s.id)?.missing?.repair ?? s.defaultRepair }))
    .sort((a, b) => REPAIR_ORDER.indexOf(a.repair) - REPAIR_ORDER.indexOf(b.repair));
  const first = ask.measureFirst[0] ? missing.find((m) => m.id === ask.measureFirst[0]) ?? missing[0] : missing[0];

  let title: SlideTitle;
  if (ask.what.trim() || !first) {
    const id = ask.successMetric;
    const current = id ? knownIn(state, id, ctx) : null;
    title = {
      key: "ask",
      values: {
        what: ask.what.trim(),
        metric: id ? lowerFirst(metricOf(metrics, id).name) : "",
        current: id && current?.kind === "known" ? formatInterval(current.value, shapeOf(id).unit, ctx, strings.units, { currency }) : "",
        target: id ? metricText(id, ask.successTarget) : "",
        horizon: ask.horizon ? fillTemplate(strings.units.quarter, { q: String(ask.horizon.quarter), year: String(ask.horizon.year) }) : "",
      },
    };
  } else {
    title = { key: "askMeasureFirst", values: { cost: strings.repair[REPAIR_KEY[first.repair]], metric: lowerFirst(metricOf(metrics, first.id).name) } };
  }

  const lines: Record<string, string>[] = ask.bullets.filter((b) => b.trim()).map((text) => ({ row: "bullet", text }));
  if (ask.cost) {
    lines.push({
      row: "cost",
      text: ask.cost.kind === "money" ? formatMoney(ask.cost.amount, currency, ctx.locale) : fillTemplate(strings.ask.costTeam, { weeks: String(ask.cost.weeks), people: String(ask.cost.people) }),
    });
  }
  if (ask.successMetric) {
    const [year, month] = nextMonth(currentMonth(ctx.today)).split("-").map(Number) as [number, number];
    lines.push({
      row: "know",
      metric: metricOf(metrics, ask.successMetric).name,
      current: title.values.current ?? "",
      target: metricText(ask.successMetric, ask.successTarget),
      checkpoint: fillTemplate(strings.slide.askCheckpoint, { date: formatDay(new Date(year, month - 1, 1), ctx.locale) }),
    });
  }
  for (const id of ask.measureFirst) {
    const entry = entryOf(snapshot, id);
    lines.push({
      row: "measure",
      metric: metricOf(metrics, id).name,
      repair: strings.repair[REPAIR_KEY[entry?.missing?.repair ?? shapeOf(id).defaultRepair]],
      role: strings.role[ROLE_KEY[entry?.missing?.ownerRole ?? shapeOf(id).defaultRole]],
    });
  }
  return { title, lines };
}

// --- Annex -------------------------------------------------------------------

function buildAnnex(state: EngineState, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): Record<string, string>[] {
  const snapshot = currentSnapshot(state);
  const event = snapshot.metrics["act.event"];
  const eventName = event?.status === "measured" && event.value?.kind === "text" ? event.value.text : lowerFirst(metricOf(metrics, "act.event").name);
  return METRIC_SHAPES.map((shape) => {
    const entry = entryOf(snapshot, shape.id);
    const metric = metricOf(metrics, shape.id);
    const period = periodOf(shape, entry, snapshot);
    const days = windowDaysOf(shape, state.setup);
    const known = knownIn(state, shape.id, ctx);
    const confidence = known.kind === "known" ? known.confidence : entry ? confidenceOf(entry) : "unknown";
    return {
      row: "annex",
      number: metric.name,
      formula: fillTemplate(metric.formula, {
        event: eventName,
        n: String(days),
        cohort: formatMonth(entry?.cohortMonth ?? snapshot.cohortMonth, ctx.locale),
        month: formatMonth(snapshot.referenceMonth, ctx.locale),
      }),
      window: days > 0 ? formatDuration(days, "days", ctx, strings.units) : "",
      period: period ? formatMonth(period, ctx.locale) : "",
      source: entry?.status === "measured" ? sourceLabel(entry.source, strings) : entry?.status === "estimated" && entry.estimate ? strings.basis[BASIS_KEY[entry.estimate.basis]] : "",
      status: strings.status[STATUS_KEY[statusOf(entry)]],
      confidence: strings.slide.confidence[confidence],
      // The user's own definition may travel; their private note NEVER does (§4.1).
      definition: entry?.definitionNote?.trim() ?? "",
    };
  });
}

// --- The model ----------------------------------------------------------------

export function buildDeck(state: EngineState, derived: EngineDerived, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): DeckModel {
  const snapshot = currentSnapshot(state);
  const starsKnown = METRIC_SHAPES.filter((s) => s.primary && knownIn(state, s.id, ctx).kind === "known").length;
  // Under two ★ known, the message is "we can't see the engine yet": visibility leads and there is no leak to name (§9.2).
  const blindEngine = starsKnown < 2;

  const leak = buildLeak(state, derived, strings, metrics, ctx);
  const visibility = buildVisibility(state, derived, strings, metrics);
  const unit = buildUnitEconomics(state, derived, strings, metrics, ctx);
  const ask = buildAsk(state, strings, metrics, ctx);
  const mirrorLinked = Boolean(state.tourLink && derived.mirror && derived.mirror.resultId === state.tourLink.resultId);
  const mirror = derived.mirror;

  const pelotonNotes = derived.peloton.columns
    .filter((c) => c.source && c.period)
    .map((c) =>
      fillTemplate(strings.notes.source, {
        tool: sourceLabel(c.source, strings),
        period: formatMonth(c.period!, ctx.locale),
        cohort: formatMonth(c.period!, ctx.locale),
      }),
    );

  const visitors = derived.peloton.visitorsPerHundred;
  const built: Record<SlideId, Omit<DeckSlide, "id" | "included" | "index">> = {
    peloton: {
      present: true,
      title: pelotonTitle(state, derived.peloton, strings, metrics, ctx),
      lines: [
        {
          row: "upstream",
          // The template carries its own "~": the count here is the two-significant-digit number alone.
          n: visitors ? formatCountInterval(mapBounds(visitors, (v) => roundSignificant(v, 2)), ctx, strings.units) : "",
          source: sourceLabel(derived.peloton.upstreamSource, strings),
          month: derived.peloton.upstreamPeriod ? formatMonth(derived.peloton.upstreamPeriod, ctx.locale) : "",
        },
        ...derived.peloton.columns.map((c) => ({
          row: "column",
          metric: c.metric,
          n: c.perHundred ? formatCountInterval(c.perHundred, ctx, strings.units) : "",
          source: sourceLabel(c.source, strings),
          period: c.period ? formatMonth(c.period, ctx.locale) : "",
        })),
      ],
      notes: [...pelotonNotes, strings.notes.seasonal],
    },
    leak: { present: leak.present && !blindEngine, title: leak.title, lines: leak.lines, notes: leak.notes },
    visibility: { present: true, title: visibility.title, lines: visibility.lines, notes: [] },
    "unit-economics": { present: unit.present, title: unit.title, lines: unit.lines, notes: [] },
    mirror: {
      present: mirrorLinked,
      title: {
        key: "mirror",
        values: mirror
          ? {
              k: String(mirror.rows.filter((row) => row.declared === "tracked").length),
              m: String(mirror.rows.filter((row) => row.declared === "tracked" && (row.found === "tracked" || row.found === "approximate")).length),
            }
          : { k: "0", m: "0" },
      },
      lines: mirror
        ? [
            ...mirror.rows.map((row) => ({
              row: "bridge",
              questionId: row.questionId,
              metric: row.metric,
              points: String(row.declaredPoints),
              found: row.found ?? "",
              verdict: row.verdict ?? "",
            })),
            {
              row: "tourFooter",
              text: fillTemplate(strings.slide.tourFooter, {
                score: mirror.total === null ? "" : String(mirror.total),
                date: Number.isNaN(Date.parse(mirror.takenAt)) ? "" : formatDay(new Date(Date.parse(mirror.takenAt)), ctx.locale),
              }),
            },
          ]
        : [],
      notes: [],
    },
    ask: { present: true, title: ask.title, lines: ask.lines, notes: [] },
    annex: { present: true, title: { key: "annex", values: {} }, lines: buildAnnex(state, strings, metrics, ctx), notes: [] },
  };

  const order: SlideId[] = blindEngine ? ["visibility", ...SLIDE_ORDER.filter((id) => id !== "visibility")] : [...SLIDE_ORDER];
  let index = 0;
  const slides: DeckSlide[] = order.map((id) => {
    const slide = built[id];
    const included = slide.present && (state.deck.include[id] ?? DEFAULT_INCLUDE[id]);
    return { id, ...slide, included, index: included ? ++index : null };
  });

  const tools = [
    ...new Set(
      METRIC_SHAPES.map((s) => entryOf(snapshot, s.id))
        .filter((e) => e?.status === "measured" && e.source?.kind === "tool")
        .map((e) => sourceLabel(e!.source, strings)),
    ),
  ];
  const month = formatMonth(snapshot.referenceMonth, ctx.locale);
  const company = state.deck.showCompany && state.setup.companyLabel?.trim() ? `${state.setup.companyLabel.trim()} · ` : "";

  return {
    slides,
    checks: derived.sanity,
    dataPill: { measured: derived.coverage.found, approximate: derived.coverage.approximate, missing: derived.coverage.missing },
    kicker: { company, month },
    footer: {
      cohort: formatMonth(snapshot.cohortMonth, ctx.locale),
      month,
      tools: joinList(tools, strings.grammar),
      credit: state.deck.showSiteCredit ? strings.slide.credit : "",
    },
  };
}

/** The value of a line in the text export: its sentence when it has one, else its fields, row key left out. */
function lineText(line: Record<string, string>): string {
  if (line.text) return line.label ? `${line.label} · ${line.text}` : line.text;
  return Object.entries(line)
    .filter(([key, value]) => key !== "row" && key !== "key" && value !== "")
    .map(([, value]) => value)
    .join(" · ");
}

/**
 * "Copy the text and notes" (§9.4): each included slide's title, its lines,
 * then the speaker notes as quotes. The `**…**` accent reads as Markdown
 * bold, which is what someone pasting into their own deck wants.
 */
export function deckMarkdown(model: DeckModel, strings: Words): string {
  const out: string[] = [fillTemplate(strings.slide.kicker, model.kicker), fillTemplate(strings.slide.dataPill, {
    m: String(model.dataPill.measured),
    a: String(model.dataPill.approximate),
    x: String(model.dataPill.missing),
  })];
  const included = model.slides.filter((s) => s.included).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const slide of included) {
    out.push("", `## ${slide.index}. ${renderTitle(slide.title, strings)}`, "");
    for (const line of slide.lines) {
      const text = lineText(line);
      if (text) out.push(`- ${text}`);
    }
    for (const note of slide.notes) out.push(`> ${note}`);
  }
  out.push("", tidy(fillTemplate(strings.slide.footer, model.footer)));
  if (model.footer.credit) out.push(model.footer.credit);
  return out.join("\n");
}

/** Present for reuse by the board: the comparator of a candidate, formatted — "20 à 40 %" or "30 %". */
export function comparatorText(state: EngineState, id: CandidateId, strings: Words, ctx: EngineCalcContext): string {
  const comparator = comparatorOf(state, id);
  return comparator ? formatComparator(comparator, id, state, ctx, strings.units) : "";
}
