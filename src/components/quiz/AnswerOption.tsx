import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./AnswerOption.module.css";

export interface AnswerOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** desktop = 17px · mobile = 16px. Padding and hit height are identical. */
  size?: "desktop" | "mobile";
  children?: ReactNode;
}

/**
 * One answer in the questionnaire, 2 to 6 per question, stacked in a
 * 12px-gap column — never a radio list, never a grid. Hover and selected
 * both lift to paper with the 4px shadow; minimum height 64px on both
 * viewports. Never label an option with its score, a letter, or a number —
 * scoring stays invisible to the user.
 */
export function AnswerOption({ selected = false, size = "desktop", className, children, ...rest }: AnswerOptionProps) {
  const classes = [styles.option, styles[size], selected ? styles.selected : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" aria-pressed={selected} className={classes} {...rest}>
      {children}
    </button>
  );
}
