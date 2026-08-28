import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ModeTag.module.css";

export interface ModeTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** "quick" = dashed outline, recessive · "deep" = solid ink, the only inverted chip in the system */
  mode?: "quick" | "deep";
  children?: ReactNode;
}

/**
 * Marks which run the user is in: the 15-question Quick tour or the
 * 10-question Deep dive. `mode="deep"` is the one solid-ink chip in the
 * whole system — that scarcity is what makes it read as a mode, so it's
 * never reused for ordinary labels. Quick mode usually needs no tag at all
 * (it's the default state).
 */
export function ModeTag({ mode = "quick", className, children, ...rest }: ModeTagProps) {
  const deep = mode === "deep";
  const classes = [styles.tag, deep ? styles.deep : styles.quick, className ?? ""].filter(Boolean).join(" ");

  return (
    <span className={classes} {...rest}>
      {children || (deep ? "Deep dive" : "Quick")}
    </span>
  );
}
