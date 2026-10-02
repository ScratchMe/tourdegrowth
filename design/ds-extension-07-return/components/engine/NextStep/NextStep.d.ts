import * as React from 'react';

/**
 * NextStep — design system extension 07.
 * The board's "since last time" and its ONE primary action: reason, action,
 * then what else waits.
 */
export interface NextStepLine {
  text: React.ReactNode;
  /** plain (default) · pending: a request out, a month to start — dashed edge · advice: backup missing, storage refused — dashed red edge. */
  tone?: 'plain' | 'pending' | 'advice';
  /** One quiet Button: "Follow up", "Save (.json)". */
  action?: React.ReactNode;
}

export interface NextStepProps {
  /** "Last visit · 12 days ago" on return; "Where you are" during a first visit; "{month} · read only" on a past month. */
  eyebrow: React.ReactNode;
  /** Why the primary is the primary, in one sentence. */
  lead?: React.ReactNode;
  /** `advice` when the reason is a risk (storage refused). */
  leadTone?: 'advice';
  /** THE action of the screen (Button primary, lg). Chosen by the order in the prompt. */
  primary: { label: React.ReactNode; href?: string; onClick?: () => void };
  /** At most one quiet alternative ("Keep filling August 2026", "Correct this month"). */
  secondary?: React.ReactNode;
  /** What else changed or waits, under a rule. */
  lines?: NextStepLine[];
  headingId?: string;
}

export declare const NextStep: React.ComponentType<NextStepProps>;
