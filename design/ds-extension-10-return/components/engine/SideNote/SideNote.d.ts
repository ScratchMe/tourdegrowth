import * as React from 'react';

/**
 * SideNote — design system extension 10.
 * What a side says where a part is absent: by design ("absent": supply
 * earns nothing directly) or not yet ("pending": too few team targets to
 * name what holds the side back).
 */
export interface SideNoteProps {
  /** "absent": no frame, ink; "pending": the system's dashed edge (dashed = not yet). Never red. */
  kind?: 'absent' | 'pending';
  /** The part's own eyebrow, kept so the board's structure stays: « L'argent · août 2026 ». */
  eyebrow?: React.ReactNode;
  /** « Les vendeurs ne paient pas : l'offre ne rapporte rien en direct ». */
  title: React.ReactNode;
  /** One or two short paragraphs: what the side does instead, or what is needed. */
  children?: React.ReactNode;
  /** One quiet Button: « Fixer les cibles des vendeurs → », « … Coche-le dans les réglages ». */
  action?: React.ReactNode;
  headingId?: string;
  className?: string;
  'data-testid'?: string;
}

export declare const SideNote: React.ComponentType<SideNoteProps>;
