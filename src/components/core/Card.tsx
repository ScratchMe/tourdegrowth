import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** raised = 7px shadow, one per screen · panel = 5px, popovers · flat = no shadow */
  elevation?: "raised" | "panel" | "flat";
  /** paper = default · sunken = recessed example block · alert = red wash · outlineAlert = dashed red on paper */
  tone?: "paper" | "sunken" | "alert" | "outlineAlert";
  /** CSS padding override. Defaults to 26px 30px desktop / 20px mobile. */
  padding?: string;
}

/**
 * The paper card. `elevation="raised"` carries the 7px hard shadow and is
 * reserved for the one thing a screen is about — the score, or the current
 * question. `tone="alert"` (solid red wash) marks a diagnosed weakness;
 * `tone="outlineAlert"` (dashed red on paper) marks advice. Shadows are
 * always ink, never blurred, never coloured.
 */
export function Card({
  elevation = "flat",
  tone = "paper",
  padding,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    styles[elevation],
    styles[tone],
    padding ? "" : styles.padDefault,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: CSSProperties | undefined = padding ? { padding, ...style } : style;

  return (
    <div className={classes} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
}
