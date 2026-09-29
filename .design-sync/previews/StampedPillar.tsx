import { StampedPillar } from "tour-de-growth";

/*
 * Roast mode only, and only ever for the SINGLE lowest-scoring pillar — it
 * replaces that pillar's PillarChip entirely, rotated and stamped in solid
 * red. The second-lowest just switches to the light red `weak` chip.
 *
 * There is no neutral-tone version of this on purpose: it is the one place
 * the product raises its voice, and it stops being a signal if it appears
 * anywhere else.
 *
 * The score prints over 20 on its own — `total` defaults to 20 and no screen
 * passes anything else. The board is 20 · 13 · 9 · 16 · 16, one the quiz can
 * produce, whose lowest stage is retention at 9.
 */

/** As it ships — the suffix is `UI_STRINGS.result.stampedSuffix`, localized by the caller ("dead last"). */
export const Stamped = () => (
  <div style={{ maxWidth: 400, padding: "10px 0" }}>
    <StampedPillar pillar="Retention" score={9} suffix="dead last" />
  </div>
);

/** In French, where the suffix is the only part that changes ("bon dernier"): pillar names stay in English on French screens. */
export const French = () => (
  <div style={{ maxWidth: 400, padding: "10px 0" }}>
    <StampedPillar pillar="Retention" score={9} suffix="bon dernier" />
  </div>
);
