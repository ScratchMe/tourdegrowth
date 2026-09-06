import * as React from "react";

/**
 * Paper surface with a hard 2px edge and, when raised, an unblurred offset shadow.
 * @startingPoint section="Core" subtitle="Elevation and tone matrix" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** raised = 7px shadow, one per screen · panel = 5px, popovers · flat = no shadow */
  elevation?: "raised" | "panel" | "flat";
  /** paper = default · sunken = recessed example block · alert = red wash · outlineAlert = dashed red on paper */
  tone?: "paper" | "sunken" | "alert" | "outlineAlert";
  /** CSS padding override. Defaults to 26px 30px; use 20px on mobile. */
  padding?: string;
}

export declare function Card(props: CardProps): JSX.Element;
