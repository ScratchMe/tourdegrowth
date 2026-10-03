import {
  ALL_DERIVED_SHAPES,
  CANDIDATE_IDS,
  LEVER_IDS,
  LINK_METRIC_SHAPES,
  METRIC_SHAPES,
  PELOTON_METRICS,
  SLG_CANDIDATE_IDS,
  SLG_METRIC_SHAPES,
  REFERRAL_CANDIDATES,
  REFERRAL_PRICING_CEILING,
  isPricedAt,
  motionOfMetric,
  motionShapes,
  shapeOf,
} from "./catalog-shape";
import { nextMonth, currentMonth, monthsBefore, periodOf, periodRangeOf, windowDaysOf } from "./cohort";
import { comparatorOf, impactTarget } from "./diagnose";
import { formatComparator } from "./findings";
import {
  capitalise,
  fillTemplate,
  approxRounding,
  formatApproxMoneyInterval,
  formatChange,
  formatCountInterval,
  formatDay,
  formatDuration,
  formatDurationInterval,
  formatInterval,
  formatMoney,
  formatMonth,
  formatMonthRange,
  formatPerHundred,
  formatPerHundredCount,
  joinList,
  lowerFirst,
  pairPrecision,
  rateRounding,
  roundDisplay,
  roundSignificant,
} from "./format";
import { impactHeadline, whatIf } from "./impact";
import { mapBounds, point } from "./interval";
import {
  type AnyDiagnosis,
  blindSentence,
  catalogueValues,
  chainTemplate,
  churnWithoutCommonAmount,
  fillSegments,
  notEnoughBelowValues,
  numbered,
  sideText,
  slgChainTemplate,
  stagePhrase,
  subjectOf,
  unitInputsPhrase,
  worthOf,
} from "./phrases";
import { annexPages, type AnnexCells } from "./annex-pages";
import { buildEvolutionSlide, seasonalNote } from "./deck-series";
import { buildRelaysSlide, buildSlgWhatIfSlides, buildTotalSlide, buildUnitBoth, buildUnitSlg, motionOf } from "./deck-slg";
import { linkSentence } from "./deck-motions";
import { buildScenario, leverAlone } from "./scenario";
import { renewalTermOf, slgWhatIf } from "./slg-impact";
import { slgLeverAlone } from "./slg-scenario";
import type { MoneyKpis } from "./money";
import type { Scenario, ScenarioFunnel } from "./scenario";
import { BASIS_KEY, REPAIR_KEY, ROLE_KEY, STATUS_KEY } from "./strings";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "./strings";
import { includeKeyOf, SLIDE_ORDER } from "./types";
import type {
  CandidateId,
  PlgCandidateId,
  Comparator,
  DeckModel,
  DeckSlide,
  DerivedId,
  EngineCalcContext,
  EngineDerived,
  EngineState,
  Impact,
  ImpactLine,
  Interval,
  LeverId,
  MetricId,
  MirrorVerdict,
  MissingCause,
  Motion,
  Peloton,
  Position,
  RepairScale,
  FixedSlideId,
  SlideId,
  SlgCandidateId,
  SlideCurve,
  SlideLeverSum,
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
export type Row = Record<string, string>;

/** The prose a few rows name computed figures and Tour answers with. Optional: without it those rows print their figures unlabelled. */
export interface DeckProse {
  derived?: ResolvedDerived[];
  bridges?: ResolvedBridge[];
}

export const DEFAULT_INCLUDE: Record<FixedSlideId, boolean> = {
  peloton: true,
  leak: true,
  visibility: true,
  "unit-economics": true,
  // The Tour is a self-assessment: shown only when the gap is the argument (D13, decision 4).
  mirror: false,
  ask: true,
  annex: true,
};

export const REPAIR_ORDER: readonly RepairScale[] = ["meeting", "afternoon", "sprint", "quarter"];

/** The title template filled, `**…**` kept: the slide renders it as the red accent, Markdown as bold. */
export function renderTitle(title: SlideTitle, strings: Words): string {
  return fillTemplate(strings.slideTitles[title.key], title.values);
}

export function metricOf(metrics: ResolvedMetric[], id: MetricId): ResolvedMetric {
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

// --- User words on a slide (§10.4) ---------------------------------------------

/** Typed look-alikes of glyphs the slide fonts carry, and the few symbols people type for them. */
const GLYPH_SUBSTITUTES: Readonly<Record<string, string>> = {
  "\u202f": "\u00a0", // narrow no-break (a French keyboard's space before « : ») — absent from Stardos and Plex
  "\u2007": "\u00a0",
  "\u3000": " ",
  "“": '"',
  "”": '"',
  "„": '"',
  "‟": '"',
  "‘": "’",
  "‚": ",",
  "‛": "’",
  "‹": "«",
  "›": "»",
  "‐": "-",
  "‑": "-",
  "‒": "–",
  "―": "—",
  "−": "-",
  "≤": "<=",
  "≥": ">=",
  "≈": "~",
  "≠": "!=",
  "•": "·",
  "‣": "·",
  "∙": "·",
  "⇒": "→",
  "⟶": "→",
  "➔": "→",
  "➜": "→",
  "⇐": "←",
  "⟵": "←",
  œ: "oe",
  Œ: "OE",
};

/** What the three slide families draw (§10.4): printable Latin-1 plus – — ’ « » … € · × ÷ ±, and the two arrows `SlideText` draws. */
const SLIDE_GLYPH = /^[ -~\u00a0-\u00ff–—’«»…€·×÷±→←]$/u;

/**
 * The user's own words — the company label, the ask, its bullets, the
 * activation event's name, a definition — as the slide fonts can print them.
 * §10.4 whitelists the glyphs of the COPY and says nothing about what a
 * person types; this is the minimal behaviour that keeps a typed emoji or a
 * narrow no-break space from being drawn in a fallback face (on screen) or
 * embedded as DejaVu or Noto (in the PDF), which is the defect that list
 * exists to prevent:
 *
 * - typographic look-alikes become the glyph the fonts carry (NFC first, so
 *   a decomposed « é » is one letter again);
 * - a Latin letter outside Latin-1 loses its accent (« Škoda » → « Skoda »):
 *   readable in the brand face beats exact in a system one;
 * - emoji, pictographs, symbols and invisible joiners go — they carry nothing
 *   a leadership slide needs;
 * - a letter or digit of another script is KEPT: a name is data, and a slide
 *   that erased « 株式会社 » would say something false. It prints in a system
 *   face, which is the lesser harm.
 *
 * Applied in the model, not in the components, so the text export says what
 * the slides say.
 */
export function slideGlyphs(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    const substitute = GLYPH_SUBSTITUTES[ch];
    if (substitute !== undefined) {
      out += substitute;
    } else if (SLIDE_GLYPH.test(ch)) {
      out += ch;
    } else if (/\p{Script=Latin}/u.test(ch)) {
      const folded = ch.normalize("NFD").replace(/\p{M}/gu, "");
      out += [...folded].every((c) => SLIDE_GLYPH.test(c)) ? folded : ch;
    } else if (/[\p{L}\p{N}]/u.test(ch)) {
      out += ch;
    } else if (/\s/u.test(ch)) {
      out += " ";
    }
    // Everything else — pictographs, symbols, joiners, variation selectors, controls — is dropped.
  }
  return out.replace(/[ \u00a0]{2,}/g, (run) => (run.includes("\u00a0") ? "\u00a0" : " ")).trim();
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
    { row: "upstream", text: visitors ? fillSegments(strings.peloton.upstream, { n, source, month }) : strings.visual.upstreamUnknown },
  ];

  const referred = knownIn(state, "ref.referred-share", ctx);
  if (referred.kind === "known") {
    lines.push({
      row: "legendReferred",
      label: strings.peloton.signups,
      text: fillTemplate(strings.peloton.slideReferred, { share: formatPerHundred(referred.value, ctx, strings.units) }),
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
      // The numeral over the grid: under half a person in 100 it is « moins de 1 », never the
      // per-thousand sentence (that one is in `text`) and never « 0 », which would be a measurement.
      value: k.kind !== "known" ? "" : k.value.hi > 0 && k.value.hi < 0.5 ? strings.visual.lessThanOne : formatPerHundredCount(k.value, ctx, strings.units),
      source: [where, period].filter(Boolean).join(" · "),
      text: k.kind === "known" ? [formatPerHundred(k.value, ctx, strings.units), where, period].filter(Boolean).join(" · ") : strings.slide.noNumber,
    });
  }
  return lines;
}

// --- Slide 2: the leak -------------------------------------------------------

/** "30 % (team target)" — the target's own words (§9.3). Only a team target names a stage (C1). */
export function targetPhrase(comparator: Comparator, id: CandidateId, state: EngineState, strings: Words, ctx: EngineCalcContext): string {
  const value = formatInterval(point(impactTarget(comparator)), shapeOf(id).unit, ctx, strings.units, { currency: state.setup.currency });
  return fillTemplate(strings.whatIf.targetTeam, { value });
}

/** One chain line as the sentence the slide prints; `label` is the line's lead-in ("Aujourd'hui", "Si"…). */
export function chainLine(line: ImpactLine, impact: Impact, stage: string, target: string, strings: Words, locale: EngineCalcContext["locale"]): Row {
  const { label, template } = chainTemplate(line, impact, strings.whatIf, locale);
  // The "if" line quotes the target in its own words; "then" keeps the bare number its arithmetic needs.
  const values = { ...line.values, stage, ...(line.key === "if" ? { target } : {}) };
  return { row: "calc", key: line.key, label: label ?? "", text: fillTemplate(template, values) };
}

export interface LeakBuild {
  present: boolean;
  title: SlideTitle;
  lines: Row[];
  notes: string[];
}

type AsideTone = "below" | "neutral" | "unknown";

/**
 * The leak slide of one motion (§9.3; §18.8.2 for sales-assisted): its own
 * diagnosis, its own chain, its own candidates alongside — never a stage of
 * the other motion (§18.6.4). Self-serve's is the v1 slide to the character
 * (golden); sales-assisted's prices its quarter then a month (`slg-impact.ts`).
 */
export function buildLeak(
  state: EngineState,
  diagnosis: AnyDiagnosis,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): LeakBuild {
  const locale = ctx.locale;
  const slg = diagnosis.motion === "slg";
  const absent: LeakBuild = { present: false, title: { key: "leakLevel", values: {} }, lines: [], notes: [] };
  const subject = (id: MetricId) => subjectOf(id, strings, metrics);
  const positions = diagnosis.positions as Record<CandidateId, { position: Position; comparator?: Comparator }>;
  const impactOf = (id: CandidateId): Impact | null => {
    const comparator = positions[id].comparator;
    if (!comparator) return null;
    return slg
      ? slgWhatIf(state, id as SlgCandidateId, impactTarget(comparator), ctx, strings.units)
      : whatIf(state, id as PlgCandidateId, impactTarget(comparator), ctx, strings.units);
  };
  const named = diagnosis.named as readonly CandidateId[];
  const term = slg ? renewalTermOf(state, ctx) : null;
  /** One line of the chain, in its motion's words. */
  const calcLine = (line: ImpactLine, impact: Impact, stage: string, target: string): Row => {
    if (!slg) return chainLine(line, impact, stage, target, strings, locale);
    const { label, template, values } = slgChainTemplate(line, impact, strings, locale, term);
    return { row: "calc", key: line.key, label: label ?? "", text: fillTemplate(template, { ...line.values, ...values, stage, ...(line.key === "if" ? { target } : {}) }) };
  };

  const lines: Row[] = [];
  const notes: string[] = [];
  let title: SlideTitle;
  /** What closing the named gap is worth, for the notes that compare the others with it. */
  let top: string | null = null;

  const unpriced = (id: CandidateId) => {
    const comparator = positions[id].comparator;
    return comparator !== undefined && !isPricedAt(id, impactTarget(comparator));
  };
  if (diagnosis.state === "clear" && unpriced(named[0]!)) {
    // A stage the model can't price — go-live, a referred share past a 50 % target (§19.3) — still gets its slide:
    // without it the deck dropped, without a word, the conclusion the board shows (C9, 2026-09-29). Its title names
    // the value and the target, never an amount; the footer says why there is none; no chain to show, so no card.
    const id = named[0]!;
    const comparator = positions[id].comparator;
    const known = knownIn(state, id, ctx);
    if (!comparator || known.kind !== "known") return absent;
    const target = targetPhrase(comparator, id, state, strings, ctx);
    const value = formatInterval(known.value, shapeOf(id).unit, ctx, strings.units);
    title = { key: "leakClearUnpriced", values: { stage: capitalise(subject(id)), value, target } };
    const ceiling = formatInterval(point(REFERRAL_PRICING_CEILING), "percent", ctx, strings.units);
    lines.push({
      row: "footer",
      text: REFERRAL_CANDIDATES.includes(id) ? fillTemplate(strings.slide.leakFooterCeiling, { max: ceiling }) : strings.slide.leakFooterUnpriced,
    });
    notes.push(fillTemplate(strings.notes.compared, { comparator: target }));
  } else if (diagnosis.state === "clear") {
    const id = named[0]!;
    const comparator = positions[id].comparator;
    const impact = impactOf(id);
    // A gain under one customer a month is not an argument for a committee: that slide stays out (C9).
    if (!comparator || !impact || impact.lines.some((l) => l.key === "less-than-one")) return absent;
    const stage = subject(id);
    const target = targetPhrase(comparator, id, state, strings, ctx);
    const head = impactHeadline(impact);
    if (head.amount) {
      title = { key: impact.kind === "retained-mrr" ? "leakClearMrrRetained" : "leakClearMrrNew", values: { stage, target, amount: head.amount } };
    } else if (slg && impact.kind === "per-hundred") {
      // No count of new customers: read on the relay's own 100, its words chosen once (`worthOf`).
      const worth = worthOf(impact, strings, locale);
      if (!worth) return absent;
      title = { key: "slgLeakClearPerHundred", values: { stage, target, worth } };
    } else if (head.n) {
      const base = slg
        ? id === "slg.ret.renewal"
          ? "slgLeakClearKept"
          : "slgLeakClearCustomers"
        : impact.kind === "per-hundred"
          ? "leakClearPerHundred"
          : id === "ret.logo-churn"
            ? "leakClearKept"
            : "leakClearCustomers";
      title = { key: numbered(base, head.count, locale), values: { stage, target, n: head.n } };
    } else {
      return absent;
    }
    for (const line of impact.lines) lines.push(calcLine(line, impact, stage, target));
    // The assumption is said here, once (spec §9.3, §18.5.3): what the calculation takes for granted.
    const assumption = slg
      ? (strings.slide.slgLeakAssumption[id as keyof Words["slide"]["slgLeakAssumption"]] ?? "")
      : id === "act.rate"
        ? strings.slide.leakAssumption
        : (strings.slide.plgLeakAssumption[id as keyof Words["slide"]["plgLeakAssumption"]] ?? "");
    lines.push({ row: "footer", text: fillSegments(strings.slide.leakFooter, { assumption }) });
    notes.push(fillTemplate(strings.notes.compared, { comparator: target }));
    top = worthOf(impact, strings, locale);
  } else if (diagnosis.state === "shared") {
    title = { key: "leakShared", values: { n: String(named.length), list: joinList(named.map(subject), strings.grammar) } };
  } else if (diagnosis.state === "level") {
    title = { key: "leakLevel", values: {} };
  } else {
    const values = notEnoughBelowValues(diagnosis, strings, metrics);
    if (!values) return absent;
    title = { key: "leakNotEnoughBelow", values };
  }

  // Alongside: every other candidate of the motion, where it stands — on the right side of its comparator, and what it is worth.
  const r = strings.notes.ranking;
  for (const id of slg ? SLG_CANDIDATE_IDS : CANDIDATE_IDS) {
    if (diagnosis.state === "clear" && id === named[0]) continue;
    const { position, comparator } = positions[id];
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
    lines.push({ row: "aside", id, label: name, text, tone });
    if (diagnosis.state === "clear") notes.push(fillTemplate(strings.notes.whyNot, { stage: subject(id), ranking: capitalise(ranking) }));
  }
  const blind = blindSentence(diagnosis.blind, strings, metrics);
  if (blind) lines.push({ row: "blind", text: blind });
  notes.push(seasonalNote(state, strings));
  return { present: true, title, lines, notes };
}

// --- Slide 3: visibility -----------------------------------------------------

function buildVisibility(state: EngineState, derived: Omit<EngineDerived, "findings">, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): { title: SlideTitle; lines: Row[] } {
  const snapshot = currentSnapshot(state);
  const { coverage } = derived;
  const n = coverage.found + coverage.approximate;
  const N = coverage.denominator;
  const k = N - n;

  // The ticked motions' numbers (the link is optional and never counted, §18.2.2); self-serve alone is the v1 list.
  const shapes = motionShapes(state.setup.motions);
  const hybrid = state.setup.motions.plg && state.setup.motions.slg;
  // In the hybrid, a row says its motion: two numbers can share a stage, and a repair belongs to one team.
  const motionTag = (id: MetricId): Row => (hybrid ? { motion: motionOfMetric(id) } : {});
  const motionWord = (id: MetricId) => (hybrid ? strings.hybrid.motionAdjective[motionOfMetric(id)] : "");
  // What is not documented, cheapest repair first: a missing number's own estimate, else the catalogue's default.
  const undocumented = shapes.filter((s) => ["todo", "requested", "missing"].includes(statusOf(entryOf(snapshot, s.id)))).map((s) => {
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

  const lines: Row[] = shapes.map((s) => {
    const name = metricOf(metrics, s.id).name;
    const status = strings.status[STATUS_KEY[statusOf(entryOf(snapshot, s.id))]];
    // `label` is the stage (the text export groups by it), `metric` the number's own name; the slide groups by the id's stage.
    return { row: "metric", id: s.id, label: strings.stages[s.stage], metric: name, status, text: `${name} · ${lowerFirst(status)}`, ...motionTag(s.id) };
  });
  for (const u of undocumented) {
    const status = statusOf(u.entry);
    const name = metricOf(metrics, u.id).name;
    // The fact, as a slide says it — not the reader's own voice the screen's cause labels use (« je n'y ai pas accès »).
    const cause = status === "missing" && u.entry?.missing ? strings.slide.cause[SLIDE_CAUSE_KEY[u.entry.missing.cause]] : lowerFirst(strings.status[STATUS_KEY[status]]);
    // A role, never a person (§9.1).
    const role = u.entry?.missing?.ownerRole ? strings.role[ROLE_KEY[u.entry.missing.ownerRole]] : u.entry?.request ? strings.role[ROLE_KEY[u.entry.request.role]] : "";
    const fix = strings.repair[REPAIR_KEY[u.repair]];
    lines.push({ row: "missing", id: u.id, label: name, repair: fix, text: [motionWord(u.id), cause, role, fix].filter(Boolean).join(" · "), ...motionTag(u.id) });
  }
  return { title, lines };
}

/**
 * The slide's own cause words. Not `CAUSE_KEY`: that one indexes the screen's
 * labels, written in the reader's first person (« je n'y ai pas accès ») and
 * wider (it also holds the conflicting / not-applicable choices, which are
 * statuses here, not causes). A slide states the fact, in no one's voice.
 */
export const SLIDE_CAUSE_KEY: Record<MissingCause, keyof Words["slide"]["cause"]> = {
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
  const present = cac.kind === "known" || [unit.ltv, unit.payback, unit.ltvCac, unit.grr, unit.nrr].some((d) => d.kind === "known");

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
  const figure = (row: string, id: DerivedId, value: string, missing: readonly MetricId[] | null, caveat = ""): Row => {
    const d = prose.derived?.find((x) => x.id === id);
    const note = !value && missing && d ? fillTemplate(d.uncomputable, { input: unitInputsPhrase(missing, strings, metrics) }) : value ? caveat : "";
    return { row, id, label: d?.name ?? "", value, note, text: [value, note].filter(Boolean).join(" · ") || strings.slide.noNumber };
  };
  // NRR and GRR read logo churn as revenue churn: the slide says so under the figure, every time it prints one.
  const retentionCaveat = (id: DerivedId) => prose.derived?.find((x) => x.id === id)?.caveat ?? "";
  const percent = (d: typeof unit.grr) => (d.kind === "known" ? formatInterval(d.value, "percent", ctx, strings.units) : "");
  const lines: Row[] = [
    { row: "cac", id: "acq.cac", label: metricOf(metrics, "acq.cac").name, value: cacValue, variant, text: cacValue ? [cacValue, lowerFirst(variant)].filter(Boolean).join(" · ") : strings.slide.noNumber },
    figure("payback", "rev.cac-payback", unit.payback.kind === "known" ? formatDurationInterval(unit.payback.value, "months", ctx, strings.units) : "", unit.payback.kind === "uncomputable" ? unit.payback.missing : null),
    figure("ltv", "rev.ltv", unit.ltv.kind === "known" ? formatApproxMoneyInterval(unit.ltv.value, currency, ctx, strings.units) : "", unit.ltv.kind === "uncomputable" ? unit.ltv.missing : null),
    figure(
      "ltvCac",
      "rev.ltv-cac",
      unit.ltvCac.kind === "known" ? fillTemplate(strings.units.times, { n: formatInterval(unit.ltvCac.value, "ratio", ctx, strings.units) }) : "",
      unit.ltvCac.kind === "uncomputable" ? unit.ltvCac.missing : null,
    ),
    figure("grr", "rev.grr", percent(unit.grr), unit.grr.kind === "uncomputable" ? unit.grr.missing : null, retentionCaveat("rev.grr")),
    figure("nrr", "rev.nrr", percent(unit.nrr), unit.nrr.kind === "uncomputable" ? unit.nrr.missing : null, retentionCaveat("rev.nrr")),
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
  // The ask is the user's own words: reduced to what the slide fonts draw (§10.4), trimmed after.
  const what = slideGlyphs(ask.what);
  const metricText = (id: MetricId, value: number | undefined) =>
    value === undefined ? "" : formatInterval(point(value), shapeOf(id).unit, ctx, strings.units, { currency });

  // What to measure first when nothing is asked for: the team's own first pick; else a blind ★ — the number
  // whose absence keeps the diagnosis from concluding, which is what "before deciding where to invest" means —
  // else the cheapest missing number to repair.
  const missing = motionShapes(state.setup.motions)
    .filter((s) => statusOf(entryOf(snapshot, s.id)) === "missing")
    .map((s) => ({ id: s.id, repair: entryOf(snapshot, s.id)?.missing?.repair ?? s.defaultRepair }))
    .sort((a, b) => REPAIR_ORDER.indexOf(a.repair) - REPAIR_ORDER.indexOf(b.repair));
  const first =
    missing.find((m) => m.id === ask.measureFirst[0]) ?? missing.find((m) => derived.motions.some((d) => d.diagnosis.blind.includes(m.id))) ?? missing[0];

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

  const lines: Row[] = ask.bullets.map(slideGlyphs).filter(Boolean).map((text) => ({ row: "bullet", text }));
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
    lines.push({ row: "know", id, label: name, current, target, checkpoint, text: [capitalise(goal), checkpoint].join(" · ") });
  }
  // A title that says « pour mesurer d'abord ce qui manque (rétention à J30) » must show that number below it:
  // with no pick of the team's own, the one the title named is the list.
  const measure = ask.measureFirst.length ? ask.measureFirst : !what && first ? [first.id] : [];
  for (const m of measure) {
    const entry = entryOf(snapshot, m);
    const repair = strings.repair[REPAIR_KEY[entry?.missing?.repair ?? shapeOf(m).defaultRepair]];
    const role = strings.role[ROLE_KEY[entry?.missing?.ownerRole ?? shapeOf(m).defaultRole]];
    const name = metricOf(metrics, m).name;
    lines.push({ row: "measure", id: m, label: name, text: [repair, role].join(" · ") });
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

/** Blind spots first: they are why this slide would be shown at all (§8.5, D13) — the board's order. */
const VERDICT_ORDER: readonly MirrorVerdict[] = ["blind-spot", "blind-spot-light", "known-gap", "better", "coherent"];

const VERDICT_KEY: Record<MirrorVerdict, "blindSpot" | "blindSpotLight" | "knownGap" | "better" | "coherent"> = {
  "blind-spot": "blindSpot",
  "blind-spot-light": "blindSpotLight",
  "known-gap": "knownGap",
  better: "better",
  coherent: "coherent",
};

/** A verdict's name in the grammatical number of `count` (« 1 angle mort », « 2 angles morts »). */
function verdictLabel(verdict: MirrorVerdict, count: number, strings: Words, locale: EngineCalcContext["locale"]): string {
  return strings.mirror[numbered(VERDICT_KEY[verdict], point(count), locale)];
}

function mirrorLines(mirror: NonNullable<EngineDerived["mirror"]>, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext, prose: DeckProse, hybrid = false): Row[] {
  // Both motions' computed figures: in the hybrid, a Tour question bridges to sales-assisted's LTV too (§18.4.9).
  const isDerived = (id: MetricId | DerivedId): id is DerivedId => ALL_DERIVED_SHAPES.some((s) => s.id === id);
  // The counts lead, blind spots first; a verdict nobody reached is not a line.
  const lines: Row[] = VERDICT_ORDER.filter((verdict) => mirror.counts[verdict] > 0).map((verdict) => ({
    row: "verdictCount",
    id: verdict,
    value: String(mirror.counts[verdict]),
    label: verdictLabel(verdict, mirror.counts[verdict], strings, ctx.locale),
  }));
  // Then one line per bridge, in the same order — a bridge nobody has a verdict for yet goes last.
  const rank = (verdict: MirrorVerdict | null) => (verdict ? VERDICT_ORDER.indexOf(verdict) : VERDICT_ORDER.length);
  const bridges = [...mirror.rows].sort((a, b) => rank(a.verdict) - rank(b.verdict));
  for (const row of bridges) {
    const label = isDerived(row.metric) ? (prose.derived?.find((d) => d.id === row.metric)?.name ?? "") : metricOf(metrics, row.metric).name;
    const answer = prose.bridges?.find((b) => b.questionId === row.questionId)?.options.find((o) => o.points === row.declaredPoints)?.label;
    // Nobody has looked yet (to do, requested): « à renseigner », not a verdict.
    const found = lowerFirst(strings.status[row.found ? FOUND_STATUS[row.found] : "todo"]);
    lines.push({
      row: "bridge",
      id: row.metric,
      questionId: row.questionId,
      label,
      verdict: row.verdict ?? "",
      // The one bridge's verdict, in the singular: the slide's tag on its row.
      tag: row.verdict ? verdictLabel(row.verdict, 1, strings, ctx.locale) : "",
      text: answer ? fillTemplate(strings.mirror.card, { answer, points: String(row.declaredPoints), found }) : found,
      ...(hybrid ? { motion: row.motion } : {}),
    });
  }
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

function buildAnnex(state: EngineState, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext): (Row & AnnexCells)[] {
  const snapshot = currentSnapshot(state);
  const { motions } = state.setup;
  const hybrid = motions.plg && motions.slg;
  // Grouped « Libre-service », « Assisté », « Liaison » (§18.8.2); self-serve alone is the v1 table.
  const shapes = hybrid ? [...motionShapes(motions), ...LINK_METRIC_SHAPES] : motionShapes(motions);
  return shapes.map((shape) => {
    const entry = entryOf(snapshot, shape.id);
    const metric = metricOf(metrics, shape.id);
    // Sales-assisted reads three months (C25 Q2), written bare: « juin à août 2026 ».
    const range = shape.span > 1 ? periodRangeOf(shape, entry, snapshot, state.setup, ctx.today) : null;
    const period = range ? null : periodOf(shape, entry, snapshot);
    const days = windowDaysOf(shape, state.setup);
    const known = knownIn(state, shape.id, ctx);
    const confidence = known.kind === "known" ? known.confidence : entry ? confidenceOf(entry) : "unknown";
    const cells = {
      row: "annex",
      id: shape.id,
      label: metric.name,
      // The same words the request and the sheet fill: « ayant déclenché l'événement « a créé un premier projet » ».
      // The event is the user's own name for it, so the formula goes through the slide glyphs.
      formula: slideGlyphs(fillTemplate(metric.formula, catalogueValues(state, shape.id, strings, metrics, ctx))),
      window: days > 0 ? formatDuration(days, "days", ctx, strings.units) : "",
      period: range ? formatMonthRange(range, ctx.locale, strings.units) : period ? formatMonth(period, ctx.locale) : "",
      source: entry?.status === "measured" ? sourceLabel(entry.source, strings) : entry?.status === "estimated" && entry.estimate ? strings.basis[BASIS_KEY[entry.estimate.basis]] : "",
      status: strings.status[STATUS_KEY[statusOf(entry)]],
      confidence: strings.slide.confidence[confidence],
      // The user's own definition may travel; their private note NEVER does (§4.1).
      definition: slideGlyphs(entry?.definitionNote ?? ""),
    };
    // The table reads the columns; the text export reads one line, where words go on in lower case — a
    // tool or a role keeps its capital (it is a name), an estimate's basis or « Autre » does not.
    const named = entry?.status === "measured" && (entry.source?.kind === "tool" || entry.source?.kind === "person");
    const source = named ? cells.source : lowerFirst(cells.source);
    const group: Row = hybrid ? { group: shape.scope === "link" ? "link" : shape.scope === "slg" ? "slg" : "plg" } : {};
    return { ...cells, ...group, text: [cells.formula, cells.definition, cells.window, cells.period, source, lowerFirst(cells.status), cells.confidence].filter(Boolean).join(" · ") };
  });
}

// --- « Et si ? » (2026-09-26) ----------------------------------------------------

/**
 * The what-if slides (Antoine, 2026-09-26: « une slide par "Et si ?", et une
 * slide qui prend en compte tous les "Et si ?" cumulés avec effet sur MRR,
 * NRR, GRR, CAC, LTV »). One slide per lever the team moved, that lever
 * alone (`leverAlone`); then, when two or more moved, one slide with all of
 * them at once (`buildScenario`), which is where the compounding shows. Both
 * kinds print the same two tables — the growth figures and the month's
 * funnel, today, with the what-if(s), and the change — and the "together"
 * slide adds what each lever brings on its own and the sentence that
 * compares their sum with the whole. The model's assumptions are the
 * slide's footer, as on the leak: a slide is forwarded without its speaker.
 *
 * Every number comes from `scenario.ts`, formatted here once; the title's
 * gain is read from the same change the table's first row prints.
 */

/** `extra`: digits finer than the figure's usual rounding, for a today → projected pair (`pairPrecision`); change printers ignore it. */
export type Print = (i: Interval, extra?: number) => string;

/**
 * The growth figures of a what-if slide's table, in the order a leadership
 * meeting reads them (design system extension 09, Q11, A20.d T4.b): the MRR
 * and the ARR in twelve months, the NRR, then one new customer — the CAC,
 * the LTV, the LTV:CAC, the payback — and the cash tied up. The new MRR of
 * the month and the GRR left the slide for them; the panel keeps them.
 * Self-serve and sales-assisted print the same rows.
 */
export type WhatIfKpiId = "mrr12" | "arr12" | "nrr" | "cac" | "ltv" | "ltvCac" | "payback" | "cash";
export const WHATIF_KPI_IDS: readonly WhatIfKpiId[] = ["mrr12", "arr12", "nrr", "cac", "ltv", "ltvCac", "payback", "cash"];

/** A scenario's figures, either motion's: self-serve's under `kpis`, sales-assisted's at the top. */
export type WhatIfKpis = MoneyKpis & { mrr12: Interval | null; nrr: Interval | null; cac: Interval | null; ltv: Interval | null; payback: Interval | null };

export function whatIfKpi(k: WhatIfKpis, id: WhatIfKpiId): Interval | null {
  return id === "cash" ? (k.cash?.tiedUp ?? null) : k[id];
}

/**
 * A what-if slide's curve (design system extension 09, Q11, A20.d T4.b): the
 * MRR month by month, today's pace against the what-if(s), from the same
 * scenario the slide's table reads. null when the MRR can't be projected:
 * the slide then prints its table alone.
 */
export function slideCurve(
  today: WhatIfKpis & { mrr: Interval | null },
  projected: WhatIfKpis,
  whatifKey: string,
  state: EngineState,
  strings: Words,
  ctx: EngineCalcContext,
): SlideCurve | null {
  if (!today.mrrPath || !today.mrr || !today.mrr12) return null;
  const units = strings.units;
  const currency = state.setup.currency;
  const fact = (i: Interval) => (i.lo === i.hi ? formatInterval(i, "money", ctx, units, { currency }) : formatApproxMoneyInterval(i, currency, ctx, units));
  const approx = (i: Interval) => formatApproxMoneyInterval(i, currency, ctx, units);
  const tuple = (i: Interval): [number, number] => [i.lo, i.hi];
  const ref = currentSnapshot(state).referenceMonth;
  const after = (n: number) => {
    let m = ref;
    for (let i = 0; i < n; i += 1) m = nextMonth(m);
    return formatMonth(m, ctx.locale);
  };
  const l = strings.lever;
  return {
    today: today.mrrPath.map(tuple),
    whatif: projected.mrrPath ? projected.mrrPath.map(tuple) : null,
    start: fillTemplate(l.curveStart, { mrr: fact(today.mrr) }),
    xLabels: [after(0), after(6), after(12)],
    keys: { today: l.curveToday, whatif: whatifKey },
    summary:
      projected.mrr12 && projected.mrrPath
        ? fillTemplate(l.curveSummaryWhatif, { start: fact(today.mrr), today: approx(today.mrr12), whatif: approx(projected.mrr12) })
        : fillTemplate(l.curveSummary, { start: fact(today.mrr), today: approx(today.mrr12) }),
  };
}

/**
 * The « together » slide's compounding, drawn (`LeverSum`): each lever's gain
 * on the MRR in twelve months alone, the solo gains added up, the gain
 * together. null when a gain can't be computed: nothing to draw.
 */
export function slideLeverSum(
  levers: readonly { id: string; label: string; from: string; to: string; gain: Interval | null }[],
  gain: Interval | null,
  state: EngineState,
  strings: Words,
  ctx: EngineCalcContext,
): SlideLeverSum | null {
  if (!gain || levers.some((l) => !l.gain)) return null;
  const { approxMoney, roundMoney } = whatIfPrinters(state, strings, ctx);
  const mid = (i: Interval) => (i.lo + i.hi) / 2;
  const sum = levers.reduce((acc, l) => ({ lo: acc.lo + l.gain!.lo, hi: acc.hi + l.gain!.hi }), { lo: 0, hi: 0 });
  const w = strings.scenario;
  return {
    rows: levers.map((l) => ({
      id: l.id,
      label: fillTemplate(w.aloneRow, { lever: l.label, from: l.from, to: l.to }),
      value: formatChange(l.gain!, roundMoney, strings.units),
      amount: mid(l.gain!),
    })),
    sum: { id: "sum", label: w.sumOneByOne, value: approxMoney(sum), amount: mid(sum) },
    together: { id: "together", label: w.sumTogether, value: formatChange(gain, roundMoney, strings.units), amount: mid(gain) },
  };
}

/** A row's label: the panel's words; sales-assisted's NRR is over twelve months. */
export function whatIfKpiLabel(id: WhatIfKpiId, strings: Words, slg: boolean): string {
  const w = strings.scenario;
  const labels: Record<WhatIfKpiId, string> = {
    mrr12: w.kpiMrr12,
    arr12: strings.lever.arr12,
    nrr: slg ? w.kpiNrr12 : w.kpiNrr,
    cac: w.kpiCac,
    ltv: w.kpiLtv,
    ltvCac: w.rowLtvCac,
    payback: w.kpiPayback,
    cash: w.rowCash,
  };
  return labels[id];
}

/** The month's funnel, top to bottom. The referred share is left to the panel: on a slide it is one line too many. */
const STEP_ROWS = [
  ["visitors", "visitors"],
  ["signups", "signups"],
  ["activated", "activated"],
  ["d30", "d30"],
  ["paying", "paying"],
] as const satisfies readonly (readonly [keyof ScenarioFunnel, keyof Words["scenario"]])[];

/**
 * Projected minus today, bound by bound. Both columns come from the SAME
 * uncertain inputs (an estimate at 6 to 9 % is 6 to 9 % in both), and every
 * function of the model is monotonic in them (scenario.ts), so each bound of
 * the change is the difference of the same bounds. Subtracting the two
 * intervals instead would count today's uncertainty twice and turn an exact
 * "+125" into "+0 to +250".
 */
export function changeOf(today: Interval, projected: Interval): Interval {
  const a = projected.lo - today.lo;
  const b = projected.hi - today.hi;
  return { lo: Math.min(a, b), hi: Math.max(a, b) };
}

/** Unchanged: two identical computations, give or take their floating point. */
function isStable(change: Interval, today: Interval): boolean {
  const tolerance = 1e-9 * Math.max(1, Math.abs(today.lo), Math.abs(today.hi));
  return Math.abs(change.lo) <= tolerance && Math.abs(change.hi) <= tolerance;
}

/** What a what-if does to the MRR in twelve months — the figure every what-if title prices. */
function mrrGain(s: Scenario): Interval | null {
  const { mrr12: today } = s.today.kpis;
  const { mrr12: projected } = s.projected.kpis;
  return today && projected ? changeOf(today, projected) : null;
}

/** A gain the title can say « would gain »: at least one unit of currency. A loss, or noise, gets the plain title. */
export const isPricedGain = (gain: Interval | null): gain is Interval => gain !== null && gain.lo >= 1;

export interface Printers {
  today: Print;
  projected: Print;
  change: Print;
  /** The figure's own rounding, for `pairPrecision`; absent (months, people), the pair keeps the usual precision. */
  round?: (v: number, extra: number) => number;
}

/**
 * How each figure prints. A projection is approximate by nature, so its
 * money is two significant digits and a "~" (`formatApproxMoneyInterval`,
 * as the LTV on the unit-economics slide); today's CAC is the number the
 * team measured, printed as the rest of the deck prints it. NRR and GRR are
 * rates, their change a number of points; the payback, months; the funnel,
 * people (the visitors to two significant digits, as on the peloton: they
 * are back-computed from a rounded rate).
 */
export function whatIfPrinters(state: EngineState, strings: Words, ctx: EngineCalcContext) {
  const units = strings.units;
  const currency = state.setup.currency;
  const approxMoney: Print = (i, extra = 0) => formatApproxMoneyInterval(i, currency, ctx, units, extra);
  // A change of money: rounded the same way, without the "~" — « +~6 600 € » glued a sign to a tilde,
  // and the "with" column beside it already says the figures are approximate.
  const roundMoney: Print = (i) => formatApproxMoneyInterval(i, currency, ctx, { ...units, approx: "{n}" });
  const percent: Print = (i, extra = 0) => formatInterval(i, "percent", ctx, units, { extra });
  const points: Print = (i) => {
    const printed = mapBounds(i, (v) => roundDisplay(v));
    return fillTemplate(strings.slide[numbered("whatIfPoints", printed, ctx.locale)], { n: formatInterval(i, "ratio", ctx, units) });
  };
  const months: Print = (i) => formatDurationInterval(i, "months", ctx, units);
  const people: Print = (i) => formatCountInterval(i, ctx, units);
  const roundPeople: Print = (i, extra = 0) => formatCountInterval(mapBounds(i, (v) => approxRounding(v, extra)), ctx, units);
  const approxPeople: Print = (i, extra = 0) => fillTemplate(units.approx, { n: roundPeople(i, extra) });
  const same = (p: Print): Printers => ({ today: p, projected: p, change: p });

  const money: Printers = { today: approxMoney, projected: approxMoney, change: roundMoney, round: approxRounding };
  const rate: Printers = { today: percent, projected: percent, change: points, round: rateRounding };
  // LTV:CAC, a multiple: « 0,79 fois », its change a plain difference.
  const times: Print = (i) => fillTemplate(units.times, { n: formatInterval(i, "ratio", ctx, units) });
  const ratio: Print = (i) => formatInterval(i, "ratio", ctx, units);
  const kpis: Record<WhatIfKpiId | "newMrr" | "grr", Printers> = {
    mrr12: money,
    arr12: money,
    newMrr: money,
    nrr: rate,
    grr: rate,
    ltvCac: { today: times, projected: times, change: ratio },
    cash: money,
    cac: { today: (i) => formatInterval(i, "money", ctx, units, { currency }), projected: approxMoney, change: roundMoney, round: approxRounding },
    ltv: money,
    payback: same(months),
  };
  const steps: Record<(typeof STEP_ROWS)[number][0], Printers> = {
    // « ~26 000 → ~26 000 · –490 » when the referred share moves: the visitors are a pair like the money.
    visitors: { today: approxPeople, projected: approxPeople, change: roundPeople, round: approxRounding },
    signups: same(people),
    activated: same(people),
    d30: same(people),
    paying: same(people),
  };
  return { kpis, steps, approxMoney, roundMoney };
}

/**
 * One row of a table: today, with the what-if(s), the change — each "" when
 * the figure can't be computed, which the slide prints as "?", never as 0.
 * A figure the what-if doesn't move says so in a word. `tone` (unknown |
 * stable | moved) is for the slide's emphasis, never printed; `text` is the
 * row as the text export writes it.
 */
export function changeRow(
  row: "kpi" | "funnelStep",
  id: string,
  label: string,
  today: Interval | null,
  projected: Interval | null,
  print: Printers,
  rowTemplate: string,
  strings: Words,
): Row {
  if (!today || !projected) return { row, id, label, tone: "unknown", today: "", projected: "", change: "", text: strings.slide.noNumber };
  const change = changeOf(today, projected);
  const mid = (i: Interval) => (i.lo + i.hi) / 2;
  const extra = print.round ? pairPrecision(mid(today), mid(projected), print.round) : 0;
  const now = print.today(today, extra);
  const after = print.projected(projected, extra);
  // A change too small to print, even two digits finer, is no change — the tile says none either
  // (scenario-view.ts). A backstop: no lever of the example reaches it once the pairs carry their
  // precision (swept 2026-09-28), but « 96 % → 96 % · –0,6 point » told the reader two things at once.
  if (isStable(change, today) || after === now) {
    const text = fillTemplate(strings.slide.whatIfRowStable, { today: now });
    return { row, id, label, tone: "stable", today: now, projected: now, change: strings.slide.whatIfStable, text };
  }
  const moved = formatChange(change, print.change, strings.units);
  return { row, id, label, tone: "moved", today: now, projected: after, change: moved, text: fillTemplate(rowTemplate, { today: now, projected: after, change: moved }) };
}

/** The two tables and the footer, for one scenario — a lever alone, or all of them. */
function scenarioLines(s: Scenario, rowTemplate: string, state: EngineState, strings: Words, ctx: EngineCalcContext): Row[] {
  const printers = whatIfPrinters(state, strings, ctx);
  const lines: Row[] = [
    ...WHATIF_KPI_IDS.map((id) =>
      changeRow("kpi", id, whatIfKpiLabel(id, strings, false), whatIfKpi(s.today.kpis, id), whatIfKpi(s.projected.kpis, id), printers.kpis[id], rowTemplate, strings),
    ),
    ...STEP_ROWS.map(([id, label]) =>
      changeRow("funnelStep", id, strings.scenario[label], s.today.funnel[id], s.projected.funnel[id], printers.steps[id], rowTemplate, strings),
    ),
  ];
  // What the projection takes for granted, only what applied (scenario.ts), as the slide's footer.
  if (s.assumptions.length) lines.push({ row: "footer", text: s.assumptions.map((a) => strings.scenario.assumption[a]).join(" ") });
  return lines;
}

interface MovedLever {
  id: LeverId;
  /** Today's value and the target, in the lever's own unit. */
  from: string;
  to: string;
  alone: Scenario;
}

/**
 * The levers the team moved, in lever order: a target in `state.whatIf` on a
 * number that is known (`leverAlone` confirms it moved). A target that prints
 * as today's value is left out — « de 18 % à 18 % » moves nothing a reader
 * can see, and is no slide.
 */
function movedLevers(state: EngineState, strings: Words, ctx: EngineCalcContext): MovedLever[] {
  return LEVER_IDS.flatMap((id) => {
    const alone = leverAlone(state, id, ctx);
    const lever = alone?.levers.find((l) => l.id === id);
    if (!alone || !lever?.today || lever.target === null) return [];
    // Self-serve's levers are percents and money; the link's count is sales-assisted's, for its slides (S4).
    const print: Print = (i) => formatInterval(i, lever.unit === "count" ? "ratio" : lever.unit, ctx, strings.units, { currency: state.setup.currency });
    const from = print(lever.today);
    const to = print(point(lever.target));
    return from === to ? [] : [{ id, from, to, alone }];
  });
}

export type BuiltSlide = Omit<DeckSlide, "id" | "included" | "index">;

/**
 * The appendix as the pages it prints on (A2.1, 2026-09-29): `annex`,
 * `annex:2`…, « (1/2) » in each title, every page with its own rows in the
 * catalogue's order. It is never one page: the catalogue's rows, each at its
 * shortest, run past one page at 18px (annex-pages.test.ts holds that, so
 * the title's page part never reads « (1/1) » without a test saying so).
 */
function annexSlides(annex: BuiltSlide, rows: (Row & AnnexCells)[]): { id: SlideId; slide: BuiltSlide; byDefault: boolean }[] {
  const pages = annexPages(rows);
  return pages.map((lines, i) => ({
    id: i === 0 ? "annex" : `annex:${i + 1}`,
    slide: { ...annex, title: { key: "annex", values: { i: String(i + 1), n: String(pages.length) } }, lines },
    byDefault: DEFAULT_INCLUDE.annex,
  }));
}

/** The what-if slides, in the order they print: each lever alone, then all of them together when there are two or more. */
function buildWhatIfSlides(state: EngineState, strings: Words, ctx: EngineCalcContext): { id: SlideId; slide: BuiltSlide }[] {
  const levers = movedLevers(state, strings, ctx);
  const { approxMoney, roundMoney } = whatIfPrinters(state, strings, ctx);
  const notes = [strings.notes.whatIf, seasonalNote(state, strings)];

  const slides: { id: SlideId; slide: BuiltSlide }[] = levers.map((lever) => {
    const gain = mrrGain(lever.alone);
    const values = { stage: strings.leverSubject[lever.id], from: lever.from, to: lever.to };
    const title: SlideTitle = isPricedGain(gain) ? { key: "whatIfLever", values: { ...values, gain: approxMoney(gain) } } : { key: "whatIfLeverPlain", values };
    const curve = slideCurve(lever.alone.today.kpis, lever.alone.projected.kpis, strings.slide.curveWhatifOne, state, strings, ctx);
    return {
      id: `whatif:${lever.id}`,
      slide: { present: true, title, lines: scenarioLines(lever.alone, strings.slide.whatIfRowOne, state, strings, ctx), notes, ...(curve ? { curve } : {}) },
    };
  });

  // One lever is already its own slide: « together » would repeat it.
  if (levers.length < 2) return slides;
  const targets: Partial<Record<LeverId, number>> = Object.fromEntries(levers.map((l) => [l.id, state.whatIf![l.id]!]));
  const all = buildScenario(state, targets, ctx);
  const gain = mrrGain(all);
  const n = String(levers.length);

  const leverRows: Row[] = levers.map((lever) => {
    const alone = mrrGain(lever.alone);
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

  // The sum of the levers taken alone against the whole: what the whole adds is the compounding (funnel levers multiply).
  const together: Row[] = [];
  if (gain) {
    const alone = levers.map((l) => mrrGain(l.alone)!);
    const sum = alone.reduce((acc, g) => ({ lo: acc.lo + g.lo, hi: acc.hi + g.hi }), { lo: 0, hi: 0 });
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
    id: "scenario",
    slide: {
      present: true,
      title: isPricedGain(gain) ? { key: "scenario", values: { n, gain: approxMoney(gain) } } : { key: "scenarioPlain", values: { n } },
      lines: [...leverRows, ...together, ...scenarioLines(all, strings.slide.whatIfRowAll, state, strings, ctx)],
      notes,
      ...withDrawings(
        slideCurve(all.today.kpis, all.projected.kpis, fillTemplate(strings.slide.curveWhatifAll, { n }), state, strings, ctx),
        slideLeverSum(
          levers.map((l) => ({ id: l.id, label: capitalise(strings.leverSubject[l.id]), from: l.from, to: l.to, gain: mrrGain(l.alone) })),
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

/** The drawings a « together » slide carries, each only when it can be drawn. */
export function withDrawings(curve: SlideCurve | null, leverSum: SlideLeverSum | null): { curve?: SlideCurve; leverSum?: SlideLeverSum } {
  return { ...(curve ? { curve } : {}), ...(leverSum ? { leverSum } : {}) };
}

// --- The model ----------------------------------------------------------------

export function buildDeck(state: EngineState, derived: EngineDerived, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext, prose: DeckProse = {}): DeckModel {
  // Sales-assisted ticked, alone or with self-serve: the deck of §18.8. Self-serve alone is the v1 deck below, to the character.
  if (state.setup.motions.slg) return buildMotionsDeck(state, derived, strings, metrics, ctx, prose);
  const snapshot = currentSnapshot(state);
  const starsKnown = METRIC_SHAPES.filter((s) => s.primary && knownIn(state, s.id, ctx).kind === "known").length;
  // Under two ★ known, the message is "we can't see the engine yet": visibility leads and there is no leak to name (§9.2).
  const blindEngine = starsKnown < 2;

  const leak = buildLeak(state, derived.diagnosis, strings, metrics, ctx);
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

  const annexRows = buildAnnex(state, strings, metrics, ctx);
  const built: Record<FixedSlideId, Omit<DeckSlide, "id" | "included" | "index">> = {
    peloton: {
      present: true,
      title: pelotonTitle(state, derived.peloton, strings, metrics, ctx),
      lines: pelotonLines(state, derived.peloton, strings, ctx),
      notes: [...pelotonNotes, seasonalNote(state, strings)],
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
    // Its title's page part is filled by annexSlides, page by page.
    annex: { present: true, title: { key: "annex", values: { i: "1", n: "1" } }, lines: annexRows, notes: [] },
  };

  const order: FixedSlideId[] = blindEngine ? ["visibility", ...SLIDE_ORDER.filter((id) => id !== "visibility")] : [...SLIDE_ORDER];
  // The what-if slides have no fixed place: they follow the leak, in lever order, then the « together » one.
  const whatIfs = buildWhatIfSlides(state, strings, ctx);
  // « Ce qui a bougé » (§19.2.6): from the second month, after the leak and its what-ifs, unticked until the team ticks it.
  const evolution = buildEvolutionSlide(state, derived.series, "plg", derived.diagnosis, strings, metrics, ctx);
  const afterLeak = [...whatIfs.map((w) => ({ ...w, byDefault: true })), ...(evolution ? [{ id: "evolution" as const, slide: evolution, byDefault: false }] : [])];
  const entries = order.flatMap((id): { id: SlideId; slide: BuiltSlide; byDefault: boolean }[] => {
    if (id === "annex") return annexSlides(built.annex, annexRows);
    return [{ id, slide: built[id], byDefault: DEFAULT_INCLUDE[id] }, ...(id === "leak" ? afterLeak : [])];
  });
  let index = 0;
  const slides: DeckSlide[] = entries.map(({ id, slide, byDefault }) => {
    // The appendix's pages share one « include » box (`annex`).
    const included = slide.present && (state.deck.include[includeKeyOf(id)] ?? byDefault);
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
  const label = state.deck.showCompany ? slideGlyphs(state.setup.companyLabel ?? "") : "";
  const company = label ? `${label} · ` : "";

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

/** The tools the measured numbers of these shapes cite, once each, in catalogue order. */
function toolsOf(state: EngineState, shapes: readonly { id: MetricId }[], strings: Words): string[] {
  const snapshot = currentSnapshot(state);
  return [
    ...new Set(
      shapes
        .map((s) => entryOf(snapshot, s.id))
        .filter((e) => e?.status === "measured" && e.source?.kind === "tool")
        .map((e) => sourceLabel(e!.source, strings)),
    ),
  ];
}

/** Under two ★ known in a motion, its message is « we can't see that engine yet »: no leak slide for it (§18.8.1). */
function blindMotion(state: EngineState, motion: Motion, ctx: EngineCalcContext): boolean {
  const shapes = motion === "plg" ? METRIC_SHAPES : SLG_METRIC_SHAPES;
  return shapes.filter((s) => s.primary && knownIn(state, s.id, ctx).kind === "known").length < 2;
}

type Entry = { id: SlideId; slide: BuiltSlide; byDefault: boolean; motion?: Motion };

/**
 * The deck with sales-assisted ticked (§18.8.1): alone, its slides in the
 * v1 order; in the hybrid, « deux moteurs, un total » first, then each
 * motion's slides — self-serve's, then sales-assisted's, never interleaved
 * and never reordered by their values — then the slides they share. Each
 * motion's slides wear its kicker, pill and footer (`byMotion`).
 */
function buildMotionsDeck(state: EngineState, derived: EngineDerived, strings: Words, metrics: ResolvedMetric[], ctx: EngineCalcContext, prose: DeckProse): DeckModel {
  const snapshot = currentSnapshot(state);
  const hybrid = state.setup.motions.plg;
  const plg = motionOf(derived, "plg");
  const slg = motionOf(derived, "slg")!;
  const plgBlind = hybrid && blindMotion(state, "plg", ctx);
  const slgBlind = blindMotion(state, "slg", ctx);
  const tag = (motion: Motion) => (entry: Entry): Entry & { motion: Motion } => ({ ...entry, motion });

  // Each motion's slides, in their v1 order: the funnel, the leak, the what-ifs.
  const plgEntries: (Entry & { motion?: Motion })[] = [];
  if (plg) {
    const leak = buildLeak(state, plg.diagnosis, strings, metrics, ctx);
    const pelotonNotes = plg.peloton.columns
      .filter((c) => c.source && c.period)
      .map((c) => fillTemplate(strings.notes.source, { metric: metricOf(metrics, c.metric).name, tool: sourceLabel(c.source, strings), cohort: formatMonth(c.period!, ctx.locale) }));
    plgEntries.push(
      tag("plg")({
        id: "peloton",
        slide: {
          present: true,
          title: pelotonTitle(state, plg.peloton, strings, metrics, ctx),
          lines: pelotonLines(state, plg.peloton, strings, ctx),
          notes: [...pelotonNotes, seasonalNote(state, strings)],
        },
        byDefault: true,
      }),
      tag("plg")({ id: "leak", slide: { present: leak.present && !plgBlind, title: leak.title, lines: leak.lines, notes: leak.notes }, byDefault: true }),
      ...buildWhatIfSlides(state, strings, ctx).map((w) => tag("plg")({ ...w, byDefault: true })),
    );
    const evolution = buildEvolutionSlide(state, derived.series, "plg", plg.diagnosis, strings, metrics, ctx);
    if (evolution) plgEntries.push(tag("plg")({ id: "evolution", slide: evolution, byDefault: false }));
  }
  const slgLeak = buildLeak(state, slg.diagnosis, strings, metrics, ctx);
  const slgEntries: (Entry & { motion?: Motion })[] = [
    tag("slg")({ id: "slg:peloton", slide: buildRelaysSlide(state, slg, derived.sanity, strings, metrics, ctx), byDefault: true }),
    tag("slg")({ id: "slg:leak", slide: { present: slgLeak.present && !slgBlind, title: slgLeak.title, lines: slgLeak.lines, notes: slgLeak.notes }, byDefault: true }),
    ...buildSlgWhatIfSlides(state, strings, ctx).map((w) => tag("slg")({ ...w, byDefault: true })),
  ];
  const slgEvolution = buildEvolutionSlide(state, derived.series, "slg", slg.diagnosis, strings, metrics, ctx);
  if (slgEvolution) slgEntries.push(tag("slg")({ id: "slg:evolution", slide: slgEvolution, byDefault: false }));

  // The slides the two motions share.
  const visibility = buildVisibility(state, derived, strings, metrics, ctx);
  const unit = hybrid ? buildUnitBoth(state, derived, strings, metrics, ctx) : buildUnitSlg(state, slg, strings, metrics, ctx, prose.derived ?? []);
  const ask = buildAsk(state, derived, strings, metrics, ctx);
  const mirror = derived.mirror;
  const mirrorLinked = Boolean(state.tourLink && mirror && mirror.resultId === state.tourLink.resultId);
  const annexRows = buildAnnex(state, strings, metrics, ctx);
  const visibilityEntry: Entry = { id: "visibility", slide: { present: true, title: visibility.title, lines: visibility.lines, notes: [] }, byDefault: true };
  const shared: (Entry & { motion?: Motion })[] = [
    // Sales-assisted alone: its unit economics are its own slide, in its chrome.
    { id: "unit-economics", slide: { present: unit.present, title: unit.title, lines: unit.lines, notes: [] }, byDefault: true, ...(hybrid ? {} : { motion: "slg" as const }) },
    {
      id: "mirror",
      slide: {
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
        lines: mirror ? mirrorLines(mirror, strings, metrics, ctx, prose, hybrid) : [],
        notes: [],
      },
      byDefault: DEFAULT_INCLUDE.mirror,
    },
    { id: "ask", slide: { present: ask.present, title: ask.title, lines: ask.lines, notes: [] }, byDefault: true },
    ...annexSlides({ present: true, title: { key: "annex", values: { i: "1", n: "1" } }, lines: annexRows, notes: [] }, annexRows),
  ];

  // The total's body cites slide numbers: a placeholder now, written once the deck is numbered.
  const totalEntry: (Entry & { motion?: Motion })[] = hybrid ? [{ id: "total", slide: { present: Boolean(derived.total), title: { key: "total", values: {} }, lines: [], notes: [] }, byDefault: true }] : [];
  // Both motions blind: what we can't see leads, right after the total (§18.8.1).
  const allBlind = (!hybrid || plgBlind) && slgBlind;
  const entries = allBlind
    ? [...totalEntry, visibilityEntry, ...plgEntries, ...slgEntries, ...shared]
    : [...totalEntry, ...plgEntries, ...slgEntries, visibilityEntry, ...shared];

  let index = 0;
  const slides: DeckSlide[] = entries.map(({ id, slide, byDefault, motion }) => {
    const included = slide.present && (state.deck.include[includeKeyOf(id)] ?? byDefault);
    return { id, ...slide, included, index: included ? ++index : null, ...(motion ? { motion } : {}) };
  });
  const indexOf = (id: SlideId) => slides.find((s) => s.id === id)?.index ?? null;

  const allTools = toolsOf(state, motionShapes(state.setup.motions), strings);
  if (hybrid && derived.total) {
    const at = slides.findIndex((s) => s.id === "total");
    const built = buildTotalSlide(state, derived, strings, metrics, ctx, (m) => indexOf(m === "plg" ? "leak" : "slg:leak"), joinList(allTools, strings.grammar));
    slides[at] = { ...slides[at]!, ...built, notes: totalNotes(state, derived, strings, ctx, indexOf) };
  }

  // The chrome: each motion's own in the hybrid; sales-assisted's for the whole deck when it is alone.
  const month = formatMonth(snapshot.referenceMonth, ctx.locale);
  const cohort = formatMonth(snapshot.cohortMonth, ctx.locale);
  const label = state.deck.showCompany ? slideGlyphs(state.setup.companyLabel ?? "") : "";
  const company = label ? `${label} · ` : "";
  const flows = formatMonthRange({ from: monthsBefore(snapshot.referenceMonth, 2), to: snapshot.referenceMonth }, ctx.locale, strings.units, "from");
  const leadRange = periodRangeOf(shapeOf("slg.acq.lead-to-opp"), entryOf(snapshot, "slg.acq.lead-to-opp"), snapshot, state.setup, ctx.today);
  const leads = leadRange ? formatMonthRange(leadRange, ctx.locale, strings.units, "from") : "";
  const slgFooter = fillSegments(strings.slide.footerSlg, { flows, leads, tools: joinList(toolsOf(state, SLG_METRIC_SHAPES, strings), strings.grammar) });
  const pill = (c: { found: number; approximate: number; missing: number }) => ({ measured: c.found, approximate: c.approximate, missing: c.missing });
  const credit = state.deck.showSiteCredit ? strings.slide.credit : "";
  const byMotion: DeckModel["byMotion"] =
    hybrid && plg
      ? {
          plg: {
            kicker: fillTemplate(strings.slide.kickerMotion, { company, month, motion: strings.hybrid.motionAdjective.plg }),
            dataPill: pill(plg.coverage),
            footer: fillSegments(strings.slide.footer, { cohort, month, tools: joinList(toolsOf(state, METRIC_SHAPES, strings), strings.grammar) }),
          },
          slg: {
            kicker: fillTemplate(strings.slide.kickerMotion, { company, month, motion: strings.hybrid.motionAdjective.slg }),
            dataPill: pill(slg.coverage),
            footer: slgFooter,
          },
        }
      : undefined;
  const toolList = joinList(allTools, strings.grammar);
  return {
    slides,
    checks: derived.sanity,
    dataPill: pill(derived.coverage),
    kicker: { company, month },
    footer: {
      cohort: hybrid ? cohort : "",
      month,
      tools: toolList,
      credit,
      // The shared slides of the hybrid cite the flows' month and every tool; sales-assisted alone, its own months.
      text: hybrid ? capitalise(fillSegments(strings.slide.footer, { cohort: "", month, tools: toolList })) : slgFooter,
    },
    ...(byMotion ? { byMotion } : {}),
  };
}

/**
 * The total slide's speaker notes (§18.8.3): why the two aren't compared
 * (each motion's slides cited), what the link is and is not, what moving it
 * would sign when the team moved it, and who counts where (S8).
 */
function totalNotes(state: EngineState, derived: EngineDerived, strings: Words, ctx: EngineCalcContext, indexOf: (id: SlideId) => number | null): string[] {
  const n = strings.notes;
  const notes: string[] = [];
  const i = indexOf("leak") ?? indexOf("peloton");
  const j = indexOf("slg:leak") ?? indexOf("slg:peloton");
  if (i !== null && j !== null) notes.push(fillTemplate(n.whyNotCompare, { i: String(i), j: String(j) }));
  const link = derived.total ? linkSentence(derived.total, state, strings, ctx) : null;
  if (link) notes.push(fillTemplate(n.selfServeFeeds, { link }));
  const k = indexOf("whatif:link.pql-handoff");
  const alone = slgLeverAlone(state, "link.pql-handoff", ctx);
  const lever = alone?.levers.find((l) => l.id === "link.pql-handoff");
  if (k !== null && alone && lever?.today && lever.target !== null && alone.today.won && alone.projected.won) {
    const more = changeOf(alone.today.won, alone.projected.won);
    notes.push(
      fillTemplate(n.selfServeLever, {
        from: formatInterval(lever.today, "ratio", ctx, strings.units),
        to: formatInterval(point(lever.target), "ratio", ctx, strings.units),
        n: fillTemplate(strings.units.approx, { n: formatCountInterval(mapBounds(more, (v) => Math.round(v * 10) / 10), ctx, strings.units) }),
        k: String(k),
      }),
    );
  }
  notes.push(n.whoCountsWhere);
  return notes;
}

/** Machine keys: ids and states a slide maps to its own words, never printed as they are. */
const MACHINE_KEYS: ReadonlySet<string> = new Set(["row", "key", "id", "questionId", "tone", "verdict"]);

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
  // The hybrid: each motion's slides cite their own months and tools, said once each after the shared line.
  if (model.byMotion) for (const motion of ["plg", "slg"] as const) out.push(model.byMotion[motion].footer);
  if (model.footer.credit) out.push(model.footer.credit);
  return out.join("\n");
}

/** Present for reuse by the board: the team's target on a candidate, formatted — "30 %" — or "" without one. */
export function comparatorText(state: EngineState, id: CandidateId, strings: Words, ctx: EngineCalcContext): string {
  const comparator = comparatorOf(state, id);
  return comparator ? formatComparator(comparator, id, state, ctx, strings.units) : "";
}
