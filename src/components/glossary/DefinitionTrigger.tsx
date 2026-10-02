import type { ButtonHTMLAttributes } from "react";
import styles from "./DefinitionTrigger.module.css";

export interface DefinitionTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** The term being defined — used to build the accessible label unless `label` overrides it. */
  term: string;
  /** Full accessible label, e.g. "Definition: Retention" / "Définition : Retention" — localized by the caller. Defaults to `term` alone. */
  label?: string;
  /** Whether its popover is currently open. Drives aria-expanded and the inverse fill. */
  open?: boolean;
  /** Match the surrounding text colour: muted on paper, alert on the stalling stage's red wash. */
  tone?: "muted" | "ink" | "alert";
}

/**
 * The 16px "?" that opens a glossary definition: a solid ring at rest, body
 * ink under the pointer, the inverse fill while its definition is open
 * (design system extension 05, C35). 16px drawn, 44px tapped (a transparent
 * disc around it takes the hit). Always a real
 * `<button>`: keyboard-reachable and screen-reader labelled, never a `<span>`
 * with a click handler. Use immediately after a jargon term — first
 * occurrence per screen only, never on every repeat — and pair it with
 * `DefinitionPopover`.
 */
export function DefinitionTrigger({
  term,
  label,
  open = false,
  tone = "muted",
  className,
  ...rest
}: DefinitionTriggerProps) {
  const classes = [styles.trigger, styles[tone], open ? styles.open : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" aria-label={label ?? term} aria-expanded={open} className={classes} {...rest}>
      ?
    </button>
  );
}
