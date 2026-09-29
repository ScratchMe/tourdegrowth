import type { HTMLAttributes, ReactNode } from "react";
import styles from "./QuestionCard.module.css";

export interface QuestionCardProps extends HTMLAttributes<HTMLDivElement> {
  /** desktop = 34px question in 40px 44px padding · mobile = 25px in 24px 22px */
  size?: "desktop" | "mobile";
  /** Question text. May contain an inline DefinitionTrigger. */
  children?: ReactNode;
}

/**
 * Wraps one question in the screen's single raised card, used identically in
 * both the Quick tour and the Deep dive — never restyle it for deep mode. It
 * renders an `<h2>`; one per screen. It owns the hero shadow (8px,
 * `--shadow-hero`), so nothing else on a question screen may use
 * `elevation="raised"` or `"hero"`.
 */
export function QuestionCard({ size = "desktop", className, children, ...rest }: QuestionCardProps) {
  const desktop = size === "desktop";
  return (
    <div className={[styles.card, desktop ? styles.desktop : styles.mobile, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <h2 className={[styles.question, desktop ? styles.questionDesktop : styles.questionMobile].join(" ")}>
        {children}
      </h2>
    </div>
  );
}
