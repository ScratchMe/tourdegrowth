import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tag.module.css";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** neutral = sunken fill · outline = dashed on paper · ink = solid dark · alert = the red of a diagnosis (the game catalogue's trick still running) */
  tone?: "neutral" | "outline" | "ink" | "alert";
  children?: ReactNode;
}

/** Small mono uppercase tag: "Pillar 1", "AARRR check-up — 3 min", "🔥 Roast". Use ModeTag/PillarChip instead for those specific jobs. */
export function Tag({ tone = "neutral", className, children, ...rest }: TagProps) {
  const classes = [styles.tag, styles[tone], className ?? ""].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
