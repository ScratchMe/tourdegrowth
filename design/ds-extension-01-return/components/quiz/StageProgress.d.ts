import * as React from "react";

/** Progress through the five pillars, drawn as road markings rather than a bar. */
export interface StageProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 1-based index of the pillar in progress. */
  current?: number;
  /** Segment count. Always 5 in production — one per AARRR pillar. */
  total?: number;
  size?: "desktop" | "mobile";
  /** Mono caption below, e.g. "Deep dive · Question 3 of 10 — Activation". */
  label?: React.ReactNode;
}

export declare function StageProgress(props: StageProgressProps): JSX.Element;
