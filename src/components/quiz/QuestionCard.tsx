import type { HTMLAttributes, ReactNode } from "react";
import styles from "./QuestionCard.module.css";

export interface QuestionCardProps extends HTMLAttributes<HTMLDivElement> {
  /** desktop = 28px question in 30px 32px padding · mobile = 22px in 22px 20px */
  size?: "desktop" | "mobile";
  /** Question text. May contain an inline DefinitionTrigger. */
  children?: ReactNode;
}

/**
 * Wraps one question in the screen's single raised card, used identically in
 * both the Quick tour and the Deep dive — never restyle it for deep mode. It
 * renders an `<h2>`; one per screen. It owns the raised shadow, so nothing
 * else on a question screen may use `elevation="raised"`.
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
