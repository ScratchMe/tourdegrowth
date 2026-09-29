import { Bottleneck, Card, ScoreDisplay } from "tour-de-growth";

/*
 * Sharpness is the honesty mechanism (design system extension 03, §1): a
 * stage name set in stencil is a claim, and `sharpness` says whether the
 * scores support it. All copy below is the product's own — the three
 * labels from `UI_STRINGS.bottleneck`, the verdicts from the copy library.
 *
 * Never render this block outside the raised score card: it replaces the
 * verdict line that used to float under the numeral, so it reads as the
 * card's second half, not as a standalone banner.
 *
 * Since design I + B (2026-09-28) the score stands in its `lead`, as a
 * kilometre marker: marker on the left, the label and the names beside it,
 * the verdict under both. The name sizes to the room the marker leaves
 * (« ACQUISITION » is the longest), and the row wraps when the names would get under 120px.
 */

const card = { maxWidth: 440 } as const;
const marker = (score: number) => <ScoreDisplay variant="marker" score={score} label="Overall Growth Score" />;

/** `clear` — one stage sits at least four points below the next. One name. */
export const Clear = () => (
  <Card elevation="raised" style={card}>
    <Bottleneck
      lead={marker(74)}
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
    <Bottleneck
      lead={marker(41)}
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
    <Bottleneck
      lead={marker(88)}
      sharpness="level"
      label="Nothing is stalling you"
      verdict="Every stage is holding — it's the whole engine working, not one part carrying the rest."
    />
  </Card>
);

/** `roast` paints the stage name red and changes nothing else. */
export const Roast = () => (
  <Card elevation="raised" style={card}>
    <Bottleneck
      lead={marker(74)}
      sharpness="clear"
      tone="roast"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 8 }]}
      verdict="Not bad for someone whose users leave before the second week."
    />
  </Card>
);

/** `mobile` is the landing preview card's scale — a 140px marker. */
export const Mobile = () => (
  <Card elevation="raised" style={{ maxWidth: 448 }}>
    <Bottleneck
      lead={<ScoreDisplay variant="marker" score={74} label="Overall Growth Score" size="mobile" />}
      size="mobile"
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 8 }]}
      verdict="Solid engine, one flat tyre: retention."
    />
  </Card>
);

/** Without a `lead`, the block stacks under a numeral placed before it — how it read before the marker. */
export const Stacked = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={74} label="Overall Growth Score" />
    <Bottleneck
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 8 }]}
      verdict="Solid engine, one flat tyre: retention."
    />
  </Card>
);
