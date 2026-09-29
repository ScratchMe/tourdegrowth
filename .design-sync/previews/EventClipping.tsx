import { EventClipping, NightSurface } from "tour-de-growth";

/*
 * A public event of the quarter, as the outside world printed it: a paper
 * clipping, slightly tilted, nested inside the night. `data-world="paper"`
 * rebinds the tokens back to paper, so the press reads on paper while the
 * dashboard stays dark — the dashboard hides the cost, the press shows it
 * first. Mastheads and handles are fictional, except SignalConso, the
 * public platform the event names. The tilt is static, so it stays under
 * reduced motion.
 *
 * Each cell is the clippings of one real quarter, exactly as the island
 * builds them (`reportContent().clippings`) from a reference year, stacked
 * in the report's main column (600px). An inspection and the complaints that
 * announce one always carry their `why`; the rubber stamp only lands on the
 * end-of-quarter news screen and is left off here. Copy:
 * content/game/retention.ts (`events`, `clippings`).
 */

const col = { padding: 24, maxWidth: 648, display: "flex", flexDirection: "column", gap: 20 } as const;

/**
 * Reference year C, third quarter: the inspection. The fine is the model's
 * (60,000 + 500 per radar point: €106,000 at radar 92), the leavers too, and
 * the `why` names every trick in production when it fell. A viral thread
 * lands the same quarter.
 */
export const Inspection = () => (
  <NightSurface as="div" style={col}>
    <EventClipping
      kind="control"
      masthead="The Business Courier"
      headline="Flixo caught out by the French consumer watchdog"
      text="An inspection by the DGCCRF, France's consumer protection authority, an article in the press, a fine of €106,000. The CEO asks you to take everything down by Friday. 1,400 subscribers leave on the spot, and tell everyone why."
      why={{"heading": "Why this inspection", "lines": ["Every trick you put into production pushed up the regulator radar, the hidden tile on your dashboard. This quarter it crossed the inspection threshold.", "In production when the inspectors came: \"Pause up front\", \"Declutter the subscription page\", \"Assisted cancellation\", \"Retention offers\", \"Social proof at exit\" and \"Contractual notice\". All of it is taken down on the spot, and its effect stops."]}}
    />
    <EventClipping
      kind="viral"
      handle="@endless_evening"
      text="A viral thread: \"I tried to cancel Flixo, here are my three hours.\" Cancellations speed up."
    />
  </NightSurface>
);

/**
 * Reference year C, second quarter: the warning before the inspection —
 * complaints on SignalConso (with what they signal), a viral thread, and the
 * competitor's spring offer that every year meets in Q2.
 */
export const Warnings = () => (
  <NightSurface as="div" style={col}>
    <EventClipping
      kind="reports"
      masthead="SignalConso"
      headline="Complaints against Flixo pile up"
      text="Dozens of complaints on SignalConso, the French government's consumer reporting site. A journalist is asking the press office questions."
      why={{"heading": "What it signals", "lines": ["The authorities read SignalConso: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer."]}}
    />
    <EventClipping
      kind="viral"
      handle="@endless_evening"
      text="A viral thread: \"I tried to cancel Flixo, here are my three hours.\" Cancellations speed up."
    />
    <EventClipping
      kind="competitor"
      masthead="The Streaming Letter"
      headline="A price offensive in the spring"
      text="A competitor launched an aggressive offer in the spring. Everyone lost subscribers this quarter, you included."
    />
  </NightSurface>
);

/** The one kind article: reference year A, fourth quarter, trust past 80. */
export const Press = () => (
  <NightSurface as="div" style={col}>
    <EventClipping
      kind="press"
      masthead="The Screen Echo"
      headline="Flixo, the app that lets you leave"
      text="An article: \"Flixo, the app that lets its subscribers leave, and sees them come back.\" Sign-ups climb."
    />
  </NightSurface>
);

/** The inspection in French (same quarter as Inspection): digit groups and the fine carry U+00A0. */
export const French = () => (
  <NightSurface as="div" style={col}>
    <EventClipping
      kind="control"
      masthead="Le Courrier de l'éco"
      headline="Flixo épinglé par la répression des fraudes"
      text="Contrôle de la DGCCRF, article dans la presse, amende de 106 000 €. Le DG te demande de tout retirer avant vendredi. 1 400 abonnés partent dans la foulée, en le racontant."
      why={{"heading": "Pourquoi ce contrôle", "lines": ["Chaque astuce mise en production a fait monter le radar DGCCRF, la tuile masquée de ton tableau de bord. Ce trimestre, il a franchi le seuil du contrôle.", "En production au moment du contrôle : « Pause mise en avant », « Alléger la page abonnement », « Résiliation accompagnée », « Offres de rétention », « Preuve sociale en sortie » et « Préavis contractuel ». Tout est retiré d'office, et leur effet s'arrête."]}}
    />
  </NightSurface>
);
