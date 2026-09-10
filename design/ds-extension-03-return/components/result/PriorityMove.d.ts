import * as React from "react";

/**
 * The single next action, dashed red on paper. Ext-03: shown on every free result.
 * @startingPoint section="Result" subtitle="visitor · owner (with upgrade) · level" viewport="520x300"
 */
export interface PriorityMoveProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Eyebrow. "Next move" on the free result; "Priority move" once the Deep dive has personalised it. */
  label?: React.ReactNode;
  /** Bottleneck stage the action belongs to. Omit in the level state. */
  pillar?: string;
  score?: number;
  total?: number;
  /**
   * Owner-only Deep dive offer: one line of body text and one secondary Button.
   * Rendered under a dashed rule inside the card. Visitors never receive it.
   */
  upgrade?: React.ReactNode;
  /** The action sentence, verbatim from the action library. */
  children: React.ReactNode;
}

export declare function PriorityMove(props: PriorityMoveProps): JSX.Element;
