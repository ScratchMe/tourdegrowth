import * as React from 'react';

/**
 * HowItCompares — design system extension 07.
 * Your figure, the published reference and your team's target, as one object.
 */
export interface HowItComparesProps {
  /** "How it compares" / « Comment il se situe ». */
  title: React.ReactNode;
  /** The figure (null before it is typed, or for an estimate: no bar). */
  value?: number | null;
  /** The chart's scale: [0, 2 × the reference's high] by default, the caller's. */
  domain: readonly [number, number];
  /** The published range, from the catalogue's reference — BulletChart's `band` (delta). */
  band?: readonly [number, number];
  /** The team's target: BulletChart's red tick. Only the six (self-serve) and five (sales-assisted) numbers that can name a stage. */
  target?: number | null;
  /** The chart in words: value, reference and target. */
  chartLabel: string;
  /** One line under the chart, each mark drawn as the chart draws it: value · band · target. */
  legend?: { kind: 'value' | 'band' | 'target'; label: React.ReactNode }[];
  /** The reference's caveat, word for word ("For context, never to name a stage: …"), or "No reference worth publishing: …". */
  caveat?: React.ReactNode;
  /** Only against a TEAM TARGET: below → Tag alert (diagnosis); at or above → Tag neutral. Never from a reference. */
  verdict?: { tone: 'below' | 'ok'; label: React.ReactNode } | null;
  /** For numbers that cannot name a stage: "This number situates; it does not name a stage." */
  note?: React.ReactNode;
  /** The target box itself (NumberField sm, "%"), on the numbers that can name a stage. */
  targetField?: React.ReactNode;
  headingId?: string;
}

export declare const HowItCompares: React.ComponentType<HowItComparesProps>;
