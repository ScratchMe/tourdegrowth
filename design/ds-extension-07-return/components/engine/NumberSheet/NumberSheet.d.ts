import * as React from 'react';

/**
 * NumberSheet — design system extension 07.
 * One number's screen, for the first visit and every month after (the
 * step-by-step and the board share it). It fixes the ORDER of the blocks;
 * the caller fills the slots.
 */
export interface NumberSheetProps {
  /** The heading's id; it takes focus (tabIndex −1) when a person moves to this screen, never on first paint. */
  headingId?: string;
  /** "Acquisition · 1 of 3" — the stage and the number's place in it. */
  position: React.ReactNode;
  /** An EngineProgress size "sm": "6 to go". */
  progress?: React.ReactNode;
  /** The number's name, from the catalogue. */
  name: React.ReactNode;
  /** The catalogue's effort ("On your own, 5 min"): a neutral Tag — an effort is not pending. */
  effort?: React.ReactNode;
  /** "Definition →" — the glossary page. */
  definitionLabel?: React.ReactNode;
  definitionHref?: string;
  /** The one-liner, from the catalogue. */
  definition: React.ReactNode;
  /** "Formula" and the formula, one mono line. */
  formulaLabel?: React.ReactNode;
  formula?: React.ReactNode;
  /** What was declared in the Tour, one line, when linked. */
  tour?: React.ReactNode;
  /** A TrapNote — open, before the value. */
  trap?: React.ReactNode;
  /** A WhereToFind — closed, its summary naming the tools. */
  where?: React.ReactNode;
  /** An AnswerSwitch: the value first, the three other answers under it. */
  answer?: React.ReactNode;
  /** A HowItCompares: reference, target, verdict. */
  compare?: React.ReactNode;
  /** A closed Disclosure "Your definition and a note" with the two TextAreas (both kept in the model). */
  words?: React.ReactNode;
  /** "Save and continue →" (primary, type submit) · "← Your numbers" · "Skip for now". */
  actions?: React.ReactNode;
  /** The sheet is a <form>: Enter in any box saves (constraint 14). */
  onSubmit?: () => void;
  /** A computed number: no answer, no words; formula, trap, reference only. */
  readOnly?: boolean;
}

export declare const NumberSheet: React.ComponentType<NumberSheetProps>;
