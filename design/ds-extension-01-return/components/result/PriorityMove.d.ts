import * as React from "react";

/** The one action to take next. Exactly one per result screen. */
export interface PriorityMoveProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Eyebrow text. "Priority move" / "Action prioritaire". */
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export declare function PriorityMove(props: PriorityMoveProps): JSX.Element;
