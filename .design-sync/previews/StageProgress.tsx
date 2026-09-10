import { StageProgress } from "tour-de-growth";

/*
 * Five segments, one per AARRR stage. It is a real `role="progressbar"` with
 * a name the caller supplies: the segments carry no text of their own, so
 * without `aria-label` this announces as an unnamed bar (REVIEW.md R-19).
 *
 * The current segment pulses in CSS. That is the only motion on the quiz
 * screen and it is what tells a reader the bar is live rather than decorative.
 */

const wrap = { maxWidth: 560 } as const;

/** Partway through — segments before the current one are filled. */
export const InProgress = () => (
  <div style={wrap}>
    <StageProgress current={3} total={5} aria-label="Stage 3 of 5" />
  </div>
);

/** With the mono caption underneath, which is how the quiz ships it. */
export const WithLabel = () => (
  <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 22 }}>
    <StageProgress current={1} total={5} label="Stage 1 of 5" aria-label="Stage 1 of 5" />
    <StageProgress current={3} total={5} label="Stage 3 of 5" aria-label="Stage 3 of 5" />
    <StageProgress current={5} total={5} label="Stage 5 of 5" aria-label="Stage 5 of 5" />
  </div>
);

/**
 * The deep dive runs ten questions over the same five segments, so its
 * caption counts questions rather than stages.
 */
export const DeepDive = () => (
  <div style={wrap}>
    <StageProgress
      current={2}
      total={5}
      label="Deep dive · Question 3 of 10"
      aria-label="Deep dive, question 3 of 10"
    />
  </div>
);

/** `mobile` is the narrow scale. */
export const Mobile = () => (
  <div style={{ maxWidth: 320 }}>
    <StageProgress current={2} total={5} size="mobile" label="Stage 2 of 5" aria-label="Stage 2 of 5" />
  </div>
);
