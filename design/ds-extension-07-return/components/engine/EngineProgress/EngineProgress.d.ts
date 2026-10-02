import * as React from 'react';

/**
 * EngineProgress — design system extension 07.
 * What remains, first; then one mark per number, grouped by stage.
 */
export type NumberStatus = 'found' | 'est' | 'asked' | 'cant' | 'todo';

export interface EngineProgressGroup {
  id: string;
  /** Read by screen readers for the group: "Acquisition: found, found, to do". */
  label: string;
  marks: NumberStatus[];
}

export interface EngineProgressProps {
  /** What remains, always first: "4 to go" · "Last one to go" · "None to go". Never "done" while a number has no answer. */
  remaining: React.ReactNode;
  /** The counts after it: "7 found · 2 estimated · 1 asked · 3 can't find". */
  counts?: React.ReactNode;
  /** md only: one group per stage, in funnel order. */
  groups?: EngineProgressGroup[];
  /** The marks' legend (the board shows it once, under the numbers list's title). */
  legend?: { status: NumberStatus; label: string }[];
  legendLabel?: string;
  /** md: sentence + marks (the board). sm: the sentence only, in a number screen's header. */
  size?: 'md' | 'sm';
  /** The marks list's accessible name. */
  label?: string;
}

export declare const EngineProgress: React.ComponentType<EngineProgressProps>;
