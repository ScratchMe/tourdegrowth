import * as React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectOptionGroup {
  /** The group's heading ("The tools this usually comes from"). */
  label: string;
  options: SelectOption[];
}

/**
 * Select — design system extension 04. The native <select>, drawn as a field.
 * @replaces select
 */
export interface SelectProps {
  label: React.ReactNode;
  /** "" means not chosen yet (only with `placeholder`). */
  value: string;
  onChange: (value: string) => void;
  /** Past three values. Two or three is a Segmented. */
  options: Array<SelectOption | SelectOptionGroup>;
  /** Adds an empty, choosable first option ("Choose…" / « Choisir… »). Nothing is pre-selected for the person. */
  placeholder?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  missing?: React.ReactNode;
  optional?: string;
  disabled?: boolean;
  disabledReason?: React.ReactNode;
  size?: 'sm' | 'md';
  /** `content` for a short closed value (a currency). */
  fit?: 'fill' | 'content';
  id?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
}

export declare const Select: React.ComponentType<SelectProps>;
