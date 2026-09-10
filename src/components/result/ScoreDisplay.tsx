import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ScoreDisplay.module.css";

export interface ScoreDisplayProps extends HTMLAttributes<HTMLDivElement> {
  score: number | string;
  /** Denominator. 100 for the overall score, 20 for a pillar. */
  total?: number;
  /** Mono eyebrow, e.g. "Overall Growth Score". */
  label?: ReactNode;
  size?: "desktop" | "mobile";
  /** Stamp-in animation. Disable for OG images and print. */
  animate?: boolean;
}

/**
 * The overall score, set in stencil display type with the spray texture
 * over it. Use once per result screen, inside a `Card elevation="raised"`.
 * The spray texture belongs to display numerals at 100px and up — never to
 * body text or small numbers.
 */
export function ScoreDisplay({
  score,
  total = 100,
  label,
  size = "desktop",
  animate = true,
  className,
  ...rest
}: ScoreDisplayProps) {
  const desktop = size === "desktop";

  return (
    <div className={className} {...rest}>
      {label ? <div className={styles.eyebrow}>{label}</div> : null}
      <div className={[styles.numeralRow, desktop ? styles.desktop : styles.mobile, animate ? styles.animate : ""].filter(Boolean).join(" ")}>
        {score}
        <span className={[styles.suffix, desktop ? styles.suffixDesktop : styles.suffixMobile].join(" ")}>/{total}</span>
        <span aria-hidden="true" className={styles.spray} />
      </div>
    </div>
  );
}
