import type { Translatable } from "@/lib/i18n/dictionary";
import type { GlossaryTermId } from "./glossary";

/**
 * Which quiz questions carry a jargon term with a glossary entry, and the
 * exact substring (per locale) the "?" trigger goes right after — per
 * SPEC-ADDENDUM-01.md §1.2's explicit list: "aha moment" (act-1), CAC
 * implicit in acq-3 ("coût d'acquisition"), LTV (rev-2), churn (ret-3),
 * coefficient viral (ref-3), upsell/cross-sell (rev-3). The 5 pillar names
 * themselves get their own trigger wherever they appear as a tag/label
 * (PillarChip), not inline in question text — see ResultView.
 *
 * Matched against the exact copy-library.ts question strings; if that copy
 * ever changes, update the anchor here too (there's no automatic sync,
 * same as the how-it-works.ts `exampleQuestionId` cross-reference note).
 */
export interface QuestionGlossaryTerm {
  termId: GlossaryTermId;
  anchor: Translatable;
}

export const QUESTION_GLOSSARY_TERMS: Record<string, QuestionGlossaryTerm> = {
  "act-1": { termId: "aha-moment", anchor: { en: '"aha" moment', fr: 'moment "aha"' } },
  "acq-3": { termId: "cac", anchor: { en: "customer acquisition cost", fr: "coût d'acquisition" } },
  "ret-3": { termId: "churn", anchor: { en: "churn", fr: "churn" } },
  "ref-3": { termId: "viral-coefficient", anchor: { en: "viral coefficient", fr: "coefficient viral" } },
  "rev-2": { termId: "ltv", anchor: { en: "LTV", fr: "LTV" } },
  "rev-3": { termId: "upsell-cross-sell", anchor: { en: "upsell/cross-sell", fr: "upsell/cross-sell" } },
};
