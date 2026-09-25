import { Hand, NightSurface } from "tour-de-growth";

/*
 * The quarter's hand: the list of action cards, its title and counter, the
 * hint that says what to do now, and the "in production" line. The hand
 * never sorts its cards — the order is the island's (the CEO's order first,
 * never by effect). Every state a card can be in is said in words:
 * "Requested by the CEO", "Chosen". Copy: content/game/retention.ts.
 */

const noop = () => {};
const box = { padding: 20, maxWidth: 720 } as const;

const PITCH = {
  pdef: 'The main button becomes "Pause". Cancel moves to a secondary link.',
  pause: "Three months with no charge, offered once on the cancellation page.",
  survey: "One optional question for subscribers who cancel.",
  onboard: "Rework the first week of new subscribers.",
  remind: "An email three days before each renewal.",
};

/**
 * While the CEO talks: every card is `locked` — disabled but at full
 * contrast, because the hand is read while he talks. His order comes first,
 * badged. The hint says how to get the cards back: leave the call.
 */
export const WhileTheCeoTalks = () => (
  <NightSurface as="div" style={box}>
    <Hand
      title="Quarter 2 · your two actions"
      count="0 / 2"
      label="Your actions this quarter"
      hint="The CEO is talking. Leave the call to choose."
      orderLabel="Requested by the CEO"
      chosenLabel="Chosen"
      production="Nothing in production yet. The current flow: one button, two clicks."
      onToggle={noop}
      cards={[
        { id: "pdef", name: "Pause up front", pitch: PITCH.pdef, pressed: false, state: "locked", ordered: true },
        { id: "pause", name: "Pause offer", pitch: PITCH.pause, pressed: false, state: "locked", ordered: false },
        { id: "survey", name: "Exit survey", pitch: PITCH.survey, pressed: false, state: "locked", ordered: false },
        { id: "onboard", name: "Onboarding project", pitch: PITCH.onboard, pressed: false, state: "locked", ordered: false },
      ]}
    />
  </NightSurface>
);

/**
 * Two cards ticked: the counter reads 2 / 2, the other cards drop to
 * `unavailable` (muted, out of the round), and the production line names
 * what the previous quarter left running. The CEO's order was refused here —
 * nothing in the hand punishes that; the report will.
 */
export const TwoChosen = () => (
  <NightSurface as="div" style={box}>
    <Hand
      title="Quarter 2 · your two actions"
      count="2 / 2"
      label="Your actions this quarter"
      hint="Three months are about to pass. Watch the numbers."
      orderLabel="Requested by the CEO"
      chosenLabel="Chosen"
      production="In production: Pause offer, Exit survey."
      onToggle={noop}
      cards={[
        { id: "pdef", name: "Pause up front", pitch: PITCH.pdef, pressed: false, state: "unavailable", ordered: true },
        { id: "pause", name: "Pause offer", pitch: PITCH.pause, pressed: true, state: "available", ordered: false },
        { id: "survey", name: "Exit survey", pitch: PITCH.survey, pressed: true, state: "available", ordered: false },
        { id: "remind", name: "Pre-billing reminder", pitch: PITCH.remind, pressed: false, state: "unavailable", ordered: false },
      ]}
    />
  </NightSurface>
);

/** In French, one card ticked out of two — the rest stay available. */
export const OneChosenFrench = () => (
  <NightSurface as="div" style={box}>
    <Hand
      title="Trimestre 1 · tes deux actions"
      count="1 / 2"
      label="Tes actions du trimestre"
      hint="Choisis deux actions. Tu verras leur effet à la fin du trimestre."
      orderLabel="Demandé par le DG"
      chosenLabel="Choisie"
      production="Rien en production pour l'instant. Le parcours actuel : un bouton, deux clics."
      onToggle={noop}
      cards={[
        {
          id: "pause",
          name: "Offre de pause",
          pitch: "Trois mois sans prélèvement, proposés une fois sur la page de résiliation.",
          pressed: true,
          state: "available",
          ordered: false,
        },
        {
          id: "survey",
          name: "Questionnaire de sortie",
          pitch: "Une question facultative aux abonnés qui résilient.",
          pressed: false,
          state: "available",
          ordered: false,
        },
        {
          id: "annual",
          name: "Offre annuelle",
          pitch: "Douze mois pour le prix de dix, sur la page abonnement.",
          pressed: false,
          state: "available",
          ordered: false,
        },
      ]}
    />
  </NightSurface>
);
