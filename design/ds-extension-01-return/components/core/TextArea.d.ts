import * as React from "react";

/**
 * Multi-line text field on paper with a hard 2px edge, no resize handle, and an optional `n/max` mono counter.
 * @startingPoint section="Core" subtitle="Empty, filled, over limit" viewport="640x520"
 */
export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "maxLength" | "style"> {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Soft limit. Past it the counter and border turn red; input is NOT blocked (the server truncates). */
  maxLength?: number;
  /** Format the counter. Default `${n}/${max}`. */
  counterLabel?: (n: number, max: number) => string;
  /** Accessible name when there is no visible <label> — pass the QuestionCard title. */
  label?: string;
  /** id of a visible helper line, joined with the counter in aria-describedby. */
  describedBy?: string;
  /** Wrapper style. */
  style?: React.CSSProperties;
  /** Style on the <textarea> itself. */
  fieldStyle?: React.CSSProperties;
}

export declare function TextArea(props: TextAreaProps): JSX.Element;
