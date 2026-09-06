import * as React from "react";

/** A pillar score, e.g. "08/20 Retention". Five per result screen, in AARRR order. */
export interface PillarChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Pillar name. Kept in English on French screens, matching content/glossary.js. */
  pillar: string;
  score: number | string;
  total?: number;
  /** Marks the lowest-scoring pillar: red wash, red dashed edge. At most one. */
  weak?: boolean;
  size?: "desktop" | "mobile";
  /** Slot for an inline DefinitionTrigger. */
  children?: React.ReactNode;
}

export declare function PillarChip(props: PillarChipProps): JSX.Element;
