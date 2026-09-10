import * as React from "react";
import { ToneToggle } from "tour-de-growth";

/*
 * Straight up | Roast me 🔥 — a `Segmented` with the roast side painted red.
 * The 🔥 is the ONLY emoji in the whole brand; do not add a second one.
 *
 * Neutral is always the default. Roast is an explicit choice the reader makes,
 * never a state the product picks for them.
 *
 * Its one wiring today is the landing's preview card, where flipping it swaps
 * the sample verdict — a demo you can touch says "there is a roast mode"
 * harder than a line of copy does. It is deliberately NOT on the result
 * screen: that screen shows exactly two calls to action and a third control
 * would reopen a settled decision.
 */

/** Live, at the `compact` scale the landing uses: a 32px track in a 44px hit area. */
export const Compact = () => {
  const [tone, setTone] = React.useState<"straight" | "roast">("straight");
  return <ToneToggle size="compact" value={tone} onChange={setTone} />;
};

/** `md` is the full scale, for a placement with room around it. */
export const Medium = () => {
  const [tone, setTone] = React.useState<"straight" | "roast">("straight");
  return <ToneToggle value={tone} onChange={setTone} />;
};

/** Roast selected — the only red fill this control has. */
export const RoastSelected = () => {
  const [tone, setTone] = React.useState<"straight" | "roast">("roast");
  return <ToneToggle value={tone} onChange={setTone} />;
};

/** Labels are the caller's, already translated — the group name too. */
export const French = () => {
  const [tone, setTone] = React.useState<"straight" | "roast">("straight");
  return (
    <ToneToggle
      size="compact"
      value={tone}
      onChange={setTone}
      straightLabel="Neutre"
      roastLabel="Roast me 🔥"
      groupLabel="Ton"
    />
  );
};
