import * as React from 'react';

/** What a Field hands the control it wraps. */
export interface FieldControlProps {
  /** The control's id: the <label for> already points at it. */
  id: string;
  /** The label's id, for a control named by aria-labelledby (Segmented). */
  labelId: string;
  /** Message, hint and count ids, in reading order. Put it on the control. */
  describedBy: string | undefined;
  status: 'invalid' | 'missing' | undefined;
  invalid: boolean;
}

/**
 * Field — design system extension 04.
 * The visible label, the hint and the message around one control, or the
 * legend around a group (`group`). Every control in a form gets its visible
 * label from a Field.
 */
export interface FieldProps {
  /** Visible label, a sentence in sentence case. Required: an accessible name alone is not enough in a form. */
  label: React.ReactNode;
  /** Quiet line under the control: what to type, where it goes. */
  hint?: React.ReactNode;
  /** Invalid: what was typed cannot be saved as it is. Red rule + message, the edge turns 3px red. Wins over `missing`. */
  error?: React.ReactNode;
  /** Still to fill in, but the form saves anyway (the audit's "flagged as incomplete"). Dashed edge + message. */
  missing?: React.ReactNode;
  /** The word for "optional", localized ("optional" / "facultatif"). Its presence marks the field optional; required fields carry no mark. */
  optional?: string;
  /** The soft-limit count in the label row. TextField fills it in; pass it yourself only around a custom control. */
  counter?: { count: number; max: number; over?: boolean; label?: string };
  /** `md` (default): one question, 48px control, legend as the question. `sm`: a sheet of fields, 44px control. */
  size?: 'sm' | 'md';
  /** `fill` (default) fills the column; `content` sizes to the content (numbers, currencies). */
  fit?: 'fill' | 'content';
  /** A fieldset with a legend, for radios, checkboxes, a date in parts. */
  group?: boolean;
  id?: string;
  labelId?: string;
  className?: string;
  children: React.ReactNode | ((props: FieldControlProps) => React.ReactNode);
}

export declare const Field: React.ComponentType<FieldProps>;
