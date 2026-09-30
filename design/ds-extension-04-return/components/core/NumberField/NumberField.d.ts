import * as React from 'react';

/**
 * NumberField — design system extension 04.
 * A text input with inputMode, never type="number".
 * @replaces input[type=number]
 */
export interface NumberFieldProps {
  label: React.ReactNode;
  /** What the box shows, as typed (and grouped). The caller parses it: "" is null, never 0; an unreadable string stays on screen. */
  value: string;
  /** Receives the text as it should now be shown, already regrouped when `group`. */
  onChange: (text: string) => void;
  /** Sets the grouping as typed: "26,000" (en) / "26 000" with a no-break space (fr). */
  locale?: 'en' | 'fr';
  /** Group digits as they are typed. Default true. */
  group?: boolean;
  /** A sign that comes first, inside the box: "€", "£", "$" in English. The figure then starts against it. */
  prefix?: string;
  /** A unit that comes after, inside the box: "€" in French, "%", "%" with its no-break space in French. The figure is set right, against it. */
  suffix?: string;
  /** The unit as a word, for screen readers ("euros", "percent"). The visible sign is hidden from them. */
  unitName?: string;
  /** The magnitude expected, in digits, including group separators: sizes the box when fit="content". */
  digits?: number;
  inputMode?: 'decimal' | 'numeric';
  hint?: React.ReactNode;
  /** A parse error and a validation error are one treatment; the words tell them apart. Show it on blur, not on each keystroke. */
  error?: React.ReactNode;
  missing?: React.ReactNode;
  optional?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: React.ReactNode;
  size?: 'sm' | 'md';
  /** `content` (default) sizes to `digits`; `fill` fills the column. */
  fit?: 'fill' | 'content';
  id?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export declare const NumberField: React.ComponentType<NumberFieldProps>;
/** Regroups what was typed; returns it unchanged when it cannot be read ("12o"). */
export declare function groupAsTyped(text: string, locale: 'en' | 'fr'): string;
