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

  /** Header nav — SPEC.md §12 cut "How it works"/"Examples"/"Roast mode" from
   * the MVP; SPEC-ADDENDUM-01.md §1.3 explicitly reintroduces just the first
   * one, now that there's a real page behind it. "Glossary" joins it once
   * SPEC-ADDENDUM-02.md §3.1 gives the glossary its own indexable pages —
   * on Antoine's request, not part of either addendum's own spec text. */
  nav: {
    howItWorks: { en: "How it works", fr: "Comment ça marche" },
    glossary: { en: "Glossary", fr: "Glossaire" },
  },

  /** Glossary info-bubble chrome (SPEC-ADDENDUM-01.md §1.2) — the terms and
   * definitions themselves live in content/glossary.ts, this is just the
   * trigger's accessible label and the mobile sheet's close button. */
  glossary: {
    definitionLabelTemplate: { en: "Definition: {term}", fr: "Définition : {term}" },
    closeLabel: { en: "Close", fr: "Fermer" },
  },

  /** "How it works" page chrome (SPEC-ADDENDUM-01.md §1.3) not already in
   * content/how-it-works.ts (title/body copy lives there). */
  howItWorksPage: {
    exampleQuestionLabel: { en: "Example question:", fr: "Exemple de question :" },
  },

  /** `/glossary` + `/glossary/[term]` (SPEC-ADDENDUM-02.md §3.1) — the term/definition content itself lives in content/glossary.ts, this is just page chrome. */
  glossaryPage: {
    indexTitle: { en: "Growth glossary", fr: "Glossaire growth" },
    indexIntro: {
      en: "Plain-English definitions for the growth vocabulary used throughout Tour de Growth.",
      fr: "Des définitions simples pour le vocabulaire growth utilisé dans Tour de Growth.",
    },
    backToIndex: { en: "← Glossary", fr: "← Glossaire" },
    inPracticeLabel: { en: "In practice", fr: "En pratique" },
    relatedLabel: { en: "Related terms", fr: "Termes liés" },
  },

  /**
   * Questionnaire chrome (DESIGN-BRIEF.md §05) — question/answer copy itself
   * lives in content/copy-library.ts, not here. `{n}`/`{pillar}`/`{m}` are
   * replaced in code (see quiz/page.tsx) — this project's i18n is
   * intentionally template-free otherwise, this is the one spot with
   * enough moving parts (a number AND a translated pillar name) to need it.
   */
  quiz: {
    stageLabelTemplate: { en: "Stage {n} of 5 — {pillar}", fr: "Étape {n} sur 5 — {pillar}" },
    questionCounterTemplate: { en: "Q {n} / 15", fr: "Q {n} / 15" },
    minutesLeftTemplate: { en: "— {m} min left", fr: "— {m} min restantes" },
    backButton: { en: "← Back", fr: "← Retour" },
    answerToContinue: { en: "Answer to continue", fr: "Réponds pour continuer" },
    // DESIGN-BRIEF.md §06c — copy transcribed verbatim from the brief (not
    // invented here); French is a working translation of that same brief
    // copy, same status as the rest of this file's FR strings (see the note
    // above UI_STRINGS) — this is UI chrome, not the verdict-text library.
    errorHeaderLabel: { en: "Error", fr: "Erreur" },
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
    errorHint: {
      en: "Your 15 answers are still saved on this device — retrying doesn't restart the questionnaire.",
      fr: "Tes 15 réponses sont toujours enregistrées sur cet appareil — réessayer ne relance pas le questionnaire.",
    },
  },

  /** Tone selector (DESIGN-BRIEF.md §06a). SPEC.md §6bis: "Straight up" /
   * neutral is the explicit default. */
  toneSelector: {
    headerLabel: { en: "15 / 15 answered", fr: "15 / 15 répondues" },
    title: { en: "How do you want your results?", fr: "Comment veux-tu tes résultats ?" },
    neutralTitle: { en: "Straight up", fr: "Neutre" },
    neutralDescription: {
      en: "Clear, constructive, no sugar-coating.",
      fr: "Clair, constructif, sans détour.",
    },
    roastTitle: { en: "Roast me", fr: "Roast me" },
    roastDescription: {
      en: "Same insights, sharper tongue. All in good fun.",
      fr: "Mêmes constats, un ton plus mordant. Toujours bienveillant.",
    },
    cta: { en: "Get my score →", fr: "Obtiens ton score →" },
    switchHint: {
      en: "You can switch tone on the result page.",
      fr: "Tu pourras changer de ton sur la page de résultat.",
    },
  },

  /** Loading — DESIGN-BRIEF.md §06b's 3 rotating messages. Quick mode now
   * only ever shows message1, briefly (SPEC-ADDENDUM-01.md §0: no real wait
   * left to narrate); the Deep dive keeps the full 3-message sequence,
   * since it still makes a real Gemini call. */
  loading: {
    message1: { en: "Reviewing your answers...", fr: "Relecture de tes réponses..." },
    message2: { en: "Calculating your stage times...", fr: "Calcul de tes temps par étape..." },
    message3: { en: "Drafting your race report...", fr: "Rédaction de ton rapport de course..." },
  },

  /** Deep dive mode (SPEC-ADDENDUM-01.md §2) — the 10-question follow-up
   * offered from the result page. Question/answer copy itself lives in
   * content/deep-mode-questions.ts.
   *
   * `teaserText`/`teaserCta` anchor the incentive to the one concrete thing
   * being locked (the Priority move card, see ResultView's
   * `lockedPriorityMove` — sharpened from an earlier, vaguer "Want more
   * specific advice?" once Quick mode's own recommendation was retired,
   * per Antoine's steer: the Deep dive is now the ONLY place a priority
   * action exists at all, so the copy should say exactly that). */
  deepDive: {
    teaserText: {
      en: "Answer 10 more questions to unlock your personalized priority action.",
      fr: "Réponds à 10 questions supplémentaires pour débloquer ton action prioritaire personnalisée.",
    },
    teaserCta: { en: "Unlock my priority action →", fr: "Débloquer mon action prioritaire →" },
    questionCounterTemplate: {
      en: "Deep dive · Question {n} of {total}",
      fr: "Approfondissement · Question {n} sur {total}",
    },
    // The mode badge itself stays "Deep dive" in both locales, same
    // treatment as the AARRR pillar names and the roast 🔥 badge — a
    // product-level label, not a sentence to translate.
    badge: { en: "Deep dive", fr: "Deep dive" },
    priorityMoveLabel: { en: "Priority move", fr: "Action prioritaire" },
    priorityMoveLockedLabel: { en: "Priority move — locked", fr: "Action prioritaire — verrouillée" },
  },

  /** Result page chrome (DESIGN-BRIEF.md §02/§04) — the Strengths/Where
   * you're losing time SENTENCES come from content/copy-library.ts (Quick)
   * or Gemini (Deep dive), not from here; this is just the surrounding UI
   * text. Quick mode's old single "Priority recommendation" section is
   * retired (SPEC-ADDENDUM-01.md §0 drops the Gemini-authored
   * recommendation along with the Gemini call that produced it) — a
   * single actionable recommendation is now exclusively the Deep dive's
   * `priorityAction` (see `deepDive.priorityMoveLabel` above). */
  result: {
    finishedLabel: { en: "Stage 5/5 — finished", fr: "Étape 5/5 — terminé" },
    answeredSuffixTemplate: { en: " · {n}/15 answered", fr: " · {n}/15 répondues" },
    roastBadge: { en: "🔥 Roast Mode", fr: "🔥 Roast Mode" },
    strengthsTitle: { en: "Strengths", fr: "Points forts" },
    strengthsTitleRoast: { en: "Credit where it's due", fr: "Ce qui marche, quand même" },
    weaknessesTitle: { en: "Where you're losing time", fr: "Là où tu perds du temps" },
    ctaShare: { en: "Share my score", fr: "Partager mon score" },
    ctaShareRoast: { en: "Share my roast", fr: "Partager mon roast" },
    ctaAgain: { en: "Take the Tour again", fr: "Refaire le Tour" },
    ctaSwitchToRoast: { en: "Switch to roast", fr: "Passer en roast" },
    ctaSwitchToNeutral: { en: "Switch to straight up", fr: "Repasser en neutre" },
    // Roast-only stamped tag on the weakest pillar (DESIGN-BRIEF.md §04: "08/20 RETENTION — dead last").
    stampedSuffix: { en: "dead last", fr: "bon dernier" },
    sampleBadge: { en: "Sample result — not your data", fr: "Résultat d'exemple — pas tes données" },
    notFoundTitle: { en: "No result at this address.", fr: "Aucun résultat à cette adresse." },
    notFoundBody: {
      en: "This link may be wrong, or the result may no longer exist.",
      fr: "Ce lien est peut-être incorrect, ou le résultat n'existe plus.",
    },
    notFoundCta: { en: "Start your Tour →", fr: "Démarre ton Tour →" },
  },

  /** OG share image only (DESIGN-BRIEF.md §03) — rendered by Satori (src/app/r/[id]/opengraph-image.tsx), a separate pipeline from the rest of the UI. */
  og: {
    checkupBadge: { en: "AARRR check-up — 3 min", fr: "Bilan AARRR — 3 min" },
    // SPEC-ADDENDUM-01.md §2.6: the same badge becomes this once the result
    // has been enriched by a Deep dive — same gabarit otherwise, just this
    // one string. (Only the non-roast badge; the roast badge below doesn't
    // get a Deep dive variant per the addendum's own scope.)
    checkupBadgeDeepDive: { en: "AARRR check-up — Deep dive", fr: "Bilan AARRR — Deep dive" },
    roastBadge: { en: "🔥 ROAST MODE", fr: "🔥 ROAST MODE" },
    scoreLabel: { en: "Overall Growth Score", fr: "Score growth global" },
    stallSentenceTemplate: { en: "{pillar} is where this growth stalls.", fr: "{pillar} est là où cette croissance cale." },
    whereDoesYours: { en: "Where does yours?", fr: "Et la tienne ?" },
  },
} as const satisfies Record<string, Record<string, Translatable>>;
