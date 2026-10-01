import * as React from 'react';

/**
 * StageScores — design system extension 05.
 * The five stage scores as one score sheet: an ordered list in AARRR order,
 * whose rows are `StageScore`s (and, in a roast, one `StampedPillar`).
 */
export interface StageScoresProps {
  /** `md` (default): the result — 48px rows, shrinks to `sm` below 760px by itself. `sm`: the landing's preview, 44px rows at every width. */
  size?: 'sm' | 'md';
  /** Accessible name of the list, localized: "Score per stage, out of 20" / « Score par étape, sur 20 ». */
  label?: string;
  className?: string;
  /** Five rows, AARRR order: StageScore, or one StampedPillar in the weakest stage's place. */
  children: React.ReactNode;
}

export declare const StageScores: React.ComponentType<StageScoresProps>;
