import type { HTMLAttributes, ReactNode } from "react";
import styles from "./PriorityMove.module.css";

export interface PriorityMoveProps extends HTMLAttributes<HTMLDivElement> {
  /** Eyebrow text, e.g. "Priority move" / "Action prioritaire". */
  label?: ReactNode;
  children?: ReactNode;
}

/**
 * The one action to take next — exactly one per result screen, at the end
 * of a Deep dive result, after the insight cards and before the CTAs.
 * Dashed red on paper distinguishes it from the solid red wash of a
 * weakness: solid = what is wrong, dashed = what to do. Never ship two.
 */
export function PriorityMove({ label = "Priority move", className, children, ...rest }: PriorityMoveProps) {
  return (
    <div className={[styles.card, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.eyebrow}>{label}</div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
