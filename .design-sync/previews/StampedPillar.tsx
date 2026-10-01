import { StageScore, StageScores, StampedPillar } from "tour-de-growth";

/*
 * Roast mode only, and only ever for the SINGLE lowest-scoring stage: in a
 * roast it leaves the score sheet as a stamp, "RETENTION · 9/20 · DEAD LAST",
 * inked across its own row of StageScores (it renders an <li>). The
 * second-lowest takes the red `alert` row.
 *
 * Redrawn by design system extension 05: an inked rubber stamp — red ink on
 * the wash, a 3px solid red edge, soft 4px corners, a degree askew. It used
 * to be a red-FILLED pill, the primary action's red. It keeps its exception:
 * no meter, capitals, the tilt. There is no neutral-tone version: it is the
 * one place the product raises its voice.
 *
 * The board is 20 · 13 · 9 · 16 · 16, one the quiz can produce, whose lowest
 * stage is retention at 9.
 */

/** As it ships, in its row of the sheet — the suffix is `UI_STRINGS.result.stampedSuffix` ("dead last"). */
export const Stamped = () => (
  <div style={{ maxWidth: 420 }}>
    <StageScores label="Score per stage, out of 20">
      <StageScore stage="Activation" score={13} tone="alert" />
      <StampedPillar pillar="Retention" score={9} suffix="dead last" />
      <StageScore stage="Referral" score={16} />
    </StageScores>
  </div>
);

/** In French, where the suffix is the only part that changes ("bon dernier"): stage names stay in English on French screens. */
export const French = () => (
  <div style={{ maxWidth: 420 }}>
    <StageScores label="Score par étape, sur 20">
      <StampedPillar pillar="Retention" score={9} suffix="bon dernier" />
    </StageScores>
  </div>
);
