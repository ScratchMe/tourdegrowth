import * as React from 'react';

/**
 * SlideStreams — design system extension 10.
 * The marketplace's total slide: two streams added up, as a ledger —
 * never two cards facing each other.
 */
export interface SlideStreamsProps {
  /** For a screen reader: « Deux flux, un total ». */
  caption?: React.ReactNode;
  /** The columns, each one an addition: « Ce mois-ci », « Nouveau chaque mois », « Dans 12 mois, rythme actuel », « Dans 12 mois, avec nos « Et si » » (when any moved). */
  columns: readonly { key: string; label: React.ReactNode }[];
  /** Always the commissions, then the sellers' subscriptions — the order of the sum. `side`: where the stream is read on its own (« les acheteurs · slides 2 à 5 »). */
  streams: readonly [
    { id: 'demand'; label: React.ReactNode; side?: React.ReactNode; values: Record<string, React.ReactNode> },
    { id: 'supply'; label: React.ReactNode; side?: React.ReactNode; values: Record<string, React.ReactNode> },
  ];
  /** « Total par mois », under the solid rule. */
  total: { label: React.ReactNode; values: Record<string, React.ReactNode> };
  /** « Une somme, jamais une comparaison : chaque flux se lit sur les slides de son côté, contre ses propres cibles. » */
  note?: React.ReactNode;
  className?: string;
}

export declare const SlideStreams: React.ComponentType<SlideStreamsProps>;
