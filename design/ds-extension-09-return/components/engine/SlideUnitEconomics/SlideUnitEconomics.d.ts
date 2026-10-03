import * as React from 'react';

/**
 * SlideUnitEconomics — design system extension 09.
 * The body of the deck's unit-economics slide (the frame, header, title and
 * footer stay the deck's own): six figures, then the picture that explains
 * them — for one engine, or for the two engines of a hybrid side by side.
 */
export interface SlideTile {
  key?: string;
  /** "CAC", "LTV", "LTV:CAC", "CAC payback", "Months after payback", "Cash tied up". */
  label: React.ReactNode;
  /** "?" draws the dashed unknown tile. */
  value: React.ReactNode;
  /** "an often-cited reference: about 3:1" · "leaves ~4 months before paying back" · "does not all come back" · "missing: gross margin". */
  note?: React.ReactNode;
  /** The hybrid's cash tile, across two columns. */
  wide?: boolean;
}

export interface SlideUnitEconomicsProps {
  /** PaybackChart. */
  chart?: React.ReactNode;
  tiles?: SlideTile[];
  /** GRR and NRR, one line, their approximation printed with them. */
  retention?: React.ReactNode;
  /** CashWarning, when it applies (never with the loss). */
  warning?: React.ReactNode;
  /** What the cash figure assumes, one line. */
  assume?: React.ReactNode;
  /** The hybrid: self-serve then sales-assisted, each its tiles and its chart — never summed. */
  engines?: { name: React.ReactNode; chart: React.ReactNode; tiles: SlideTile[]; line?: React.ReactNode }[];
}

export declare const SlideUnitEconomics: React.ComponentType<SlideUnitEconomicsProps>;
