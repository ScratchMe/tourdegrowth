import { ActionCard, NightSurface } from "tour-de-growth";

/*
 * One action of the quarter's hand — a toggle button (`aria-pressed`) in the
 * system's one selection language: ticked is the inverse fill with its own
 * text, amber with the night as ink at night — the same state as a quiz
 * answer, in another world. Nothing on a card says what it pays: a name and a
 * mechanical sentence, never a figure, a sign or an arrow.
 *
 * Why a card cannot be ticked is two different things, drawn differently:
 * `unavailable` (two are already ticked: muted, out of the round) and
 * `locked` (disabled at full contrast). `locked` was the hand while the CEO
 * talked; since 2026-09-25 the hand only appears once the call is hung up
 * (lib/game/phases.ts `handVisible`), so the level no longer draws it — it
 * stays in the contract, and is shown here so it is recognised, not copied.
 * Props are what `Hand` passes for one card of `handView` (the badge's label
 * only when the card is `ordered`). Copy: content/game/retention.ts. Cards
 * are 294px wide, the width of one column of the hand in the desk's 600px
 * column.
 */

const grid = { padding: 20, display: "grid", gridTemplateColumns: "repeat(2, 294px)", gap: 12 } as const;
const noop = () => {};

/**
 * The four states side by side: available, ticked (the word "Chosen" says it
 * — never the colour alone), `locked` with the CEO's badge (contract only, see
 * above), and `unavailable`. Each card is one `handView` returns in
 * reference year A (`PATH_A`): the pause offer and the exit survey from the
 * first quarter's hand with the survey ticked, the pre-billing reminder once
 * the pause offer is ticked too, and "Pause up front" from the second
 * quarter while the CEO is still on the call (`locked`; it is his order,
 * hence the badge).
 */
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

/**
 * The CEO's order, ticked, in French — reference year C's second quarter
 * (`PATH_C`, `handView` with the card ticked), where he asks for the
 * phone-only cancellation and gets it. On a ticked card
 * the red badge turns into an outline in the selection's ink. At the hand's
 * real card width (294px) his badge and "Choisie" share the top row; the row
 * is `flex-wrap`, so on a narrower card the word drops under the badge
 * rather than overflowing.
 */
export const OrderedFrench = () => (
  <NightSurface as="div" style={{ padding: 20, width: 334 }}>
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
