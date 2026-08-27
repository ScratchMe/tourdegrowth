import type { Locale } from "./locale";
import { DEFAULT_LOCALE } from "./locale";

/** A piece of UI copy provided in both supported languages. */
export type Translatable = Record<Locale, string>;

/** `tc` = "translate content": picks the string for the active locale. */
export function tc(entry: Translatable, locale: Locale): string {
  return entry[locale] ?? entry[DEFAULT_LOCALE];
}

/**
 * UI_STRINGS holds every bit of interface copy, keyed by screen/section.
 *
 * Only a `scaffold` section exists so far — it proves the FR/EN pipeline
 * end-to-end. Real screen copy (landing, questionnaire, results) is added
 * screen-by-screen in later build steps.
 *
 * // TODO: copie finale à venir pour les vrais écrans, voir SPEC.md §12 —
 * ce fichier ne doit contenir aucune copie "roast" ou FR définitive tant que
 * la bibliothèque de textes de verdict n'a pas été fournie par l'agent produit.
 */
export const UI_STRINGS = {
  scaffold: {
    placeholderTitle: {
      en: "Tour de Growth — scaffold running",
      fr: "Tour de Growth — scaffold en marche",
    },
    placeholderBody: {
      en: "Temporary check page: it proves the Next.js scaffold, the design tokens, and FR/EN locale resolution work end-to-end. Real screens land in later build steps.",
      fr: "Page de vérification temporaire : elle prouve que le scaffold Next.js, les tokens de design et la résolution de langue FR/EN fonctionnent de bout en bout. Les vrais écrans arrivent aux étapes suivantes.",
    },
    localeLabel: {
      en: "Resolved locale",
      fr: "Langue résolue",
    },
  },
} as const satisfies Record<string, Record<string, Translatable>>;
