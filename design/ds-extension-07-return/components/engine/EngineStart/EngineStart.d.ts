import * as React from 'react';
import { ChoiceOption } from '../../core/Choices/Choices';

/**
 * EngineStart — design system extension 07.
 * The first visit's only setup screen: one question (how you sell, defaulted),
 * every other default said in one sentence, one primary way in.
 */
export interface EngineStartProps {
  /** "Before you start" / « Avant de commencer ». */
  title: React.ReactNode;
  /** "How do you sell?" / « Comment vends-tu ? » */
  legend: React.ReactNode;
  /** Self-serve · Sales-assisted · Both, each with its one-line note. "Both" sets both motions in the model. */
  options: ChoiceOption[];
  /** Default "ss" (today's default: self-serve ticked). */
  motion: 'ss' | 'sa' | 'both';
  onMotionChange: (motion: 'ss' | 'sa' | 'both') => void;
  /** The counts by effort for the chosen motion: "17 numbers: 5 take five minutes, 7 about an hour each, 5 come from someone else." */
  plan: React.ReactNode;
  /** Every other default in one sentence: company type, currency, the month and the cohort. */
  defaults: React.ReactNode;
  /** Optional node after the sentence (kept for a GlossaryTerm; the board uses none: the cohort is taught on the number that needs it). */
  defaultsTerm?: React.ReactNode;
  /** "Change" — opens Settings. */
  changeLabel: React.ReactNode;
  onChange: () => void;
  /** "Start with your first number →" — the primary. */
  startLabel: React.ReactNode;
  onStart: () => void;
  /** "See a filled-in example" (quiet). */
  exampleLabel: React.ReactNode;
  onExample: () => void;
  /** "Import a file (.json)" (quiet). */
  importLabel: React.ReactNode;
  onImport: () => void;
  headingId?: string;
}

export declare const EngineStart: React.ComponentType<EngineStartProps>;
