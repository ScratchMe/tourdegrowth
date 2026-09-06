import type { Translatable } from "@/lib/i18n/dictionary";

/**
 * free-context.ts — Tour de Growth
 * Copy for the free-text context field, the 11th and last Deep dive screen
 * (SPEC-ADDENDUM-02.md §1). Kept in its own file rather than folded into
 * `deep-mode-questions.ts` — those are structured multiple-choice questions
 * with a fixed shape (id/pillar/options), this is a single freeform field
 * with no pillar and no options, a different enough shape that sharing the
 * file would just make both harder to read.
 */
export const FREE_CONTEXT = {
  label: {
    fr: "Un contexte particulier qu'on devrait connaître ? (optionnel)",
    en: "Any specific context we should know about? (optional)",
  },
  pitch: {
    fr: "Plus tu nous en dis, plus la recommandation qui suit sera précise et vraiment utile — pas un conseil générique de plus.",
    en: "The more you tell us, the sharper and more useful the recommendation that follows — not just another generic tip.",
  },
  placeholder: {
    fr: "Ex. : on vend à des cabinets comptables, cycle de vente long, le vrai frein c'est la confiance plus que le prix...",
    en: "E.g.: we sell to accounting firms, long sales cycle, trust is a bigger blocker than price...",
  },
  /**
   * No longer rendered: design system extension 01 reduced this screen to two
   * actions (← Back, primary). Leaving the field empty and submitting is what
   * skipping now is. Kept because this file is product-agent copy — deleting
   * a delivered string is the product agent's call, not ours.
   */
  skip: { fr: "Skip", en: "Skip" },
  submit: { fr: "Obtenir mon diagnostic →", en: "Get my results →" },
} satisfies Record<string, Translatable>;

/** SPEC-ADDENDUM-02.md §1.2/§1.4: client-side limit, enforced again server-side (see the deep-dive API route) — never trust the client alone. */
export const FREE_CONTEXT_MAX_LENGTH = 500;
