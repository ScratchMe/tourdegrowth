import { Hand, NightSurface } from "tour-de-growth";

/*
 * The quarter's hand: the list of action cards, its title and counter, the
 * hint that says what to do now, and the "in production" line. The hand
 * never sorts its cards — the order is the engine's (`handIds`: the CEO's
 * order first, then dark and honest alternating, never by effect). Every
 * state a card can be in is said in words: "Requested by the CEO",
 * "Unlocked by the survey", "Chosen". The hand only appears once the call is
 * hung up (since 2026-09-25), so its cards are never shown locked.
 *
 * Props are what the island builds (`handView`) from reference year A. A
 * real hand holds ten to twelve cards, taller than a still: each cell shows
 * the FIRST EIGHT, in the hand's own order, at the desk's 600px column.
 */

const noop = () => {};
const box = { padding: 20, width: 640 } as const;

/**
 * Second quarter, nothing ticked yet: the CEO's order ("Pause up front")
 * leads with its badge, and the data review arrives with "Unlocked by the
 * survey" — the exit survey played in Q1 made it. The first quarter left the
 * pause offer in production.
 */
export const OrderAndUnlock = () => (
  <NightSurface as="div" style={box}>
    <Hand
      title="Quarter 2 · your two projects"
      count="0 / 2"
      label="Your actions this quarter"
      hint="Your product team can ship two projects a quarter, not one more. Choose them: you'll see their effect at the end of the quarter."
      orderLabel="Requested by the CEO"
      unlockedLabel="Unlocked by the survey"
      chosenLabel="Chosen"
      production="In production: Pause offer."
      cards={[{"id": "pdef", "name": "Pause up front", "pitch": "The main button becomes \"Pause\". Cancel moves to a secondary link.", "pressed": false, "state": "available", "ordered": true, "unlocked": false}, {"id": "bury", "name": "Declutter the subscription page", "pitch": "The \"Cancel\" link moves to Settings › Account › Other options.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "onboard", "name": "Onboarding project", "pitch": "Rework the first week of new subscribers.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "cascade", "name": "Retention offers", "pitch": "Three successive offers shown before the confirmation.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "annual", "name": "Annual plan", "pitch": "Twelve months for the price of ten, on the subscription page.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "shame", "name": "Custom decline button", "pitch": "The button to decline the offer says \"No thanks, I'd rather be bored\".", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "present", "name": "Data review with the CEO", "pitch": "A thirty-minute meeting with the quarter's numbers.", "pressed": false, "state": "available", "ordered": false, "unlocked": true}, {"id": "call", "name": "Assisted cancellation", "pitch": "Cancellation happens by phone, Monday to Friday, in the morning.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}]}
      onToggle={noop}
    />
  </NightSurface>
);

/**
 * The same quarter with two cards ticked (the onboarding project and the data
 * review): the counter reads 2 / 2, every other card drops to `unavailable`,
 * the CEO's order included — refusing it is allowed; the report will say so.
 */
export const TwoChosen = () => (
  <NightSurface as="div" style={box}>
    <Hand
      title="Quarter 2 · your two projects"
      count="2 / 2"
      label="Your actions this quarter"
      hint="The team is fully booked for the quarter. Three months are about to pass: watch the numbers."
      orderLabel="Requested by the CEO"
      unlockedLabel="Unlocked by the survey"
      chosenLabel="Chosen"
      production="In production: Pause offer."
      cards={[{"id": "pdef", "name": "Pause up front", "pitch": "The main button becomes \"Pause\". Cancel moves to a secondary link.", "pressed": false, "state": "unavailable", "ordered": true, "unlocked": false}, {"id": "bury", "name": "Declutter the subscription page", "pitch": "The \"Cancel\" link moves to Settings › Account › Other options.", "pressed": false, "state": "unavailable", "ordered": false, "unlocked": false}, {"id": "onboard", "name": "Onboarding project", "pitch": "Rework the first week of new subscribers.", "pressed": true, "state": "available", "ordered": false, "unlocked": false}, {"id": "cascade", "name": "Retention offers", "pitch": "Three successive offers shown before the confirmation.", "pressed": false, "state": "unavailable", "ordered": false, "unlocked": false}, {"id": "annual", "name": "Annual plan", "pitch": "Twelve months for the price of ten, on the subscription page.", "pressed": false, "state": "unavailable", "ordered": false, "unlocked": false}, {"id": "shame", "name": "Custom decline button", "pitch": "The button to decline the offer says \"No thanks, I'd rather be bored\".", "pressed": false, "state": "unavailable", "ordered": false, "unlocked": false}, {"id": "present", "name": "Data review with the CEO", "pitch": "A thirty-minute meeting with the quarter's numbers.", "pressed": true, "state": "available", "ordered": false, "unlocked": true}, {"id": "call", "name": "Assisted cancellation", "pitch": "Cancellation happens by phone, Monday to Friday, in the morning.", "pressed": false, "state": "unavailable", "ordered": false, "unlocked": false}]}
      onToggle={noop}
    />
  </NightSurface>
);

/** In French, the first quarter with one card ticked (the pause offer) — the rest stay available. */
export const OneChosenFrench = () => (
  <NightSurface as="div" style={box}>
    <Hand
      title="Trimestre 1 · tes deux chantiers"
      count="1 / 2"
      label="Tes actions du trimestre"
      hint="Ton équipe produit peut livrer deux chantiers par trimestre, pas un de plus. Choisis-les : tu verras leur effet à la fin du trimestre."
      orderLabel="Demandé par le DG"
      unlockedLabel="Débloqué par le questionnaire"
      chosenLabel="Choisie"
      production="Rien en production pour l'instant. Le parcours actuel : un bouton, deux clics."
      cards={[{"id": "pdef", "name": "Pause mise en avant", "pitch": "Le bouton principal devient « Mettre en pause ». Résilier passe en lien secondaire.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "pause", "name": "Offre de pause", "pitch": "Trois mois sans prélèvement, proposés une fois sur la page de résiliation.", "pressed": true, "state": "available", "ordered": false, "unlocked": false}, {"id": "bury", "name": "Alléger la page abonnement", "pitch": "Le lien « Résilier » passe dans Paramètres › Compte › Autres options.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "survey", "name": "Questionnaire de sortie", "pitch": "Une question facultative aux abonnés qui résilient.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "cascade", "name": "Offres de rétention", "pitch": "Trois offres successives présentées avant la confirmation.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "onboard", "name": "Chantier onboarding", "pitch": "Retravailler la première semaine des nouveaux abonnés.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "shame", "name": "Bouton de refus personnalisé", "pitch": "Le bouton pour décliner l'offre dit « Non merci, je préfère m'ennuyer ».", "pressed": false, "state": "available", "ordered": false, "unlocked": false}, {"id": "annual", "name": "Offre annuelle", "pitch": "Douze mois pour le prix de dix, sur la page abonnement.", "pressed": false, "state": "available", "ordered": false, "unlocked": false}]}
      onToggle={noop}
    />
  </NightSurface>
);
