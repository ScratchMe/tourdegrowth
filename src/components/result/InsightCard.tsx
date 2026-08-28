import type { HTMLAttributes, ReactNode } from "react";
import styles from "./InsightCard.module.css";

export interface InsightCardProps extends HTMLAttributes<HTMLDivElement> {
  pillar: string;
  score: number | string;
  total?: number;
  /** strength = paper card · weakness = red wash, solid red edge */
  kind?: "strength" | "weakness";
  children?: ReactNode;
}

/**
 * One diagnosis paragraph tied to a pillar — used under a `MetaLabel wide`
 * eyebrow ("Strengths", then "Where you're losing time") in both the Quick
 * and Deep dive result screens, since it's the one component in the system
 * built exactly for "pillar name + score + one sentence". Never more than
 * one paragraph, never a bulleted list, and never a card without a score in
 * its header — the number is what makes it credible.
 */
export function InsightCard({ pillar, score, total = 20, kind = "strength", className, children, ...rest }: InsightCardProps) {
  const weak = kind === "weakness";
  const classes = [styles.card, weak ? styles.weakness : styles.strength, className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      <div className={[styles.eyebrow, weak ? styles.eyebrowWeakness : styles.eyebrowStrength].join(" ")}>
        {pillar} — {score}/{total}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
