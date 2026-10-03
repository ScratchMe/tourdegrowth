import * as React from 'react';

/**
 * MoneyBlock — design system extension 09.
 * Today's money on the board: the MRR and its ARR, what one new customer is
 * worth, and the cash it ties up. One flat ruled block, no control of its
 * own (only the "?" of the words it teaches).
 */
export interface MoneyFigure {
  key?: string;
  /** "MRR" · "ARR, the MRR × 12". */
  label: React.ReactNode;
  /** A fact, to the unit: "€48,000". */
  value: React.ReactNode;
  note?: React.ReactNode;
}

export interface MoneyFact {
  key?: string;
  /** "Spent on acquisition this month" · "Tied up at this pace" + its "?". */
  label: React.ReactNode;
  /** "€93,480" · "~€990,000" · "?" (drawn as the dashed, hatched "?" box). */
  value: React.ReactNode;
  /** When `value` is "?": what is missing ("missing: gross margin"). */
  missing?: React.ReactNode;
}

export interface MoneyBlockProps {
  /** "The money · August 2026". */
  eyebrow: React.ReactNode;
  headingId?: string;
  /** MRR then ARR, side by side. `null` in the hybrid: TotalBand carries them. */
  figures: MoneyFigure[] | null;
  worth: {
    /** "What one new customer is worth". */
    title: React.ReactNode;
    /** The finding's name: the loss (ink tag) or its maybe (`maybe`: dashed). None when it pays back or cannot be said. */
    tag?: { label: React.ReactNode; maybe?: boolean };
    /** The finding in words: "Each new customer costs €1,900 and brings back ~€1,500 of margin: you lose ~€400 on each one." */
    finding: React.ReactNode;
    /** WorthBars. */
    bars?: React.ReactNode;
    /** The finding's figure in time: "A customer stays ~17 months; paying back its cost would take 21 months: it leaves before." */
    months?: React.ReactNode;
    /** With no margin, why nothing is computed on revenue; with a maybe, where the range comes from. */
    note?: React.ReactNode;
  };
  cash?: {
    /** "Cash". */
    title: React.ReactNode;
    facts: MoneyFact[];
    /** Does it come back, and when: "Each month's spend comes back over 11 months…" / "And it does not all come back…". */
    line?: React.ReactNode;
    /** CashWarning, or nothing. Never with the loss. */
    warning?: React.ReactNode;
    /** The printed assumptions (a floor, linear return, monthly billing). */
    assumptions?: React.ReactNode;
  };
  className?: string;
}

export declare const MoneyBlock: React.ComponentType<MoneyBlockProps>;
