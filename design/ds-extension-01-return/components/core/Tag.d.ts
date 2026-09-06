import * as React from "react";

/** Mono uppercase micro-label for structural markers: pillar numbers, run length, section ids. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** neutral = sunken fill · outline = dashed on paper · ink = solid dark · red = roast/emphasis */
  tone?: "neutral" | "outline" | "ink" | "red";
  children?: React.ReactNode;
}

export declare function Tag(props: TagProps): JSX.Element;
