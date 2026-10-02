import * as React from 'react';

/**
 * TotalBand — design system extension 07.
 * The hybrid's sum: two engines, one total — in a fixed order, never ranked.
 */
export interface TotalBandProps {
  /** "Two engines, one total". */
  eyebrow: React.ReactNode;
  /** The hybrid's own title (the first slide's, from the engine's function). */
  title: React.ReactNode;
  /** Self-serve, then sales-assisted. Always this order, whatever the values. */
  engines: { label: React.ReactNode; value: React.ReactNode }[];
  /** "Total MRR". */
  total: { label: React.ReactNode; value: React.ReactNode };
  /** The link: "12 opportunities came from self-serve in August 2026". */
  link?: React.ReactNode;
  headingId?: string;
}

export declare const TotalBand: React.ComponentType<TotalBandProps>;
