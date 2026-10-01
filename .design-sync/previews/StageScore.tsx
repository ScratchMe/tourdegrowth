import { DefinitionTrigger, StageScore, StageScores } from "tour-de-growth";

/*
 * One stage's score as a row of the score sheet: "18/20 Acquisition ?". A
 * value, not an action — no box, no radius, no edge all round, no hover on
 * the row. It renders an <li>, so it always sits in a StageScores list (one
 * row per story here, to show its parts). The only thing to touch is the
 * « ? » (a GlossaryTerm in the product; its trigger alone here), or on the
 * landing the stage name when `href` makes it a link.
 *
 * The figure prints as given ("8", not "08"), set right in tabular figures so
 * 8/20 sits under 18/20. Scores are /r/sample's (lib/submissions/sample.ts).
 */

/** A neutral row: figure in body ink, "/20" and the name in the row's muted ink, the meter in ink. */
export const Neutral = () => (
  <div style={{ maxWidth: 420 }}>
    <StageScores label="Score per stage, out of 20">
      <StageScore stage="Acquisition" score={18}>
        <DefinitionTrigger term="Acquisition" label="Definition: Acquisition" tone="muted" />
      </StageScore>
    </StageScores>
  </div>
);

/** `tone="alert"`, the stage that stalls: a red wash, a solid 3px red rule down its start edge, the name at 600, the « ? » in the alert tone. Never dashed — dashed red is advice. */
export const Alert = () => (
  <div style={{ maxWidth: 420 }}>
    <StageScores label="Score per stage, out of 20">
      <StageScore stage="Retention" score={8} tone="alert">
        <DefinitionTrigger term="Retention" label="Definition: Retention" tone="alert" />
      </StageScore>
    </StageScores>
  </div>
);

/** `href` + `linkLabel` (the landing only): the stage name is the link, underlined in the row's ink, never the red --text-link. Never with a « ? » on the same row. */
export const Linked = () => (
  <div style={{ maxWidth: 380 }}>
    <StageScores size="sm" label="Score per stage, out of 20">
      <StageScore stage="Activation" score={12} href="/en/glossary/activation" linkLabel="Activation — definition" />
    </StageScores>
  </div>
);
