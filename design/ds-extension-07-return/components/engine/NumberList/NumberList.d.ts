import * as React from 'react';
import { NumberStatus } from '../EngineProgress/EngineProgress';

/**
 * NumberList — design system extension 07.
 * Every number, by stage, in one list. Replaces the five stage tabs and their
 * panel of folded rows (decision of 2026-09-26, reopened by brief 07 Q16).
 */
export interface NumberRow {
  /** The catalogue id ("ss:activation-rate"). */
  id: string;
  name: React.ReactNode;
  /** The figure or the range as the person typed it ("18%", "2–4 days"); omitted when there is none. */
  value?: React.ReactNode;
  status: NumberStatus | 'computed';
  /** Shown as a Tag for est (neutral), asked (outline: pending), cant (neutral), todo (outline). A found number shows its value, no tag. */
  statusLabel?: React.ReactNode;
  /** Small line under the row: a computed number's missing inputs ("Needs CAC, gross margin"). */
  note?: React.ReactNode;
  /** Opens the number's own screen (NumberSheet). Computed rows open it read only. */
  onOpen?: () => void;
  describedBy?: string;
}

export interface NumberStage {
  id: string;
  /** Stage names stay in English on French screens. */
  name: string;
  /** The stage a TEAM TARGET names (C1). Never set from a published reference. */
  holdsBack?: boolean;
  /** "Holds you back" / « Freine ici ». */
  holdsLabel?: React.ReactNode;
  /** "2 of 3 found". */
  foundLabel: string;
  marks: NumberStatus[];
  rows: NumberRow[];
}

export interface NumberListProps {
  /** "Your numbers". */
  title: React.ReactNode;
  /** An EngineProgress (md) under the title. */
  progress?: React.ReactNode;
  stages: NumberStage[];
  /** "Computed from yours (5)" — a closed Disclosure with read-only rows. In the hybrid, the link sits here too. */
  computed?: { title: React.ReactNode; rows: NumberRow[]; open?: boolean };
  headingId?: string;
}

export declare const NumberList: React.ComponentType<NumberListProps>;
