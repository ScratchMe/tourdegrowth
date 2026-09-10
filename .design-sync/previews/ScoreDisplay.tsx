import { Card, ScoreDisplay } from "tour-de-growth";

/*
 * The stencil numeral. This is the single loudest element in the product and
 * there is one per screen — it always sits at the top of a `raised` Card, and
 * on a result screen the Bottleneck block goes directly under it inside the
 * same card.
 *
 * The little break after the "4" is not a rendering artefact: it is a real
 * stencil break in Stardos Stencil's glyph (verified against the font on its
 * own, outside the app).
 */

/** The overall score — `total` defaults to 100, so it is usually left off. */
export const Overall = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={74} label="Overall growth score" />
  </Card>
);

/** A single pillar reads out of 20. */
export const Pillar = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={8} total={20} label="Retention" />
  </Card>
);

/**
 * `size="mobile"` is the explicit small scale — used once, for the landing's
 * preview card, which is deliberately smaller than the real result screen.
 * The desktop size already shrinks itself below 760px in pure CSS, so you
 * only pass this to force the small scale on a wide viewport.
 */
export const Mobile = () => (
  <Card elevation="raised" style={{ maxWidth: 320 }}>
    <ScoreDisplay score={74} label="Overall growth score" size="mobile" />
  </Card>
);

/** `animate={false}` kills the stamp-in — for print, and for anything captured as an image. */
export const NoAnimation = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={41} label="Overall growth score" animate={false} />
  </Card>
);
