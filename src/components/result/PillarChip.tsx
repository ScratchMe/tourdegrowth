import type { HTMLAttributes, ReactNode } from "react";
import styles from "./PillarChip.module.css";

export interface PillarChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Pillar name. Kept in English on French screens, matching content/glossary.js. */
  pillar: string;
  score: number | string;
  total?: number;
  /** Marks the lowest-scoring pillar: red wash, red dashed edge. At most one. */
  weak?: boolean;
  size?: "desktop" | "mobile";
  /** Stretch to the full width of its column, score pinned left / name right — desktop result-screen alignment only, see PillarChip.module.css. */
  stretch?: boolean;
  /** Slot for an inline DefinitionTrigger. */
  children?: ReactNode;
}

/**
 * One pillar's score as a dashed mono chip, e.g. "08/20 Retention" — five
 * per result screen, in AARRR order, a column on desktop and a two-up grid
 * on mobile. Mark exactly one pillar `weak`: the point of the screen is a
 * single thing to fix.
 */
export function PillarChip({
  pillar,
  score,
  total = 20,
  weak = false,
  size = "desktop",
  stretch = false,
  className,
  children,
  ...rest
}: PillarChipProps) {
  const desktop = size === "desktop";
  const classes = [
    styles.chip,
    desktop ? styles.desktop : styles.mobile,
    weak ? styles.weak : styles.normal,
    stretch ? styles.stretch : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      <b className={[styles.score, weak ? styles.scoreWeak : styles.scoreNormal].join(" ")}>{score}</b>
      <span>/{total}</span>
      <span className={styles.label}>{pillar}</span>
      {children}
    </span>
  );
}
