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
 * Filled in screen-by-screen as the build reaches them (see CLAUDE.md's
 * build plan) — sections not built yet simply don't exist here.
 *
 * // TODO: la copie ci-dessous (landing) est une traduction FR de travail —
 * cohérente avec la copie EN "finale" du design (voir DESIGN-BRIEF.md), mais
 * pas encore relue par l'agent produit. Ce n'est PAS la bibliothèque de
 * textes de verdict ni la voix "roast" visées par SPEC.md §12 (celles-là
 * restent non tranchées et ne sont pas inventées ici) — juste la traduction
 * factuelle du hero/CTA de la landing, nécessaire dès le premier commit
 * fonctionnel bilingue (CLAUDE.md).
 */
export const UI_STRINGS = {
  /**
   * The 5 AARRR pillar names. Kept identical in both locales on purpose —
   * SPEC.md itself uses these English/cognate forms in its own French prose
   * (e.g. "Referral", "Retention") rather than translating them, to keep the
   * AARRR acronym recognizable. Still routed through Translatable/tc() so a
   * future product decision to localize them doesn't require touching every
   * call site.
   */
  pillars: {
    acquisition: { en: "Acquisition", fr: "Acquisition" },
    activation: { en: "Activation", fr: "Activation" },
    retention: { en: "Retention", fr: "Retention" },
    referral: { en: "Referral", fr: "Referral" },
    revenue: { en: "Revenue", fr: "Revenue" },
  },

  landing: {
    bibTag: {
      en: "№ 15 questions — 3 min — free entry",
      fr: "№ 15 questions — 3 min — entrée gratuite",
    },
    // Split so each locale can break the headline across two lines on its
    // own terms: line 1 is always plain, line 2 is an optional plain lead-in
    // (h1Line2) followed by the --red accent (h1Accent). DESIGN-BRIEF.md's
    // exact EN break is "Where does" / "your growth stall?" (only "stall?"
    // in red) — FR reads naturally with an empty h1Line2 instead.
    h1Line1: { en: "Where does", fr: "Où ta croissance" },
    h1Line2: { en: "your growth ", fr: "" },
    h1Accent: { en: "stall?", fr: "cale-t-elle ?" },
    subtitle: {
      en: "A guided check-up across Acquisition, Activation, Retention, Referral and Revenue — scored, explained, and built to share.",
      fr: "Un diagnostic guidé sur l'Acquisition, l'Activation, la Retention, le Referral et le Revenue — noté, expliqué, et pensé pour être partagé.",
    },
    ctaPrimary: { en: "Start your Tour →", fr: "Démarre ton Tour →" },
    ctaSecondary: { en: "See a sample result", fr: "Voir un résultat d'exemple" },
  },

  /** The score card recipe is shared by the landing preview and the real
   * result screens (DESIGN-BRIEF.md #01/#02/#04) — only this label is
   * universal across all of them; caption/stage text is context-specific
   * and passed in by each caller instead of living here. */
  scoreCard: {
    label: { en: "Overall Growth Score", fr: "Score growth global" },
  },

  /** Text specific to the fixed, hard-coded sample result (SPEC.md §12) —
   * shown on the landing preview now, and on the future `/r/sample` page. */
  sample: {
    caption: { en: "Sample B2B SaaS", fr: "Exemple SaaS B2B" },
    stageLabel: { en: "Stage 5/5", fr: "Étape 5/5" },
  },
} as const satisfies Record<string, Record<string, Translatable>>;
