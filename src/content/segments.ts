import type { Translatable } from "@/lib/i18n/translatable";

/**
 * segments.ts — Tour de Growth
 * The two context questions behind a comparable benchmark (REVIEW-02.md
 * R2-26). "Average of every Tour: 58/100" is honest but weak: a pre-launch
 * indie hacker and a scale-up have nothing to say to each other through it.
 * "The average for B2B SaaS at your stage" is a number worth beating.
 *
 * These are NOT questions about growth and they are NOT scored — which is
 * why the product can still say "15 questions" everywhere without lying.
 * They ask who you are, so the comparison lands on the right people.
 *
 * Each carries an explicit "rather not say": the benchmark is a
 * nice-to-have beside someone's result, and gating the score on answering
 * two profiling questions would trade a completion for a statistic. An
 * unanswered axis simply falls the reader back to the global average.
 *
 * TODO: à relire (REVIEW-02) — R2-26, premier jet de la session de code.
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

/** Stored on the submission and used to build the aggregate's document id — never renamed lightly. */
export type SegmentStage = "pre-launch" | "first-customers" | "scaling" | "established" | "unknown";
export type SegmentModel = "b2b" | "b2c" | "marketplace" | "unknown";

export interface SegmentOption<T> {
  value: T;
  label: Translatable;
}

export const SEGMENT_STAGES: SegmentOption<SegmentStage>[] = [
  { value: "pre-launch", label: t("Pas encore lancé", "Not launched yet") },
  { value: "first-customers", label: t("Premiers clients", "First customers") },
  { value: "scaling", label: t("Plus de 100 clients", "More than 100 customers") },
  { value: "established", label: t("Plus de 1 000 clients", "More than 1,000 customers") },
  { value: "unknown", label: t("Je préfère ne pas dire", "I'd rather not say") },
];

export const SEGMENT_MODELS: SegmentOption<SegmentModel>[] = [
  { value: "b2b", label: t("B2B", "B2B") },
  { value: "b2c", label: t("B2C", "B2C") },
  { value: "marketplace", label: t("Place de marché", "Marketplace") },
  { value: "unknown", label: t("Je préfère ne pas dire", "I'd rather not say") },
];

export const SEGMENT_SCREEN = {
  eyebrow: t("Avant le score", "Before your score"),
  title: t("Deux questions pour te comparer aux bonnes équipes", "Two questions, so we compare you to the right teams"),
  intro: t(
    "Elles ne comptent pas dans ton score — elles servent seulement à te situer face à des produits comparables au tien plutôt qu'à la moyenne de tout le monde.",
    "They don't count towards your score — they only place you against products like yours rather than against everyone's average.",
  ),
  stageLabel: t("Où en est ton produit ?", "Where is your product?"),
  modelLabel: t("Tu vends à qui ?", "Who do you sell to?"),
  submit: t("Continuer →", "Continue →"),
  /** Shown under the button: says plainly that skipping costs nothing. */
  optional: t(
    "Les deux sont facultatives : sans réponse, tu seras comparé à la moyenne générale.",
    "Both are optional: leave them and you'll be compared to the overall average.",
  ),
} satisfies Record<string, Translatable>;
