import type { HTMLAttributes, ReactNode } from "react";
import styles from "./PillarChip.module.css";

export interface PillarChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Pillar name. Kept in English on French screens, matching content/glossary.js. */
  pillar: string;
  score: number | string;
  total?: number;
  /** Marks the lowest-scoring pillar: red wash, red dashed edge. At most one. */
  weak?: boolean;
  size?: "md" | "sm";
  /** Stretch to the full width of its cell, score pinned left / name right — so every meter's track is the same length; see PillarChip.module.css. */
  stretch?: boolean;
  /** Slot for an inline DefinitionTrigger. */
  children?: ReactNode;
}

/**
 * One pillar's score as a mono chip, e.g. "08/20 Retention" — five per
 * result screen, in AARRR order, a column on desktop and a two-up grid on
 * mobile. Mark exactly one pillar `weak`: the point of the screen is a
 * single thing to fix.
 *
 * A thin meter runs along its foot (design I + B, retained by Antoine on
 * 2026-09-28): the score's share of its total, in ink, red on the weak
 * pillar. It repeats the number and says nothing else, so it is hidden from
 * assistive technology — the chip's text is the whole reading.
 */
export function PillarChip({
  pillar,
  score,
  total = 20,
  weak = false,
  size = "md",
  stretch = false,
  className,
  children,
  ...rest
}: PillarChipProps) {
  const md = size === "md";
  const value = typeof score === "number" ? score : Number(score);
  const share = Number.isFinite(value) && total > 0 ? Math.min(1, Math.max(0, value / total)) : null;
  const classes = [
    styles.chip,
    md ? styles.md : styles.sm,
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
      {share !== null ? (
        <span className={styles.meter} aria-hidden="true" data-testid="pillar-meter">
          <span className={styles.meterFill} style={{ width: `${Math.round(share * 1000) / 10}%` }} />
        </span>
      ) : null}
    </span>
  );
}
