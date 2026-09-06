import * as React from "react";

/**
 * Collapsible section: an uppercase mono summary row with a `+` / `−` chip, and any content below.
 * Built on native <details>; closed by default.
 * @startingPoint section="Core" subtitle="Closed and open, md and sm" viewport="640x260"
 */
export interface DisclosureProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "open"> {
  /** Summary text. Uppercase mono; keep it under ~40 characters so it stays on one line at 390px. */
  summary: React.ReactNode;
  /** Controlled open state. Leave undefined to let the browser own it. */
  open?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  /** md = --meta-sm summary (result page) · sm = --meta-xs (nested pillar rows) */
  size?: "md" | "sm";
  /** Draw the 2px dashed rule above the summary. Off for nested disclosures. */
  rule?: boolean;
  children?: React.ReactNode;
}

export declare function Disclosure(props: DisclosureProps): JSX.Element;
