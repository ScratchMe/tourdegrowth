import * as React from "react";

export type Sharpness = "clear" | "shared" | "level";

export interface BottleneckPillar {
  /** Untranslated pillar name, rendered uppercase in the stencil face. */
  pillar: string;
  score: number;
}

/**
 * The stage holding the product back, stamped under the score numeral.
 * Lives inside the score card, below `ScoreDisplay` (which no longer carries `verdict`).
 * @startingPoint section="Result" subtitle="clear · shared · level" viewport="520x420"
 */
export interface BottleneckProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Computed from the gap between the two lowest pillars. Drives how many names show. */
  sharpness?: Sharpness;
  /**
   * The sharpness string, one per state, from the copy library. Uppercase mono,
   * ≤ 32 characters so it holds one line at 390px.
   */
  label: React.ReactNode;
  /** Lowest pillars first. clear reads [0]; shared reads [0] and [1]; level ignores it. */
  pillars?: BottleneckPillar[];
  total?: number;
  /** The verdict sentence from the existing library. Closes the block. */
  verdict?: React.ReactNode;
  size?: "desktop" | "mobile";
  /** roast paints the pillar name --paint-red; nothing else changes. */
  tone?: "straight" | "roast";
}

export declare function Bottleneck(props: BottleneckProps): JSX.Element;
