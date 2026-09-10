import { ModeTag } from "tour-de-growth";

/*
 * Which of the two modes produced this result. It sits in the result header
 * next to the wordmark, and it is a STATE — not a progress read-out, which is
 * why the "Stage 5/5 — finished" line was dropped from that header and this
 * stayed.
 *
 * The word "Deep dive" is not translated: like the AARRR pillar names and the
 * 🔥 roast badge, it is a product label rather than a sentence.
 */

/** `deep` is the only inverted chip in the system — solid ink, paper text. */
export const Deep = () => <ModeTag mode="deep">Deep dive</ModeTag>;

/** `quick` is the recessive dashed outline. */
export const Quick = () => <ModeTag mode="quick">Quick</ModeTag>;

/** Side by side, which is how the contrast reads. */
export const Both = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <ModeTag mode="quick">Quick</ModeTag>
    <ModeTag mode="deep">Deep dive</ModeTag>
  </div>
);
