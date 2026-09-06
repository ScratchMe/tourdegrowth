import * as React from "react";

/** Small mono line stating the limits of the score, with a link to How it works. */
export interface DisclaimerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** center under stacked mobile buttons, left under a desktop button row */
  align?: "left" | "center";
  children?: React.ReactNode;
}

export declare function Disclaimer(props: DisclaimerProps): JSX.Element;
