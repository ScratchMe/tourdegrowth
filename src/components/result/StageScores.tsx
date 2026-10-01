import type { OlHTMLAttributes, ReactNode } from "react";
import styles from "./StageScores.module.css";

export interface StageScoresProps extends Omit<OlHTMLAttributes<HTMLOListElement>, "aria-label" | "children"> {
  /** `md` (default): the result — 48px rows, 44px below 760px by itself. `sm`: the landing's preview, 44px rows at every width. */
  size?: "md" | "sm";
  /** Accessible name of the list, localized: "Score per stage, out of 20" / « Score par étape, sur 20 ». */
  label?: string;
  className?: string;
  /** Five rows, AARRR order: `StageScore`s, or in a roast one `StampedPillar` in the weakest stage's place. */
  children: ReactNode;
}

/**
 * The five stage scores as one score sheet (design system extension 05): an
 * ordered list in AARRR order, drawn the way the system draws readings — one
 * solid rule on top, a dashed hairline between rows, no box around the whole.
 * It is the route profile's table, so it sits right under `StageProfile`.
 * One column at every width.
 *
 * The list is the grid and each row a subgrid of it, so the five meters
 * start at the same x and have the same track: they compare.
 */
export function StageScores({ size = "md", label, className, children, ...rest }: StageScoresProps) {
  return (
    <ol className={[styles.list, styles[size], className ?? ""].filter(Boolean).join(" ")} aria-label={label} {...rest}>
      {children}
    </ol>
  );
}
