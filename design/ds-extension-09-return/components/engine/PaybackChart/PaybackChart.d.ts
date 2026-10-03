import * as React from 'react';

/**
 * PaybackChart — design system extension 09.
 * One customer, month by month (0–36 months): the margin it brings back
 * against what it cost — where the payback and the lifetime meet. Replaces
 * the unit-economics slide's 0–36 month bar. Ink only.
 */
export type Range = [number, number];

export interface PaybackChartProps {
  /** ARPA × margin (self-serve) or ACV ÷ 12 × margin (sales-assisted), €/month; null = no margin: the "?" box. */
  monthlyMargin: Range | null;
  /** The CAC (a range draws as a hatched band). */
  cac: Range;
  /** The counted lifetime in months (capped at 36). */
  lifetime: Range | null;
  /** CAC ÷ monthly margin, in months. */
  payback: Range | null;
  width?: number;
  height?: number;
  labels: {
    /** "0", "12", "24", "36 months" — 0 and 36 are drawn; 12 carries the reference. */
    months: [string, string, string, string];
    /** "12 months · a commonly cited reference" — on the axis row; it situates, never judges. */
    reference: React.ReactNode;
    /** "what a new customer costs"; null to omit (the hybrid's narrow columns). */
    cost: React.ReactNode | null;
    /** No margin: "missing: gross margin". */
    unknown: React.ReactNode;
    /** "leaves at ~17 months". */
    leaves: React.ReactNode;
    /** Loss: "would pay back at 21 months"; healthy: "paid back: 11 months". */
    paysBack: React.ReactNode;
    /** Loss: "~€400 short". */
    short: React.ReactNode;
    /** Healthy: "~22 months of margin after". */
    after: React.ReactNode;
    /** `compact` only: the time story on the axis row ("leaves at ~17 months; would pay back at 21"). */
    time?: React.ReactNode;
  };
  /** The chart in words, for a screen reader. */
  summary: React.ReactNode;
  id?: string;
  /** The hybrid's two columns: fewer labels, the reference's label in the slide's note. */
  compact?: boolean;
}

export declare const PaybackChart: React.ComponentType<PaybackChartProps>;
