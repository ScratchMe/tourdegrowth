import * as React from 'react';

/**
 * AnswerSwitch — design system extension 07.
 * The value first; "No figure to hand?" offers the three other answers.
 */
export type OtherAnswer = 'estimate' | 'ask' | 'cant';

export interface AnswerSwitchProps {
  /** "No figure to hand?" / « Pas de chiffre sous la main ? » */
  legend: React.ReactNode;
  /** The three other answers, in this order: I can estimate it · I'll ask for it · I can't find it. */
  options: { value: OtherAnswer; label: React.ReactNode }[];
  /** null: the value boxes. One of the three: its editor. Nothing is chosen by default. */
  answer?: OtherAnswer | null;
  onAnswer?: (answer: OtherAnswer) => void;
  /** The boxes: a FieldRow of NumberFields (numerator over denominator), a single NumberField ("I only have the rate"), or a TextField (a number that is words). With the shared-count hint and the computed result under them. */
  value?: React.ReactNode;
  /** Once a value is typed: "Where does it come from?" (Select) and "The denominator comes from another tool" (Checkbox). */
  source?: React.ReactNode;
  /** The chosen answer's editor: low/high and its basis · role, the request and "Copy the request" · the triage and its repair. */
  editor?: React.ReactNode;
  /** "← I have the figure after all". */
  backLabel: React.ReactNode;
  onBack?: () => void;
  legendId?: string;
}

export declare const AnswerSwitch: React.ComponentType<AnswerSwitchProps>;
