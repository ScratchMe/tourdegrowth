import * as React from 'react';

/**
 * WhereToFind — design system extension 07.
 * Each tool and the path in it, one tap away; the other numbers the same tool gives.
 */
export interface WhereToFindProps {
  /** "Where to find it" / « Où le trouver ». */
  label: React.ReactNode;
  /** From the catalogue, in its order. `yours`: a tool chosen in Settings — listed first and tagged. */
  tools: { tool: string; path: string; yours?: boolean }[];
  /** "Also in GA4:" and the numbers that tool gives. */
  also?: { tool: string; label: React.ReactNode; items: { id: string; label: React.ReactNode; href?: string }[] }[];
  /** The tag on the person's own tools: "your tool". */
  yoursLabel?: React.ReactNode;
  /** Open on first render. */
  open?: boolean;
  /** Opens another number's screen from "Also in". */
  onOpenNumber?: (id: string) => void;
}

export declare const WhereToFind: React.ComponentType<WhereToFindProps>;
