import * as React from 'react';

/**
 * LeverCard — design system extension 07, changed by extension 09.
 * "What if?" through one lever — now with the curve of the MRR and the ARR
 * it leads to.
 */
export interface LeverCardProps {
  /** "What if?" */
  eyebrow: React.ReactNode;
  /** Untouched: "Move the lever of the stage that holds you back, and see what follows." Moved: "What if: monthly logo churn, 4% instead of 6%, with your other levers". */
  title: React.ReactNode;
  lever: {
    id: string;
    /** "Monthly logo churn (today 6%)". */
    label: React.ReactNode;
    min: number;
    max: number;
    step: number;
    value: number;
    /** The value in words for the slider and its output ("4%"). */
    valueText: string;
    onChange?: (value: number) => void;
  };
  /** Extension 09: MrrCurve — today's pace, and with the what-ifs once moved. */
  curve?: React.ReactNode;
  /** Extension 09: "MRR in 12 months" and "ARR in 12 months" (was: MRR in 12 months and new paying customers a month); `today` once moved. */
  figures: { key?: string; label: React.ReactNode; value: React.ReactNode; today?: React.ReactNode }[];
  /** Extension 09: one line on one new customer with this what-if ("One new customer: no longer a loss…" / "still a loss…"), when the board shows a loss. */
  worth?: React.ReactNode;
  /** Extension 09, hybrid only: both engines' MRR in 12 months with this what-if — a sum, never a comparison. */
  total?: React.ReactNode;
  /** "See all 8 levers and what the calculation assumes →" — opens the full panel in place. */
  allLabel: React.ReactNode;
  onAll?: () => void;
  /** "Back to today", once moved. */
  resetLabel?: React.ReactNode;
  onReset?: () => void;
  moved?: boolean;
  headingId?: string;
}

export declare const LeverCard: React.ComponentType<LeverCardProps>;
