import * as React from 'react';

/**
 * LeverCard — design system extension 07.
 * "What if?" through one lever: the one on the stage that holds you back.
 */
export interface LeverCardProps {
  /** "What if?" */
  eyebrow: React.ReactNode;
  /** Untouched: "Move the lever of the stage that holds you back, and see what follows." Moved: "If activation rate went from 18% to 22%". */
  title: React.ReactNode;
  lever: {
    id: string;
    /** "Activation rate, today 18%". */
    label: React.ReactNode;
    min: number;
    max: number;
    step: number;
    value: number;
    /** The value in words for the slider and its output ("22%"). */
    valueText: string;
    onChange?: (value: number) => void;
  };
  /** The two figures it moves most, from the engine's calculation: "MRR in 12 months", "New paying customers a month"; `today` once moved. */
  figures: { label: React.ReactNode; value: React.ReactNode; today?: React.ReactNode }[];
  /** "All 8 levers and what the calculation assumes →" — opens today's full what-if panel, unchanged. */
  allLabel: React.ReactNode;
  onAll?: () => void;
  /** "Back to today", once moved. */
  resetLabel?: React.ReactNode;
  onReset?: () => void;
  moved?: boolean;
  headingId?: string;
}

export declare const LeverCard: React.ComponentType<LeverCardProps>;
