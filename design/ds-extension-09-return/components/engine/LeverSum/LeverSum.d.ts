import * as React from 'react';

/**
 * LeverSum — design system extension 09.
 * What each lever brings on its own, the solo gains added up, what they
 * bring together, and the difference — the compounding, as lengths on one
 * scale, all ink; the bracket over the end of "together" measures it.
 */
export interface LeverSumRow {
  id?: string;
  /** "Activation rate: 18% → 24%" · "Each alone, added up" · "Together". */
  label: React.ReactNode;
  /** "+€18,000". */
  value: React.ReactNode;
  /** The gain on MRR in 12 months, in euros (the bar's length). */
  amount: number;
}

export interface LeverSumProps {
  /** "What each lever brings on its own, on MRR in 12 months". */
  title: React.ReactNode;
  /** One row per lever moved, in funnel order (two or more). */
  rows: LeverSumRow[];
  sum: LeverSumRow;
  together: LeverSumRow;
  /** "Together they bring ~€4,400 more than each alone, added up: … That's compounding." */
  extra?: React.ReactNode;
  /** "slide": a fixed canvas, never stacked on a phone. */
  size?: 'screen' | 'slide';
}

export declare const LeverSum: React.ComponentType<LeverSumProps>;
