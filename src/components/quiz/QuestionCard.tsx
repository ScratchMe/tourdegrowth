import type { HTMLAttributes, ReactNode } from "react";
import styles from "./QuestionCard.module.css";

export interface QuestionCardProps extends HTMLAttributes<HTMLDivElement> {
  /** md = 34px question in 40px 44px padding · sm = 25px in 24px 22px */
  size?: "md" | "sm";
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
export function QuestionCard({ size = "md", className, children, ...rest }: QuestionCardProps) {
  const md = size === "md";
  return (
    <div className={[styles.card, md ? styles.md : styles.sm, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <h2 className={[styles.question, md ? styles.questionMd : styles.questionSm].join(" ")}>
        {children}
      </h2>
    </div>
  );
}
