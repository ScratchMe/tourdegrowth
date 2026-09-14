import type { Translatable } from "@/lib/i18n/dictionary";

/**
 * glossary-terms.ts — Tour de Growth
 * `term`/`definition` ported verbatim from `content/glossary.js` in the
 * SPEC-ADDENDUM-01 handoff bundle — the short (1-2 sentence) copy used by
 * `DefinitionTrigger`/`DefinitionPopover` and "How it works". Never
 * lengthen `definition` itself: it renders inside a small popover, and a
 * long popover is a broken popover.
 *
 * This is the half of the glossary the BROWSER gets (REVIEW-02.md R2-14):
 * the "?" triggers on the quiz and the result page are Client Components,
 * and this module is all they import. The long-form `extended` copy, the
 * related links and the meta descriptions live in `glossary.ts`, which only
 * Server Components read. Keep it that way — every paragraph added over
 * there is a paragraph that stays out of the questionnaire's bundle.
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
  | "north-star-metric"
  // GROWTH-PLAN.md wave 2.2, lot 1 — chosen on the Search Console queries the
  // existing pages already brush against (short definitional searches:
  // "activation", "what is an activation", "définition ltv"), each a child of
  // a page that already gets impressions.
  | "activation-rate"
  | "cac-payback"
  | "nrr-grr"
  | "cohort-analysis"
  // wave 2.2, lot 2 — the three that describe HOW a product is used, where
  // lot 1 described what it earns.
  | "dau-mau"
  | "time-to-value"
  | "pql"
  // wave 2.2, lot 3 — closes the batch. ARPU replaces "expansion revenue"
  // (upsell-cross-sell already owns it) and NPS replaces "growth loop vs
  // funnel" (which belongs to the 2.3 comparison cluster).
  | "product-led-growth"
  | "arpu"
  | "nps";

function same(value: string): Translatable {
  return { fr: value, en: value };
}

export const GLOSSARY_TERMS: Record<GlossaryTermId, { term: Translatable; definition: Translatable }> = {
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
    // R2-16: French quotation marks, as the file's own comment always said.
    term: { fr: "Moment « aha »", en: '"Aha" moment' },
    definition: {
      fr: "L'instant précis où un nouvel utilisateur comprend enfin pourquoi ton produit lui est utile.",
      en: "The precise instant a new user finally understands why your product is useful to them.",
    },
  },
  cac: {
    // Relu et validé par Antoine (2026-09-09) — R2-16: the French head query is "coût
    // d'acquisition client" and it appeared in neither the H1 nor the title.
    term: { fr: "CAC — Coût d'Acquisition Client", en: "CAC — Customer Acquisition Cost" },
    definition: {
      fr: "Coût d'Acquisition Client : combien tu dépenses en moyenne pour obtenir un nouveau client.",
      en: "Customer Acquisition Cost: how much you spend on average to acquire one new customer.",
    },
  },
  ltv: {
    // Relu et validé par Antoine (2026-09-09) — R2-16.
    term: { fr: "LTV — Lifetime Value", en: "LTV — Lifetime Value" },
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
    // Relu et validé par Antoine (2026-09-09) — R2-16.
    term: { fr: "North Star Metric — métrique phare", en: "North Star Metric" },
    definition: {
      fr: "L'indicateur unique qu'une équipe choisit de suivre en priorité, parce qu'il capture le mieux la valeur réelle livrée aux utilisateurs.",
      en: "The single metric a team chooses to prioritize, because it best captures the real value delivered to users.",
    },
  },
  "activation-rate": {
    term: { fr: "Taux d'activation", en: "Activation rate" },
    definition: {
      fr: "La part des nouvelles inscriptions qui atteignent ton événement d'activation — le moment où la valeur arrive vraiment, pas celui où le compte est créé.",
      en: "The share of new sign-ups who reach your activation event — the moment value actually lands, not the moment an account gets created.",
    },
  },
  "cac-payback": {
    term: { fr: "CAC payback — délai de remboursement", en: "CAC payback period" },
    definition: {
      fr: "Le nombre de mois de marge brute d'un client qu'il faut pour rembourser ce que son acquisition a coûté. Une date, là où le ratio LTV:CAC est une prévision.",
      en: "How many months of one customer's gross margin it takes to earn back what winning them cost. A date, where the LTV:CAC ratio is a forecast.",
    },
  },
  "nrr-grr": {
    term: { fr: "NRR / GRR — Net et Gross Revenue Retention", en: "NRR / GRR — Net and Gross Revenue Retention" },
    definition: {
      fr: "Les deux taux de rétention de revenu : sur ce que les clients de l'an dernier valent cette année, la brute ignore l'expansion, la nette la compte.",
      en: "Two ways to read what last year's customers are worth this year: gross revenue retention ignores expansion, net revenue retention counts it.",
    },
  },
  "cohort-analysis": {
    term: { fr: "Analyse de cohortes", en: "Cohort analysis" },
    definition: {
      fr: "Lire une métrique par groupe d'utilisateurs arrivés en même temps, au lieu d'une moyenne globale qui peut masquer deux tendances opposées.",
      en: "Reading a metric by group of users who arrived at the same time, instead of one blended average that can hide two opposite trends.",
    },
  },
  "dau-mau": {
    term: { fr: "DAU/MAU — Daily et Monthly Active Users", en: "DAU/MAU — Daily and Monthly Active Users" },
    definition: {
      fr: "Le ratio d'adhérence : les utilisateurs actifs quotidiens sur les mensuels. Multiplié par 30, il donne les jours par mois où un utilisateur moyen revient.",
      en: "The ratio of daily to monthly active users. Multiplied by 30, it gives the number of days a month the average user comes back.",
    },
  },
  "time-to-value": {
    term: { fr: "Time to value — délai jusqu'à la valeur", en: "Time to value" },
    definition: {
      fr: "Le temps médian entre l'inscription et le moment où l'utilisateur obtient vraiment ce pour quoi il est venu — à lire toujours à côté du taux d'activation.",
      en: "The median time between sign-up and the moment a user actually gets what they came for — always read next to the activation rate.",
    },
  },
  pql: {
    term: { fr: "PQL — Product-Qualified Lead", en: "PQL — Product-Qualified Lead" },
    definition: {
      fr: "Un lead qualifié par le produit : quelqu'un qui a franchi un seuil d'usage qui prédit l'achat — qualifié par ce qu'il fait, pas par ce qu'il a téléchargé.",
      en: "A user who has crossed a usage threshold chosen because it predicts buying — qualified by what they do, not by what they downloaded.",
    },
  },
  "product-led-growth": {
    term: { fr: "Product-led growth — croissance portée par le produit", en: "Product-led growth" },
    definition: {
      fr: "Un modèle où le produit lui-même fait l'acquisition et la conversion. Le test honnête : quelle part de tes clients paie sans avoir parlé à personne ?",
      en: "A model where the product itself does the acquiring and the converting. The honest test: what share of your customers pay without talking to anyone?",
    },
  },
  arpu: {
    term: { fr: "ARPU — Average Revenue Per User", en: "ARPU — Average Revenue Per User" },
    definition: {
      fr: "Le revenu d'une période divisé par les utilisateurs actifs. À ne pas confondre avec l'ARPPU, par utilisateur payant, qui peut être vingt fois plus élevé.",
      en: "Revenue over a period divided by active users. Not to be confused with ARPPU, per paying user, which can be twenty times higher.",
    },
  },
  nps: {
    term: { fr: "NPS — Net Promoter Score", en: "NPS — Net Promoter Score" },
    definition: {
      fr: "Le pourcentage de promoteurs moins celui de détracteurs, sur une question en 0-10. Mesure une intention déclarée, jamais un parrainage réellement fait.",
      en: "The percentage of promoters minus the percentage of detractors, on a 0-10 question. It measures stated intent, never a referral actually made.",
    },
  },
};
