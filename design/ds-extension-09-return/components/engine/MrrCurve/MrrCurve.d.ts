import * as React from 'react';

/**
 * MrrCurve — design system extension 09.
 * The MRR month by month: 13 points (today first, the MRR in 12 months
 * last), at today's pace and with the what-ifs. Two ink lines, never red.
 */
export type Point = [number, number];

export interface MrrCurveProps {
  /** 13 points [low, high] at today's pace; a range (an estimate upstream) draws as a hatched band. */
  today: Point[];
  /** 13 points with the what-ifs, or null (untouched: today's pace alone). */
  whatif?: Point[] | null;
  /** The column's width, in px (720 on a desktop, the phone's column on a phone): drawn at real size, its type never scales. */
  width?: number;
  height?: number;
  /** A phone: the keys go under the plot, as a legend. */
  compact?: boolean;
  /** "at today's pace" · "with your what-ifs" (slides: "with this what-if", "with the 3 what-ifs"). */
  keys: { today: React.ReactNode; whatif?: React.ReactNode };
  /** Today's MRR, the only figure on the curve: "€48,000 today". */
  start: React.ReactNode;
  /** Three months under the axis: today, in 6 months, in 12 months. */
  xLabels?: [React.ReactNode, React.ReactNode, React.ReactNode];
  /** The curve in words, for a screen reader (the SVG is decoration). */
  summary: React.ReactNode;
  /** "slide": the slide's type sizes; never compact. */
  size?: 'screen' | 'slide';
  /** Unique per page (the hatch pattern's id). */
  id?: string;
}

export declare const MrrCurve: React.ComponentType<MrrCurveProps>;
