import * as React from 'react';

/**
 * TrapNote — design system extension 07.
 * The number's trap, word for word from the catalogue, shown before the value.
 */
export interface TrapNoteProps {
  /** "The trap, before you type" / « Le piège, avant de taper ». */
  label: React.ReactNode;
  /** The trap's text, unchanged. */
  children: React.ReactNode;
  /** When both motions are ticked: the hybrid trap under its own label ("When you sell both ways"). */
  hybrid?: { label: React.ReactNode; text: React.ReactNode };
  /** At most one quiet Button: "Write your definition", when the trap asks for it. */
  action?: React.ReactNode;
}

export declare const TrapNote: React.ComponentType<TrapNoteProps>;
