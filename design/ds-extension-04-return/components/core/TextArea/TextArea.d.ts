import * as React from 'react';

/**
 * TextArea — extension 01, as extension 04 changes it (see TextArea.delta.md).
 * @replaces textarea
 */
export interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  /** Display and soft-cap only — the counter turns over, typing is never blocked. */
  maxLength: number;
  /** Accessible name. Required when the TextArea stands alone under a QuestionCard; omit it inside a Field, whose <label for> names it (a second name would override the visible one). */
  label?: string;
  id?: string;
  /** From the Field around it: its message is invalid. Same 3px red edge as over the limit. */
  invalid?: boolean;
  placeholder?: string;
  rows?: number;
  'aria-describedby'?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare const TextArea: React.ComponentType<TextAreaProps>;
