import { StampedPillar } from "tour-de-growth";

/*
 * Roast mode only, and only ever for the SINGLE lowest-scoring pillar — it
 * replaces that pillar's PillarChip entirely, rotated and stamped in solid
 * red. The second-lowest just switches to the light red `weak` chip.
 *
 * There is no neutral-tone version of this on purpose: it is the one place
 * the product raises its voice, and it stops being a signal if it appears
 * anywhere else.
 */

/** As it ships — the suffix is localized by the caller ("dead last" / "bon dernier"). */
export const Stamped = () => (
  <div style={{ maxWidth: 400, padding: "10px 0" }}>
    <StampedPillar pillar="Retention" score={8} suffix="dead last" />
  </div>
);

/** In French, where the suffix is the only part that changes. */
export const French = () => (
  <div style={{ maxWidth: 400, padding: "10px 0" }}>
    <StampedPillar pillar="Retention" score={8} suffix="bon dernier" />
  </div>
);

/** `total` prints the denominator, as the result screen does. */
export const WithTotal = () => (
  <div style={{ maxWidth: 400, padding: "10px 0" }}>
    <StampedPillar pillar="Activation" score={0} total={20} suffix="dead last" />
  </div>
);
