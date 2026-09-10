import { Bottleneck, Card, ScoreDisplay } from "tour-de-growth";

/*
 * Sharpness is the honesty mechanism (design system extension 03, §1): a
 * stage name set in 36px stencil is a claim, and `sharpness` says whether
 * the scores support it. All copy below is the product's own — the three
 * labels from `UI_STRINGS.bottleneck`, the verdicts from the copy library.
 *
 * Never render this block outside the raised score card: it replaces the
 * verdict line that used to float under the numeral, so it reads as the
 * card's second half, not as a standalone banner.
 */

const card = { maxWidth: 400 } as const;

/** `clear` — one stage sits at least four points below the next. One name. */
export const Clear = () => (
  <Card elevation="raised" style={card}>
    <ScoreDisplay score={74} label="Overall growth score" />
    <Bottleneck
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 8 }]}
      verdict="Solid engine, one flat tyre: retention."
    />
  </Card>
);

/**
 * `shared` — the bottom of the board is crowded, so every tied stage is
 * named at the same size. The label carries the count, never the word "two":
 * with three answer options a pillar score can only land on nine values, so
 * three-way ties are unremarkable.
 */
export const Shared = () => (
  <Card elevation="raised" style={card}>
    <ScoreDisplay score={41} label="Overall growth score" />
    <Bottleneck
      sharpness="shared"
      label="3 stages holding you back"
      pillars={[
        { pillar: "Activation", score: 7 },
        { pillar: "Retention", score: 7 },
        { pillar: "Referral", score: 9 },
      ]}
      verdict="Solid engine overall, but activation is the main brake left to release."
    />
  </Card>
);

/** `level` — every pillar is in the strong band, so no stage is named at all. */
export const Level = () => (
  <Card elevation="raised" style={card}>
    <ScoreDisplay score={88} label="Overall growth score" />
    <Bottleneck
      sharpness="level"
      label="Nothing is stalling you"
      verdict="Every stage is holding — it's the whole engine working, not one part carrying the rest."
    />
  </Card>
);

/** `roast` paints the stage name red and changes nothing else. */
export const Roast = () => (
  <Card elevation="raised" style={card}>
    <ScoreDisplay score={74} label="Overall growth score" />
    <Bottleneck
      sharpness="clear"
      tone="roast"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 8 }]}
      verdict="Not bad for someone whose users leave before the second week."
    />
  </Card>
);

/** `mobile` is the landing preview card's scale — 30px name instead of 36px. */
export const Mobile = () => (
  <Card elevation="raised" style={{ maxWidth: 320 }}>
    <ScoreDisplay score={74} label="Overall growth score" size="mobile" />
    <Bottleneck
      size="mobile"
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 8 }]}
      verdict="Solid engine, one flat tyre: retention."
    />
  </Card>
);
