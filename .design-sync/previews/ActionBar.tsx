import { ActionBar, NightSurface } from "tour-de-growth";

/*
 * The quarter's one action, under the hand. What these cards show is the
 * DESKTOP form: the primary button full width. It carries no hint: the hand's
 * header already says what happens next, at every width. On a phone viewport
 * (under 760px) the same component becomes a bar stuck to the bottom of the
 * screen and adds the counter and the clicks pill — that form depends on the viewport, not on the card width, so this
 * canvas cannot draw it; `count` and `clicks` are passed here only because
 * the contract requires them. "Run the quarter" is enabled only with
 * exactly two cards ticked and the call closed — the island decides
 * `canRun`, the bar only draws it.
 */

const noop = () => {};
const box = { padding: 20, maxWidth: 720 } as const;

/** Ready: two cards ticked, the call closed — the primary button live. */
export const Ready = () => (
  <NightSurface as="div" style={box}>
    <ActionBar
      count="2 / 2"
      clicks={{ text: "2 clicks to cancel", alert: false }}
      runLabel="Run the quarter"
      canRun
      onRun={noop}
    />
  </NightSurface>
);

/** Not ready: one card of two, so the button is disabled (the hand header says what is missing). */
export const NotReady = () => (
  <NightSurface as="div" style={box}>
    <ActionBar
      count="1 / 2"
      clicks={{ text: "6 clicks to cancel", alert: true }}
      runLabel="Run the quarter"
      canRun={false}
      onRun={noop}
    />
  </NightSurface>
);

/** In French. */
export const French = () => (
  <NightSurface as="div" style={box}>
    <ActionBar
      count="2 / 2"
      clicks={{ text: "5 clics pour résilier", alert: true }}
      runLabel="Lancer le trimestre"
      canRun
      onRun={noop}
    />
  </NightSurface>
);
