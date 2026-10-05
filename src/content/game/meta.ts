import type { Translatable } from "@/lib/i18n/translatable";

/**
 * meta.ts — the words around the game rather than in it: titles and search
 * descriptions, share-image alt text, breadcrumb names, and the level page's
 * indexable intro (plan §5, rows 1-3).
 *
 * **TODO: à relire** (convention 6). Everything here is new copy written by
 * the code session — except the level's lead paragraph, which is the
 * prototype's own (`design/game/prototype-s-ils-reviennent.html`, GAME-BRIEF
 * 8.1: the French is taken word for word), translated into English here.
 *
 * Why the intro lives here and not in `content/game/retention.ts`: it is the
 * paper-world part of the level page — Tour de Growth's own voice presenting
 * the game, prerendered and read by search engines — rendered by the server
 * page. `retention.ts` is the text of the year itself, handed to the island
 * as props. Keeping them apart keeps the island's payload to what it plays.
 *
 * Titles stay under ~60 characters and descriptions within 70-160
 * (`game-hub.test.ts`), the rule the SEO audit asked to apply from the first
 * line rather than retrofit (seo-audit §4.1, point 1).
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

export const GAME_META = {
  hub: {
    title: t("Le côté obscur, un jeu sur la croissance — Tour de Growth", "The dark side, a growth game — Tour de Growth"),
    description: t(
      "Cinq étapes du Tour, cinq entreprises, un DG qui veut le chiffre. Un jeu gratuit pour reconnaître les dark patterns avant d'en proposer un.",
      "Five stages of the Tour, five companies, one CEO who wants the number. A free game to spot dark patterns before you ever ship one.",
    ),
    breadcrumb: t("Le jeu", "The game"),
    // TODO: à relire — 2026-10-04 (A24.T0) : le nombre de niveaux ouverts devient un gabarit, {open}, rempli
    // par l'image du hub avec GAME_OPEN_COUNT_WORDS (« deux » à deux niveaux ouverts, « trois » depuis l'activation,
    // A24 ACT-3, « quatre » depuis le referral, A24 REF-3).
    // Quand les cinq niveaux seront ouverts, la phrase dira « les cinq étapes du Tour, dont cinq sont ouvertes » :
    // formulation à trancher au bon à tirer.
    shareImageAlt: t(
      "Le côté obscur de Tour de Growth : les cinq étapes du Tour, dont {open} sont ouvertes.",
      "The dark side of Tour de Growth: the five stages of the Tour, {open} of them open.",
    ),
  },
  retention: {
    title: t("Une année chez Flixo : le jeu du churn — Tour de Growth", "A year at Flixo: a churn game — Tour de Growth"),
    description: t(
      "Joue une année comme PM growth d'une appli de streaming : un DG qui veut 4 % de churn, deux actions par trimestre, et huit astuces à reconnaître.",
      "Play a year as the growth PM of a streaming app: a CEO who wants 4% churn, two actions a quarter, and eight tricks to learn to spot.",
    ),
    breadcrumb: t("Une année chez Flixo", "A year at Flixo"),
    shareImageAlt: t(
      "Une année chez Flixo : résiliations à 6,0 % par mois, la confiance et le radar DGCCRF absents du dashboard.",
      "A year at Flixo: churn at 6.0% a month, subscriber trust and the regulator's radar missing from the dashboard.",
    ),
  },
  // TODO: à relire — nouveau (2026-10-01, CHANTIERS.md A12.c) : le niveau 2, tout le bloc.
  acquisition: {
    title: t("Pédalix : le jeu de l'acquisition — Tour de Growth", "Pédalix: the acquisition game — Tour de Growth"),
    description: t(
      "Joue une année comme PM growth d'une boutique de vélos en ligne : un DG qui veut 3 000 nouveaux clients par mois, et huit astuces à reconnaître.",
      "Play a year as the growth PM of an online bike shop: a CEO who wants 3,000 new customers a month, and eight tricks to learn to spot.",
    ),
    breadcrumb: t("Une année chez Pédalix", "A year at Pédalix"),
    shareImageAlt: t(
      "Une année chez Pédalix : 2 000 nouveaux clients par mois, la confiance et le radar DGCCRF absents du dashboard.",
      "A year at Pédalix: 2,000 new customers a month, customer trust and the regulator's radar missing from the dashboard.",
    ),
  },
  // TODO: à relire — 2026-10-04 (A24.ACT-1) : le niveau activation, tout le bloc.
  activation: {
    title: t("Quandi : le jeu de l'activation — Tour de Growth", "Quandi: the activation game — Tour de Growth"),
    description: t(
      "Joue une année comme PM growth d'un outil de planification pour indépendants : un DG qui veut 45 % d'activation, et huit astuces à reconnaître.",
      "Play a year as the growth PM of a scheduling tool for freelancers: a CEO who wants 45% activation, and eight tricks to learn to spot.",
    ),
    breadcrumb: t("Une année chez Quandi", "A year at Quandi"),
    shareImageAlt: t(
      "Une année chez Quandi : 30,0 % d'activation, la confiance et le radar CNIL absents du dashboard.",
      "A year at Quandi: 30.0% activation, user trust and the regulator's radar missing from the dashboard.",
    ),
  },
  // TODO: à relire — 2026-10-05 (A24.REF-1) : le niveau referral, tout le bloc.
  referral: {
    title: t("Partix : le jeu du referral — Tour de Growth", "Partix: the referral game — Tour de Growth"),
    description: t(
      "Joue une année comme PM growth d'une appli de partage de dépenses : un DG qui veut un coefficient viral de 0,60, et huit astuces à reconnaître.",
      "Play a year as the growth PM of an expense-sharing app: a CEO who wants a viral coefficient of 0.60, and eight tricks to learn to spot.",
    ),
    breadcrumb: t("Une année chez Partix", "A year at Partix"),
    shareImageAlt: t(
      "Une année chez Partix : un coefficient viral de 0,40, la confiance et le radar CNIL absents du dashboard.",
      "A year at Partix: a viral coefficient of 0.40, user trust and the regulator's radar missing from the dashboard.",
    ),
  },
  // TODO: à relire — 2026-10-05 (A24.REV-1) : le niveau revenue, tout le bloc.
  revenue: {
    title: t("Gainix : le jeu du revenue — Tour de Growth", "Gainix: the revenue game — Tour de Growth"),
    description: t(
      "Joue une année comme PM growth d'une appli de sport : un DG qui veut 6 € de revenu par utilisateur, et huit astuces à reconnaître.",
      "Play a year as the growth PM of a fitness app: a CEO who wants €6 of revenue per user, and eight tricks to learn to spot.",
    ),
    breadcrumb: t("Une année chez Gainix", "A year at Gainix"),
    shareImageAlt: t(
      "Une année chez Gainix : 4,00 € de revenu par utilisateur, la confiance et le radar DGCCRF absents du dashboard.",
      "A year at Gainix: €4.00 of revenue per user, user trust and the regulator's radar missing from the dashboard.",
    ),
  },
} as const satisfies Record<string, Record<string, Translatable>>;

/**
 * The number of open levels, in words — what `{open}` becomes in
 * `GAME_META.hub.shareImageAlt` (filled by the hub's image, which counts
 * `enabledLevelSlugs()`). From two, the fewest the hub has shown, to all five.
 */
// TODO: à relire — 2026-10-04 (A24.T0) : les nombres en lettres du gabarit ; « deux » / "two" existait déjà dans la phrase.
export const GAME_OPEN_COUNT_WORDS: Record<2 | 3 | 4 | 5, Translatable> = {
  2: t("deux", "two"),
  3: t("trois", "three"),
  4: t("quatre", "four"),
  5: t("cinq", "five"),
};

/** The level page's paper-world intro — the part of the page that is read before anything is played. */
export const RETENTION_INTRO = {
  // TODO: à relire — 2026-10-04 (A24.T0) : le bandeau dit l'étape, sans numéro, comme sur les cinq niveaux (C76).
  eyebrow: t("Le côté obscur · retention", "The dark side · retention"),
  title: t("Une année chez Flixo", "A year at Flixo"),
  lead: t(
    "Tu es le PM growth de Flixo, une appli de streaming à 12,99 € par mois. Cent mille abonnés, et 6 % d'entre eux résilient chaque mois. Le board veut 4 % d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut.",
    "You are the growth PM at Flixo, a streaming app at €12.99 a month. A hundred thousand subscribers, and 6% of them cancel every month. The board wants 4% by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants.",
  ),
  stepsTitle: t("Comment se joue une année", "How a year plays"),
  steps: [
    {
      title: t("Le DG t'appelle.", "The CEO calls."),
      body: t(
        "Chaque trimestre s'ouvre sur une visio. Il dit ce qu'il attend, et parfois ce qu'il exige.",
        "Every quarter opens on a video call. He says what he expects, and sometimes what he demands.",
      ),
    },
    {
      title: t("Tu choisis deux actions.", "You pick two actions."),
      body: t(
        "Certaines sont honnêtes, d'autres pas. Leur nom ne le dit pas : il est écrit pour passer en réunion.",
        "Some are honest, some are not. Their names won't tell you: they are written to get through a meeting.",
      ),
    },
    {
      title: t("Le trimestre tombe.", "The quarter lands."),
      body: t(
        "Trois mois défilent sur ton dashboard. Deux chiffres n'y figurent pas : ils t'attendent en décembre.",
        "Three months play out on your dashboard. Two numbers are not on it: they are waiting for you in December.",
      ),
    },
  ],
  // Plan §1.4 (23): the context help is ordinary links to the glossary, not a
  // popover — and these two pages are the ones whose readers already care.
  glossaryLead: t("Les deux mots du jeu, s'ils te manquent :", "The game's two words, if you need them:"),
} as const;

/**
 * Level 2's intro (GAME-BRIEF §17). The three steps and the glossary lead
 * say how any year plays, so they are level 1's own objects.
 *
 * TODO: à relire — nouveau (2026-10-01, CHANTIERS.md A12.c) : le bandeau, le titre et le chapeau.
 */
export const ACQUISITION_INTRO = {
  // TODO: à relire — 2026-10-04 (A24.T0) : le bandeau dit l'étape, sans numéro, comme sur les cinq niveaux (C76).
  eyebrow: t("Le côté obscur · acquisition", "The dark side · acquisition"),
  title: t("Une année chez Pédalix", "A year at Pédalix"),
  lead: t(
    "Ton DG a quitté Flixo, une appli de streaming, pour diriger Pédalix, une boutique en ligne de vélos, et il t'a emmené avec lui comme PM growth. 2 000 nouveaux clients par mois, et le board en veut 3 000 d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut.",
    "Your CEO has left Flixo, a streaming app, to run Pédalix, an online bike shop, and he brought you along as growth PM. 2,000 new customers a month, and the board wants 3,000 by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants.",
  ),
  stepsTitle: RETENTION_INTRO.stepsTitle,
  steps: RETENTION_INTRO.steps,
  glossaryLead: RETENTION_INTRO.glossaryLead,
} as const;

/**
 * The activation level's intro (GAME-BRIEF §18). The three steps and the glossary
 * lead say how any year plays, so they are level 1's own objects.
 *
 * TODO: à relire — 2026-10-04 (A24.ACT-1) : le bandeau, le titre et le chapeau.
 */
export const ACTIVATION_INTRO = {
  eyebrow: t("Le côté obscur · activation", "The dark side · activation"),
  title: t("Une année chez Quandi", "A year at Quandi"),
  lead: t(
    "Ton DG dirige maintenant Quandi, un outil de planification en ligne pour indépendants, et il t'a emmené avec lui comme PM growth. 10 000 inscriptions par mois, et 30 % seulement publient un premier planning dans la semaine. Le board en veut 45 % d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut.",
    "Your CEO now runs Quandi, an online scheduling tool for freelancers, and he brought you along as growth PM. 10,000 sign-ups a month, and only 30% publish a first schedule within the week. The board wants 45% by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants.",
  ),
  stepsTitle: RETENTION_INTRO.stepsTitle,
  steps: RETENTION_INTRO.steps,
  glossaryLead: RETENTION_INTRO.glossaryLead,
} as const;

// TODO: à relire — 2026-10-05 (A24.REF-1) : le bandeau, le titre et le chapeau.
/**
 * The referral level's intro (GAME-BRIEF §19). The three steps and the glossary
 * lead say how any year plays, so they are level 1's own objects.
 */
export const REFERRAL_INTRO = {
  eyebrow: t("Le côté obscur · referral", "The dark side · referral"),
  title: t("Une année chez Partix", "A year at Partix"),
  lead: t(
    "Ton DG dirige maintenant Partix, une appli de partage de dépenses entre amis, et il t'a emmené avec lui comme PM growth. Un million d'utilisateurs, et chaque nouveau en amène 0,40 autre en moyenne par ses invitations : c'est le coefficient viral. Le board veut 0,60 d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut.",
    "Your CEO now runs Partix, an app for splitting costs with friends, and he brought you along as growth PM. A million users, and each new one brings in 0.40 more on average through their invitations: that's the viral coefficient. The board wants 0.60 by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants.",
  ),
  stepsTitle: RETENTION_INTRO.stepsTitle,
  steps: RETENTION_INTRO.steps,
  glossaryLead: RETENTION_INTRO.glossaryLead,
} as const;

// TODO: à relire — 2026-10-05 (A24.REV-1) : le bandeau, le titre et le chapeau.
/**
 * The revenue level's intro (GAME-BRIEF §20). The three steps and the glossary
 * lead say how any year plays, so they are level 1's own objects.
 */
export const REVENUE_INTRO = {
  eyebrow: t("Le côté obscur · revenue", "The dark side · revenue"),
  title: t("Une année chez Gainix", "A year at Gainix"),
  lead: t(
    "Ton DG dirige maintenant Gainix, une appli de sport avec abonnement et monnaie virtuelle, et il t'a emmené avec lui comme PM growth. 200 000 utilisateurs actifs, qui rapportent 4 € chacun par mois. Le board veut 6 € d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut.",
    "Your CEO now runs Gainix, a fitness app with a subscription and a virtual currency, and he brought you along as growth PM. 200,000 active users, who bring in €4 each a month. The board wants €6 by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants.",
  ),
  stepsTitle: RETENTION_INTRO.stepsTitle,
  steps: RETENTION_INTRO.steps,
  glossaryLead: RETENTION_INTRO.glossaryLead,
} as const;
