import * as React from 'react';

/**
 * StageScore — design system extension 05. Replaces PillarChip.
 * One stage's score as a row of the score sheet: "18/20 Acquisition ?".
 * A value, not an action. Renders an <li>: always inside a StageScores.
 */
export interface StageScoreProps {
  /** The stage's name. Kept in English on French screens (content/glossary.js). */
  stage: string;
  /** The figure, printed as given ("8", not "08"). Always printed with its "/total". */
  score: string | number;
  /** Default 20. Also the meter's scale — the caller's, never fitted to the data. */
  total?: number;
  /** `alert`: the stage that stalls — red wash and a solid red rule. Follows Bottleneck: `clear` marks one row, `level` none (see the prompt for `shared`). */
  tone?: 'neutral' | 'alert';
  /** The landing only: makes the stage name a link to its glossary page. Never together with a "?" in `children`. */
  href?: string;
  /** The link's accessible name, localized, containing the visible name: "Acquisition — definition" / « Acquisition — définition ». Required with `href`. */
  linkLabel?: string;
  id?: string;
  /** The result only: the stage's GlossaryTerm (its "?"), right after the name. tone="alert" on the alert row, "muted" elsewhere. */
  children?: React.ReactNode;
}

export declare const StageScore: React.ComponentType<StageScoreProps>;
