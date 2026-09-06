import * as React from "react";

/**
 * The overall score, set in stencil display type with the spray texture over it.
 * @startingPoint section="Result" subtitle="Score, pillar chips, insight cards" viewport="700x340"
 */
export interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number | string;
  /** Denominator. 100 for the overall score, 20 for a pillar. */
  total?: number;
  /** Mono eyebrow, e.g. "Overall Growth Score". */
  label?: React.ReactNode;
  /** One-line verdict from the copy library — never generated ad hoc. */
  verdict?: React.ReactNode;
  size?: "desktop" | "mobile";
  /** Stamp-in animation. Disable for OG images and print. */
  animate?: boolean;
}

export declare function ScoreDisplay(props: ScoreDisplayProps): JSX.Element;
