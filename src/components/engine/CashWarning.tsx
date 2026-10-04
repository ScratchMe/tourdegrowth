import type { ReactNode } from "react";
import styles from "./CashWarning.module.css";

export interface CashWarningProps {
  /**
   * One sentence; its limit is a slot (C49): « Un client met 11 mois à rembourser son coût, plus que ton runway (9 mois) :
   * tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie. » — the team's runway, or, with none typed,
   * the 30-month floor. Never a published reference (C1).
   */
  children: ReactNode;
  /** The payback is a range that straddles the limit: « peut-être plus que… ». Same look. */
  maybe?: boolean;
  className?: string;
  "data-testid"?: string;
}

/**
 * The long-payback warning — design system extension 09 (Q5): « you make
 * money, but late — maybe after your cash runs out ». A warning, not an
 * alarm: the system's advice (the dashed red edge of the backup line and of
 * the trap), never the solid red of the diagnosis, never the ink tag of the
 * loss. One sentence, no icon, no button.
 *
 * Never drawn when the loss is certain: a customer who leaves before paying
 * back is the loss, not a late return (`money.ts#paybackWarning` says null).
 */
export function CashWarning({ children, maybe = false, className, "data-testid": testId }: CashWarningProps) {
  return (
    <p className={[styles.root, className].filter(Boolean).join(" ")} data-maybe={maybe ? "true" : undefined} data-testid={testId}>
      {children}
    </p>
  );
}
