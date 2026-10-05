import * as React from 'react';

/**
 * SideFunnel — design system extension 10.
 * One side of a marketplace as a funnel: its sign-ups brought back to 100,
 * the stages counted on those same 100, the monthly rates that are not
 * columns, and — on demand — liquidity on a base of its own (100 searches
 * or requests). The peloton's grammar, for one side at a time.
 */

/** The synced DotGrid's grid (components/viz/DotGrid). */
export type DotGridGrid =
  | { kind: 'known'; dots: readonly ('filled' | 'empty' | 'range' | 'referred' | 'referredRange')[] }
  | { kind: 'unknown'; dots: readonly [] };

export interface FunnelColumn {
  id: string;
  /** "100", "20", "6 à 9", "?" — the figure, as the peloton prints it. */
  n: React.ReactNode;
  /** « Première commande sous 30 jours » — set in the stage face, uppercase on a desktop. */
  label: React.ReactNode;
  grid: DotGridGrid;
  /** The column the side's diagnosis names (a team target): red dots + the alert Tag (« Sous la cible »). One per side. */
  holds?: { label: React.ReactNode };
  /** « 3 000 inscrits en mai 2026, ramenés à 100 », « Amplitude · mai 2026 ». */
  source?: React.ReactNode;
  /** The grid's accessible name (default: n + label). */
  ariaLabel?: string;
}

export interface FunnelRate {
  id: string;
  /** « Vendeurs payants qui résilient ». */
  label: React.ReactNode;
  /** « 3 % ». */
  value: React.ReactNode;
  /** « cible 2,5 % ». */
  note?: React.ReactNode;
  /** The rate the side's diagnosis names, when it is a rate: the diagnosis edge. */
  holds?: boolean;
}

export interface SideFunnelProps {
  /** « Pour 100 inscrits côté acheteurs » / « Pour 100 vendeurs inscrits ». Screen only (a slide's title is the verdict). */
  title: React.ReactNode;
  /** « ~2 000 visiteurs par mois pour 100 inscrits · GA4 · août 2026 ». */
  upstream?: React.ReactNode;
  /** The 100 sign-ups first, then each stage counted on the same 100 (two on demand; two on supply, one without the subscriptions). */
  columns: readonly FunnelColumn[];
  /** A second base of 100 that is not the same people: liquidity. Demand only. */
  base?: {
    /** « Liquidité · sur 100 recherches » + its "?" (GlossaryTerm `liquidity`). */
    title: React.ReactNode;
    column: FunnelColumn;
    /** « Taux de service : 9 % des recherches aboutissent à une commande ». */
    line?: React.ReactNode;
  };
  /** Monthly rates, never columns: supply's two churns. */
  rates?: readonly FunnelRate[];
  /** « Chaque mois ». */
  ratesTitle?: React.ReactNode;
  /** One line on where this side shows when it earns nothing directly (supply without subscriptions → the fill rate). */
  aside?: React.ReactNode;
  /** The cohort line (« Tes 3 000 inscrits… sont ramenés à 100… »). */
  note?: React.ReactNode;
  /** DotGrid's legend items: referred, measured, range, unknown. */
  legend?: readonly { kind: 'referred' | 'filled' | 'range' | 'unknown'; label: React.ReactNode }[];
  /** "slide": the deck's 1 920 canvas, no card (the slide is the frame); the rates at the columns' right. */
  medium?: 'screen' | 'slide';
  headingId?: string;
  className?: string;
  'data-testid'?: string;
}

export declare const SideFunnel: React.ComponentType<SideFunnelProps>;
