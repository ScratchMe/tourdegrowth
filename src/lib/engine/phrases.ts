import { CANDIDATE_IDS, DERIVED_SHAPES, PELOTON_METRICS, shapeOf } from "./catalog-shape";
import { windowDaysOf } from "./cohort";
import { CHAIN_VERB } from "./findings";
import { capitalise, fillTemplate, formatMonth, joinList, lowerFirst } from "./format";
import { impactHeadline } from "./impact";
import type { EngineStrings, ResolvedMetric } from "./strings";
import type {
  CandidateId,
  Comparator,
  Diagnosis,
  EngineCalcContext,
  EngineState,
  Impact,
  ImpactLine,
  Interval,
  MetricId,
  Position,
  SourceRef,
  UnitInputId,
} from "./types";
import { currentSnapshot, entryOf } from "./values";

/**
 * phrases.ts — the words that go INTO the templates (engine spec §14).
 *
 * The copy (`content/engine-copy.ts`) holds every word; this module decides
 * which of them a sentence takes, from the model. It exists because the
 * choices below were being made in five places — the deck, the request, the
 * board's diagnosis, the "what if" drawer, the static catalogue — and each
 * made them slightly differently, which is how a slide came to print
 * « combien ont fait a créé un premier projet », « Sans chiffre pour La
 * rétention à J30 » and a churn « sous le repère » when it sat above it.
 *
 * The rules, each one a test in `__tests__/phrases.test.ts` and all of them
 * swept together in `sentences-guard.test.ts`:
 *
 * - **A stage inside a sentence is a phrase with its article** — `subject`,
 *   `peloton.unmeasured`, `unitInput`, `event` — never a catalogue NAME,
 *   which is a label (after a colon, in parentheses, before « · »).
 * - **Where a value sits is said physically, from the metric's direction.**
 *   Positions are good-or-bad (`below` = behind); churn is lower-is-better,
 *   so behind is ABOVE. `sideKey` is the one place that crossing happens.
 * - **A noun agrees with the number as printed.** French takes the singular
 *   under 2 (« 1,5 payant », « 0 chiffre »), English only for exactly 1 —
 *   decided on the displayed (rounded) count, the one the reader sees.
 *
 * Pure and free of `content/`: the client island imports it (the board's
 * diagnosis and "what if" build their sentences here too).
 */

type Words = EngineStrings;
type Locale = EngineCalcContext["locale"];

function nameOf(metrics: ResolvedMetric[], id: MetricId): string {
  const m = metrics.find((x) => x.id === id);
  if (!m) throw new Error(`No resolved prose for engine metric ${id}`);
  return m.name;
}

export function isCandidate(id: MetricId): id is CandidateId {
  return (CANDIDATE_IDS as readonly string[]).includes(id);
}

// --- Grammatical number --------------------------------------------------------

/**
 * Whether a noun agrees in the singular with this PRINTED count. French: under
 * 2 (« 0 chiffre », « 1,5 payant », « 1 à 1,5 payant »); English: exactly 1.
 */
export function isSingular(count: Interval, locale: Locale): boolean {
  return locale === "fr" ? count.hi < 2 : count.lo === 1 && count.hi === 1;
}

/** `key`, or its `keyOne` sibling when the printed count takes the singular. */
export function numbered<K extends string>(key: K, count: Interval | undefined, locale: Locale): K | `${K}One` {
  return count && isSingular(count, locale) ? `${key}One` : key;
}

// --- Stages, inputs, the event -----------------------------------------------------

/** A number as the subject of a sentence, with its article: « l'activation », « le churn logo ». */
export function subjectOf(id: MetricId, strings: Words, metrics: ResolvedMetric[]): string {
  // Every id a sentence names as a stage is a candidate; the fallback keeps an unforeseen one readable.
  return isCandidate(id) ? strings.subject[id] : lowerFirst(nameOf(metrics, id));
}

/**
 * How a stage is named mid-sentence. The three peloton columns use their
 * `unmeasured` phrase — all feminine, which the peloton titles' « mesurées »
 * agrees with — and every other candidate its `subject`.
 */
export function stagePhrase(id: MetricId, strings: Words, metrics: ResolvedMetric[]): string {
  if ((PELOTON_METRICS as readonly string[]).includes(id)) return strings.peloton.unmeasured[CHAIN_VERB[id as (typeof PELOTON_METRICS)[number]]];
  return subjectOf(id, strings, metrics);
}

/** The inputs of the computed figures: the only ids « il manque » / "missing:" ever names. */
const UNIT_INPUTS: ReadonlySet<MetricId> = new Set(DERIVED_SHAPES.flatMap((s) => s.inputs));

/** « la marge brute », « le CAC et l'ARPA mensuel » — what « il manque » is followed by. */
export function unitInputsPhrase(ids: readonly MetricId[], strings: Words, metrics: ResolvedMetric[]): string {
  return joinList(
    ids.map((id) => (UNIT_INPUTS.has(id) ? strings.unitInput[id as UnitInputId] : lowerFirst(nameOf(metrics, id)))),
    strings.grammar,
  );
}

/** The quotes a user may have typed around their own event name, stripped so the copy's quotes aren't doubled. */
const WRAPPING_QUOTES = /^[\s«»"“”'‘’]+|[\s«»"“”'‘’]+$/g;

/**
 * The activation event as a noun phrase: the user's words quoted and
 * introduced (« l'événement « a créé un premier projet » »), or the generic
 * « l'événement d'activation » before anyone has named it.
 */
export function eventPhrase(state: EngineState, strings: Words): string {
  const entry = entryOf(currentSnapshot(state), "act.event");
  const raw = entry?.status === "measured" && entry.value?.kind === "text" ? entry.value.text : "";
  const name = raw.replace(WRAPPING_QUOTES, "");
  return name ? fillTemplate(strings.event.named, { name }) : strings.event.unnamed;
}

/**
 * The five placeholders of a catalogue string (formula, recipe, request,
 * count labels) for one number of this state — the same values the request,
 * the annex and the sheet fill, so the three cannot word one definition two ways.
 */
export function catalogueValues(
  state: EngineState,
  id: MetricId,
  strings: Words,
  metrics: ResolvedMetric[],
  ctx: EngineCalcContext,
): Record<"month" | "cohort" | "n" | "event" | "variant", string> {
  const snapshot = currentSnapshot(state);
  const shape = shapeOf(id);
  const entry = entryOf(snapshot, id);
  const variantId = entry?.variant ?? shape.variants?.[0];
  const variant = metrics.find((m) => m.id === id)?.variants?.find((v) => v.id === variantId)?.label ?? "";
  return {
    month: formatMonth(snapshot.referenceMonth, ctx.locale),
    cohort: formatMonth(entry?.cohortMonth ?? snapshot.cohortMonth, ctx.locale),
    n: String(windowDaysOf(shape, state.setup)),
    event: eventPhrase(state, strings),
    // A label (« Média seul ») sits mid-sentence here: « (média seul) ».
    variant: lowerFirst(variant),
  };
}

/** The same five, for the static catalogue page: bracketed slots, never a made-up month. */
export function staticCatalogueValues(strings: Words): Record<"month" | "cohort" | "n" | "event" | "variant", string> {
  const v = strings.visual;
  return { event: v.staticEvent, n: v.staticWindow, cohort: v.staticCohort, month: v.staticMonth, variant: v.staticVariant };
}

/** A source after « selon » / "according to": a tool's name, a role, or « une autre source » — never the label « Autre ». */
export function sourceInSentence(source: SourceRef | null | undefined, strings: Words): string {
  if (!source || source.kind === "other") return strings.source.otherInSentence;
  return source.kind === "tool" ? strings.tools[source.tool] : strings.role[source.role];
}

// --- Where a value sits ----------------------------------------------------------

export type SideKey = keyof Words["side"];

/**
 * A position (good-or-bad) and its comparator, as a physical `side` key. The
 * one place the metric's direction crosses the words: churn `below` (behind)
 * is `overReference`, churn `above` (ahead) is `underReference`.
 */
export function sideKey(position: Position, comparator: Comparator | undefined): SideKey | null {
  if (!comparator) return null;
  const up = comparator.direction === "higher";
  const target = comparator.kind === "target";
  switch (position) {
    case "below":
      return target ? (up ? "underTarget" : "overTarget") : up ? "underReference" : "overReference";
    case "maybe-below":
      return target ? (up ? "maybeUnderTarget" : "maybeOverTarget") : up ? "maybeUnderReference" : "maybeOverReference";
    case "within":
      return target ? "atTarget" : "withinReference";
    case "above":
      return target ? (up ? "overTarget" : "underTarget") : up ? "overReference" : "underReference";
    default:
      return null;
  }
}

/** « sous le repère », « au-dessus de la cible »… — null when there is nothing to compare with. */
export function sideText(position: Position, comparator: Comparator | undefined, strings: Words): string | null {
  const key = sideKey(position, comparator);
  return key ? strings.side[key] : null;
}

/** The same, as a stamp or a line of its own: « Au-dessus du repère ». */
export function stampText(position: Position, comparator: Comparator | undefined, strings: Words): string | null {
  const text = sideText(position, comparator, strings);
  return text ? capitalise(text) : null;
}

/**
 * The board's sentence under a NAMED stage: « 18 %, sous l'ordre de grandeur
 * couramment cité (20 à 40 %) » — or, for churn, « au-dessus de … ».
 * `value` and `comparatorText` arrive formatted.
 */
export function behindSentence(comparator: Comparator, value: string, comparatorText: string, strings: Words): string {
  const d = strings.diagnosis;
  const up = comparator.direction === "higher";
  if (comparator.kind === "target") return fillTemplate(up ? d.belowTarget : d.aboveTarget, { value, target: comparatorText });
  return fillTemplate(up ? d.belowReference : d.aboveReference, { value, range: comparatorText });
}

// --- Diagnosis sentences ------------------------------------------------------------

/** « Sans chiffre pour la rétention à J30, l'étape qui freine vraiment peut s'y cacher. » — the list mid-sentence, never capitalised. */
export function blindSentence(ids: readonly MetricId[], strings: Words, metrics: ResolvedMetric[]): string | null {
  if (ids.length === 0) return null;
  const stages = joinList(ids.map((id) => stagePhrase(id, strings, metrics)), strings.grammar);
  return fillTemplate(ids.length === 1 ? strings.diagnosis.blindOne : strings.diagnosis.blind, { stages });
}

/** `not-enough` with a stage behind: which one, and where it sits — the title's and the board's values alike. */
export function notEnoughBelowValues(diagnosis: Diagnosis, strings: Words, metrics: ResolvedMetric[]): { stage: string; side: string } | null {
  if (diagnosis.state !== "not-enough") return null;
  const id = CANDIDATE_IDS.find((c) => diagnosis.positions[c].position === "below");
  if (!id) return null;
  const side = sideText("below", diagnosis.positions[id].comparator, strings);
  return side ? { stage: capitalise(subjectOf(id, strings, metrics)), side } : null;
}

export function notEnoughBelowSentence(diagnosis: Diagnosis, strings: Words, metrics: ResolvedMetric[]): string | null {
  const values = notEnoughBelowValues(diagnosis, strings, metrics);
  return values ? fillTemplate(strings.diagnosis.notEnoughBelow, values) : null;
}

/** Whether churn is behind but cannot be ranked: the flows have no amount to set its money next to. */
export function churnWithoutCommonAmount(diagnosis: Diagnosis): boolean {
  return diagnosis.basis === "relative-gap" && diagnosis.positions["ret.logo-churn"].position === "below";
}

/**
 * « Aussi en retard, sans montant calculable : Rétention à J30 » — the
 * names after the colon, as labels. Churn is left out when `noArpa` already
 * says why it stands apart: one reason, said once.
 */
export function unpricedSentence(diagnosis: Diagnosis, strings: Words, metrics: ResolvedMetric[]): string | null {
  const ids = diagnosis.belowUnpriced.filter((id) => !(id === "ret.logo-churn" && churnWithoutCommonAmount(diagnosis)));
  if (ids.length === 0) return null;
  return fillTemplate(strings.diagnosis.unpriced, { stages: joinList(ids.map((id) => nameOf(metrics, id)), strings.grammar) });
}

// --- What a gap is worth, and the "what if" chain --------------------------------

/**
 * What closing a gap is worth, as a phrase — read from the SAME chain the
 * calculation prints (`impactHeadline`), never recomputed. null when the
 * chain prices nothing.
 */
export function worthOf(impact: Impact, strings: Words, locale: Locale): string | null {
  const w = strings.worth;
  if (impact.lines.some((l) => l.key === "less-than-one")) return w.lessThanOne;
  const head = impactHeadline(impact);
  if (head.amount) return fillTemplate(impact.kind === "retained-mrr" ? w.retainedMrr : w.newMrr, { amount: head.amount });
  if (!head.n) return null;
  const key = impact.kind === "per-hundred" ? "perHundred" : impact.metric === "ret.logo-churn" ? "kept" : "customers";
  return fillTemplate(w[numbered(key, head.count, locale)], { n: head.n });
}

type ChainTemplateKey = Exclude<keyof Words["whatIf"], "today" | "if" | "then" | "times">;

/**
 * Which sentence a line of the "what if" chain is printed with, and under
 * which label — the drawer and the slide alike. Churn counts customers kept;
 * a chain with no monthly volume is read per 100 sign-ups, where « par mois »
 * would be false; a noun agrees with its printed count.
 */
export function chainTemplate(
  line: ImpactLine,
  impact: Pick<Impact, "metric" | "kind">,
  words: Words["whatIf"],
  locale: Locale,
): { label: string | null; template: string } {
  const churn = impact.metric === "ret.logo-churn";
  const pick = (key: ChainTemplateKey) => words[key];
  switch (line.key) {
    case "today":
      if (churn) return { label: words.today, template: words.todayChurn };
      return {
        label: words.today,
        template: pick(numbered(impact.kind === "per-hundred" ? "todayPerHundred" : "todayFlow", line.count, locale)),
      };
    case "if":
      return { label: words.if, template: words.ifFlow };
    case "then":
      return { label: words.then, template: churn ? pick(numbered("thenChurn", line.count, locale)) : words.thenFlow };
    case "times":
      return { label: words.times, template: churn ? words.timesChurn : words.timesFlow };
    case "annual":
      return { label: null, template: words.annual };
    case "less-than-one":
      return { label: null, template: words.lessThanOne };
  }
}

// --- Templates of " · "-separated segments -----------------------------------------

/**
 * Fills a template made of " · "-separated segments, dropping every segment
 * one of whose placeholders is empty — separator included. `tidy` after the
 * fact can't: « sources : » is not empty once its value is.
 */
export function fillSegments(template: string, values: Record<string, string>): string {
  return template
    .split(" · ")
    .filter((segment) => [...segment.matchAll(/\{(\w+)\}/g)].every(([, key]) => (values[key!] ?? "").trim() !== ""))
    .map((segment) => fillTemplate(segment, values))
    .join(" · ");
}
