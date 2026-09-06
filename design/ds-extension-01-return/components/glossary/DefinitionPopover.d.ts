import * as React from "react";

/**
 * The definition itself, in a 5px-shadow panel. One open at a time, app-wide.
 * @startingPoint section="Glossary" subtitle="Trigger states and both popover placements" viewport="700x300"
 */
export interface DefinitionPopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  term: string;
  definition: React.ReactNode;
  /** anchored = under the trigger, 280px max (desktop) · docked = full-width at the bottom (mobile) */
  placement?: "anchored" | "docked";
  /** Required for docked placement, which shows an explicit ✕. */
  onClose?: () => void;
}

export declare function DefinitionPopover(props: DefinitionPopoverProps): JSX.Element;
