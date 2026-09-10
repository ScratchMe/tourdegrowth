import { LoadingScreen } from "tour-de-growth";

/*
 * The wait. Two variants, and the difference is how long the wait actually is
 * — which is the whole reason the prop exists.
 *
 * `quick` has nothing left to narrate: scoring and the verdict lookup are
 * synchronous, so the screen exists only to keep the transition from
 * flickering (one message, a ~300ms floor).
 *
 * `deep` is a real Gemini call — measured around 70 seconds for four
 * generations. Its three messages run once at 2.6s each and then it holds an
 * open-ended "still working" state indefinitely: never a fixed timeout, since
 * only the response can end the wait. The placeholder numeral breathes and an
 * ellipsis cycles so a long wait still looks alive rather than hung.
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

/** In French — the rotating messages are copy, so they change length. */
export const French = () => (
  <div style={frame}>
    <LoadingScreen locale="fr" variant="deep" />
  </div>
);
