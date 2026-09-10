import { MetaLabel } from "tour-de-growth";

/*
 * The mono voice of the system — every eyebrow, counter and micro-label on
 * the site is this component. It is not a heading: a section title is a real
 * <h2>, and MetaLabel is the small line above it.
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
 * `wide` (0.12em) is for section eyebrows. `uppercase={false}` is for the rare
 * line read as a sentence rather than scanned as a label.
 */
export const Tracking = () => (
  <div style={row}>
    <MetaLabel size="xs" wide>Strengths</MetaLabel>
    <MetaLabel size="xs" wide>Where you're losing time</MetaLabel>
    <MetaLabel size="xs" uppercase={false}>A quick estimate, not an audit.</MetaLabel>
  </div>
);
