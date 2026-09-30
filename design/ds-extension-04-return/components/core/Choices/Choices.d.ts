import * as React from 'react';

export interface ChoiceOption {
  value: string;
  label: React.ReactNode;
  /** A quiet second line under the label. */
  note?: React.ReactNode;
  /** Shown dashed, "not yet". Always give it its reason. */
  disabled?: boolean;
  /** The word that leads the reason, set in 600: "Coming soon" / « Bientôt ». */
  disabledLead?: React.ReactNode;
  /** The reason, kept at full contrast. */
  disabledNote?: React.ReactNode;
}

/**
 * Choices — design system extension 04. Pick one, as cards: a real radio group.
 * @replaces input[type=radio]
 */
export interface ChoicesProps {
  /** The question, visible, as the fieldset's legend. */
  legend: React.ReactNode;
  /** Two to six. */
  options: ChoiceOption[];
  /** null: nothing chosen. Never default to the first option. */
  value?: string | null;
  onChange: (value: string) => void;
  /** 2: two columns from a 560px container, one below. For short, parallel options only (the 2×2 status question). */
  columns?: 1 | 2;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  missing?: React.ReactNode;
  optional?: string;
  /** `md`: 64px rows, legend as the question. `sm`: 44px rows, for a sheet. */
  size?: 'sm' | 'md';
  name?: string;
  id?: string;
}

export declare const Choices: React.ComponentType<ChoicesProps>;
