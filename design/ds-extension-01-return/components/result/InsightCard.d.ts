import * as React from "react";

/** One diagnosis paragraph tied to a pillar. Deep dive results only. */
export interface InsightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pillar: string;
  score: number | string;
  total?: number;
  /** strength = paper card · weakness = red wash, solid red edge */
  kind?: "strength" | "weakness";
  children?: React.ReactNode;
}

export declare function InsightCard(props: InsightCardProps): JSX.Element;
