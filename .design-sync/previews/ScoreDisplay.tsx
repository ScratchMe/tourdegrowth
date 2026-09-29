import { Card, ScoreDisplay } from "tour-de-growth";

/*
 * The stencil numeral. This is the single loudest element in the product and
 * there is one per screen, inside a `raised` Card.
 *
 * On a result screen (and the landing's preview of one) it is a kilometre
 * marker since design I + B (2026-09-28): `variant="marker"`, standing in
 * `Bottleneck`'s `lead`, beside the stage that stalls — see the Bottleneck
 * previews for the composition.
 *
 * The little break after the "4" is not a rendering artefact: it is a real
 * stencil break in Stardos Stencil's glyph (verified against the font on its
 * own, outside the app).
 *
 * `animate` (on by default) plays a stamp-in; `animate={false}` kills it, for
 * print and for anything captured as an image. A still shows the settled
 * numeral either way, so there is no separate cell for it.
 */

/** The overall score — `total` defaults to 100, so it is usually left off. */
export const Overall = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={74} label="Overall Growth Score" />
  </Card>
);

/** A single pillar reads out of 20: pass `total={20}`. */
export const Pillar = () => (
  <Card elevation="raised" style={{ maxWidth: 400 }}>
    <ScoreDisplay score={9} total={20} label="Retention" />
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
    <ScoreDisplay score={74} label="Overall Growth Score" size="mobile" />
  </Card>
);

/**
 * `variant="marker"` — the kilometre marker: a red head carrying the label,
 * the figure, the total under a rule, a plinth. Made to stand in
 * `Bottleneck`'s `lead`; shown alone here only to see it.
 */
export const Marker = () => (
  <Card elevation="raised" style={{ maxWidth: 260 }}>
    <ScoreDisplay variant="marker" score={74} label="Overall Growth Score" />
  </Card>
);

/**
 * The marker at the landing preview's scale (140px wide), in French: the
 * label is « Score growth global », `UI_STRINGS.scoreCard.label` as the
 * French landing's preview card prints it.
 */
export const MarkerMobile = () => (
  <Card elevation="raised" style={{ maxWidth: 240 }}>
    <ScoreDisplay variant="marker" score={74} label="Score growth global" size="mobile" />
  </Card>
);
