import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { Wordmark, type WordmarkProps } from "./Wordmark";
import styles from "./WordmarkLink.module.css";

/**
 * The wordmark, wherever it sits in a header, now doubles as the "go home"
 * link (added on Antoine's request, 2026-08-28 — not part of either
 * addendum's own spec text). A separate component rather than a `<Link>`
 * wrapper repeated at all 8 header call sites, so the "no default link
 * underline" fix lives in exactly one place.
 */
export interface WordmarkLinkProps extends WordmarkProps {
  /** Home is a localized address since REVIEW.md R-13 (`/en`, `/fr`). */
  locale: Locale;
}

export function WordmarkLink({ locale, ...props }: WordmarkLinkProps) {
  return (
    <Link href={localePath(locale)} aria-label="Tour de Growth" className={styles.link}>
      <Wordmark {...props} />
    </Link>
  );
}
