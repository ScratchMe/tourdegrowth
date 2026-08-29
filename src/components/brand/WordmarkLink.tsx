import Link from "next/link";
import { Wordmark, type WordmarkProps } from "./Wordmark";
import styles from "./WordmarkLink.module.css";

/**
 * The wordmark, wherever it sits in a header, now doubles as the "go home"
 * link (added on Antoine's request, 2026-08-28 — not part of either
 * addendum's own spec text). A separate component rather than a `<Link>`
 * wrapper repeated at all 8 header call sites, so the "no default link
 * underline" fix lives in exactly one place.
 */
export function WordmarkLink(props: WordmarkProps) {
  return (
    <Link href="/" aria-label="Tour de Growth" className={styles.link}>
      <Wordmark {...props} />
    </Link>
  );
}
