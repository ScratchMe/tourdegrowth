import * as React from "react";

/** Inline "?" affordance marking a jargon term that has a glossary entry. */
export interface DefinitionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The term being defined — used verbatim in the accessible label. */
  term: string;
  /** Whether its popover is currently open. Drives aria-expanded and the darker outline. */
  open?: boolean;
  /** Match the surrounding text colour: muted on paper, alert inside a red wash chip. */
  tone?: "muted" | "ink" | "alert";
}

export declare function DefinitionTrigger(props: DefinitionTriggerProps): JSX.Element;
