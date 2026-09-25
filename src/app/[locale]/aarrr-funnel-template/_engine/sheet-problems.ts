import { TEXT_LIMITS } from "@/lib/engine/catalog-shape";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import type { DraftProblem } from "./sheet-draft";
import { fill, midSentence } from "./text";

/**
 * What the sheet says about a refused save. Two kinds, said two ways:
 *
 * - a RULE the entry cannot break (§6.9, D11: more of the part than of the
 *   whole, bounds the wrong way round, a text over its limit) gets its own
 *   sentence under the field and under the button;
 * - a piece that is simply MISSING is named in one line by the button —
 *   "To save, still missing: source, what's counted" — rather than turning
 *   every empty box red before the person has had a chance to fill it.
 */
const RULES: readonly DraftProblem[] = [
  "denominator-zero",
  "num-gt-den",
  "percent-range",
  "low-above-high",
  "text-too-long",
  "label-too-long",
  "definition-too-long",
  "note-too-long",
  "comment-too-long",
];

export function isRule(problem: DraftProblem): boolean {
  return RULES.includes(problem);
}

/** The sentence for a rule problem. */
export function ruleMessage(problem: DraftProblem, metric: ResolvedMetric, strings: EngineStrings, locale: "en" | "fr"): string {
  switch (problem) {
    case "denominator-zero":
      return strings.workbench.denominatorZero;
    case "num-gt-den":
      return fill(strings.sanity.numGtDen, {
        num: midSentence(metric.inputs?.numerator ?? metric.name, locale),
        den: midSentence(metric.inputs?.denominator ?? metric.name, locale),
      });
    case "percent-range":
      return strings.workbench.percentRange;
    case "low-above-high":
      return strings.sheet.lowAboveHigh;
    case "text-too-long":
      return fill(strings.sheet.tooLong, { n: TEXT_LIMITS.value });
    case "label-too-long":
      return fill(strings.sheet.tooLong, { n: TEXT_LIMITS.label });
    case "definition-too-long":
      return fill(strings.sheet.tooLong, { n: TEXT_LIMITS.definitionNote });
    case "note-too-long":
      return fill(strings.sheet.tooLong, { n: TEXT_LIMITS.note });
    case "comment-too-long":
      return fill(strings.sheet.tooLong, { n: TEXT_LIMITS.repairComment });
    default:
      return "";
  }
}

/** The visible label of the field a missing piece belongs to — the same words the field carries on screen. */
export function missingLabel(problem: DraftProblem, metric: ResolvedMetric, strings: EngineStrings): string {
  switch (problem) {
    case "mode":
      return strings.sheet.statusQuestion;
    case "numerator":
      return metric.inputs?.numerator ?? metric.name;
    case "denominator":
      return metric.inputs?.denominator ?? metric.name;
    case "source":
      return strings.sheet.source;
    case "variant":
      return strings.sheet.variant;
    case "evidence":
      return strings.sheet.evidence;
    case "low":
      return strings.sheet.low;
    case "high":
      return strings.sheet.high;
    case "basis":
      return strings.sheet.basis;
    case "triage":
      return strings.triage.question;
    case "na-reason":
      return strings.triage.naReason;
    case "reading-a":
      return strings.triage.readingA;
    case "reading-b":
      return strings.triage.readingB;
    default:
      // percent, amount, duration, text, choice: the value itself, named by the metric.
      return metric.name;
  }
}
