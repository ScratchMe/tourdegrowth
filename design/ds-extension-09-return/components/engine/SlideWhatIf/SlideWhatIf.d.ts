import * as React from 'react';

/**
 * SlideWhatIf — design system extension 09.
 * The body of the deck's "What if?" slides, with their curve: one lever, or
 * the levers together. The title states the projected gain in ink.
 */
export interface SlideWhatIfProps {
  /** MrrCurve, size "slide". */
  curve: React.ReactNode;
  /** DataTable props: today | with this what-if | change (MRR and ARR in 12 months, NRR, CAC, LTV, LTV:CAC, CAC payback, cash tied up). */
  figures: { caption: React.ReactNode; columns: { key: string; header: React.ReactNode; numeric?: boolean }[]; rows: { id: string; cells: Record<string, React.ReactNode> }[] };
  /** Together only: LeverSum, size "slide". */
  sum?: React.ReactNode;
  /** Together only, under the figures: the compounding in one sentence. */
  note?: React.ReactNode;
  /** One lever that moves the month's funnel (activation, conversion): today's funnel table, kept. */
  funnel?: SlideWhatIfProps['figures'];
  /** One lever that leaves the funnel as it is: "This lever leaves the month's funnel as it is." */
  funnelNote?: React.ReactNode;
}

export declare const SlideWhatIf: React.ComponentType<SlideWhatIfProps>;
