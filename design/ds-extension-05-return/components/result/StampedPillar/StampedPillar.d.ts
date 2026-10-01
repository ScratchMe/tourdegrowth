import * as React from 'react';

/**
 * StampedPillar (proposed name: StageStamp) — as extension 05 redraws it.
 * The roast's stamp, in the weakest stage's row of a StageScores list.
 * Renders an <li>.
 */
export interface StampedPillarProps {
  /** The stage. Kept in English on French screens. */
  pillar: string;
  score: number;
  total?: number;
  /** e.g. "dead last" / "bon dernier" — localized by the caller. */
  suffix: string;
}

export declare const StampedPillar: React.ComponentType<StampedPillarProps>;
