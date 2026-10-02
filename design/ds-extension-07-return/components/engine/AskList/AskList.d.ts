import * as React from 'react';

/**
 * AskList — design system extension 07.
 * The numbers that come from someone else, grouped by who has them.
 */
export interface AskGroup {
  /** The role: Finance, Data, Customer success… */
  role: React.ReactNode;
  /** The numbers asked of that role, by name. */
  numbers: React.ReactNode;
  /** The request, as it will be copied (the engine's function, unchanged). */
  request: React.ReactNode;
  /** Once copied: "Copied on September 24. Your engine reminds you to follow it up." (dashed: pending). */
  copied?: React.ReactNode;
  /** "Copy the request" (secondary). */
  copyLabel?: React.ReactNode;
  onCopy?: () => void;
}

export interface AskListProps {
  /** "To ask for (5)". */
  title: React.ReactNode;
  /** "Send the requests today, fill in the rest while waiting." */
  lead: React.ReactNode;
  groups: AskGroup[];
  /** The screen's primary: "Sent, next number →". */
  done?: { label: React.ReactNode; onClick?: () => void };
  headingId?: string;
}

export declare const AskList: React.ComponentType<AskListProps>;
