import type { Translatable } from "@/lib/i18n/dictionary";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * how-it-works.ts — Tour de Growth
 * Ported verbatim from `content/how-it-works.js` in the SPEC-ADDENDUM-01
 * handoff bundle. Each pillar's `exampleQuestionId` references a real
 * question id in `content/copy-library.ts` by design (see that file's own
 * comment) — never re-typed here, so the two files can't drift apart.
 */

export interface HowItWorksPillarBlock {
  pillar: Pillar;
  explanation: Translatable;
  exampleQuestionId: string;
}

export const HOW_IT_WORKS = {
  title: { fr: "Comment fonctionne Tour de Growth", en: "How Tour de Growth works" },
  // Relu et validé par Antoine (2026-09-09) — R2-12: "AARRR" added. The page explains the
  // five stages of the framework and its meta description promises "the AARRR
  // framework explained", but the word never appeared in the page itself.
  intro: {
    fr: "Quinze questions, trois minutes, un score AARRR honnête. Voici précisément ce qu'on mesure, et pourquoi — et la seule chose à garder en tête avant de prendre ce chiffre trop au sérieux.",
    en: "Fifteen questions, three minutes, one honest AARRR score. Here's exactly what we're measuring, and why — plus the one thing you should know before you take it too seriously.",
  },

  pillars: [
    {
      pillar: "acquisition",
      explanation: {
        fr: "Comment les gens te trouvent en premier lieu — publicité, contenu, bouche-à-oreille, ou tout ce qui amène un inconnu jusqu'à ta porte.",
        en: "How people find you in the first place — through ads, content, word of mouth, or anything else that brings a stranger to your door.",
      },
      exampleQuestionId: "acq-1",
    },
    {
      pillar: "activation",
      explanation: {
        fr: "L'écart entre s'inscrire et vraiment comprendre — le moment où ton produit fait tilt pour quelqu'un de nouveau.",
        en: "The gap between signing up and actually getting it — the moment your product clicks for someone new.",
      },
      exampleQuestionId: "act-1",
    },
    {
      pillar: "retention",
      explanation: {
        fr: "Est-ce que les gens restent vraiment, ou disparaissent discrètement après un premier essai.",
        en: "Whether people actually stick around, or quietly disappear after the first try.",
      },
      exampleQuestionId: "ret-1",
    },
    {
      pillar: "referral",
      explanation: {
        fr: "Est-ce que tes utilisateurs les plus satisfaits t'en amènent vraiment de nouveaux — ou sont juste satisfaits en silence.",
        en: "Whether your happiest users are actually bringing you new ones — or just being happy quietly.",
      },
      exampleQuestionId: "ref-1",
    },
    {
      pillar: "revenue",
      explanation: {
        fr: "Est-ce que ta façon de gagner de l'argent a vraiment été testée — ou juste choisie, en espérant que ça marche.",
        en: "Whether the way you make money has actually been tested — or just chosen and hoped for.",
      },
      exampleQuestionId: "rev-1",
    },
  ] satisfies HowItWorksPillarBlock[],

  scoringSection: {
    title: { fr: "Comment le score est calculé", en: "How the score is calculated" },
    body: {
      // TODO: à relire — revue de copie v1 (2026-09-24), fiche terminologique : « étape »/"stage" pour le lecteur, « pilier »/"pillar" réservé au code. Aussi : « la même transparence, à chaque fois, pour tout le monde » était une triade creuse (§3.1).
      fr: "Quinze questions, trois par étape. Chaque réponse vaut un nombre de points fixe — rien de subjectif, rien qu'une IA ne décide à la volée. Tes cinq scores d'étape (sur 20 chacun) s'additionnent pour ton total (sur 100). Le texte de ton résultat vient d'un ensemble de verdicts pré-écrits, choisis selon ton score — les mêmes textes pour tout le monde, à score égal.",
      en: "Fifteen questions, three per stage. Each answer is worth a fixed number of points — nothing subjective, nothing an AI decides on the fly. Your five stage scores (out of 20 each) add up to your total (out of 100). The wording of your results comes from a set of pre-written verdicts matched to your score — the same wording for everyone with the same score.",
    },
  },

  tonesSection: {
    title: { fr: "Les deux tons", en: "The two tones" },
    straightUp: {
      // TODO: à relire — revue de copie v1 (2026-09-24), changement nº6 : le
      // sélecteur de ton, la page de résultat et la carte d'aperçu disent
      // « Neutre » ; cette page était la seule à dire « Straight up » en
      // français, un nom que le lecteur ne retrouvait nulle part ensuite.
      label: { fr: "Neutre", en: "Straight up" },
      body: {
        fr: "Un retour clair et constructif, sans enrobage — mais sans dureté inutile non plus.",
        en: "Clear, constructive feedback with no sugar-coating — but no unnecessary harshness either.",
      },
    },
    roast: {
      label: { fr: "Roast me", en: "Roast me" },
      body: {
        fr: "Même contenu, ton plus mordant. Le trait d'esprit vise toujours ta stratégie, jamais toi — c'est une règle stricte, pas une suggestion.",
        en: "Same substance, sharper delivery. The wit always targets your strategy, never you — that's a hard rule, not a suggestion.",
      },
    },
  },

  limitationNotice: {
    long: {
      fr: "Tour de Growth donne une estimation rapide et directionnelle, pas un audit professionnel. Le score reflète tes propres réponses à 15 questions — utile comme point de départ de conversation, pas comme verdict définitif.",
      en: "Tour de Growth gives a fast, directional estimate — not a professional audit. The score reflects your own answers to 15 questions, useful as a conversation starter, not a final verdict.",
    },
    short: {
      // Relu et validé par Antoine (2026-09-11) : le libellé du lien était resté
      // en anglais alors que le pied de page traduit la même destination.
      fr: "Estimation rapide, pas un audit — voir Comment ça marche.",
      en: "A quick estimate, not an audit — see How it works.",
    },
  },

  cta: { fr: "Commencer mon Tour →", en: "Start your Tour →" },
};
