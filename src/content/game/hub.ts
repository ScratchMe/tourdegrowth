import type { EndingId } from "@/lib/game/types";
import type { Pillar } from "@/lib/scoring/pillars";
import type { Translatable } from "@/lib/i18n/translatable";

/**
 * hub.ts — the text of `/{locale}/game`: the five zones of the Tour, which
 * one can be played, and the way back to the Tour (GAME-BRIEF 11.5, plan §5
 * row 24).
 *
 * **TODO: à relire** (convention 6). The five zone questions are the
 * prototype's own French (its `<nav class="tour">`); their English, the
 * company lines (from GAME-BRIEF 11.1-11.4), the ending labels and every
 * other string are new copy written by the code session.
 *
 * Zone names show BOTH names (orchestrator decision 4, 2026-09-24):
 * « Retention — S'ils reviennent ». The Tour says "Retention" everywhere and
 * a reader arriving from a result page recognises it; the game's question
 * form is what gives the level its voice. The pillar name comes from
 * `UI_STRINGS.pillars`, untranslated in both languages — only the question is
 * written here.
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

export interface HubZone {
  /** The zone as the game says it — the question form. */
  question: Translatable;
  /** The company the CEO runs on that level (GAME-BRIEF 11). */
  company: Translatable;
}

export const GAME_HUB = {
  eyebrow: t("Tour de Growth · le jeu", "Tour de Growth · the game"),
  title: t("Le côté obscur", "The dark side"),
  lead: t(
    "Le Tour te dit où ta croissance cale et quoi faire. Ici, c'est l'inverse : cinq années dans cinq entreprises, avec un DG qui veut le chiffre et des astuces pour l'obtenir, nommées comme on les nomme en réunion. Tu y apprends à les reconnaître.",
    "The Tour tells you where your growth stalls and what to do about it. This is the other side: five years at five companies, with a CEO who wants the number and tricks to get it, named the way they are named in meetings. You learn to spot them.",
  ),
  zonesTitle: t("Les cinq zones du Tour", "The five zones of the Tour"),
  zoneCounter: t("Zone {n}/5", "Zone {n}/5"),
  // State is carried by the word, never by colour alone (plan §6.2).
  playable: t("Jouable", "Playable"),
  soon: t("Bientôt", "Coming soon"),
  play: t("Jouer le niveau", "Play the level"),
  zones: {
    acquisition: {
      question: t("Comment les gens vous trouvent", "How people find you"),
      company: t("Une boutique en ligne de vélos et d'équipement", "An online shop for bikes and gear"),
    },
    activation: {
      question: t("Comment ils comprennent ce que vous apportez", "How they understand what you bring"),
      company: t("Un outil de planification pour indépendants", "A scheduling tool for freelancers"),
    },
    retention: {
      question: t("S'ils reviennent", "If they come back"),
      company: t("Flixo, une appli de streaming", "Flixo, a streaming app"),
    },
    referral: {
      question: t("S'ils vous recommandent", "If they recommend you"),
      company: t("Une appli de partage de dépenses entre amis", "An app for splitting costs with friends"),
    },
    revenue: {
      question: t("Comment vous gagnez de l'argent", "How you make money"),
      company: t("Une appli de sport avec abonnement", "A fitness app with a subscription"),
    },
  } satisfies Record<Pillar, HubZone>,

  /** "{ending}" and "{date}" are filled on the device, after mount (HubProgress). */
  lastEnding: t("Ta dernière année : {ending}, le {date}.", "Your last year: {ending}, on {date}."),
  endings: {
    applause: t("applaudissements", "a standing ovation"),
    cleanMiss: t("droit dans tes bottes", "clean hands, target missed"),
    firedClean: t("licencié, mais propre", "fired, but clean"),
    firedDark: t("licencié", "fired"),
    fine: t("le contrôle et l'amende", "the inspection and the fine"),
    labyrinth: t("le labyrinthe", "the maze"),
    repentant: t("le repenti", "the repentant"),
  } satisfies Record<EndingId, Translatable>,

  // GAME-BRIEF 11.5 and 13.3 D: the loop back to the Tour.
  tourLoopTitle: t("Où en est ta croissance ?", "Where does your own growth stand?"),
  tourLoopBody: t(
    "Quinze questions, trois minutes, et l'étape qui te freine — pour de vrai, cette fois.",
    "Fifteen questions, three minutes, and the stage holding you back — for real, this time.",
  ),
  tourLoopCta: t("Faire le Tour →", "Take the Tour →"),
} as const;
