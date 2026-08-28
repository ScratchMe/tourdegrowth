import type { Translatable } from "@/lib/i18n/dictionary";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * deep-mode-questions.ts — Tour de Growth
 * Ported verbatim from `content/deep-mode-questions.js` in the
 * SPEC-ADDENDUM-01 handoff bundle. The 10 Deep dive questions (2 per
 * pillar). No points: each option carries a `contextLabel` (bilingual)
 * passed as-is into the Deep dive Gemini prompt (SPEC-ADDENDUM-01.md §2.4),
 * never used to change the score.
 */

export interface DeepModeOption {
  contextLabel: Translatable;
}

export interface DeepModeQuestion {
  id: string;
  pillar: Pillar;
  question: Translatable;
  options: readonly DeepModeOption[];
}

export const DEEP_MODE_QUESTIONS: readonly DeepModeQuestion[] = [
  // --- Acquisition ---
  {
    id: "deep-acq-1",
    pillar: "acquisition",
    question: { fr: "Quel est ton canal d'acquisition principal aujourd'hui ?", en: "What's your primary acquisition channel today?" },
    options: [
      { contextLabel: { fr: "Publicité payante", en: "Paid ads" } },
      { contextLabel: { fr: "SEO / contenu", en: "SEO / content" } },
      { contextLabel: { fr: "Réseaux sociaux organiques", en: "Organic social" } },
      { contextLabel: { fr: "Prospection commerciale sortante", en: "Outbound sales" } },
      { contextLabel: { fr: "Partenariats", en: "Partnerships" } },
      { contextLabel: { fr: "Product-led / viral", en: "Product-led / viral" } },
    ],
  },
  {
    id: "deep-acq-2",
    pillar: "acquisition",
    question: {
      fr: "Approximativement, combien de nouveaux utilisateurs/clients par mois ?",
      en: "Roughly, how many new users/customers per month?",
    },
    options: [
      { contextLabel: { fr: "Moins de 10", en: "Fewer than 10" } },
      { contextLabel: { fr: "10 à 100", en: "10–100" } },
      { contextLabel: { fr: "100 à 1 000", en: "100–1,000" } },
      { contextLabel: { fr: "Plus de 1 000", en: "1,000+" } },
    ],
  },

  // --- Activation ---
  {
    id: "deep-act-1",
    pillar: "activation",
    question: { fr: "Comment décrirais-tu ton onboarding aujourd'hui ?", en: "How would you describe your onboarding today?" },
    options: [
      { contextLabel: { fr: "Autonome, sans guidage", en: "Self-serve, no guidance" } },
      { contextLabel: { fr: "Autonome avec guidage intégré", en: "Self-serve with in-app guidance" } },
      { contextLabel: { fr: "Nécessite une démo ou un appel commercial", en: "Requires a demo or sales call" } },
      { contextLabel: { fr: "Nécessite une configuration manuelle par ton équipe", en: "Requires manual setup by your team" } },
    ],
  },
  {
    id: "deep-act-2",
    pillar: "activation",
    question: {
      fr: "Comment les utilisateurs découvrent-ils la valeur de ton produit ?",
      en: "How do users typically discover your product's value?",
    },
    options: [
      { contextLabel: { fr: "Ils le découvrent seuls", en: "They figure it out on their own" } },
      { contextLabel: { fr: "On les guide via des tooltips/visites guidées", en: "We guide them via tooltips/tours" } },
      { contextLabel: { fr: "On leur explique directement (ex. appel commercial)", en: "We tell them directly (e.g. sales call)" } },
      { contextLabel: { fr: "Honnêtement, on n'est pas sûr", en: "Honestly, we're not sure" } },
    ],
  },

  // --- Retention ---
  {
    id: "deep-ret-1",
    pillar: "retention",
    question: { fr: "Quelle fréquence d'usage décrit le mieux ton produit ?", en: "Which usage frequency best matches your product?" },
    options: [
      { contextLabel: { fr: "Outil d'usage quotidien", en: "Daily-use tool" } },
      { contextLabel: { fr: "Outil d'usage hebdomadaire", en: "Weekly-use tool" } },
      { contextLabel: { fr: "Usage occasionnel / par projet", en: "Occasional / project-based use" } },
      { contextLabel: { fr: "Achat unique, pas d'usage répété attendu", en: "One-time purchase, no repeat use expected" } },
    ],
  },
  {
    id: "deep-ret-2",
    pillar: "retention",
    question: {
      fr: "À quel moment du cycle de vie le churn est-il le plus fréquent ?",
      en: "When in the user lifecycle does churn happen most?",
    },
    options: [
      { contextLabel: { fr: "Première semaine", en: "First week" } },
      { contextLabel: { fr: "Premier mois", en: "First month" } },
      { contextLabel: { fr: "Après 3 mois ou plus", en: "After 3+ months" } },
      { contextLabel: { fr: "Aucune idée", en: "No idea" } },
    ],
  },

  // --- Referral ---
  {
    id: "deep-ref-1",
    pillar: "referral",
    question: { fr: "Tes clients interagissent-ils entre eux via le produit ?", en: "Do your customers interact with each other through the product?" },
    options: [
      { contextLabel: { fr: "Oui, directement", en: "Yes, directly" } },
      { contextLabel: { fr: "Indirectement (ex. contenu partagé)", en: "Indirectly (e.g. shared content)" } },
      { contextLabel: { fr: "Aucune interaction entre clients", en: "No interaction between customers" } },
    ],
  },
  {
    id: "deep-ref-2",
    pillar: "referral",
    question: {
      fr: "As-tu déjà explicitement demandé une recommandation à un client satisfait ?",
      en: "Have you ever explicitly asked a happy customer to refer someone?",
    },
    options: [
      { contextLabel: { fr: "Oui, systématiquement", en: "Yes, systematically" } },
      { contextLabel: { fr: "De temps en temps, de façon informelle", en: "Occasionally, informally" } },
      { contextLabel: { fr: "Jamais", en: "Never" } },
    ],
  },

  // --- Revenue ---
  {
    id: "deep-rev-1",
    pillar: "revenue",
    question: { fr: "Quel est ton modèle de pricing ?", en: "What's your pricing model?" },
    options: [
      { contextLabel: { fr: "Gratuit / financé par la pub", en: "Free / ad-supported" } },
      { contextLabel: { fr: "Freemium", en: "Freemium" } },
      { contextLabel: { fr: "Abonnement fixe", en: "Flat subscription" } },
      { contextLabel: { fr: "À l'usage", en: "Usage-based" } },
      { contextLabel: { fr: "Sur-mesure / vente entreprise", en: "Custom / enterprise sales" } },
    ],
  },
  {
    id: "deep-rev-2",
    pillar: "revenue",
    question: { fr: "Combien de clients payants as-tu approximativement ?", en: "Roughly how many paying customers do you have?" },
    options: [
      { contextLabel: { fr: "0", en: "0" } },
      { contextLabel: { fr: "1 à 10", en: "1–10" } },
      { contextLabel: { fr: "11 à 100", en: "11–100" } },
      { contextLabel: { fr: "Plus de 100", en: "100+" } },
    ],
  },
] as const;
