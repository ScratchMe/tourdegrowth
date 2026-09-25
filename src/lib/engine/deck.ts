import { CANDIDATE_IDS, DERIVED_SHAPES, METRIC_SHAPES, PELOTON_METRICS, shapeOf } from "./catalog-shape";
import { nextMonth, currentMonth, periodOf, windowDaysOf } from "./cohort";
import { comparatorOf, impactTarget } from "./diagnose";
import { formatComparator } from "./findings";
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
  formatPerHundred,
  formatPerHundredCount,
  joinList,
  lowerFirst,
  roundSignificant,
} from "./format";
import { impactHeadline, whatIf } from "./impact";
import { mapBounds, point } from "./interval";
import {
  blindSentence,
  catalogueValues,
  chainTemplate,
  churnWithoutCommonAmount,
  fillSegments,
  notEnoughBelowValues,
  numbered,
  sideText,
  stagePhrase,
  subjectOf,
  unitInputsPhrase,
  worthOf,
} from "./phrases";
import { BASIS_KEY, REPAIR_KEY, ROLE_KEY, STATUS_KEY } from "./strings";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "./strings";
import { SLIDE_ORDER } from "./types";
import type {
  CandidateId,
  Comparator,
  DeckModel,
  DeckSlide,
  DerivedId,
  EngineCalcContext,
  EngineDerived,
  EngineState,
  Impact,
  ImpactLine,
  MetricId,
  MissingCause,
  Peloton,
  RepairScale,
  SlideId,
  SlideTitle,
  SourceRef,
  TrackingLevel,
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
 * Every `lines` row carries a `row` key naming its kind. A row a slide prints
 * as words carries them finished: `text` (a sentence, or the row's figures
 * joined by « · ») and, where the row is about one number or one stage,
 * `label` (its name, as a label). `id` is the machine id, never printed. The
 * words themselves are chosen in `phrases.ts` — with their article inside a
 * sentence, on the right side of a comparator for churn, in the grammatical
 * number of the printed count — and `sentences-guard.test.ts` sweeps every
 * sentence this module can produce.
 */

type Words = EngineStrings;
type Row = Record<string, string>;

/** The prose a few rows name computed figures and Tour answers with. Optional: without it those rows print their figures unlabelled. */
export interface DeckProse {
  derived?: ResolvedDerived[];
  bridges?: ResolvedBridge[];
}

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

// Kept importable from here: the board's verdict reached for it before phrases.ts existed.
export { stagePhrase };

/** A source as its label: a tool's name, a role, or "other" — never a person's name. */
export function sourceLabel(source: SourceRef | null | undefined, strings: Words): string {
  if (!source) return "";
  if (source.kind === "tool") return strings.tools[source.tool];
  if (source.kind === "person") return strings.role[ROLE_KEY[source.role]];
  return strings.source.other;
}

// --- Slide 1: the peloton ----------------------------------------------------

const CLAUSES = [
  ["clauseActivated", "a"],
  ["clauseD30", "r"],
  ["clausePaid", "p"],
] as const;

/**
 * The peloton's verdict title (§9.3 slide 1) — the same function for the
 * board's verdict (§7 E2) and the slide, so screen and slide can't word one
 * engine two ways. Counts are formatted from each column's RAW rate, so
 * "fewer than 1 in 100 (4 in 1,000)" survives where the grid rounds to 0;
 * each clause's verb agrees with its own printed count (« 1 paie »).
 */
export function pelotonTitle(state: EngineState, peloton: Peloton, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): SlideTitle {
  const clauses = PELOTON_METRICS.map((id, i) => {
    const k = knownIn(state, id, ctx);
    if (k.kind !== "known") return null;
    // As printed: under half a person the count reads "fewer than 1", which French agrees in the singular.
    const printed = k.value.hi > 0 && k.value.hi < 0.5 ? point(0) : mapBounds(k.value, Math.round);
    const [key, placeholder] = CLAUSES[i]!;
    return fillTemplate(strings.peloton[numbered(key, printed, ctx.locale)], { [placeholder]: formatPerHundredCount(k.value, ctx, strings.units) });
  });
  if (peloton.chain === "complete") return { key: "pelotonComplete", values: { activated: clauses[0]!, d30: clauses[1]!, paid: clauses[2]! } };
  if (peloton.chain === "empty") return { key: "pelotonEmpty", values: {} };

  const known = clauses.filter((c): c is string => c !== null);
  const unknown = PELOTON_METRICS.filter((_, i) => clauses[i] === null).map((id) => stagePhrase(id, strings, metrics));
  const one = unknown.length === 1;
  const key = peloton.chain === "gap" ? (one ? "pelotonGapOne" : "pelotonGap") : one ? "pelotonTailBreakOne" : "pelotonTailBreak";
  return { key, values: { clauses: joinList(known, strings.grammar), stages: joinList(unknown, strings.grammar) } };
}

function pelotonLines(state: EngineState, peloton: Peloton, strings: Words, ctx: EngineCalcContext): Row[] {
  const snapshot = currentSnapshot(state);
  const visitors = peloton.visitorsPerHundred;
  // The template carries its own "~": the count here is the two-significant-digit number alone.
  const n = visitors ? formatCountInterval(mapBounds(visitors, (v) => roundSignificant(v, 2)), ctx, strings.units) : "";
  const source = sourceLabel(peloton.upstreamSource, strings);
  const month = peloton.upstreamPeriod ? formatMonth(peloton.upstreamPeriod, ctx.locale) : "";
  const lines: Row[] = [
    { row: "upstream", n, source, month, text: visitors ? fillSegments(strings.peloton.upstream, { n, source, month }) : strings.visual.upstreamUnknown },
  ];

  const referred = knownIn(state, "ref.referred-share", ctx);
  if (referred.kind === "known") {
    lines.push({
      row: "legendReferred",
      label: strings.peloton.signups,
      text: fillTemplate(strings.peloton.legendReferred, { n: formatPerHundredCount(referred.value, ctx, strings.units) }),
    });
  }

  const labels: Record<(typeof PELOTON_METRICS)[number], string> = {
    "act.rate": strings.peloton.activated,
    "ret.d30": strings.peloton.d30,
    "rev.paid-conversion": fillTemplate(strings.peloton.paid, { n: String(state.setup.paidWindowDays) }),
  };
  for (const c of peloton.columns) {
    const k = knownIn(state, c.metric, ctx);
    const status = statusOf(entryOf(snapshot, c.metric));
    // A measured column cites its tool; an estimate or two conflicting numbers say so instead.
    const where = c.source ? sourceLabel(c.source, strings) : k.kind === "known" ? lowerFirst(strings.status[STATUS_KEY[status]]) : "";
    const period = c.period ? formatMonth(c.period, ctx.locale) : "";
    lines.push({
      row: "column",
      id: c.metric,
      label: labels[c.metric],
      value: k.kind === "known" ? formatPerHundredCount(k.value, ctx, strings.units) : "",
      source: [where, period].filter(Boolean).join(" · "),
      text: k.kind === "known" ? [formatPerHundred(k.value, ctx, strings.units), where, period].filter(Boolean).join(" · ") : strings.slide.noNumber,
    });
  }
  return lines;
}

// --- Slide 2: the leak -------------------------------------------------------

/**
 * "20 % (low end of the commonly cited range)" or "30 % (team target)" — the
 * target's own words (§9.3). Churn is measured to its reference's cautious
 * bound, which for a lower-is-better metric is the HIGH end, and says so.
 */
export function targetPhrase(comparator: Comparator, id: CandidateId, state: EngineState, strings: Words, ctx: EngineCalcContext): string {
  const value = formatInterval(point(impactTarget(comparator)), shapeOf(id).unit, ctx, strings.units, { currency: state.setup.currency });
  if (comparator.kind === "target") return fillTemplate(strings.whatIf.targetTeam, { value });
  return fillTemplate(comparator.direction === "higher" ? strings.whatIf.targetReference : strings.whatIf.targetReferenceHigh, { value });
}

/** One chain line as the sentence the slide prints; `label` is the line's lead-in ("Aujourd'hui", "Si"…). */
export function chainLine(line: ImpactLine, impact: Impact, stage: string, target: string, strings: Words, locale: EngineCalcContext["locale"]): Row {
  const { label, template } = chainTemplate(line, impact, strings.whatIf, locale);
  // The "if" line quotes the target in its own words; "then" keeps the bare number its arithmetic needs.
  const values = { ...line.values, stage, ...(line.key === "if" ? { target } : {}) };
  return { row: "calc", key: line.key, label: label ?? "", text: fillTemplate(template, values) };
}

interface LeakBuild {
  present: boolean;
  title: SlideTitle;
  lines: Row[];
  notes: string[];
}

type AsideTone = "below" | "neutral" | "unknown";

function buildLeak(state: EngineState, derived: Omit<EngineDerived, "findings">, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): LeakBuild {
  const { diagnosis } = derived;
  const locale = ctx.locale;
  const absent: LeakBuild = { present: false, title: { key: "leakLevel", values: {} }, lines: [], notes: [] };
  const subject = (id: MetricId) => subjectOf(id, strings, metrics);
  const impactOf = (id: CandidateId): Impact | null => {
    const comparator = diagnosis.positions[id].comparator;
    return comparator ? whatIf(state, id, impactTarget(comparator), ctx, strings.units) : null;
  };

  const lines: Row[] = [];
  const notes: string[] = [];
  let title: SlideTitle;
  /** What closing the named gap is worth, for the notes that compare the others with it. */
  let top: string | null = null;

  if (diagnosis.state === "clear") {
    const id = diagnosis.named[0]!;
    const comparator = diagnosis.positions[id].comparator;
    const impact = impactOf(id);
    // An unpriced stage (day-30 retention, referred share) or a gain under one customer has no title the copy can say truthfully.
    if (!comparator || !impact || impact.lines.some((l) => l.key === "less-than-one")) return absent;
    const stage = subject(id);
    const target = targetPhrase(comparator, id, state, strings, ctx);
    const head = impactHeadline(impact);
    if (head.amount) {
      title = { key: impact.kind === "retained-mrr" ? "leakClearMrrRetained" : "leakClearMrrNew", values: { stage, target, amount: head.amount } };
    } else if (head.n) {
      const base = impact.kind === "per-hundred" ? "leakClearPerHundred" : id === "ret.logo-churn" ? "leakClearKept" : "leakClearCustomers";
      title = { key: numbered(base, head.count, locale), values: { stage, target, n: head.n } };
    } else {
      return absent;
    }
    for (const line of impact.lines) lines.push(chainLine(line, impact, stage, target, strings, locale));
    const caveat = comparator.kind === "reference" ? (metricOf(metrics, id).benchmarkCaveat ?? "") : "";
    lines.push({
      row: "footer",
      // The assumption is said here, once (spec §9.3): the calculation multiplies activation into payers.
      text: fillSegments(strings.slide.leakFooter, {
        assumption: id === "act.rate" ? strings.slide.leakAssumption : "",
        caveat: caveat ? fillTemplate(strings.slide.leakCaveat, { range: formatComparator(comparator, id, state, ctx, strings.units), caveat }) : "",
      }),
    });
    notes.push(fillTemplate(strings.notes.compared, { comparator: target }));
    top = worthOf(impact, strings, locale);
  } else if (diagnosis.state === "shared") {
    title = { key: "leakShared", values: { n: String(diagnosis.named.length), list: joinList(diagnosis.named.map(subject), strings.grammar) } };
  } else if (diagnosis.state === "level") {
    title = { key: "leakLevel", values: {} };
  } else {
    const values = notEnoughBelowValues(diagnosis, strings, metrics);
    if (!values) return absent;
    title = { key: "leakNotEnoughBelow", values };
  }

  // Alongside: every other candidate, where it stands — on the right side of its comparator, and what it is worth.
  const r = strings.notes.ranking;
  for (const id of CANDIDATE_IDS) {
    if (diagnosis.state === "clear" && id === diagnosis.named[0]) continue;
    const { position, comparator } = diagnosis.positions[id];
    const side = sideText(position, comparator, strings);
    let text: string;
    let ranking: string;
    let tone: AsideTone = "neutral";
    if (position === "unknown") {
      [text, ranking, tone] = [strings.slide.cannotExclude, r.unknown, "unknown"];
    } else if (!side) {
      [text, ranking] = [strings.slide.noComparator, r.noComparator];
    } else if (position === "below") {
      const impact = impactOf(id);
      const worth = impact ? worthOf(impact, strings, locale) : null;
      tone = "below";
      text = `${side} · ${worth ?? strings.slide.unpricedShort}`;
      ranking =
        id === "ret.logo-churn" && churnWithoutCommonAmount(diagnosis)
          ? fillTemplate(r.belowNoArpa, { side })
          : worth && top
            ? fillTemplate(r.belowWorth, { side, worth, top })
            : fillTemplate(r.belowUnpriced, { side });
    } else {
      [text, ranking] = [side, position === "maybe-below" ? fillTemplate(r.maybe, { side }) : side];
    }
    const name = metricOf(metrics, id).name;
    lines.push({ row: "aside", id, label: name, metric: name, text, tone });
    if (diagnosis.state === "clear") notes.push(fillTemplate(strings.notes.whyNot, { stage: subject(id), ranking: capitalise(ranking) }));
  }
  const blind = blindSentence(diagnosis.blind, strings, metrics);
  if (blind) lines.push({ row: "blind", text: blind });
  notes.push(strings.notes.seasonal);
  return { present: true, title, lines, notes };
}

// --- Slide 3: visibility -----------------------------------------------------

function buildVisibility(state: EngineState, derived: Omit<EngineDerived, "findings">, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): { title: SlideTitle; lines: Row[] } {
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

  // « 0 chiffre sur 15 », « 1 chiffre sur 15 »: the noun agrees with the printed count.
  const documented = fillTemplate(strings.slide[numbered("documented", point(n), ctx.locale)], { n: String(n), N: String(N) });
  const title: SlideTitle =
    k === 0
      ? { key: "visibilityAllDocumented", values: { N: String(N) } }
      : k === 1
        ? { key: "visibilityOne", values: { documented, repair } }
        : { key: "visibility", values: { documented, k: String(k), repair } };

  const lines: Row[] = METRIC_SHAPES.map((s) => {
    const name = metricOf(metrics, s.id).name;
    const status = strings.status[STATUS_KEY[statusOf(entryOf(snapshot, s.id))]];
    return { row: "metric", id: s.id, label: strings.stages[s.stage], metric: name, status, text: `${name} · ${status}` };
  });
  for (const u of undocumented) {
    const status = statusOf(u.entry);
    const name = metricOf(metrics, u.id).name;
    // The fact, as a slide says it — not the reader's own voice the screen's cause labels use (« je n'y ai pas accès »).
    const cause = status === "missing" && u.entry?.missing ? strings.slide.cause[SLIDE_CAUSE_KEY[u.entry.missing.cause]] : lowerFirst(strings.status[STATUS_KEY[status]]);
    // A role, never a person (§9.1).
    const role = u.entry?.missing?.ownerRole ? strings.role[ROLE_KEY[u.entry.missing.ownerRole]] : u.entry?.request ? strings.role[ROLE_KEY[u.entry.request.role]] : "";
    const fix = strings.repair[REPAIR_KEY[u.repair]];
    lines.push({ row: "missing", id: u.id, label: name, metric: name, cause, role, repair: fix, text: [cause, role, fix].filter(Boolean).join(" · ") });
  }
  return { title, lines };
}

/**
 * The slide's own cause words. Not `CAUSE_KEY`: that one indexes the screen's
 * labels, written in the reader's first person (« je n'y ai pas accès ») and
 * wider (it also holds the conflicting / not-applicable choices, which are
 * statuses here, not causes). A slide states the fact, in no one's voice.
 */
const SLIDE_CAUSE_KEY: Record<MissingCause, keyof Words["slide"]["cause"]> = {
  "not-tracked": "notTracked",
  "not-computed": "notComputed",
  "no-access": "noAccess",
  "no-definition": "noDefinition",
};

// --- Slide 4: unit economics ------------------------------------------------

function buildUnitEconomics(
  state: EngineState,
  derived: Omit<EngineDerived, "findings">,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
  prose: DeckProse,
): { present: boolean; title: SlideTitle; lines: Row[] } {
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
    title = { key: "unitEconomicsUnknown", values: { input: unitInputsPhrase(missing, strings, metrics) } };
  }

  const variantId = currentSnapshot(state).metrics["acq.cac"]?.variant;
  const cacValue = cac.kind === "known" ? formatInterval(cac.value, "money", ctx, strings.units, { currency }) : "";
  // Always written: "media-only CAC" and "fully loaded CAC" are two numbers that print the same.
  const variant = metricOf(metrics, "acq.cac").variants?.find((v) => v.id === variantId)?.label ?? "";
  const figure = (row: string, id: DerivedId, value: string, missing: readonly MetricId[] | null): Row => {
    const d = prose.derived?.find((x) => x.id === id);
    const note = !value && missing && d ? fillTemplate(d.uncomputable, { input: unitInputsPhrase(missing, strings, metrics) }) : "";
    return { row, id, label: d?.name ?? "", value, note, text: value || note || strings.slide.noNumber };
  };
  const lines: Row[] = [
    { row: "cac", id: "acq.cac", label: metricOf(metrics, "acq.cac").name, value: cacValue, variant, text: cacValue ? [cacValue, variant].filter(Boolean).join(" · ") : strings.slide.noNumber },
    figure("payback", "rev.cac-payback", unit.payback.kind === "known" ? formatDurationInterval(unit.payback.value, "months", ctx, strings.units) : "", unit.payback.kind === "uncomputable" ? unit.payback.missing : null),
    figure("ltv", "rev.ltv", unit.ltv.kind === "known" ? formatApproxMoneyInterval(unit.ltv.value, currency, ctx, strings.units) : "", unit.ltv.kind === "uncomputable" ? unit.ltv.missing : null),
    figure(
      "ltvCac",
      "rev.ltv-cac",
      unit.ltvCac.kind === "known" ? fillTemplate(strings.units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, strings.units) }) : "",
      unit.ltvCac.kind === "uncomputable" ? unit.ltvCac.missing : null,
    ),
  ];
  // The cap only qualifies a lifetime value that exists.
  if (unit.ltv.kind === "known") lines.push({ row: "cap", text: strings.slide.unitCap });
  return { present, title, lines };
}

// --- Slide 6: the ask --------------------------------------------------------

function buildAsk(
  state: EngineState,
  derived: Omit<EngineDerived, "findings">,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): { present: boolean; title: SlideTitle; lines: Row[] } {
  const snapshot = currentSnapshot(state);
  const ask = state.deck.ask;
  const currency = state.setup.currency;
  const what = ask.what.trim();
  const metricText = (id: MetricId, value: number | undefined) =>
    value === undefined ? "" : formatInterval(point(value), shapeOf(id).unit, ctx, strings.units, { currency });

  // What to measure first when nothing is asked for: the team's own first pick; else a blind ★ — the number
  // whose absence keeps the diagnosis from concluding, which is what "before deciding where to invest" means —
  // else the cheapest missing number to repair.
  const missing = METRIC_SHAPES.filter((s) => statusOf(entryOf(snapshot, s.id)) === "missing")
    .map((s) => ({ id: s.id, repair: entryOf(snapshot, s.id)?.missing?.repair ?? s.defaultRepair }))
    .sort((a, b) => REPAIR_ORDER.indexOf(a.repair) - REPAIR_ORDER.indexOf(b.repair));
  const first =
    missing.find((m) => m.id === ask.measureFirst[0]) ?? missing.find((m) => derived.diagnosis.blind.includes(m.id)) ?? missing[0];

  // The goal, from what the team filled in — only those parts, so no « de  à  d'ici ».
  const id = ask.successMetric;
  const known = id ? knownIn(state, id, ctx) : null;
  const current = id && known?.kind === "known" ? formatInterval(known.value, shapeOf(id).unit, ctx, strings.units, { currency }) : "";
  const target = id ? metricText(id, ask.successTarget) : "";
  let goal = "";
  if (id && target) {
    const metric = lowerFirst(metricOf(metrics, id).name);
    goal = fillTemplate(current ? strings.slide.askGoal : strings.slide.askGoalNoCurrent, { metric, current, target });
    if (ask.horizon) {
      goal = fillTemplate(strings.slide.askGoalHorizon, {
        goal,
        horizon: fillTemplate(strings.units.quarter, { q: String(ask.horizon.quarter), year: String(ask.horizon.year) }),
      });
    }
  }

  let present = true;
  let title: SlideTitle;
  if (what) title = goal ? { key: "ask", values: { what, goal } } : { key: "askPlain", values: { what } };
  else if (first) title = { key: "askMeasureFirst", values: { cost: strings.repair[REPAIR_KEY[first.repair]], metric: lowerFirst(metricOf(metrics, first.id).name) } };
  else {
    // Nothing asked for and nothing missing: there is no ask to put on a slide.
    present = false;
    title = { key: "askPlain", values: { what } };
  }

  const lines: Row[] = ask.bullets.filter((b) => b.trim()).map((text) => ({ row: "bullet", text }));
  if (ask.cost) {
    lines.push({
      row: "cost",
      text: ask.cost.kind === "money" ? formatMoney(ask.cost.amount, currency, ctx.locale) : fillTemplate(strings.ask.costTeam, { weeks: String(ask.cost.weeks), people: String(ask.cost.people) }),
    });
  }
  if (id && goal) {
    const [year, month] = nextMonth(currentMonth(ctx.today)).split("-").map(Number) as [number, number];
    const checkpoint = fillTemplate(strings.slide.askCheckpoint, { date: formatDay(new Date(year, month - 1, 1), ctx.locale) });
    const name = metricOf(metrics, id).name;
    lines.push({ row: "know", id, label: name, metric: name, current, target, checkpoint, text: [capitalise(goal), checkpoint].join(" · ") });
  }
  // A title that says « pour mesurer d'abord ce qui manque (rétention à J30) » must show that number below it:
  // with no pick of the team's own, the one the title named is the list.
  const measure = ask.measureFirst.length ? ask.measureFirst : !what && first ? [first.id] : [];
  for (const m of measure) {
    const entry = entryOf(snapshot, m);
    const repair = strings.repair[REPAIR_KEY[entry?.missing?.repair ?? shapeOf(m).defaultRepair]];
    const role = strings.role[ROLE_KEY[entry?.missing?.ownerRole ?? shapeOf(m).defaultRole]];
    const name = metricOf(metrics, m).name;
    lines.push({ row: "measure", id: m, label: name, metric: name, repair, role, text: [repair, role].join(" · ") });
  }
  return { present, title, lines };
}

// --- Slide 5: the mirror -------------------------------------------------------

/** Found, in words: the statuses already say it (tracked = « Trouvé », approximate = « Estimé », unknown = « Introuvable »). */
const FOUND_STATUS: Record<TrackingLevel, "measured" | "estimated" | "missing"> = {
  tracked: "measured",
  approximate: "estimated",
  unknown: "missing",
};

function mirrorLines(mirror: NonNullable<EngineDerived["mirror"]>, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext, prose: DeckProse): Row[] {
  const isDerived = (id: MetricId | DerivedId): id is DerivedId => DERIVED_SHAPES.some((s) => s.id === id);
  const lines: Row[] = mirror.rows.map((row) => {
    const label = isDerived(row.metric) ? (prose.derived?.find((d) => d.id === row.metric)?.name ?? "") : metricOf(metrics, row.metric).name;
    const answer = prose.bridges?.find((b) => b.questionId === row.questionId)?.options.find((o) => o.points === row.declaredPoints)?.label;
    // Nobody has looked yet (to do, requested): « à renseigner », not a verdict.
    const found = lowerFirst(strings.status[row.found ? FOUND_STATUS[row.found] : "todo"]);
    return {
      row: "bridge",
      id: row.metric,
      questionId: row.questionId,
      label,
      points: String(row.declaredPoints),
      found: row.found ?? "",
      verdict: row.verdict ?? "",
      text: answer ? fillTemplate(strings.mirror.card, { answer, points: String(row.declaredPoints), found }) : found,
    };
  });
  const takenAt = Date.parse(mirror.takenAt);
  if (!Number.isNaN(takenAt)) {
    const date = formatDay(new Date(takenAt), ctx.locale);
    lines.push({
      row: "tourFooter",
      text: mirror.total === null ? fillTemplate(strings.visual.mirrorTakenAtNoScore, { date }) : fillTemplate(strings.slide.tourFooter, { score: String(mirror.total), date }),
    });
  }
  return lines;
}

// --- Annex -------------------------------------------------------------------

function buildAnnex(state: EngineState, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): Row[] {
  const snapshot = currentSnapshot(state);
  return METRIC_SHAPES.map((shape) => {
    const entry = entryOf(snapshot, shape.id);
    const metric = metricOf(metrics, shape.id);
    const period = periodOf(shape, entry, snapshot);
    const days = windowDaysOf(shape, state.setup);
    const known = knownIn(state, shape.id, ctx);
    const confidence = known.kind === "known" ? known.confidence : entry ? confidenceOf(entry) : "unknown";
    return {
      row: "annex",
      id: shape.id,
      number: metric.name,
      // The same words the request and the sheet fill: « ayant déclenché l'événement « a créé un premier projet » ».
      formula: fillTemplate(metric.formula, catalogueValues(state, shape.id, strings, metrics, ctx)),
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

export function buildDeck(state: EngineState, derived: EngineDerived, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext, prose: DeckProse = {}): DeckModel {
  const snapshot = currentSnapshot(state);
  const starsKnown = METRIC_SHAPES.filter((s) => s.primary && knownIn(state, s.id, ctx).kind === "known").length;
  // Under two ★ known, the message is "we can't see the engine yet": visibility leads and there is no leak to name (§9.2).
  const blindEngine = starsKnown < 2;

  const leak = buildLeak(state, derived, strings, metrics, ctx);
  const visibility = buildVisibility(state, derived, strings, metrics, ctx);
  const unit = buildUnitEconomics(state, derived, strings, metrics, ctx, prose);
  const ask = buildAsk(state, derived, strings, metrics, ctx);
  const mirrorLinked = Boolean(state.tourLink && derived.mirror && derived.mirror.resultId === state.tourLink.resultId);
  const mirror = derived.mirror;

  // One note per measured column: where it comes from. The column's period IS its cohort month.
  const pelotonNotes = derived.peloton.columns
    .filter((c) => c.source && c.period)
    .map((c) =>
      fillTemplate(strings.notes.source, {
        metric: metricOf(metrics, c.metric).name,
        tool: sourceLabel(c.source, strings),
        cohort: formatMonth(c.period!, ctx.locale),
      }),
    );

  const built: Record<SlideId, Omit<DeckSlide, "id" | "included" | "index">> = {
    peloton: {
      present: true,
      title: pelotonTitle(state, derived.peloton, strings, metrics, ctx),
      lines: pelotonLines(state, derived.peloton, strings, ctx),
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
      lines: mirror ? mirrorLines(mirror, strings, metrics, ctx, prose) : [],
      notes: [],
    },
    ask: { present: ask.present, title: ask.title, lines: ask.lines, notes: [] },
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
  const cohort = formatMonth(snapshot.cohortMonth, ctx.locale);
  const toolList = joinList(tools, strings.grammar);
  const company = state.deck.showCompany && state.setup.companyLabel?.trim() ? `${state.setup.companyLabel.trim()} · ` : "";

  return {
    slides,
    checks: derived.sanity,
    dataPill: { measured: derived.coverage.found, approximate: derived.coverage.approximate, missing: derived.coverage.missing },
    kicker: { company, month },
    footer: {
      cohort,
      month,
      tools: toolList,
      credit: state.deck.showSiteCredit ? strings.slide.credit : "",
      // Finished: with no tool measured, « sources : » is dropped whole rather than left dangling.
      text: fillSegments(strings.slide.footer, { cohort, month, tools: toolList }),
    },
  };
}

/** Machine keys: ids and states a slide maps to its own words, never printed as they are. */
const MACHINE_KEYS: ReadonlySet<string> = new Set(["row", "key", "id", "questionId", "tone", "found", "verdict", "points"]);

/** The value of a line in the text export: its sentence (after its label) when it has one, else its fields. */
function lineText(line: Row): string {
  if (line.text) return line.label ? `${line.label} · ${line.text}` : line.text;
  return Object.entries(line)
    .filter(([key, value]) => !MACHINE_KEYS.has(key) && value !== "")
    .map(([, value]) => value)
    .join(" · ");
}

/**
 * "Copy the text and notes" (§9.4): each included slide's title, its lines,
 * then the speaker notes as quotes. The `**…**` accent reads as Markdown
 * bold, which is what someone pasting into their own deck wants.
 */
export function deckMarkdown(model: DeckModel, strings: Words): string {
  const out: string[] = [
    fillTemplate(strings.slide.kicker, model.kicker),
    fillTemplate(strings.slide.dataPill, {
      m: String(model.dataPill.measured),
      a: String(model.dataPill.approximate),
      x: String(model.dataPill.missing),
    }),
  ];
  const included = model.slides.filter((s) => s.included).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const slide of included) {
    const body = [
      ...slide.lines.map(lineText).filter(Boolean).map((text) => `- ${text}`),
      ...slide.notes.map((note) => `> ${note}`),
    ];
    // A title-only slide gets no empty body: one blank line between slides, never two.
    out.push("", `## ${slide.index}. ${renderTitle(slide.title, strings)}`);
    if (body.length) out.push("", ...body);
  }
  out.push("", model.footer.text ?? fillSegments(strings.slide.footer, model.footer));
  if (model.footer.credit) out.push(model.footer.credit);
  return out.join("\n");
}

/** Present for reuse by the board: the comparator of a candidate, formatted — "20 à 40 %" or "30 %". */
export function comparatorText(state: EngineState, id: CandidateId, strings: Words, ctx: EngineCalcContext): string {
  const comparator = comparatorOf(state, id);
  return comparator ? formatComparator(comparator, id, state, ctx, strings.units) : "";
}
