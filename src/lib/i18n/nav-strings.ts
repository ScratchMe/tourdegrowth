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
  // TODO: à relire (REVIEW-02) — R2-04.
  about: { en: "About", fr: "À propos" },
} as const satisfies Record<string, Translatable>;
