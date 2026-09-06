import * as React from "react";

/** Marks which run the user is in: the 15-question Quick tour or the 10-question Deep dive. */
export interface ModeTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** "quick" = dashed outline, recessive · "deep" = solid ink, the only inverted chip in the system */
  mode?: "quick" | "deep";
  /** Override the label. Defaults to "Quick" / "Deep dive". */
  children?: React.ReactNode;
}

export declare function ModeTag(props: ModeTagProps): JSX.Element;
