import * as React from 'react';

/**
 * CashWarning — design system extension 09.
 * The long-payback warning: "you make money, but late — maybe after your
 * cash runs out". The system's advice look (dashed red edge), never the
 * diagnosis's solid red, never the loss's ink tag.
 */
export interface CashWarningProps {
  /**
   * One sentence; its trigger is a slot (C49): "Paying back a customer takes
   * 11 months, longer than {limit}: you make money, but maybe after your cash
   * runs out." — {limit} = "your runway (9 months)" or "your payback target
   * (12 months)". Never a published reference (constraint 2).
   */
  children: React.ReactNode;
  /** The payback is a range that straddles the limit: "maybe longer than …". Same look. */
  maybe?: boolean;
  className?: string;
}

export declare const CashWarning: React.ComponentType<CashWarningProps>;
