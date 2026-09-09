import type { Translatable } from "@/lib/i18n/translatable";

/**
 * about.ts — Tour de Growth
 * Copy for `/about` (REVIEW-02.md R2-04): who built this and why, what the
 * fifteen questions measure, exactly how the score is computed, where AI is
 * used and where it is not, and how to reach the author.
 *
 * Reviewed and approved by Antoine as written (2026-09-09). Every string
 * in this file was a first draft written in his voice by the coding
 * session, not copy delivered by the product agent. The facts (experience, employers) come from
 * `antoine-credit.ts`; the arithmetic mirrors `lib/scoring/score.ts` and
 * SPEC.md §6 and is checked by a test. The voice is his to approve.
 */
export const ABOUT = {
  title: { fr: "À propos de Tour de Growth", en: "About Tour de Growth" },
  metaDescription: {
    fr: "Qui a construit Tour de Growth et pourquoi, ce que mesurent les quinze questions AARRR, et comment le score est calculé exactement — sans qu'aucune IA touche au chiffre.",
    en: "Who built Tour de Growth and why, what the fifteen AARRR questions measure, and exactly how the score is calculated — with no AI touching the number.",
  },
  intro: {
    fr: "Je m'appelle Antoine Berthaud. Je suis Senior Growth PM, dix ans de produit et de croissance (AB Tasty, SNCF Connect & Tech…). J'ai construit Tour de Growth parce que la façon la plus rapide d'expliquer ce qu'est le travail de growth, c'est de tendre un miroir : quinze questions honnêtes et un score qu'on peut contester. C'est aussi une étude de cas grandeur nature — l'outil doit croître comme il conseille aux autres de le faire.",
    en: "I'm Antoine Berthaud, a Senior Growth PM with ten years in product and growth (AB Tasty, SNCF Connect & Tech…). I built Tour de Growth because the fastest way to explain what growth work actually is, is to hand someone a mirror: fifteen honest questions and a score they can argue with. It is also a live case study — the tool has to grow the way it tells others to.",
  },

  questionsSection: {
    title: { fr: "Pourquoi ces quinze questions", en: "Why these fifteen questions" },
    body: {
      fr: "Trois questions par étape du cadre AARRR — Acquisition, Activation, Rétention, Referral, Revenue. Elles portent volontairement sur ce que tu fais et mesures, pas sur ce que tu crois : un canal est-il identifié et suivi, un moment « aha » est-il défini, la rétention est-elle mesurée, le parrainage est-il dans le produit, le pricing a-t-il été testé. Un fondateur peut répondre en trois minutes, et deux personnes de la même équipe devraient obtenir le même score.",
      en: "Three questions per stage of the AARRR framework — Acquisition, Activation, Retention, Referral, Revenue. They deliberately ask what you do and measure, not what you believe: is a channel identified and tracked, is an aha moment defined, is retention measured, is referral built into the product, has pricing been tested. A founder can answer in three minutes, and two people on the same team should land on the same score.",
    },
  },

  scoringSection: {
    title: { fr: "Comment le score est calculé, exactement", en: "How the score is calculated, exactly" },
    rules: [
      {
        fr: "Chaque question propose trois réponses, qui valent 20, 7 ou 0 points. Pas de nuance intermédiaire : soit c'est en place et mesuré, soit c'est là sans être mesuré, soit ce n'est pas là.",
        en: "Each question has three answers, worth 20, 7 or 0 points. No middle tier: either it is in place and measured, in place but unmeasured, or not there.",
      },
      {
        fr: "Le total brut d'une étape (de 0 à 60) est divisé par 3 et arrondi à l'entier le plus proche : c'est le score de l'étape, sur 20.",
        en: "A stage's raw total (0 to 60) is divided by 3 and rounded to the nearest whole number: that is the stage score, out of 20.",
      },
      {
        fr: "Les cinq scores d'étape déjà arrondis s'additionnent pour donner le total sur 100. L'arrondi se fait avant l'addition, pour que les chiffres affichés s'additionnent toujours exactement.",
        en: "The five rounded stage scores are added up to give the total out of 100. Rounding happens before the addition, so the numbers on the page always add up exactly.",
      },
      {
        fr: "L'étape la plus faible est celle qui a le plus petit score ; en cas d'égalité, la première dans l'ordre AARRR. C'est elle qui donne le titre de ton résultat et la ligne rouge de ton image de partage.",
        en: "The weakest stage is the one with the lowest score; ties go to whichever comes first in AARRR order. It gives your result its headline and the red line on your share image.",
      },
      {
        fr: "Aucune IA ne touche au chiffre. Le score est une règle fixe, la même pour tout le monde, et tu peux la refaire à la main : ton propre résultat te montre les quinze réponses et le calcul, étape par étape.",
        en: "No AI touches the number. The score is a fixed rule, the same for everyone, and you can redo it by hand: your own result shows you the fifteen answers and the arithmetic, stage by stage.",
      },
    ] satisfies Translatable[],
    exampleLabel: { fr: "Exemple", en: "Worked example" },
    example: {
      fr: "Trois réponses à 20, 7 et 7 points font 34 sur 60. 34 divisé par 3 donne 11,33, arrondi à 11 : l'étape vaut 11/20. Cinq étapes à 18, 12, 8, 16 et 20 font un total de 74/100, et la Rétention, à 8, est l'étape la plus faible.",
      en: "Three answers worth 20, 7 and 7 points make 34 out of 60. 34 divided by 3 is 11.33, rounded to 11: the stage scores 11/20. Five stages at 18, 12, 8, 16 and 20 add up to 74/100, and Retention, at 8, is the weakest stage.",
    },
  },

  aiSection: {
    title: { fr: "Où il y a de l'IA, et où il n'y en a pas", en: "Where AI is used, and where it isn't" },
    body: {
      fr: "Le résultat rapide n'en contient aucune : le titre et les phrases par étape sont des textes pré-écrits, choisis selon la bande de score (0 à 9, 10 à 15, 16 à 20). Seul le Deep dive — dix questions de plus, et un champ libre optionnel — fait appel à un modèle de langage (Gemini, de Google) pour rédiger des recommandations à partir de tes vingt-cinq réponses. Les deux tons et les deux langues sont générés d'un coup, la règle « on vise la stratégie, jamais la personne » est écrite en dur dans la consigne, et le score, lui, ne bouge pas d'un point.",
      en: "The quick result contains none: the headline and the per-stage sentences are pre-written texts, picked by score band (0 to 9, 10 to 15, 16 to 20). Only the Deep dive — ten more questions and an optional free-text field — calls a language model (Google's Gemini) to write recommendations from your twenty-five answers. Both tones and both languages are generated at once, the rule \"aim at the strategy, never the person\" is hard-coded into the instructions, and the score itself does not move by a single point.",
    },
  },

  openSection: {
    title: { fr: "Construit en public", en: "Built in the open" },
    body: {
      fr: "Le code est public, sous licence AGPL, avec chaque décision d'architecture et chaque revue documentées dans le dépôt : ce projet est aussi une démonstration de méthode. Les chiffres de croissance de l'outil lui-même — analyses, partages, coefficient viral — sont mesurés avec les mêmes règles qu'il applique aux autres.",
      en: "The code is public under the AGPL, with every architecture decision and every review documented in the repository: this project is a demonstration of method as much as a tool. The tool's own growth numbers — analyses, shares, viral coefficient — are measured with the same rules it applies to everyone else.",
    },
    repoLinkText: { fr: "Voir le code sur GitHub", en: "See the code on GitHub" },
  },

  contactSection: {
    title: { fr: "Me contacter", en: "Get in touch" },
    body: {
      fr: "Une question sur la méthode, un score que tu contestes, ou un problème de croissance sur lequel tu voudrais un regard extérieur : ",
      en: "A question about the method, a score you disagree with, or a growth problem you'd like an outside eye on: ",
    },
    linkedinLinkText: { fr: "écris-moi sur LinkedIn", en: "message me on LinkedIn" },
    between: { fr: ", ou ", en: ", or " },
    cvLinkText: { fr: "parcours mon profil", en: "read my background" },
    after: { fr: ".", en: "." },
  },

  cta: { fr: "Faire mon Tour →", en: "Take the Tour →" },
} as const;

/**
 * REVIEW-03.md B3 — one founder sentence on the landing, below the fold,
 * pointing at `/about`. A sentence and a link, never a section.
 *
 * The quote is the same clause as in `ABOUT.intro` above — capitalised and
 * given a full stop, since it stands alone here — rather than a rewrite, so
 * the landing and `/about` cannot drift into two slightly different claims.
 * A unit test pins that: it compares the two ignoring case and terminal
 * punctuation, which is exactly the freedom taken and no more. It lives here
 * rather than in `dictionary.ts` because it is Antoine's voice, which is
 * what this file holds.
 *
 * Distinct on purpose from the site footer's "A side project by Antoine
 * Berthaud — Senior Growth PM", which sits a few centimetres below: the
 * footer says who made it, this says why.
 *
 * TODO: à relire — l'attribution et le libellé du lien sont nouveaux
 * (la phrase citée, elle, est déjà validée). Convention 6.
 */
export const LANDING_PULL = {
  quote: {
    fr: "La façon la plus rapide d'expliquer ce qu'est le travail de growth, c'est de tendre un miroir.",
    en: "The fastest way to explain what growth work actually is, is to hand someone a mirror.",
  },
  attribution: {
    fr: "Antoine Berthaud, Senior Growth PM",
    en: "Antoine Berthaud, Senior Growth PM",
  },
  cta: { fr: "Pourquoi j'ai construit ça →", en: "Why I built this →" },
} satisfies Record<string, Translatable>;

export const REPO_URL = "https://github.com/ScratchMe/tourdegrowth";
