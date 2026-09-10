import type { Translatable } from "@/lib/i18n/dictionary";
import type { Pillar } from "@/lib/scoring/pillars";
import type { Tone } from "@/lib/quiz/tone";

/**
 * copy-library.ts — Tour de Growth
 *
 * Ported verbatim (content unchanged, structure adapted to TypeScript) from
 * `content/copy-library.js` in the SPEC-ADDENDUM-01 handoff bundle — the
 * verdict library produced by the product agent (see SPEC.md §12). Replaces
 * every "TODO: copie temporaire" placeholder this file overlaps with
 * (`lib/i18n/questionnaire-content.ts`'s 4-option questions, `sample.ts`'s
 * hand-written sample verdicts, and the Gemini-driven Quick-mode verdict
 * pipeline — see SPEC-ADDENDUM-01.md §0 for why Quick mode reads from here
 * now instead of calling Gemini).
 *
 * Real, signalled discrepancy with the previously-shipped scoring engine
 * (documented rather than silently resolved, same convention as CLAUDE.md's
 * earlier "3 vs 4 options" note): the original build picked 4 answer options
 * per question (points 0/7/13/20) because SPEC.md §6's text said "4 valeurs
 * par réponse" even though the design mock only ever showed 3 buttons. This
 * delivered content library only ever gives 3 options per question (points
 * 20/7/0 — no middle "13" tier) — the product agent's actual final content
 * supersedes that earlier arbitration. The scoring formula itself (sum of a
 * pillar's 3 raw points /3, rounded, summed across pillars) is unchanged;
 * only the option count and the points scale change, both driven directly
 * by this file rather than a separately-maintained fixed array (see
 * scoring/score.ts).
 *
 * Structure:
 *  - QUESTIONS         : the 15 questions, 5 pillars × 3, with options and points
 *  - PILLAR_VERDICTS    : one verdict per pillar × band × tone × locale (60)
 *  - SUMMARY_HEADLINES  : one-line summary per weakest-pillar × tone × locale (20)
 */

export interface CopyLibraryOption {
  points: 0 | 7 | 20;
  label: Translatable;
}

export interface CopyLibraryQuestion {
  id: string;
  pillar: Pillar;
  question: Translatable;
  /** Best-first, matching the delivered content exactly — always 3 options. */
  options: readonly [CopyLibraryOption, CopyLibraryOption, CopyLibraryOption];
}

// ---------------------------------------------------------------------------
// 1. QUESTIONS (15) — 3 per pillar, each option worth 0 / 7 / 20 points
// ---------------------------------------------------------------------------
export const QUESTIONS: readonly CopyLibraryQuestion[] = [
  // --- Acquisition ---
  {
    id: "acq-1",
    pillar: "acquisition",
    question: {
      fr: "As-tu un canal d'acquisition principal identifié et mesuré ?",
      en: "Do you have a primary acquisition channel that's identified and measured?",
    },
    options: [
      { points: 20, label: { fr: "Oui, clairement identifié et suivi", en: "Yes, clearly identified and tracked" } },
      { points: 7, label: { fr: "On en a un, mais pas suivi de près", en: "We have one, but don't track it closely" } },
      { points: 0, label: { fr: "Pas vraiment / c'est dispersé", en: "Not really / it's scattered" } },
    ],
  },
  {
    id: "acq-2",
    pillar: "acquisition",
    question: {
      fr: "As-tu testé plus d'un canal d'acquisition ?",
      en: "Have you tested more than one acquisition channel?",
    },
    options: [
      { points: 20, label: { fr: "Oui, plusieurs, avec une vraie comparaison", en: "Yes, several, with real comparison" } },
      { points: 7, label: { fr: "On en a essayé un second, sans grande rigueur", en: "We've tried a second one informally" } },
      { points: 0, label: { fr: "Non, juste celui-là", en: "No, just the one" } },
    ],
  },
  {
    id: "acq-3",
    pillar: "acquisition",
    question: {
      fr: "Connais-tu ton coût d'acquisition, même approximatif ?",
      en: "Do you know your customer acquisition cost, even roughly?",
    },
    options: [
      { points: 20, label: { fr: "Oui, un chiffre solide", en: "Yes, a solid number" } },
      { points: 7, label: { fr: "Une estimation grossière", en: "A rough estimate" } },
      { points: 0, label: { fr: "Aucune idée", en: "No idea" } },
    ],
  },

  // --- Activation ---
  {
    id: "act-1",
    pillar: "activation",
    question: {
      fr: 'As-tu défini un moment "aha" précis pour tes nouveaux utilisateurs ?',
      en: 'Have you defined a specific "aha" moment for new users?',
    },
    options: [
      { points: 20, label: { fr: "Oui, et on le mesure", en: "Yes, and we measure it" } },
      { points: 7, label: { fr: "On en a un, mais on ne le mesure pas", en: "We have one, but don't measure it" } },
      { points: 0, label: { fr: "Pas vraiment", en: "Not really" } },
    ],
  },
  {
    id: "act-2",
    pillar: "activation",
    question: {
      fr: "Sais-tu quel pourcentage d'utilisateurs atteint ce moment ?",
      en: "Do you know what percentage of users reach that moment?",
    },
    options: [
      { points: 20, label: { fr: "Oui, suivi précisément", en: "Yes, tracked precisely" } },
      { points: 7, label: { fr: "Une intuition approximative", en: "A rough sense of it" } },
      { points: 0, label: { fr: "Aucune visibilité", en: "No visibility at all" } },
    ],
  },
  {
    id: "act-3",
    pillar: "activation",
    question: {
      fr: "Ton onboarding a-t-il été testé ou itéré au moins une fois ?",
      en: "Has your onboarding been tested or iterated on at least once?",
    },
    options: [
      { points: 20, label: { fr: "Oui, itéré sur la base de vraies données", en: "Yes, iterated based on real data" } },
      { points: 7, label: { fr: "Ajusté un peu, à l'instinct", en: "Tweaked a little, informally" } },
      { points: 0, label: { fr: "Jamais retouché depuis le lancement", en: "Never touched since launch" } },
    ],
  },

  // --- Retention ---
  {
    id: "ret-1",
    pillar: "retention",
    question: {
      fr: "Suis-tu un taux de rétention (J7/J30 ou équivalent) ?",
      en: "Do you track a retention rate (D7/D30 or similar)?",
    },
    options: [
      { points: 20, label: { fr: "Oui, suivi et revu régulièrement", en: "Yes, tracked and reviewed regularly" } },
      { points: 7, label: { fr: "On peut le sortir, mais on regarde rarement", en: "We can pull it, but rarely look" } },
      { points: 0, label: { fr: "Non", en: "No" } },
    ],
  },
  {
    id: "ret-2",
    pillar: "retention",
    question: {
      fr: "As-tu un mécanisme de réengagement (email, notification...) ?",
      en: "Do you have a re-engagement mechanism (email, notification...)?",
    },
    options: [
      { points: 20, label: { fr: "Oui, et il est calibré/testé", en: "Yes, and it's tuned/tested" } },
      { points: 7, label: { fr: "Quelque chose de basique existe", en: "Something basic exists" } },
      { points: 0, label: { fr: "Rien en place", en: "Nothing in place" } },
    ],
  },
  {
    id: "ret-3",
    pillar: "retention",
    question: {
      fr: "Connais-tu ta principale cause de churn ?",
      en: "Do you know your main cause of churn?",
    },
    options: [
      { points: 20, label: { fr: "Oui, confirmée par de la donnée ou des entretiens", en: "Yes, backed by data or interviews" } },
      { points: 7, label: { fr: "Une intuition, non confirmée", en: "A hunch, not confirmed" } },
      { points: 0, label: { fr: "Aucune idée", en: "No idea" } },
    ],
  },

  // --- Referral ---
  {
    id: "ref-1",
    pillar: "referral",
    question: {
      fr: "Ton produit a-t-il un mécanisme de partage ou de parrainage ?",
      en: "Does your product have a sharing or referral mechanism?",
    },
    options: [
      { points: 20, label: { fr: "Oui, intégré au produit", en: "Yes, built into the product" } },
      { points: 7, label: { fr: "Seulement en communication, pas dans le produit", en: "Only in communication, not the product" } },
      { points: 0, label: { fr: "Non", en: "No" } },
    ],
  },
  {
    id: "ref-2",
    pillar: "referral",
    question: {
      fr: "S'il existe, est-il réellement utilisé par les clients ?",
      en: "If it exists, is it actually used by customers?",
    },
    options: [
      { points: 20, label: { fr: "Oui, de façon significative", en: "Yes, meaningfully" } },
      { points: 7, label: { fr: "Un peu, rarement", en: "A little, rarely" } },
      { points: 0, label: { fr: "N'existe pas ou jamais utilisé", en: "Doesn't exist or never used" } },
    ],
  },
  {
    id: "ref-3",
    pillar: "referral",
    question: {
      fr: "Mesures-tu un coefficient viral ou équivalent ?",
      en: "Do you measure a viral coefficient or equivalent?",
    },
    options: [
      { points: 20, label: { fr: "Oui, suivi", en: "Yes, tracked" } },
      { points: 7, label: { fr: "Vaguement conscient de son existence", en: "Vaguely aware of it" } },
      { points: 0, label: { fr: "Jamais mesuré", en: "Never measured" } },
    ],
  },

  // --- Revenue ---
  {
    id: "rev-1",
    pillar: "revenue",
    question: {
      fr: "Ton modèle de pricing a-t-il été testé, pas juste choisi ?",
      en: "Has your pricing model been tested, not just chosen?",
    },
    options: [
      { points: 20, label: { fr: "Oui, testé face à des alternatives", en: "Yes, tested against alternatives" } },
      { points: 7, label: { fr: "Choisi avec une logique, mais pas testé", en: "Chosen with some reasoning, not tested" } },
      { points: 0, label: { fr: "Choisi un peu arbitrairement", en: "Picked arbitrarily" } },
    ],
  },
  {
    id: "rev-2",
    pillar: "revenue",
    question: {
      fr: "Connais-tu ta LTV, même grossièrement ?",
      en: "Do you know your LTV, even roughly?",
    },
    options: [
      { points: 20, label: { fr: "Oui, une estimation solide", en: "Yes, a solid estimate" } },
      { points: 7, label: { fr: "Une estimation très approximative", en: "A very rough guess" } },
      { points: 0, label: { fr: "Aucune idée", en: "No idea" } },
    ],
  },
  {
    id: "rev-3",
    pillar: "revenue",
    question: {
      fr: "As-tu un playbook d'expansion (upsell/cross-sell) ?",
      en: "Do you have an expansion playbook (upsell/cross-sell)?",
    },
    options: [
      { points: 20, label: { fr: "Oui, actif et utilisé", en: "Yes, active and used" } },
      { points: 7, label: { fr: "Quelques idées, rien de systématique", en: "Some ideas, not systematic" } },
      { points: 0, label: { fr: "Rien", en: "Nothing" } },
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// 2. PILLAR_VERDICTS — one verdict per pillar × band × tone × locale (60)
//    "Strengths" reads pillars in the "strong" band; "Where you're losing
//    time" reads pillars in "weak" (and sometimes "developing").
// ---------------------------------------------------------------------------
export type ScoreBand = "weak" | "developing" | "strong";

/** Pillar score bands, out of 20 (after rounding — see SPEC.md §6). */
export function scoreBand(score: number): ScoreBand {
  if (score <= 9) return "weak";
  if (score <= 15) return "developing";
  return "strong";
}

export const PILLAR_VERDICTS: Record<Pillar, Record<ScoreBand, Record<Tone, Translatable>>> = {
  acquisition: {
    weak: {
      neutral: {
        fr: "Pas de canal d'acquisition clair pour l'instant — normal à ce stade, mais ça vaut le coup d'en choisir un et de s'y tenir avant d'en tester un second.",
        en: "No clear acquisition channel yet — normal at this stage, but worth picking one and sticking with it before testing a second.",
      },
      roast: {
        fr: "Ton acquisition ressemble à une échappée sans plan de course : on pédale, on ne sait pas trop vers où.",
        en: "Your acquisition is a breakaway with no race plan — pedaling hard, unclear destination.",
      },
    },
    developing: {
      neutral: {
        fr: "Un canal existe et fonctionne un peu, mais sans vraie mesure ou comparaison. Prochaine étape logique : chiffrer avant d'ajouter un deuxième canal.",
        en: "A channel exists and works somewhat, but without real measurement or comparison. Logical next step: quantify it before adding a second channel.",
      },
      roast: {
        fr: "Ton acquisition a du panache mais pas de tableau de bord — tu roules à l'instinct, pas au compteur.",
        en: "Your acquisition has panache but no dashboard — you're riding on instinct, not on the odometer.",
      },
    },
    strong: {
      neutral: {
        fr: "Canal identifié, mesuré, et déjà comparé à d'autres options — exactement la discipline attendue à ce stade.",
        en: "Channel identified, measured, and already benchmarked against alternatives — exactly the discipline expected at this stage.",
      },
      roast: {
        fr: "Ton acquisition, elle, sait où elle va. Maillot jaune mérité sur cette étape-là.",
        en: "Your acquisition actually knows where it's going. Deserved yellow jersey on this stage.",
      },
    },
  },
  activation: {
    weak: {
      neutral: {
        fr: 'Pas de moment "aha" identifié — sans lui, difficile de savoir ce qu\'il faut optimiser dans l\'onboarding.',
        en: 'No identified "aha" moment — without one, it\'s hard to know what to optimize in onboarding.',
      },
      roast: {
        fr: "Ton activation, c'est le sprint final sans ligne d'arrivée visible : personne ne sait quand on a gagné.",
        en: "Your activation is the final sprint with no visible finish line — nobody knows when they've won.",
      },
    },
    developing: {
      neutral: {
        fr: "Le moment clé existe dans les grandes lignes, mais son taux d'atteinte n'est pas encore suivi — la prochaine itération d'onboarding devrait viser à le mesurer.",
        en: "The key moment exists in broad strokes, but its completion rate isn't tracked yet — the next onboarding iteration should aim to measure it.",
      },
      roast: {
        fr: "Tu sais qu'il y a un moment magique quelque part dans ton onboarding. Toi non plus, tu ne sais pas exactement où.",
        en: "You know there's a magic moment somewhere in your onboarding. You're also not quite sure where.",
      },
    },
    strong: {
      neutral: {
        fr: 'Moment "aha" clair, mesuré, et un onboarding déjà itéré sur cette base — un vrai socle pour la suite.',
        en: 'Clear "aha" moment, measured, and an onboarding already iterated on that basis — a real foundation to build on.',
      },
      roast: {
        fr: "Ton onboarding a le sens du rythme d'un vrai directeur sportif. Rien à redire ici.",
        en: "Your onboarding has the pacing instincts of a real team director. Nothing to roast here.",
      },
    },
  },
  retention: {
    weak: {
      neutral: {
        fr: "Pas de suivi de rétention ni de cause de churn identifiée — c'est le point le plus urgent à traiter avant d'investir ailleurs.",
        en: "No retention tracking and no identified churn cause — this is the most urgent thing to address before investing elsewhere.",
      },
      roast: {
        fr: "Ta rétention a préféré rentrer à la maison avant la fin de l'étape.",
        en: "Your retention decided to go home before the stage was even over.",
      },
    },
    developing: {
      neutral: {
        fr: "Un chiffre de rétention existe quelque part, mais personne ne le regarde vraiment — le sortir régulièrement serait déjà un vrai progrès.",
        en: "A retention number exists somewhere, but nobody really looks at it — pulling it regularly would already be real progress.",
      },
      roast: {
        fr: "Ta rétention respire encore, mais elle marche plus qu'elle ne roule.",
        en: "Your retention is still breathing, but it's walking more than riding.",
      },
    },
    strong: {
      neutral: {
        fr: "Rétention suivie, cause de churn connue, mécanisme de réengagement actif — un pilier solide de ta croissance.",
        en: "Retention tracked, churn cause known, re-engagement mechanism active — a solid pillar of your growth.",
      },
      roast: {
        fr: "Ta rétention tient la roue mieux que la plupart du peloton growth.",
        en: "Your retention holds the wheel better than most of the growth peloton.",
      },
    },
  },
  referral: {
    weak: {
      neutral: {
        fr: "Aucun mécanisme de partage intégré au produit — même tes meilleurs clients n'ont aujourd'hui aucun moyen simple de te recommander.",
        en: "No sharing mechanism built into the product — even your best customers currently have no easy way to recommend you.",
      },
      roast: {
        fr: "Ton referral, c'est le bouche-à-oreille qu'on espère sans jamais lui donner de mégaphone.",
        en: "Your referral is word-of-mouth you're hoping for without ever handing anyone a megaphone.",
      },
    },
    developing: {
      neutral: {
        fr: "Quelque chose existe en communication, mais rien n'est encore intégré au produit lui-même — c'est là que se joue la vraie mécanique virale.",
        en: "Something exists in your messaging, but nothing is built into the product itself yet — that's where real viral mechanics happen.",
      },
      roast: {
        fr: "Tes clients parlent un peu de toi. Ton produit, lui, ne les y aide pas vraiment.",
        en: "Your customers talk about you a little. Your product isn't exactly helping them do it.",
      },
    },
    strong: {
      neutral: {
        fr: "Mécanisme de partage intégré et mesuré — le pilier le plus rare à ce niveau, probablement ton meilleur atout.",
        en: "Sharing mechanism built in and measured — the rarest pillar at this level, probably your best asset.",
      },
      roast: {
        fr: "Ton referral roule en échappée. Le reste du peloton growth aimerait bien savoir comment tu as fait.",
        en: "Your referral is off the front in a breakaway. The rest of the growth peloton would love to know how.",
      },
    },
  },
  revenue: {
    weak: {
      neutral: {
        fr: "Le pricing a été choisi plutôt que testé, et la LTV reste inconnue — deux zones d'ombre qui valent la peine d'être éclaircies rapidement.",
        en: "Pricing was chosen rather than tested, and LTV remains unknown — two blind spots worth clearing up quickly.",
      },
      roast: {
        fr: "Ton pricing a été fixé au doigt mouillé, et ta LTV reste un mystère digne d'une étape de montagne dans le brouillard.",
        en: "Your pricing was set by gut feeling, and your LTV remains as foggy as a mountain stage in the mist.",
      },
    },
    developing: {
      neutral: {
        fr: "Une logique de pricing existe et une estimation de LTV circule, mais rien n'a encore été testé formellement — la prochaine étape est de le confronter au marché.",
        en: "A pricing logic exists and an LTV estimate circulates, but nothing has been formally tested yet — next step is confronting it with the market.",
      },
      roast: {
        fr: "Ton pricing a l'air raisonnable sur le papier. Sur la route, personne ne l'a encore vraiment testé.",
        en: "Your pricing looks reasonable on paper. On the road, nobody has actually tested it yet.",
      },
    },
    strong: {
      neutral: {
        fr: "Pricing testé, LTV connue, playbook d'expansion actif — un pilier revenue qui tient déjà la comparaison avec des équipes bien plus établies.",
        en: "Pricing tested, LTV known, expansion playbook active — a revenue pillar that already holds up against much more established teams.",
      },
      roast: {
        fr: "Ton revenue a le calme d'un coureur qui sait exactement combien de temps il a en réserve avant l'arrivée.",
        en: "Your revenue has the calm of a rider who knows exactly how much time he has in the bank before the finish.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 3. SUMMARY_HEADLINES — one-line summary under the score numeral, indexed
//    by the LOWEST-scoring pillar (see SPEC.md §6 for the tie-break) × tone
//    × locale. 20 lines.
// ---------------------------------------------------------------------------
export const SUMMARY_HEADLINES: Record<Pillar, Record<Tone, Translatable>> = {
  acquisition: {
    neutral: {
      fr: "Bon moteur global, mais l'acquisition reste à muscler avant d'aller plus loin.",
      en: "Solid engine overall, but acquisition still needs work before going further.",
    },
    roast: {
      fr: "Beau vélo, mais personne ne sait encore comment tu recrutes tes coureurs.",
      en: "Nice bike, but nobody quite knows how you're recruiting your riders yet.",
    },
  },
  activation: {
    neutral: {
      fr: "Bon moteur global, mais l'activation reste le principal frein à lever.",
      en: "Solid engine overall, but activation is the main brake left to release.",
    },
    roast: {
      fr: "Les gens arrivent à la ligne de départ. Peu comprennent pourquoi ils sont là.",
      en: "People show up at the starting line. Few understand why they're there.",
    },
  },
  retention: {
    neutral: { fr: "Bon moteur global, un pneu à plat : la rétention.", en: "Solid engine, one flat tyre: retention." },
    roast: {
      fr: "Pas mal pour quelqu'un dont les utilisateurs partent avant la deuxième semaine.",
      en: "Not bad for someone whose users leave before the second week.",
    },
  },
  referral: {
    neutral: {
      fr: "Bon moteur global, mais le bouche-à-oreille ne travaille pas encore pour toi.",
      en: "Solid engine overall, but word-of-mouth isn't working for you yet.",
    },
    roast: { fr: "Tes clients t'aiment en silence. Donne-leur un micro.", en: "Your customers love you quietly. Hand them a microphone." },
  },
  revenue: {
    neutral: {
      fr: "Bon moteur global, mais le modèle économique reste à valider.",
      en: "Solid engine overall, but the revenue model still needs validating.",
    },
    roast: { fr: "Tout roule, sauf la caisse.", en: "Everything's rolling, except the cash register." },
  },
};

/**
 * The 21st headline: the one for a board where no stage is behind.
 *
 * `SUMMARY_HEADLINES` is indexed by the weakest pillar, and all 20 of its
 * lines assert that stage still needs work — correct in the 19 cases out of
 * 20 where a stage IS behind, and false when every pillar lands in the strong
 * band. Design system extension 03 made that falsehood visible rather than
 * introducing it: the score card now stamps "Nothing is stalling you" and
 * then printed "…but acquisition still needs work before going further"
 * directly underneath. The share image took the same turn in lot 3
 * (`UI_STRINGS.og.stallSentenceLevel`); this is the summary half of it, and
 * it lives here rather than in the dictionary because it is a verdict line,
 * not chrome — `buildQuickVerdict` substitutes it whenever
 * `resolveBottleneck` says the board is level, so every consumer of a Quick
 * verdict gets it, not just the one screen that showed the contradiction.
 *
 * TODO: à relire — copie nouvelle. La variante roast en particulier relève de
 * l'agent produit : CLAUDE.md réserve la voix roast définitive, et celle-ci
 * vise l'auto-évaluation (ce que le questionnaire peut savoir), jamais la
 * personne.
 */
export const LEVEL_HEADLINE: Record<Tone, Translatable> = {
  neutral: {
    fr: "Chaque étape tient — c'est tout le moteur qui tourne, pas une pièce qui porte les autres.",
    en: "Every stage is holding — it's the whole engine working, not one part carrying the rest.",
  },
  roast: {
    fr: "Étonnamment propre. Soit le moteur est vraiment à ce niveau, soit le questionnaire a été plus tendre que tes utilisateurs.",
    en: "Suspiciously tidy. Either the engine really is this good, or the questionnaire was kinder than your users are.",
  },
};
