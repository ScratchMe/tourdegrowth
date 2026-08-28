import type { Translatable } from "@/lib/i18n/dictionary";

/**
 * glossary.ts — Tour de Growth
 * Ported verbatim from `content/glossary.js` in the SPEC-ADDENDUM-01 handoff
 * bundle. Consumed by DefinitionTrigger/DefinitionPopover and the
 * "How it works" page. One short (1-2 sentence) definition per term.
 */

export type GlossaryTermId =
  | "aarrr"
  | "acquisition"
  | "activation"
  | "retention"
  | "referral"
  | "revenue"
  | "aha-moment"
  | "cac"
  | "ltv"
  | "churn"
  | "viral-coefficient"
  | "onboarding"
  | "upsell-cross-sell"
  | "growth-loop"
  | "north-star-metric";

export interface GlossaryEntry {
  /** Some terms have a different display form per locale (e.g. "aha moment" / "moment « aha »"); most are identical in both. */
  term: Translatable;
  definition: Translatable;
}

function same(value: string): Translatable {
  return { fr: value, en: value };
}

export const GLOSSARY: Record<GlossaryTermId, GlossaryEntry> = {
  aarrr: {
    term: same("AARRR"),
    definition: {
      fr: "Le cadre en 5 étapes utilisé pour évaluer un produit : Acquisition, Activation, Rétention, Parrainage (Referral), Revenu. Popularisé par Dave McClure en 2007.",
      en: "The 5-stage framework used to evaluate a product: Acquisition, Activation, Retention, Referral, Revenue. Popularized by Dave McClure in 2007.",
    },
  },
  acquisition: {
    term: same("Acquisition"),
    definition: {
      fr: "La façon dont de nouveaux utilisateurs ou clients découvrent ton produit pour la première fois.",
      en: "How new users or customers first discover your product.",
    },
  },
  activation: {
    term: same("Activation"),
    definition: {
      fr: "Le moment où un nouvel utilisateur vit vraiment la valeur de ton produit pour la première fois — pas juste où il s'inscrit.",
      en: "The moment a new user actually experiences your product's value for the first time — not just where they sign up.",
    },
  },
  retention: {
    term: same("Retention"),
    definition: {
      fr: "La capacité de ton produit à faire revenir les utilisateurs dans la durée, plutôt qu'un usage unique.",
      en: "Your product's ability to bring users back over time, rather than a one-off use.",
    },
  },
  referral: {
    term: same("Referral"),
    definition: {
      fr: "La façon dont tes utilisateurs existants en amènent de nouveaux, avec ou sans mécanisme de parrainage formel.",
      en: "How your existing users bring in new ones, with or without a formal referral mechanism.",
    },
  },
  revenue: {
    term: same("Revenue"),
    definition: {
      fr: "Comment ton produit génère (ou est censé générer) de l'argent, et si ce modèle a été testé auprès de vrais clients.",
      en: "How your product generates (or is meant to generate) money, and whether that model has been tested with real customers.",
    },
  },
  "aha-moment": {
    term: { fr: 'Moment "aha"', en: '"Aha" moment' },
    definition: {
      fr: "L'instant précis où un nouvel utilisateur comprend enfin pourquoi ton produit lui est utile.",
      en: "The precise instant a new user finally understands why your product is useful to them.",
    },
  },
  cac: {
    term: same("CAC"),
    definition: {
      fr: "Coût d'Acquisition Client : combien tu dépenses en moyenne pour obtenir un nouveau client.",
      en: "Customer Acquisition Cost: how much you spend on average to acquire one new customer.",
    },
  },
  ltv: {
    term: same("LTV"),
    definition: {
      fr: "Lifetime Value : la valeur totale qu'un client génère en moyenne sur toute sa relation avec ton produit.",
      en: "Lifetime Value: the total value an average customer generates over their whole relationship with your product.",
    },
  },
  churn: {
    term: same("Churn"),
    definition: {
      fr: "Le taux de clients ou d'utilisateurs qui arrêtent d'utiliser ton produit sur une période donnée.",
      en: "The rate of customers or users who stop using your product over a given period.",
    },
  },
  "viral-coefficient": {
    term: { fr: "Coefficient viral", en: "Viral coefficient" },
    definition: {
      fr: "Le nombre moyen de nouveaux utilisateurs qu'un utilisateur existant amène par le partage — un coefficient supérieur à 1 signifie une croissance qui s'auto-alimente.",
      en: "The average number of new users an existing user brings in through sharing — a coefficient above 1 means growth that feeds itself.",
    },
  },
  onboarding: {
    term: same("Onboarding"),
    definition: {
      fr: "Le parcours qu'un nouvel utilisateur traverse entre son inscription et le moment où il sait se servir de ton produit seul.",
      en: "The journey a new user goes through between signing up and being able to use your product on their own.",
    },
  },
  "upsell-cross-sell": {
    term: same("Upsell / Cross-sell"),
    definition: {
      fr: "Upsell : faire monter un client vers une offre plus chère. Cross-sell : lui vendre un produit ou service complémentaire.",
      en: "Upsell: moving a customer to a more expensive plan. Cross-sell: selling them a complementary product or service.",
    },
  },
  "growth-loop": {
    term: same("Growth loop"),
    definition: {
      fr: "Un mécanisme où l'usage du produit génère lui-même plus d'usage — contrairement à un entonnoir classique qui s'arrête une fois l'utilisateur converti.",
      en: "A mechanism where using the product itself generates more usage — unlike a classic funnel that stops once a user converts.",
    },
  },
  "north-star-metric": {
    term: same("North Star Metric"),
    definition: {
      fr: "L'indicateur unique qu'une équipe choisit de suivre en priorité, parce qu'il capture le mieux la valeur réelle livrée aux utilisateurs.",
      en: "The single metric a team chooses to prioritize, because it best captures the real value delivered to users.",
    },
  },
};
