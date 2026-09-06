import * as React from "react";

/** Switches the result copy between the two written tones. */
export interface ToneToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: "straight" | "roast";
  onChange?: (value: "straight" | "roast") => void;
}

export declare function ToneToggle(props: ToneToggleProps): JSX.Element;
