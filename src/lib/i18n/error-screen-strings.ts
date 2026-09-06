import type { Translatable } from "./translatable";

/**
 * The error screen's copy — DESIGN-BRIEF.md §06c, transcribed verbatim from
 * the brief; the French is the working translation the rest of the
 * dictionary uses. In its own module (REVIEW-02.md R2-14) because the error
 * boundaries (`error.tsx`, `global-error.tsx`) are Client Components that
 * are part of EVERY route's client bundle in their tree: importing
 * `UI_STRINGS` from them put the whole dictionary back into the 36 content
 * pages. `dictionary.ts` spreads these into `UI_STRINGS.quiz`, so the quiz
 * still reads them under the names it always has.
 */
export const ERROR_SCREEN_STRINGS = {
  errorEyebrow: { en: "Detour", fr: "Détour" },
  errorTitle: {
    en: "Your results took a wrong turn.",
    fr: "Tes résultats ont pris un mauvais virage.",
  },
  errorBody: {
    en: "Something broke on our end — try again in a moment.",
    fr: "Quelque chose a cassé de notre côté — réessaie dans un instant.",
  },
  errorRetry: { en: "Try again", fr: "Réessayer" },
} as const satisfies Record<string, Translatable>;
