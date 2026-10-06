import type { EndingId, LevelSlug } from "@/lib/game/types";
import type { Pillar } from "@/lib/scoring/pillars";
import type { Translatable } from "@/lib/i18n/translatable";

/**
 * hub.ts — the text of `/{locale}/game`: the five zones of the Tour, which
 * one can be played, and the way back to the Tour (GAME-BRIEF 11.5, plan §5
 * row 24).
 *
 * **TODO: à relire** (convention 6). The five zone questions are the
 * prototype's own French (its `<nav class="tour">`); their English, the
 * company lines (from GAME-BRIEF 11.1-11.4; Pédalix's, Quandi's and Partix's
 * from their level's specification, `docs/game/niveau-2.md` §17,
 * `docs/game/activation.md` §18.11 and `docs/game/referral.md` §19.11), the
 * ending labels and every other string are new copy written by the code
 * session. One exception
 * besides the zone questions: `LEVEL_TEASERS.acquisition` in French is the
 * prototype's too (`design/game/prototype-s-ils-reviennent.html`), hence
 * validated — see the state of each `LEVEL_TEASERS` line below.
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

/**
 * Where a level names an ending differently: at Pédalix the inspection ends
 * in a criminal settlement with the prosecutor's agreement, never a fine
 * (GAME-BRIEF §17.9, test C14); at Gainix it ends in two procedures, a
 * settlement and a fine (`docs/game/revenue.md` §20.3). The hub merges these
 * over `GAME_HUB.endings`.
 * TODO: à relire — nouveau (2026-10-01, CHANTIERS.md A12.f).
 */
const ENDINGS_BY_LEVEL: Partial<Record<LevelSlug, Partial<Record<EndingId, Translatable>>>> = {
  acquisition: { fine: t("le contrôle et la transaction", "the inspection and the settlement") },
  // TODO: à relire — 2026-10-06 (A24.REV-3) : la fin « fine » du niveau 5, d'après docs/game/revenue.md §20.11 (deux procédures, une transaction et une amende).
  revenue: { fine: t("le contrôle, la transaction et l'amende", "the inspection, the settlement and the fine") },
};

/**
 * The line that announces each level where another level's December points at
 * it (`NextLevel`'s title, C75, A24.T0): the level and what it teaches. Keyed
 * by the level it ANNOUNCES, not the one that shows it, because the block
 * closes a December on whichever level the player has not finished yet
 * (`nextLevelFor`), chosen in the browser. Each level's own December copy
 * used to carry the other's line; acquisition's and retention's are those
 * lines, moved as they stood, and each level since adds its own at the step
 * that makes it a `LevelSlug` (activation's, at A24 ACT-3; referral's, at
 * A24 REF-3; revenue's, at A24 REV-3).
 *
 * The state of each line (moved, so each keeps the one it had):
 * - `acquisition`, French: the prototype's own French, validated, not marked;
 *   `game-retention.test.ts` keeps it word for word (C11).
 * - `acquisition`, English: TODO: à relire — premier jet du 2026-09-24, venu du
 *   niveau 1 (`retention.ts`).
 * - `retention`, both languages: TODO: à relire — écrites pour A12.c le
 *   2026-10-01, venues du niveau 2 (`acquisition.ts`).
 * - `activation`, both languages: TODO: à relire — écrites pour A24 ACT-3 le
 *   2026-10-05, d'après `docs/game/activation.md` §18.11.
 * - `referral`, both languages: TODO: à relire — écrites pour A24 REF-3 le
 *   2026-10-05, d'après `docs/game/referral.md` §19.11.
 * - `revenue`, both languages: TODO: à relire — écrites pour A24 REV-3 le
 *   2026-10-06, d'après `docs/game/revenue.md` §20.11.
 */
export const LEVEL_TEASERS: Record<LevelSlug, Translatable> = {
  acquisition: t(
    "« Comment les gens vous trouvent » : le compte à rebours, le prix qui gonfle, le faux stock",
    '"How people find you": the countdown timer, the creeping price, the fake stock',
  ),
  // TODO: à relire — 2026-10-05 (A24.ACT-3) : l'annonce du niveau 3, d'après docs/game/activation.md §18.11.
  activation: t(
    "« Comment ils comprennent ce que vous apportez » : le refus des cookies au bout du parcours, la case cochée d'avance, le numéro demandé pour la sécurité",
    '"How they understand what you bring": the cookie refusal at the end of the path, the box ticked in advance, the number asked for security',
  ),
  retention: t(
    "« S'ils reviennent » : la pause mise en avant, le bouton enterré, la résiliation par téléphone",
    '"If they come back": the pause pushed up front, the buried button, cancelling by phone',
  ),
  // TODO: à relire — 2026-10-05 (A24.REF-3) : l'annonce du niveau 4, d'après docs/game/referral.md §19.11.
  referral: t(
    "« S'ils vous recommandent » : les invitations envoyées pour toi, le carnet aspiré, le bonus aux conditions introuvables",
    '"If they recommend you": invitations sent for you, the scraped address book, the bonus with conditions nowhere to be found',
  ),
  // TODO: à relire — 2026-10-06 (A24.REV-3) : l'annonce du niveau 5, d'après docs/game/revenue.md §20.11.
  revenue: t(
    "« Comment vous gagnez de l'argent » : l'essai qui se change en abonnement, l'option cochée d'avance, le coffre au hasard",
    '"How you make money": the trial that turns into a subscription, the pre-ticked add-on, the random chest',
  ),
};

export const GAME_HUB = {
  eyebrow: t("Tour de Growth · le jeu", "Tour de Growth · the game"),
  title: t("Le côté obscur", "The dark side"),
  lead: t(
    "Le Tour te dit où ta croissance cale et quoi faire. Ici, c'est l'inverse : cinq années dans cinq entreprises, avec un DG qui veut le chiffre et des astuces pour l'obtenir, nommées comme on les nomme en réunion. Tu y apprends à les reconnaître.",
    "The Tour tells you where your growth stalls and what to do about it. This is the other side: five years at five companies, with a CEO who wants the number and tricks to get it, named the way they are named in meetings. You learn to spot them.",
  ),
  // TODO: à relire (convention 6).
  /** Over the hub's night poster (`game/HubMountain`, design I + B): the five zones drawn as five cols. */
  mountain: {
    title: t("Profil de la montagne", "Mountain profile"),
    legend: t("cinq cols, cinq entreprises", "five climbs, five companies"),
  },
  zonesTitle: t("Les cinq zones du Tour", "The five zones of the Tour"),
  zoneCounter: t("Zone {n}/5", "Zone {n}/5"),
  // State is carried by the word, never by colour alone (plan §6.2).
  playable: t("Jouable", "Playable"),
  soon: t("Bientôt", "Coming soon"),
  play: t("Jouer le niveau", "Play the level"),
  zones: {
    acquisition: {
      question: t("Comment les gens vous trouvent", "How people find you"),
      // TODO: à relire — 2026-10-01 (A12.f) : la boutique a un nom depuis que le niveau existe, comme Flixo.
      company: t("Pédalix, une boutique de vélos en ligne", "Pédalix, an online bike shop"),
    },
    activation: {
      question: t("Comment ils comprennent ce que vous apportez", "How they understand what you bring"),
      // TODO: à relire — 2026-10-05 (A24.ACT-3) : l'entreprise a un nom depuis que le niveau existe, comme Flixo et Pédalix.
      company: t("Quandi, un outil de planification pour indépendants", "Quandi, a scheduling tool for freelancers"),
    },
    retention: {
      question: t("S'ils reviennent", "If they come back"),
      company: t("Flixo, une appli de streaming", "Flixo, a streaming app"),
    },
    referral: {
      question: t("S'ils vous recommandent", "If they recommend you"),
      // TODO: à relire — 2026-10-05 (A24.REF-3) : l'entreprise a un nom depuis que le niveau existe, comme Flixo, Pédalix et Quandi.
      company: t("Partix, une appli de partage de dépenses entre amis", "Partix, an app for splitting costs with friends"),
    },
    revenue: {
      question: t("Comment vous gagnez de l'argent", "How you make money"),
      // TODO: à relire — 2026-10-06 (A24.REV-3) : l'entreprise a un nom depuis que le niveau existe, comme Flixo, Pédalix, Quandi et Partix.
      company: t("Gainix, une appli de sport avec abonnement", "Gainix, a fitness app with a subscription"),
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
  endingsByLevel: ENDINGS_BY_LEVEL,

  // GAME-BRIEF 11.5 and 13.3 D: the loop back to the Tour.
  tourLoopTitle: t("Où en est ta croissance ?", "Where does your own growth stand?"),
  tourLoopBody: t(
    "Quinze questions, trois minutes, et l'étape qui te freine — pour de vrai, cette fois.",
    "Fifteen questions, three minutes, and the stage holding you back — for real, this time.",
  ),
  tourLoopCta: t("Faire le Tour →", "Take the Tour →"),
} as const;
