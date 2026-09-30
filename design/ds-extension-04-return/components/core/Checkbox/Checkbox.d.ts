import * as React from 'react';

/**
 * Checkbox — design system extension 04. Yes / no with its sentence.
 * @replaces input[type=checkbox]
 */
export interface CheckboxProps {
  /** The sentence: the visible label, and the whole row is the target. */
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: React.ReactNode;
  /** Set by the Field group that carries the message. */
  invalid?: boolean;
  disabled?: boolean;
  disabledReason?: React.ReactNode;
  /** `sm` (default) sets the sentence in --body-md; `md` in --body-lg for a one-question screen. */
  size?: 'sm' | 'md';
  id?: string;
  name?: string;
  /** Extra ids to describe it by, e.g. the group's message. */
  describedBy?: string;
}

export declare const Checkbox: React.ComponentType<CheckboxProps>;
