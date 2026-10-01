import { MetaLabel } from "tour-de-growth";

/*
 * The mono voice of the system — every eyebrow, counter and micro-label on
 * the site is this component. A `div` by default; where the eyebrow IS the
 * section's title, `as="h2"` (or `h3`) makes it the heading a screen reader
 * goes to, and it looks the same (A15.13: the result's sections).
 */

const row = { display: "flex", flexDirection: "column", gap: 10 } as const;

/** The three sizes, largest first. `xs` is the counter and card eyebrow scale. */
export const Sizes = () => (
  <div style={row}>
    <MetaLabel size="md">Overall growth score</MetaLabel>
    <MetaLabel size="sm">Question 3 of 15</MetaLabel>
    <MetaLabel size="xs">Next move</MetaLabel>
  </div>
);

/** `alert` is the only red the mono voice gets — a weak pillar, a counter over its cap. */
export const Tones = () => (
  <div style={row}>
    <MetaLabel tone="ink">Deep dive</MetaLabel>
    <MetaLabel tone="muted">Retention · 8/20</MetaLabel>
    <MetaLabel tone="alert">520/500</MetaLabel>
  </div>
);

/**
 * `wide` (0.12em) is for section eyebrows. The first two are the result's
 * section titles as `ResultView` draws them: `as="h2" wide`, at the default
 * size. `uppercase={false}` is for the rare line read as a sentence rather
 * than scanned as a label.
 */
export const Tracking = () => (
  <div style={row}>
    <MetaLabel as="h2" wide>Strengths</MetaLabel>
    <MetaLabel as="h2" wide>Where you're losing time</MetaLabel>
    <MetaLabel size="xs" uppercase={false}>A quick estimate, not an audit.</MetaLabel>
  </div>
);
