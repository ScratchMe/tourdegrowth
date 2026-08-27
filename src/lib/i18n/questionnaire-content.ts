import type { Translatable } from "./dictionary";
import type { AnswerIndex } from "@/lib/scoring/score";
import type { Pillar } from "@/lib/scoring/pillars";

export interface AnswerOption {
  /** The AnswerIndex actually stored/scored — NOT the same as this option's position in the array below. */
  index: AnswerIndex;
  label: Translatable;
}

export interface QuestionContent {
  pillar: Pillar;
  question: Translatable;
  /** Display order (best-first, matching DESIGN-BRIEF.md's one worked example) — scoring only cares about each option's `index`, never this array's order. */
  options: AnswerOption[];
}

/**
 * // TODO: copie temporaire — voir SPEC.md §12.
 *
 * The questions themselves are SPEC.md §6's own example table (one example
 * given per pillar there is exactly 3; the two extra per pillar plus every
 * answer option are drafted here to have a complete, testable pipeline).
 * None of this is the approved verdict/roast copy library SPEC.md §12
 * explicitly defers to the product agent — it's the neutral, factual
 * questionnaire text, translated from the product owner's own French, and
 * still subject to revision.
 *
 * Every question has exactly 4 options (see CLAUDE.md's step-2 note on why
 * 4, not the 3 shown in the design mock's single example) whose `index`
 * values are the fixed 0/7/13/20-point scale from score.ts — 0,1,2,3 each
 * appear exactly once per question (enforced by questionnaire-content.test.ts).
 */
export const QUESTION_CONTENT: Record<string, QuestionContent> = {
  "acquisition-1": {
    pillar: "acquisition",
    question: {
      en: "Do you have a primary acquisition channel, identified and measured?",
      fr: "As-tu un canal d'acquisition principal identifié et mesuré ?",
    },
    options: [
      { index: 3, label: { en: "Yes, identified and measured", fr: "Oui, identifié et mesuré" } },
      { index: 2, label: { en: "Identified, but not really measured", fr: "Identifié, mais pas vraiment mesuré" } },
      { index: 1, label: { en: "A rough idea, nothing formalized", fr: "Une vague idée, rien de formalisé" } },
      { index: 0, label: { en: "Not really", fr: "Non, pas vraiment" } },
    ],
  },
  "acquisition-2": {
    pillar: "acquisition",
    question: {
      en: "Have you tested more than one acquisition channel?",
      fr: "As-tu testé plus d'un canal d'acquisition ?",
    },
    options: [
      {
        index: 3,
        label: { en: "Yes, several channels tested and compared", fr: "Oui, plusieurs canaux testés et comparés" },
      },
      { index: 2, label: { en: "A second channel tested once", fr: "Un deuxième canal testé une fois" } },
      {
        index: 1,
        label: { en: "I've thought about it, without really testing", fr: "J'y ai pensé, sans vraiment tester" },
      },
      { index: 0, label: { en: "No, just one channel", fr: "Non, un seul canal" } },
    ],
  },
  "acquisition-3": {
    pillar: "acquisition",
    question: {
      en: "Do you know your acquisition cost, even roughly?",
      fr: "Connais-tu ton coût d'acquisition, même approximatif ?",
    },
    options: [
      { index: 3, label: { en: "Yes, calculated and tracked", fr: "Oui, calculé et suivi" } },
      {
        index: 2,
        label: { en: "An estimate per channel, not overall", fr: "Une estimation par canal, pas au global" },
      },
      { index: 1, label: { en: "A very rough estimate", fr: "Une estimation très grossière" } },
      { index: 0, label: { en: "No idea", fr: "Aucune idée" } },
    ],
  },

  "activation-1": {
    pillar: "activation",
    question: {
      en: 'Have you defined a specific "aha" moment for new users?',
      fr: "As-tu défini un moment « aha » précis pour tes nouveaux utilisateurs ?",
    },
    options: [
      { index: 3, label: { en: "Yes, and we measure it", fr: "Oui, et on le mesure" } },
      { index: 2, label: { en: "We have one, but don't measure it", fr: "Oui, mais on ne le mesure pas" } },
      { index: 1, label: { en: "A hunch, nothing formalized", fr: "Une intuition, rien de formalisé" } },
      { index: 0, label: { en: "Not really", fr: "Non, pas vraiment" } },
    ],
  },
  "activation-2": {
    pillar: "activation",
    question: {
      en: 'Do you know what % of users reach that "aha" moment?',
      fr: "Sais-tu quel pourcentage d'utilisateurs atteint ce moment « aha » ?",
    },
    options: [
      { index: 3, label: { en: "Yes, we track it precisely", fr: "Oui, on le suit précisément" } },
      { index: 2, label: { en: "A rough estimate", fr: "Une estimation approximative" } },
      { index: 1, label: { en: "We talk about it, without measuring it", fr: "On en parle, sans le mesurer" } },
      { index: 0, label: { en: "No, no idea", fr: "Non, aucune idée" } },
    ],
  },
  "activation-3": {
    pillar: "activation",
    question: {
      en: "Has your onboarding been tested or iterated on at least once?",
      fr: "Ton onboarding a-t-il été testé ou itéré au moins une fois ?",
    },
    options: [
      {
        index: 3,
        label: { en: "Yes, tested and iterated on several times", fr: "Oui, testé et itéré plusieurs fois" },
      },
      { index: 2, label: { en: "Iterated on once", fr: "Itéré une fois" } },
      { index: 1, label: { en: "Tweaked a little, without real testing", fr: "Modifié un peu, sans vrai test" } },
      { index: 0, label: { en: "No, never revisited", fr: "Non, jamais retouché" } },
    ],
  },

  "retention-1": {
    pillar: "retention",
    question: {
      en: "Do you track a retention rate (D7/D30)?",
      fr: "Suis-tu un taux de rétention (J7/J30) ?",
    },
    options: [
      { index: 3, label: { en: "Yes, D7 and D30 tracked", fr: "Oui, J7 et J30 suivis" } },
      { index: 2, label: { en: "Only one of the two tracked", fr: "Un seul des deux suivi" } },
      {
        index: 1,
        label: { en: "I check occasionally, no regular tracking", fr: "Je regarde de temps en temps, sans suivi régulier" },
      },
      { index: 0, label: { en: "Not at all", fr: "Non, pas du tout" } },
    ],
  },
  "retention-2": {
    pillar: "retention",
    question: {
      en: "Do you have a re-engagement mechanism (email, notification)?",
      fr: "As-tu un mécanisme de réengagement (email, notification) ?",
    },
    options: [
      { index: 3, label: { en: "Yes, automated and active", fr: "Oui, automatisé et actif" } },
      { index: 2, label: { en: "Yes, but manual/one-off", fr: "Oui, mais manuel/ponctuel" } },
      { index: 1, label: { en: "Thought about it, nothing in place", fr: "En réflexion, rien en place" } },
      { index: 0, label: { en: "No, none", fr: "Non, aucun" } },
    ],
  },
  "retention-3": {
    pillar: "retention",
    question: {
      en: "Do you know your main cause of churn?",
      fr: "Connais-tu ta principale cause de churn ?",
    },
    options: [
      { index: 3, label: { en: "Yes, identified and documented", fr: "Oui, identifiée et documentée" } },
      { index: 2, label: { en: "A fairly confident hunch", fr: "Une intuition assez sûre" } },
      { index: 1, label: { en: "A few hypotheses, unverified", fr: "Quelques hypothèses, pas vérifiées" } },
      { index: 0, label: { en: "No idea", fr: "Aucune idée" } },
    ],
  },

  "referral-1": {
    pillar: "referral",
    question: {
      en: "Does your product have a sharing or referral mechanism?",
      fr: "Ton produit a-t-il un mécanisme de partage ou de parrainage ?",
    },
    options: [
      { index: 3, label: { en: "Yes, built-in and active", fr: "Oui, intégré et actif" } },
      { index: 2, label: { en: "Yes, but rarely used", fr: "Oui, mais peu utilisé" } },
      { index: 1, label: { en: "Planned, not built yet", fr: "En projet, pas encore construit" } },
      { index: 0, label: { en: "No, none", fr: "Non, aucun" } },
    ],
  },
  "referral-2": {
    pillar: "referral",
    question: {
      en: "Is it built into the product, or just in your messaging?",
      fr: "Ce mécanisme est-il intégré au produit ou seulement en communication ?",
    },
    options: [
      { index: 3, label: { en: "Built directly into the product", fr: "Intégré directement au produit" } },
      { index: 2, label: { en: "A bit of both", fr: "Un peu des deux" } },
      { index: 1, label: { en: "Mostly just messaging", fr: "Surtout en communication" } },
      { index: 0, label: { en: "Neither", fr: "Ni l'un ni l'autre" } },
    ],
  },
  "referral-3": {
    pillar: "referral",
    question: {
      en: "Do you measure a viral coefficient (K-factor)?",
      fr: "Mesures-tu un coefficient viral (K-factor) ?",
    },
    options: [
      { index: 3, label: { en: "Yes, tracked regularly", fr: "Oui, suivi régulièrement" } },
      { index: 2, label: { en: "Calculated once, not tracked", fr: "Calculé une fois, pas suivi" } },
      { index: 1, label: { en: "I've heard of it, haven't done it", fr: "J'en ai entendu parler, rien de fait" } },
      { index: 0, label: { en: "No", fr: "Non" } },
    ],
  },

  "revenue-1": {
    pillar: "revenue",
    question: {
      en: "Has your pricing model been tested (not just chosen)?",
      fr: "Ton modèle de pricing a-t-il été testé (pas juste choisi) ?",
    },
    options: [
      { index: 3, label: { en: "Yes, tested and adjusted", fr: "Oui, testé et ajusté" } },
      { index: 2, label: { en: "Adjusted once, without real testing", fr: "Ajusté une fois, sans vrai test" } },
      { index: 1, label: { en: "Chosen by gut feeling, never revisited", fr: "Choisi par intuition, jamais revisité" } },
      { index: 0, label: { en: "I don't really know", fr: "Je ne sais pas vraiment" } },
    ],
  },
  "revenue-2": {
    pillar: "revenue",
    question: {
      en: "Do you know your LTV, even roughly?",
      fr: "Connais-tu ta LTV, même grossièrement ?",
    },
    options: [
      { index: 3, label: { en: "Yes, calculated and tracked", fr: "Oui, calculée et suivie" } },
      { index: 2, label: { en: "A rough estimate", fr: "Une estimation grossière" } },
      { index: 1, label: { en: "I've thought about it, no calculation", fr: "J'y ai réfléchi, sans calcul" } },
      { index: 0, label: { en: "No idea", fr: "Aucune idée" } },
    ],
  },
  "revenue-3": {
    pillar: "revenue",
    question: {
      en: "Do you have an expansion playbook (upsell/cross-sell)?",
      fr: "As-tu un playbook d'expansion (upsell/cross-sell) ?",
    },
    options: [
      { index: 3, label: { en: "Yes, formalized and in use", fr: "Oui, formalisé et utilisé" } },
      { index: 2, label: { en: "A few one-off actions", fr: "Quelques actions ponctuelles" } },
      { index: 1, label: { en: "Thinking about it", fr: "En réflexion" } },
      { index: 0, label: { en: "No, nothing", fr: "Non, rien" } },
    ],
  },
};
