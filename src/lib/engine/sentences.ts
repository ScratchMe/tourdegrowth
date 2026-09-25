import { PELOTON_METRICS } from "./catalog-shape";
import { comparatorOf } from "./diagnose";
import { CHAIN_VERB } from "./findings";
import { fillTemplate } from "./format";
import { isCandidate, numbered, sourceInSentence, unitInputsPhrase } from "./phrases";
import type { EngineStrings, ResolvedDerived, ResolvedMetric } from "./strings";
import type { CandidateId, DerivedId, EngineCalcContext, EngineState, Finding, MetricId, SanityCheck, SanityId } from "./types";
import { currentSnapshot, entryOf } from "./values";

/**
 * sentences.ts — the finished sentence of a finding (§6.10) and of a sanity
 * check (§6.9).
 *
 * `findings.ts` and `sanity.ts` return a kind and formatted NUMBERS; the
 * names, the verb and the sources are copy, and each consumer used to pick
 * them itself. Built once here, a finding reads the same on the board, in
 * the slide screen's "to check" list and in any export — and the choices
 * that are easy to get wrong in one place out of three are made once:
 *
 * - churn behind its comparator is ABOVE it (`aboveComparator`, never
 *   « 3 %, sous 1 à 2 % »);
 * - a missing input is an article-ful phrase after « Il manque »
 *   (`unitInput`), never a bare catalogue name;
 * - a conflicting source is named mid-sentence (« selon une autre source »,
 *   never « selon Autre »);
 * - a noun agrees with the count it prints (`reconcileOne`).
 *
 * Pure and free of `content/`.
 */

type Words = EngineStrings;
type Locale = EngineCalcContext["locale"];

function labelOf(id: MetricId | DerivedId, metrics: ResolvedMetric[], derived: ResolvedDerived[]): string {
  const name = metrics.find((m) => m.id === id)?.name ?? derived.find((d) => d.id === id)?.name;
  if (!name) throw new Error(`No resolved prose for engine number ${id}`);
  return name;
}

/** The sentence of one finding, in the copy's words, every placeholder filled. */
export function findingText(
  finding: Finding,
  state: EngineState,
  strings: Words,
  metrics: ResolvedMetric[],
  derived: ResolvedDerived[] = [],
  locale: Locale = "en",
): string {
  const f = strings.findings;
  // `{metric}` opens the line as a label (« Taux d'activation : … »), so the catalogue NAME is right there.
  const metric = finding.metrics[0] ? labelOf(finding.metrics[0], metrics, derived) : "";
  switch (finding.kind) {
    case "chain-break": {
      // [act.event, act.rate] when the event is what's missing: the verb is still the column's.
      const column = finding.metrics.find((id): id is (typeof PELOTON_METRICS)[number] => (PELOTON_METRICS as readonly string[]).includes(id));
      return fillTemplate(f.chainBreak, { verb: column ? f.verb[CHAIN_VERB[column]] : f.verb.activated });
    }
    case "no-definition":
      return fillTemplate(f.noDefinition, { metric });
    case "blind-spot":
      return fillTemplate(f.blindSpot, { metric });
    case "hidden-knowledge":
      return fillTemplate(f.hiddenKnowledge, { metric });
    case "below-comparator": {
      const id = finding.metrics[0];
      const lower = id !== undefined && isCandidate(id as MetricId) && comparatorOf(state, id as CandidateId)?.direction === "lower";
      return fillTemplate(lower ? f.aboveComparator : f.belowComparator, { ...finding.values, metric });
    }
    case "conflict": {
      const id = finding.metrics[0] as MetricId;
      const conflict = entryOf(currentSnapshot(state), id)?.conflict;
      return fillTemplate(f.conflict, {
        ...finding.values,
        metric,
        sourceA: sourceInSentence(conflict?.a.source, strings),
        sourceB: sourceInSentence(conflict?.b.source, strings),
      });
    }
    case "unit-econ-uncomputable": {
      // metrics[0] is the payback itself; the rest are its missing inputs.
      const inputs = finding.metrics.slice(1).filter((id): id is MetricId => metrics.some((m) => m.id === id));
      return fillTemplate(f.unitEcon, { input: unitInputsPhrase(inputs, strings, metrics) });
    }
    case "reconcile-gap":
      return fillTemplate(f[numbered("reconcile", finding.count, locale)], finding.values);
    case "small-cohort":
      return f.smallCohort;
  }
}

const SANITY_KEY: Record<Exclude<SanityId, "reconcile-gap">, keyof Words["sanity"]> = {
  "num-gt-den": "numGtDen",
  "retained-gt-activated": "retainedGtActivated",
  "paid-gt-retained": "paidGtRetained",
  "churn-high": "churnHigh",
  "margin-odd": "marginOdd",
  "ttv-mean": "ttvMean",
  "cohort-mismatch": "cohortMismatch",
};

/** The message of one sanity check, every placeholder filled. */
export function sanityText(check: SanityCheck, strings: Words, locale: Locale): string {
  const s = strings.sanity;
  if (check.id === "reconcile-gap") return fillTemplate(s[numbered("reconcileGap", check.count, locale)], check.values);
  return fillTemplate(s[SANITY_KEY[check.id]], check.values);
}
