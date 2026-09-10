import * as React from "react";

/**
 * The 1200×630 og:image, rendered by Satori (not a browser). Flexbox only, hex constants only.
 * @startingPoint section="Share" subtitle="neutral · roast" viewport="1200x630"
 */
export interface ShareImageProps {
  score: number;
  total?: number;
  /** Bottleneck stage. Omit in the level state — the move card then shows the label alone. */
  pillar?: string;
  pillarScore?: number;
  pillarTotal?: number;
  /** The action sentence, verbatim. Up to 144 characters: five lines at 28px in the 490px card. */
  action: string;
  /** Existing two-line hook, unchanged: "Retention is where this growth stalls." / "Where does yours?" */
  hookLine1: string;
  hookLine2: string;
  labelScore?: string;
  labelMove?: string;
  /** roast: 6px red border + "🔥 ROAST MODE" badge instead of the dashed tag. */
  tone?: "straight" | "roast";
  tag?: string;
  url?: string;
}

export declare function ShareImage(props: ShareImageProps): JSX.Element;
