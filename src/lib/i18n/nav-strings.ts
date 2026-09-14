import type { Translatable } from "./translatable";

/**
 * The header/footer navigation labels — in their own module (REVIEW-02.md
 * R2-14) because `SiteFooter` is also rendered by the error boundaries,
 * which are Client Components in every page's bundle: anything the footer
 * imports, every page downloads. Two labels cost nothing; the dictionary
 * they used to come with cost ~7 KB gzipped per indexable page.
 */
export const NAV_STRINGS = {
  howItWorks: { en: "How it works", fr: "Comment ça marche" },
  glossary: { en: "Glossary", fr: "Glossaire" },
  // Relu et validé par Antoine (2026-09-09) — R2-04.
  about: { en: "About", fr: "À propos" },
  // Relu et validé par Antoine (2026-09-09) — R2-03.
  privacy: { en: "Privacy", fr: "Confidentialité" },
  terms: { en: "Terms", fr: "Conditions" },
  // GROWTH-PLAN.md 2.4 : la checklist reçoit son lien de pied de page, donc
  // un chemin constant depuis n'importe où. La page méthode, elle, est liée
  // depuis `/how-it-works`, l'index du glossaire et la checklist — un pied
  // de page à sept liens cesse d'en mettre aucun en avant.
  // TODO: à relire (convention 6).
  checklist: { en: "Growth checklist", fr: "Checklist growth" },
} as const satisfies Record<string, Translatable>;
