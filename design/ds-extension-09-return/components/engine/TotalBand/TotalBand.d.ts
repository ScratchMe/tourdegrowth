import * as React from 'react';

/**
 * TotalBand — design system extension 07, changed by extension 09.
 * The hybrid's sum: two engines, one total — and what else adds up.
 */
export interface TotalBandProps {
  /** "Two engines, one total". */
  eyebrow: React.ReactNode;
  /** "MRR reaches €228,000: €48,000 in self-serve, €180,000 sales-assisted." */
  title: React.ReactNode;
  /** Self-serve, then sales-assisted, always. */
  engines: { label: React.ReactNode; value: React.ReactNode }[];
  total: { label: React.ReactNode; value: React.ReactNode };
  /**
   * Extension 09: what adds up across the two engines, and only that — the
   * ARR, the MRR in 12 months at today's pace, the cash tied up. The LTV,
   * the payback and the loss never add: each engine's MoneyBlock has them.
   */
  totals?: { key?: string; label: React.ReactNode; value: React.ReactNode }[];
  /** The link between the engines (a share of the pipeline, not an attribution). */
  link?: React.ReactNode;
  headingId?: string;
}

export declare const TotalBand: React.ComponentType<TotalBandProps>;
