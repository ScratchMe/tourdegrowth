import { ALL_DERIVED_SHAPES, CANDIDATE_IDS, PELOTON_METRICS, SLG_CANDIDATE_IDS, candidatesOf, motionOfMetric, shapeOf } from "./catalog-shape";
import { periodRangeOf, windowDaysOf } from "./cohort";
import { CHAIN_VERB } from "./findings";
import { capitalise, fillTemplate, formatMonth, formatMonthRange, joinList, lowerFirst } from "./format";
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
  PlgCandidateId,
  Position,
  SlgDiagnosis,
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
  return (CANDIDATE_IDS as readonly string[]).includes(id) || (SLG_CANDIDATE_IDS as readonly string[]).includes(id);
}

/** Either motion's diagnosis — the sentences below word both alike (§18.5.2). */
export type AnyDiagnosis = Diagnosis<PlgCandidateId> | SlgDiagnosis;

/** A candidate's position in its own motion's diagnosis; undefined for another motion's candidate. */
export function positionIn(diagnosis: AnyDiagnosis, id: CandidateId): { position: Position; comparator?: Comparator; impact?: Impact } | undefined {
  return (diagnosis.positions as Partial<Record<CandidateId, { position: Position; comparator?: Comparator; impact?: Impact }>>)[id];
}

/** The candidate priced on the customer base, which ranks only in money: churn, or the renewal. */
function retentionOf(diagnosis: AnyDiagnosis): CandidateId {
  return diagnosis.motion === "plg" ? "ret.logo-churn" : "slg.ret.renewal";
}

// --- Numbers and answers -----------------------------------------------------------

/**
 * Three of the fifteen are not numbers (Antoine, 2026-09-26: « Où en es-tu avec
 * ce chiffre ? » was asked of the activation event). The activation event and
 * the churn cause are words, the referral mechanism is a choice — an ANSWER.
 * Every wording that would call a metric « ce chiffre » asks this first.
 */
export function isAnswerMetric(id: MetricId): boolean {
  const { unit } = shapeOf(id);
  return unit === "text" || unit === "choice";
}

/** The question over the sheet's four status choices: « ce chiffre » for a number, « ce point » for an answer. */
export function statusQuestionOf(id: MetricId, strings: Words): string {
  return isAnswerMetric(id) ? strings.sheet.statusQuestionAnswer : strings.sheet.statusQuestion;
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
const UNIT_INPUTS: ReadonlySet<MetricId> = new Set(ALL_DERIVED_SHAPES.flatMap((s) => s.inputs));

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
): Record<CatalogueSlot, string> {
  const snapshot = currentSnapshot(state);
  const shape = shapeOf(id);
  const entry = entryOf(snapshot, id);
  const variantId = entry?.variant ?? shape.variants?.[0];
  const variant = metrics.find((m) => m.id === id)?.variants?.find((v) => v.id === variantId)?.label ?? "";
  // The months the number covers: three for sales-assisted (C25 Q2), « de mai à juillet 2026 ».
  const range = periodRangeOf(shape, entry, snapshot, state.setup, ctx.today) ?? { from: snapshot.referenceMonth, to: snapshot.referenceMonth };
  return {
    month: formatMonth(snapshot.referenceMonth, ctx.locale),
    cohort: formatMonth(entry?.cohortMonth ?? snapshot.cohortMonth, ctx.locale),
    period: formatMonthRange(range, ctx.locale, strings.units, "from"),
    n: String(windowDaysOf(shape, state.setup)),
    event: eventPhrase(state, strings),
    // A label (« Média seul ») sits mid-sentence here: « (média seul) ».
    variant: lowerFirst(variant),
  };
}

/** The placeholders every catalogue string may carry — `{period}` since the sales-assisted catalogue (A7.3.c S2). */
export type CatalogueSlot = "month" | "cohort" | "period" | "n" | "event" | "variant";

/** The same six, for the static catalogue page: bracketed slots, never a made-up month. */
export function staticCatalogueValues(strings: Words): Record<CatalogueSlot, string> {
  const v = strings.visual;
  return { event: v.staticEvent, n: v.staticWindow, cohort: v.staticCohort, month: v.staticMonth, period: v.staticPeriod, variant: v.staticVariant };
}

/** A source after « selon » / "according to": a tool's name, a role, or « une autre source » — never the label « Autre ». */
export function sourceInSentence(source: SourceRef | null | undefined, strings: Words): string {
  if (!source || source.kind === "other") return strings.source.otherInSentence;
  return source.kind === "tool" ? strings.tools[source.tool] : strings.role[source.role];
}

// --- Where a value sits ----------------------------------------------------------

export type SideKey = keyof Words["side"];

/**
 * A position (good-or-bad) against the team's target, as a physical `side`
 * key. The one place the metric's direction crosses the words: churn `below`
 * (behind) is `overTarget`, churn `above` (ahead) is `underTarget`.
 */
export function sideKey(position: Position, comparator: Comparator | undefined): SideKey | null {
  if (!comparator) return null;
  const up = comparator.direction === "higher";
  switch (position) {
    case "below":
      return up ? "underTarget" : "overTarget";
    case "maybe-below":
      return up ? "maybeUnderTarget" : "maybeOverTarget";
    case "within":
      return "atTarget";
    case "above":
      return up ? "overTarget" : "underTarget";
    default:
      return null;
  }
}

/** « sous la cible », « au-dessus de la cible »… — null when there is nothing to compare with. */
export function sideText(position: Position, comparator: Comparator | undefined, strings: Words): string | null {
  const key = sideKey(position, comparator);
  return key ? strings.side[key] : null;
}

/** The same, as a stamp or a line of its own: « Au-dessus de la cible ». */
export function stampText(position: Position, comparator: Comparator | undefined, strings: Words): string | null {
  const text = sideText(position, comparator, strings);
  return text ? capitalise(text) : null;
}

/**
 * A position as a label of its own — the board row's comparator, the metric
 * sheet's position line, the peloton's stamp: « Au-dessus de la cible »,
 * « À la cible », « Sans cible · fixes-en une ». Null when the value is
 * unknown. The screens used to pick from four direction-blind strings
 * (`diagnosis.stampReference` & co.), so a churn above its comparator was
 * once labelled « Sous le repère ». One function, so the board cannot word a
 * position two ways.
 */
export function positionLabel(position: Position, comparator: Comparator | undefined, strings: Words): string | null {
  if (position === "no-comparator") return strings.diagnosis.noComparator;
  return stampText(position, comparator, strings);
}

/**
 * The board's sentence under a NAMED stage: « 18 %, sous ta cible (20 %) » —
 * or, for churn, « au-dessus de ta cible ». `value` and `comparatorText`
 * arrive formatted.
 */
export function behindSentence(comparator: Comparator, value: string, comparatorText: string, strings: Words): string {
  const d = strings.diagnosis;
  return fillTemplate(comparator.direction === "higher" ? d.belowTarget : d.aboveTarget, { value, target: comparatorText });
}

// --- Diagnosis sentences ------------------------------------------------------------

/** « Sans chiffre pour la rétention à J30, l'étape qui freine vraiment peut s'y cacher. » — the list mid-sentence, never capitalised. */
export function blindSentence(ids: readonly MetricId[], strings: Words, metrics: ResolvedMetric[]): string | null {
  if (ids.length === 0) return null;
  const stages = joinList(ids.map((id) => stagePhrase(id, strings, metrics)), strings.grammar);
  return fillTemplate(ids.length === 1 ? strings.diagnosis.blindOne : strings.diagnosis.blind, { stages });
}

/** `not-enough` with a stage behind: which one, and where it sits — the title's and the board's values alike. */
export function notEnoughBelowValues(diagnosis: AnyDiagnosis, strings: Words, metrics: ResolvedMetric[]): { stage: string; side: string } | null {
  if (diagnosis.state !== "not-enough") return null;
  const id = candidatesOf(diagnosis.motion).find((c) => positionIn(diagnosis, c)?.position === "below");
  if (!id) return null;
  const side = sideText("below", positionIn(diagnosis, id)?.comparator, strings);
  return side ? { stage: capitalise(subjectOf(id, strings, metrics)), side } : null;
}

export function notEnoughBelowSentence(diagnosis: AnyDiagnosis, strings: Words, metrics: ResolvedMetric[]): string | null {
  const values = notEnoughBelowValues(diagnosis, strings, metrics);
  return values ? fillTemplate(strings.diagnosis.notEnoughBelow, values) : null;
}

/** Whether churn (the renewal, in sales-assisted) is behind but cannot be ranked: the flows have no amount to set its money next to. */
export function churnWithoutCommonAmount(diagnosis: AnyDiagnosis): boolean {
  return diagnosis.basis === "relative-gap" && positionIn(diagnosis, retentionOf(diagnosis))?.position === "below";
}

/**
 * « Aussi en retard, sans montant calculable : Rétention à J30 » — the
 * names after the colon, as labels. Churn is left out when `noArpa` already
 * says why it stands apart: one reason, said once.
 */
export function unpricedSentence(diagnosis: AnyDiagnosis, strings: Words, metrics: ResolvedMetric[]): string | null {
  const retention = retentionOf(diagnosis);
  const ids = (diagnosis.belowUnpriced as CandidateId[]).filter((id) => !(id === retention && churnWithoutCommonAmount(diagnosis)));
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
  // Sales-assisted counts a quarter (§18.5.3); its money is said a month, like self-serve's.
  const slg = motionOfMetric(impact.metric) === "slg";
  const renewal = impact.metric === "slg.ret.renewal";
  if (impact.lines.some((l) => l.key === "less-than-one")) return slg ? (renewal ? w.lessThanOneKept : w.lessThanOneQuarter) : w.lessThanOne;
  const head = impactHeadline(impact);
  if (head.amount) return fillTemplate(impact.kind === "retained-mrr" ? w.retainedMrr : w.newMrr, { amount: head.amount });
  if (!head.n) return null;
  if (slg) {
    if (impact.kind === "per-hundred") {
      // Named: what is counted, and on which 100 — « 8 signatures de plus pour 100 opportunités conclues ».
      const key = renewal ? "perHundredRenewal" : impact.metric === "slg.acq.lead-to-opp" ? "perHundredLead" : "perHundredWin";
      const base = strings.findings.base[impact.perHundredBase ?? "leads"];
      return fillTemplate(w[numbered(key, head.count, locale)], { n: head.n, base });
    }
    const key = renewal ? "keptQuarter" : "customersQuarter";
    return fillTemplate(w[numbered(key, head.count, locale)], { n: head.n });
  }
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
    case "per-month":
      throw new Error("A self-serve chain has no per-month line: it counts a month already");
  }
}

/**
 * The same for a sales-assisted chain (§18.5.3): « Aujourd'hui · 24 % de
 * closing → 18 nouveaux clients sur 3 mois », « Alors · 18 × 32/24 = 24 (+6)
 * sur 3 mois », « × ACV ÷ 12 · 6 × 2 000 € = 12 000 € de MRR nouveau par
 * trimestre », « soit ~4 000 € par mois ». `values` adds what the line's
 * template needs beyond its numbers — the rate's `{phrase}`.
 */
export function slgChainTemplate(
  line: ImpactLine,
  impact: Pick<Impact, "metric" | "kind" | "perHundredBase">,
  strings: Words,
  locale: Locale,
  term: "annual" | "monthly" | null,
): { label: string | null; template: string; values: Record<string, string> } {
  const words = strings.whatIf;
  const c = strings.slgChain;
  const renewal = impact.metric === "slg.ret.renewal";
  const perHundred = impact.kind === "per-hundred";
  const phrase = impact.metric === "slg.acq.lead-to-opp" || impact.metric === "slg.rev.win-rate" ? c.phrase[impact.metric] : "";
  const base = strings.findings.base[impact.perHundredBase ?? "leads"];
  const plain = (label: string | null, template: string) => ({ label, template, values: {} });
  switch (line.key) {
    case "today":
      if (perHundred) return { label: words.today, template: c.todayPerHundred, values: { base } };
      if (renewal) return plain(words.today, c[numbered("todayRenewal", line.count, locale)]);
      return { label: words.today, template: c[numbered("todayFlow", line.count, locale)], values: { phrase } };
    case "if":
      return plain(words.if, words.ifFlow);
    case "then":
      if (perHundred) return { label: words.then, template: c.thenPerHundred, values: { base } };
      return plain(words.then, renewal ? c[numbered("thenRenewal", line.count, locale)] : c.thenFlow);
    case "times":
      return plain(renewal ? c.timesArpa : c.timesAcv, renewal ? c.timesRenewal : c.timesFlow);
    case "per-month":
      return plain(null, c.perMonth);
    case "annual":
      return plain(null, term === "monthly" ? c.annualMonthly : c.annual);
    case "less-than-one":
      return plain(null, renewal ? c.lessThanOneKept : c.lessThanOne);
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
