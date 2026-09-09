import { ERROR_SCREEN_STRINGS } from "./error-screen-strings";
import { NAV_STRINGS } from "./nav-strings";
import { tc, type Translatable } from "./translatable";

// `Translatable` and `tc` moved to `./translatable` (REVIEW-02.md R2-14) so
// Client Components can translate a prop without importing this whole file.
// Re-exported here: nothing on the server had to change.
export { tc, type Translatable };

/**
 * UI_STRINGS holds every bit of interface copy, keyed by screen/section.
 * Filled in screen-by-screen as the build reaches them (see CLAUDE.md's
 * build plan) — sections not built yet simply don't exist here.
 *
 * Toute la copie de ce fichier a été relue et validée par Antoine — une
 * première fois le 2026-09-06, puis les blocs ajoutés par la revue 02 le
 * 2026-09-09 (bon à tirer, 56 éléments). Une nouvelle chaîne ajoutée ici
 * après ces dates repart au statut « à relire » : le marquer explicitement
 * plutôt que de la glisser dans un fichier approuvé.
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
      // Relu et validé par Antoine (2026-09-09) — R2-12: "AARRR" added. The framework's name
      // appeared nowhere in the landing's visible copy, only in its metadata.
      en: "A guided AARRR check-up across Acquisition, Activation, Retention, Referral and Revenue — scored, explained, and built to share.",
      fr: "Un diagnostic AARRR guidé sur l'Acquisition, l'Activation, la Retention, le Referral et le Revenue — noté, expliqué, et pensé pour être partagé.",
    },
    /**
      * REVIEW-03.md B1 — what you leave with, which the H1 above deliberately
      * does not say (it poses the problem, and it stays as it is).
      *
      * `REVIEW-03.md` proposed "15 questions · 5 stages · 1 clear priority".
      * Not used: the bib tag two lines above already reads "№ 15 questions —
      * 3 min — free entry", and saying "15 questions" twice within a few
      * centimetres reads as padding. The half that was genuinely missing is
      * the deliverable, so this line says only that — and it can only say it
      * honestly since the free result gained an action (A2).
      *
      * TODO: à relire — nouvelle chaîne (convention 6).
      */
    promise: {
      en: "You leave with the one stage holding you back — and one action to take.",
      fr: "Tu repars avec l'étape qui te freine — et une action à mener.",
    },
    ctaPrimary: { en: "Start your Tour →", fr: "Démarre ton Tour →" },
    ctaSecondary: { en: "See a sample result", fr: "Voir un résultat d'exemple" },
  },

  /**
   * The global 404 — an address that matches no page at all (REVIEW.md R-26).
   *
   * Distinct from `result.notFound*`, which is specifically "no submission at
   * this id" and can say so. This one knows nothing about why you are here.
   *
   */
  notFound: {
    /* Design system extension 01: the detour family's mono eyebrow. */
    eyebrow: { en: "Detour", fr: "Détour" },
    title: { en: "This page doesn't exist.", fr: "Cette page n'existe pas." },
    body: {
      en: "The address may be mistyped, or the page may have moved. Everything else is still where you left it.",
      fr: "L'adresse est peut-être mal recopiée, ou la page a changé de place. Le reste est là où tu l'as laissé.",
    },
    cta: { en: "Back to Tour de Growth →", fr: "Retour à Tour de Growth →" },
  },

  /**
   * The "how does this compare" line under the score (REVIEW.md R-20).
   *
   * Only ever rendered once enough Tours have been taken for the average to
   * mean something (see `submissions/benchmark.ts`), and never on the fixed
   * sample.
   */
  benchmark: {
    line: { en: "Average of every Tour: {score}/100", fr: "Moyenne de tous les Tours : {score}/100" },
    // Relu et validé par Antoine (2026-09-09) — R2-26. Shown instead of the line above
    // once the reader's own segment has enough Tours of its own; `{segment}`
    // is built from content/segments.ts ("B2B, first customers").
    segmentLine: {
      en: "Average for {segment}: {score}/100",
      fr: "Moyenne pour {segment} : {score}/100",
    },
    segmentJoin: { en: "{model}, {stage}", fr: "{model}, {stage}" },
  },

  /**
   * The returning-visitor line on the landing (REVIEW.md R-20). Its own
   * section rather than a nested key under `landing`, because UI_STRINGS is
   * exactly two levels deep by construction (see the `satisfies` at the
   * bottom of this file).
   *
   * Only ever shown to someone who already took a Tour on this device, so it
   * never competes with the primary CTA for a newcomer.
   */
  lastResult: {
    withScore: {
      en: "Your last score: {score}/100 — see it again →",
      fr: "Ton dernier score : {score}/100 — le revoir →",
    },
    withoutScore: { en: "See your last result →", fr: "Revoir ton dernier résultat →" },
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
  // The two header/footer labels live in `./nav-strings` since R2-14: the
  // footer is rendered inside the (client) error boundary too, and importing
  // them from here dragged this whole file into every page's bundle.
  nav: NAV_STRINGS,

  /** Glossary info-bubble chrome (SPEC-ADDENDUM-01.md §1.2) — the terms and
   * definitions themselves live in content/glossary.ts, this is just the
   * trigger's accessible label and the mobile sheet's close button. */
  glossary: {
    definitionLabelTemplate: { en: "Definition: {term}", fr: "Définition : {term}" },
    closeLabel: { en: "Close", fr: "Fermer" },
    // Relu et validé par Antoine (2026-09-09) — R2-13. The popover's way out, to the term's own page.
    moreLabel: { en: "Learn more →", fr: "En savoir plus →" },
  },

  /** "How it works" page chrome (SPEC-ADDENDUM-01.md §1.3) not already in
   * content/how-it-works.ts (title/body copy lives there). */
  howItWorksPage: {
    exampleQuestionLabel: { en: "Example question:", fr: "Exemple de question :" },
    // Relu et validé par Antoine (2026-09-09) — R2-17. Eyebrow of each pillar card: the
    // stage number, since the <h2> right under it already names the pillar.
    stageEyebrowTemplate: { en: "Stage {n} of 5", fr: "Étape {n} sur 5" },
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
    // Relu et validé par Antoine (2026-09-09) — R2-11. Section labels of the long-form
    // term pages; the sections themselves are content/glossary-deep.ts.
    formulaLabel: { en: "The formula", fr: "La formule" },
    exampleLabel: { en: "Worked example", fr: "Exemple chiffré" },
    benchmarkLabel: { en: "Orders of magnitude", fr: "Ordres de grandeur" },
    improveLabel: { en: "How to improve it", fr: "Comment l'améliorer" },
    inTheTourLabel: { en: "In the Tour", fr: "Dans le Tour" },
    inTheTourQuestionLabel: { en: "The question that measures it", fr: "La question qui le mesure" },
    faqLabel: { en: "Questions people ask", fr: "Questions fréquentes" },
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
    // errorEyebrow / errorTitle / errorBody / errorRetry live in
    // `./error-screen-strings` since R2-14 (shared with the error boundaries).
    ...ERROR_SCREEN_STRINGS,
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
    // Relu et validé par Antoine (2026-09-09) — R2-09. Shown once the three messages have
    // run their course and the Deep dive is still generating: a real Deep
    // dive was measured at ~70 s in production, and nothing on this screen
    // said so. Not a fourth message (the three segments are the design), a
    // line under them.
    stillWorkingHint: {
      en: "About a minute in total — nothing is stuck.",
      fr: "Environ une minute en tout — rien n'est bloqué.",
    },
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
    // Relu et validé par Antoine (2026-09-09) — R2-09. Under the last screen's primary
    // button, BEFORE the wait starts: the one thing nobody had been told.
    waitNotice: {
      en: "About a minute — we write your recommendations in both tones and both languages.",
      fr: "Environ une minute — on rédige tes recommandations dans les deux tons et les deux langues.",
    },
    // Relu et validé par Antoine (2026-09-09) — R2-03. Under the free-text field: where
    // the text goes, that it is not kept, and that it can show through in
    // the recommendation on a page the person may share (a fact the first
    // live probe established — see CLAUDE.md, 2026-09-05).
    freeContextPrivacy: {
      en: "Sent to Google's Gemini to write your recommendation, not stored afterwards. It can shape the text shown on your result page.",
      fr: "Envoyé à Gemini (Google) pour rédiger ta recommandation, pas conservé ensuite. Il peut façonner le texte affiché sur ta page de résultat.",
    },
    freeContextPrivacyLink: { en: "Privacy policy →", fr: "Politique de confidentialité →" },
  },

  /**
   * Progression between two Tours — REVIEW-02.md R2-27. `{prev}`, `{score}`
   * and `{delta}` are replaced in code. The delta is written with its sign
   * because "+8" and "-8" have to read differently at a glance; a flat
   * result gets its own sentence rather than "+0", which reads like a bug.
   *
   * Relu et validé par Antoine (2026-09-09), à part du bon à tirer où la
   * session avait oublié de le mettre — R2-27.
   */
  progression: {
    landingUp: { en: "Previous Tour: {prev} → {score}, +{delta}", fr: "Tour précédent : {prev} → {score}, +{delta}" },
    landingDown: { en: "Previous Tour: {prev} → {score}, {delta}", fr: "Tour précédent : {prev} → {score}, {delta}" },
    landingFlat: { en: "Previous Tour: {prev} — same score", fr: "Tour précédent : {prev} — même score" },
    resultUp: { en: "+{delta} points since your previous Tour ({prev}/100).", fr: "+{delta} points depuis ton Tour précédent ({prev}/100)." },
    resultDown: { en: "{delta} points since your previous Tour ({prev}/100).", fr: "{delta} points depuis ton Tour précédent ({prev}/100)." },
    resultFlat: { en: "Same score as your previous Tour.", fr: "Même score qu'à ton Tour précédent." },
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
    roastBadge: { en: "🔥 Roast Mode", fr: "🔥 Roast Mode" },
    strengthsTitle: { en: "Strengths", fr: "Points forts" },
    strengthsTitleRoast: { en: "Credit where it's due", fr: "Ce qui marche, quand même" },
    weaknessesTitle: { en: "Where you're losing time", fr: "Là où tu perds du temps" },
    ctaShare: { en: "Share my score", fr: "Partager mon score" },
    // Replaces the mute "✓" the copy fallback used to show — on desktop,
    // where there is no native share sheet, that tick was the ONLY feedback
    // that anything had happened (REVIEW.md R-10).
    ctaShareCopied: { en: "Link copied", fr: "Lien copié" },
    ctaShareRoast: { en: "Share my roast", fr: "Partager mon roast" },
    ctaAgain: { en: "Take the Tour again", fr: "Refaire le Tour" },
    // Relu et validé par Antoine (2026-09-09) — R2-02. The three strings a VISITOR gets in
    // the CTA slot instead of the owner's pair: what the Tour is, their way
    // into it, and sharing someone else's result.
    visitorPitch: {
      en: "Your own score in 3 minutes — 15 questions, free, no sign-up.",
      fr: "Ton propre score en 3 minutes — 15 questions, gratuit, sans compte.",
    },
    ctaOwnTour: { en: "Take your own Tour →", fr: "Fais ton propre Tour →" },
    ctaShareResult: { en: "Share this result", fr: "Partager ce résultat" },
    ctaSwitchToNeutral: { en: "Switch to straight up", fr: "Repasser en neutre" },
    // Roast-only stamped tag on the weakest pillar (DESIGN-BRIEF.md §04: "08/20 RETENTION — dead last").
    stampedSuffix: { en: "dead last", fr: "bon dernier" },
    sampleBadge: { en: "Sample result — not your data", fr: "Résultat d'exemple — pas tes données" },
    /* Design system extension 01 names this case's eyebrow separately from the generic detour. */
    notFoundEyebrow: { en: "Lost result", fr: "Résultat introuvable" },
    notFoundTitle: { en: "No result at this address.", fr: "Aucun résultat à cette adresse." },
    notFoundBody: {
      en: "This link may be wrong, or the result may no longer exist.",
      fr: "Ce lien est peut-être incorrect, ou le résultat n'existe plus.",
    },
    notFoundCta: { en: "Start your Tour →", fr: "Démarre ton Tour →" },
  },

  /**
   * "How this score is calculated" — the owner-only breakdown under the
   * result (REVIEW.md R-12). The rule CLAUDE.md calls non-negotiable ("un
   * score partagé doit être ré-explicable en 10 secondes") was true of the
   * code and invisible in the interface: the page never showed the three
   * answers behind a pillar's score.
   *
   */
  breakdown: {
    title: { en: "How this score is calculated", fr: "Comment ce score est calculé" },
    intro: {
      en: "Three questions per stage. Your answers, and what each one was worth.",
      fr: "Trois questions par étape. Tes réponses, et ce que chacune valait.",
    },
    // e.g. "47/60 → 16/20"
    pillarMathTemplate: { en: "{raw}/60 → {score}/20", fr: "{raw}/60 → {score}/20" },
    pointsTemplate: { en: "{n} pts", fr: "{n} pts" },
    ownerOnlyNote: {
      en: "Only visible to you — your answers are stored on this device, never on the shared page.",
      fr: "Visible par toi seul — tes réponses sont sur cet appareil, jamais sur la page partagée.",
    },
  },

  /**
   * Text that leaves the product with the shared link — the native share
   * sheet's message (REVIEW.md R-10). `{total}` and `{pillar}` are replaced
   * in code, same convention as the quiz counters above.
   *
   * Assemblée à partir de blocs déjà livrés (le gabarit « où ça cale » et la
   * relance de l'image OG, `og` ci-dessous) plutôt qu'écrite de zéro. C'est
   * le seul texte que le produit met dans la bouche de l'utilisateur : le
   * modifier n'est pas un changement d'interface comme un autre.
   */
  share: {
    textTemplate: {
      en: "I scored {total}/100 on my AARRR growth check-up. {pillar} is where this growth stalls. Where does yours?",
      fr: "J'ai fait {total}/100 à mon bilan growth AARRR. {pillar} est là où cette croissance cale. Et la tienne ?",
    },
  },

  /** OG share image only (DESIGN-BRIEF.md §03) — rendered by Satori (src/app/r/[id]/opengraph-image.tsx), a separate pipeline from the rest of the UI. */
  /**
   * `<title>`, description and Open Graph text of the indexable content pages
   * (landing, How it works, glossary). Until now every page carried the root
   * layout's English title/description whatever the URL's language, and none
   * had Open Graph tags — a LinkedIn share of `/fr` showed an English title and
   * no image. Descriptions reuse validated copy where one exists
   * (`landing.subtitle`, `HOW_IT_WORKS.intro`); the strings that are new here
   * start at "à relire" (CLAUDE.md, convention 6).
   */
  meta: {
    landingTitle: {
      en: "Tour de Growth — a 3-minute AARRR growth check-up",
      fr: "Tour de Growth — diagnostic growth AARRR en 3 minutes",
    },
    howItWorksTitle: { en: "How Tour de Growth works — Tour de Growth", fr: "Comment fonctionne Tour de Growth — Tour de Growth" },
    glossaryTitle: { en: "Growth glossary — Tour de Growth", fr: "Glossaire growth — Tour de Growth" },
    glossaryDescription: {
      en: "Plain-English definitions of the growth/AARRR vocabulary — CAC, LTV, viral coefficient, growth loop, and more.",
      fr: "Le vocabulaire growth et AARRR expliqué en mots simples — CAC, LTV, coefficient viral, growth loop, et plus.",
    },
    glossaryTermSuffix: { en: "Tour de Growth Glossary", fr: "Glossaire Tour de Growth" },
    // Relu et validé par Antoine (2026-09-09) — R2-08. `/quiz` used to inherit the root
    // title and no description while being the most-linked page of the site.
    quizTitle: { en: "The Tour — 15 questions, 3 minutes — Tour de Growth", fr: "Le Tour — 15 questions, 3 minutes — Tour de Growth" },
    quizDescription: {
      en: "Answer 15 questions about how your product acquires, activates, retains, refers and monetises — and get an AARRR growth score out of 100 you can share.",
      fr: "Réponds à 15 questions sur la façon dont ton produit acquiert, active, retient, fait recommander et monétise — et obtiens un score growth AARRR sur 100 à partager.",
    },
    // Alt text of the landing share image (opengraph-image.tsx): what it shows,
    // for the people who can't see it.
    shareImageAlt: {
      en: "Tour de Growth — Where does your growth stall? A guided AARRR check-up, 15 questions, 3 minutes.",
      fr: "Tour de Growth — Où ta croissance cale-t-elle ? Un diagnostic AARRR guidé, 15 questions, 3 minutes.",
    },
  },

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
