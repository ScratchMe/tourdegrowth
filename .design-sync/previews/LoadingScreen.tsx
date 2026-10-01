import { LoadingScreen } from "tour-de-growth";

/*
 * The wait. Two variants, and the difference is how long the wait actually is
 * — which is the whole reason the prop exists.
 *
 * `quick` has nothing left to narrate: scoring and the verdict lookup are
 * synchronous, so the screen exists only to keep the transition from
 * flickering (one message, a ~300ms floor).
 *
 * `deep` is a real Gemini call — measured between 9 and 70 seconds for four
 * generations, with nothing reporting progress before the answer. So it
 * tells the wait by the clock (2026-10-01): one message that is true for the
 * whole wait, a bar that follows the time spent against the usual minute and
 * slows without ever filling, the time spent beside it, and after five
 * seconds the line that this is expected. Only the response ends the wait.
 * The placeholder numeral breathes and an ellipsis cycles so a long wait
 * still looks alive rather than hung. A preview shows its first instant.
 */

const frame = { maxWidth: 560, minHeight: 260 } as const;

/** The long one, which is the interesting one. */
export const Deep = () => (
  <div style={frame}>
    <LoadingScreen locale="en" variant="deep" />
  </div>
);

/** The short one. */
export const Quick = () => (
  <div style={frame}>
    <LoadingScreen locale="en" variant="quick" />
  </div>
);

/** In French — the message is copy, so it changes length. */
export const French = () => (
  <div style={frame}>
    <LoadingScreen locale="fr" variant="deep" />
  </div>
);
