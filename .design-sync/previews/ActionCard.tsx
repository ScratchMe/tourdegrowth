import { ActionCard, NightSurface } from "tour-de-growth";

/*
 * One action of the quarter's hand — a toggle button (`aria-pressed`) in the
 * system's one selection language: ticked is the inverse fill with its own
 * text, amber with the night as ink at night — the same state as a quiz
 * answer, in another world. Nothing on a card says what it pays: a name and a
 * mechanical sentence, never a figure, a sign or an arrow.
 *
 * Why a card cannot be ticked is two different things, drawn differently:
 * `locked` (the CEO is still talking: disabled, full contrast, because the
 * hand is read WHILE he talks) and `unavailable` (two are already ticked:
 * muted, out of the round). Copy: content/game/retention.ts.
 */

const grid = { padding: 20, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 260px))", gap: 12 } as const;
const noop = () => {};

/** The four states side by side. The word "Chosen" says a card is ticked — never the colour alone. */
export const States = () => (
  <NightSurface as="div" style={grid}>
    <ActionCard
      id="pause"
      name="Pause offer"
      pitch="Three months with no charge, offered once on the cancellation page."
      pressed={false}
      state="available"
      chosenLabel="Chosen"
      onToggle={noop}
    />
    <ActionCard
      id="survey"
      name="Exit survey"
      pitch="One optional question for subscribers who cancel."
      pressed
      state="available"
      chosenLabel="Chosen"
      onToggle={noop}
    />
    <ActionCard
      id="pdef"
      name="Pause up front"
      pitch={'The main button becomes "Pause". Cancel moves to a secondary link.'}
      pressed={false}
      state="locked"
      orderLabel="Requested by the CEO"
      chosenLabel="Chosen"
      onToggle={noop}
    />
    <ActionCard
      id="remind"
      name="Pre-billing reminder"
      pitch="An email three days before each renewal."
      pressed={false}
      state="unavailable"
      chosenLabel="Chosen"
      onToggle={noop}
    />
  </NightSurface>
);

/** The CEO's order, ticked: his badge and the "Chosen" word share the top row. In French. */
export const OrderedFrench = () => (
  <NightSurface as="div" style={{ padding: 20, maxWidth: 300 }}>
    <ActionCard
      id="call"
      name="Résiliation accompagnée"
      pitch="La résiliation se fait par téléphone, du lundi au vendredi, le matin."
      pressed
      state="available"
      orderLabel="Demandé par le DG"
      chosenLabel="Choisie"
      onToggle={noop}
    />
  </NightSurface>
);
