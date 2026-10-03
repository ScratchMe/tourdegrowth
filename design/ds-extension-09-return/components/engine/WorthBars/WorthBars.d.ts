import * as React from 'react';

/**
 * WorthBars — design system extension 09.
 * What one new customer costs (CAC) and brings back in margin over its life
 * (LTV): two ink bars on one scale, the cost's end carried across both rows
 * by a dashed guide, the gap measured by a bracket and named in words.
 */
export type Range = [number, number];

export interface WorthBarsProps {
  /** { label: "Costs", value: "€1,900", amount: [1900, 1900] } — a range for an estimate. */
  cost: { label: React.ReactNode; value: React.ReactNode; amount: Range };
  /**
   * { label: "Brings back", value: "~€1,500", amount: [1500, 1500] }.
   * `amount: null` = unknown (no gross margin): the dashed, hatched "?" box
   * across the track, `value` "?", and `unknown` says what is missing.
   */
  brings: { label: React.ReactNode; value: React.ReactNode; amount: Range | null; unknown?: React.ReactNode };
  /** "~€400 short" (kind "short"), "~€1,000 more" ("more"), "the two may cross" ("maybe": no bracket). */
  gap?: { label: React.ReactNode; kind: 'short' | 'more' | 'maybe' };
  /** "slide": the bars a little thicker. */
  size?: 'screen' | 'slide';
  className?: string;
}

export declare const WorthBars: React.ComponentType<WorthBarsProps>;
