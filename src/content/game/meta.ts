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
    shareImageAlt: t(
      "Le côté obscur de Tour de Growth : les cinq étapes du Tour, dont une seule est ouverte.",
      "The dark side of Tour de Growth: the five stages of the Tour, one of them open.",
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
} as const satisfies Record<string, Record<string, Translatable>>;

/** The level page's paper-world intro — the part of the page that is read before anything is played. */
export const RETENTION_INTRO = {
  eyebrow: t("Le côté obscur · niveau 1", "The dark side · level 1"),
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
