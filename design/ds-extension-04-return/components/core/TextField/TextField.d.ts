import * as React from 'react';

/**
 * TextField — design system extension 04.
 * @replaces input[type=text]
 */
export interface TextFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  missing?: React.ReactNode;
  /** The localized word for "optional". */
  optional?: string;
  /** Soft limit: never blocks typing. The count shows in the label row from 80% of it, red past it, with a 3px red edge. The save refuses and says why. */
  maxLength?: number;
  /** Spoken form of the count, localized: (count, max) => "52 of 60 characters". */
  countLabel?: (count: number, max: number) => string;
  placeholder?: string;
  disabled?: boolean;
  /** Why it is disabled. Shown in place of the hint; never hide a disabled field's reason. */
  disabledReason?: React.ReactNode;
  size?: 'sm' | 'md';
  fit?: 'fill' | 'content';
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'url' | 'search' | 'tel';
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  spellCheck?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export declare const TextField: React.ComponentType<TextFieldProps>;
