import * as React from "react";

/** Wraps one question in the screen's single raised card. */
export interface QuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** desktop = 28px question in 30px 32px padding · mobile = 22px in 22px 20px */
  size?: "desktop" | "mobile";
  /** Question text. May contain an inline DefinitionTrigger. */
  children?: React.ReactNode;
}

export declare function QuestionCard(props: QuestionCardProps): JSX.Element;
