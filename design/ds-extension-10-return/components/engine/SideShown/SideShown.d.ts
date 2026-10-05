import * as React from 'react';

/**
 * SideShown — design system extension 10.
 * The marketplace's side selector (« Côté affiché » / "Side shown") and the
 * heading of the side it shows. One side at a time, never both (C70).
 */
export type Side = 'demand' | 'supply';

export interface SideShownProps {
  /** « Côté affiché » / "Side shown". Labels the Segmented. */
  label: React.ReactNode;
  /** Always demand, then supply — a fixed order, never by their figures. */
  sides: readonly [{ id: 'demand'; label: React.ReactNode }, { id: 'supply'; label: React.ReactNode }];
  /** The side shown. The board starts on "demand". */
  value: Side;
  onChange?: (side: Side) => void;
  /** The shown side's heading: « La demande : les acheteurs » / "Supply: the providers" (the vocabulary's words). */
  title: React.ReactNode;
  /** One line: the two sides are read apart (« Deux côtés, deux lectures… »). */
  note?: React.ReactNode;
  headingId?: string;
  className?: string;
  'data-testid'?: string;
}

export declare const SideShown: React.ComponentType<SideShownProps>;
