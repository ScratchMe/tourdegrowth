import { Bottleneck, Card, ScoreDisplay } from "tour-de-growth";

/*
 * Sharpness is the honesty mechanism (design system extension 03, §1): a
 * stage name set in stencil is a claim, and `sharpness` says whether the
 * scores support it.
 *
 * Every board below is one the quiz can produce (a pillar lands on
 * 0, 2, 5, 7, 9, 11, 13, 16 or 20) and was run through the real
 * `resolveBottleneck` and `buildQuickVerdict`. The labels are
 * `UI_STRINGS.bottleneck`; each verdict is the line `buildQuickVerdict`
 * returns for that board — `SUMMARY_HEADLINES[weakest stage][band of the
 * other four][tone]`, or `LEVEL_HEADLINE` when nothing is behind.
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

/**
 * `clear` — one stage sits at least four points below the next. One name.
 * Board 20 · 13 · 9 · 16 · 16 = 74: retention 9 is four under activation 13,
 * and the other four are not all strong, so the verdict is retention's
 * « mixed » line.
 */
export const Clear = () => (
  <Card elevation="raised" style={card}>
    <Bottleneck
      lead={marker(74)}
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 9 }]}
      verdict="Retention is lagging, and the rest of the engine isn't solid enough to cover for it."
    />
  </Card>
);

/**
 * `shared` — the bottom of the board is crowded, so every stage within four
 * points of the lowest is named, at the same size. Board 16 · 7 · 7 · 9 · 11
 * = 50: activation, retention and referral are named; revenue 11 is four
 * above and is not. The label carries the count, never the word "two".
 * The verdict is keyed by the weakest stage (activation, first of the tie in
 * AARRR order) and never counts stages, so it stays true under three names.
 */
export const Shared = () => (
  <Card elevation="raised" style={card}>
    <Bottleneck
      lead={marker(50)}
      sharpness="shared"
      label="3 stages holding you back"
      pillars={[
        { pillar: "Activation", score: 7 },
        { pillar: "Retention", score: 7 },
        { pillar: "Referral", score: 9 },
      ]}
      verdict="Activation is behind, and the rest isn't solid enough to make up for what happens at the door."
    />
  </Card>
);

/** `level` — every pillar is in the strong band (16 · 20 · 16 · 20 · 16 = 88), so no stage is named at all. */
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

/** `roast` paints the stage name red and changes nothing else; the verdict is the same board's roast line. */
export const Roast = () => (
  <Card elevation="raised" style={card}>
    <Bottleneck
      lead={marker(74)}
      sharpness="clear"
      tone="roast"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 9 }]}
      verdict="Retention is freewheeling, and the rest of the engine isn't pushing hard enough to carry it."
    />
  </Card>
);

/** `mobile` is the landing preview card's scale — a 140px marker. Same board as `Clear`. */
export const Mobile = () => (
  <Card elevation="raised" style={{ maxWidth: 448 }}>
    <Bottleneck
      lead={<ScoreDisplay variant="marker" score={74} label="Overall Growth Score" size="mobile" />}
      size="mobile"
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 9 }]}
      verdict="Retention is lagging, and the rest of the engine isn't solid enough to cover for it."
    />
  </Card>
);

/** Without a `lead`, the block stacks under a numeral placed before it — how it read before the marker. Same board as `Clear`. */
export const Stacked = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={74} label="Overall Growth Score" />
    <Bottleneck
      sharpness="clear"
      label="One stage holding you back"
      pillars={[{ pillar: "Retention", score: 9 }]}
      verdict="Retention is lagging, and the rest of the engine isn't solid enough to cover for it."
    />
  </Card>
);
