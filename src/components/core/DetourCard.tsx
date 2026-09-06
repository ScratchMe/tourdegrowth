import type { ReactNode, Ref } from "react";
import styles from "./DetourCard.module.css";

export interface DetourCardProps {
  /** `wrongTurn` (a 404) is ink on paper; `fault` (something broke on our side) is red-edged. */
  tone?: "wrongTurn" | "fault";
  eyebrow: string;
  title: string;
  children: ReactNode;
  /** Rendered as the page's `<h1>` on a 404, and as a section heading inside a flow that already has one. */
  headingLevel?: "h1" | "h2";
  className?: string;
  /**
   * For the `fault` tone: the card IS the alert, so it is also what receives
   * focus when the flow fails (REVIEW.md R-19). Pair with `tabIndex={-1}`.
   */
  ref?: Ref<HTMLDivElement>;
  tabIndex?: number;
  "data-testid"?: string;
}

/**
 * The "wrong turn" card — design system extension 01.
 *
 * Every screen where the road stops is this card in one of two temperatures:
 * the two 404s (ink) and the result-failed state (red). Mono eyebrow, stencil
 * title, one calm sentence — the primary Button goes BELOW the card, never
 * inside it.
 *
 * It is the screen's one raised element; nothing else on a detour screen
 * carries a shadow.
 */
export function DetourCard({
  tone = "wrongTurn",
  eyebrow,
  title,
  children,
  headingLevel = "h1",
  className,
  ...rest
}: DetourCardProps) {
  const fault = tone === "fault";
  const Heading = headingLevel;

  return (
    <div
      role={fault ? "alert" : undefined}
      className={[styles.card, fault ? styles.fault : "", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className={styles.eyebrow}>{eyebrow}</div>
      <Heading className={styles.title}>{title}</Heading>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
