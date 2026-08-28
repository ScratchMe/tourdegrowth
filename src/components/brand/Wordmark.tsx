import type { ElementType, HTMLAttributes } from "react";
import styles from "./Wordmark.module.css";

export interface WordmarkProps extends HTMLAttributes<HTMLElement> {
  /** sm 15px (mobile header) · md 19px (desktop header) · lg 34px (hero) */
  size?: "sm" | "md" | "lg";
  /** Element to render. Use "h1" only where the wordmark is the page title. */
  as?: ElementType;
}

/** "TOUR DE GROWTH" in stencil caps. GROWTH is always road-paint red — never retype it by hand, never colour the whole thing red. */
export function Wordmark({ size = "md", as: Tag = "div", className, ...rest }: WordmarkProps) {
  const classes = [styles.wordmark, styles[size], className ?? ""].filter(Boolean).join(" ");

  return (
    <Tag className={classes} {...rest}>
      TOUR DE <span className={styles.accent}>GROWTH</span>
    </Tag>
  );
}
