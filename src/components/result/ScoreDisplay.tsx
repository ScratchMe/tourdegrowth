import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ScoreDisplay.module.css";

export interface ScoreDisplayProps extends HTMLAttributes<HTMLDivElement> {
  score: number | string;
  /** Denominator. 100 for the overall score, 20 for a pillar. */
  total?: number;
  /** Mono eyebrow, e.g. "Overall Growth Score". */
  label?: ReactNode;
  size?: "md" | "sm";
  /**
   * `numeral` is the stencil figure on its own, under its eyebrow. `marker`
   * sets it on a kilometre marker — design I + B, retained by Antoine on
   * 2026-09-28: a red cap carrying the label, the figure, the total under a
   * rule, a plinth. The marker is made to sit beside the stage that stalls
   * (`Bottleneck`'s `lead`), never alone.
   */
  variant?: "numeral" | "marker";
  /** Stamp-in animation. Disable for OG images and print. */
  animate?: boolean;
}

/**
 * The overall score, set in stencil display type with the spray texture
 * over it. Use once per result screen, inside a `Card elevation="raised"`.
 * The spray texture belongs to display numerals at 100px and up — never to
 * body text or small numbers, which is why the marker, at 84px, has none.
 */
export function ScoreDisplay({
  score,
  total = 100,
  label,
  size = "md",
  variant = "numeral",
  animate = true,
  className,
  ...rest
}: ScoreDisplayProps) {
  const md = size === "md";

  if (variant === "marker") {
    // Divs only, the plinth a pseudo-element: the marker sits first inside
    // `Bottleneck`, and a caller reading that block's first span expects the
    // stage's name (`e2e/landing-preview.spec.ts`).
    return (
      <div
        className={[styles.marker, md ? styles.markerMd : styles.markerSm, className ?? ""]
          .filter(Boolean)
          .join(" ")}
        data-variant="marker"
        {...rest}
      >
        {label ? <div className={styles.cap}>{label}</div> : null}
        <div className={[styles.markerNumeral, animate ? styles.animate : ""].filter(Boolean).join(" ")}>{score}</div>
        <div className={styles.markerTotal}>/{total}</div>
      </div>
    );
  }

  return (
    <div className={className} {...rest}>
      {label ? <div className={styles.eyebrow}>{label}</div> : null}
      <div className={[styles.numeralRow, md ? styles.md : styles.sm, animate ? styles.animate : ""].filter(Boolean).join(" ")}>
        {score}
        <span className={[styles.suffix, md ? styles.suffixMd : styles.suffixSm].join(" ")}>/{total}</span>
        <span aria-hidden="true" className={styles.spray} />
      </div>
    </div>
  );
}
