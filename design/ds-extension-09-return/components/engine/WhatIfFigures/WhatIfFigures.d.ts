import * as React from 'react';

/**
 * WhatIfFigures — design system extension 09.
 * The full "What if?" panel's figures, replacing its seven tiles: three
 * short DataTables by meaning — Growth, One new customer, Cash — with
 * today, with your what-ifs, and the change.
 */
export interface WhatIfRow {
  id: string;
  /** "MRR in 12 months", "CAC payback", "Cash tied up"… */
  label: React.ReactNode;
  today: React.ReactNode;
  /** Moved only. "?" when it cannot be computed — never 0. */
  whatif?: React.ReactNode;
  /** Moved only: signed, no colour ("+€42,000", "−5 months", "+3 pt", "stable"). */
  change?: React.ReactNode;
}

export interface WhatIfFiguresProps {
  /** "Your growth figures". */
  title: React.ReactNode;
  /** Untouched only: "Today". */
  label?: React.ReactNode;
  groups: { id: string; title: React.ReactNode; rows: WhatIfRow[] }[];
  columns: { figure: React.ReactNode; today: React.ReactNode; whatif: React.ReactNode; change: React.ReactNode };
  /** false: one value column (today's figures, as today). */
  moved: boolean;
  /** Under 760px the "today" column folds into the what-if cell as a second line: "today ~€80,000". */
  todayLine?: (value: React.ReactNode) => React.ReactNode;
}

export declare const WhatIfFigures: React.ComponentType<WhatIfFiguresProps>;
