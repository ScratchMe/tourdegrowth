import * as React from "react";

/** Every small mono line in the product: eyebrows, question counters, disclaimers, captions. */
export interface MetaLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "md" | "sm" | "xs";
  tone?: "muted" | "ink" | "alert";
  /** Uppercase + tracking. Set false for anything read as a sentence. */
  uppercase?: boolean;
  /** Wider tracking (0.12em) for section eyebrows like "Strengths". */
  wide?: boolean;
  children?: React.ReactNode;
}

export declare function MetaLabel(props: MetaLabelProps): JSX.Element;
