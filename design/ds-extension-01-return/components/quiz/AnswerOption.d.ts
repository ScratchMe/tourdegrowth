import * as React from "react";

/**
 * One answer in the questionnaire. Never shows its point value — scoring stays invisible.
 * @startingPoint section="Quiz" subtitle="Question card, options, stage progress" viewport="700x380"
 */
export interface AnswerOptionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** desktop = 17px · mobile = 16px. Padding and hit height are identical. */
  size?: "desktop" | "mobile";
}

export declare function AnswerOption(props: AnswerOptionProps): JSX.Element;
