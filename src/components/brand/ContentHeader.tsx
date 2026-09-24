import type { Locale } from "@/lib/i18n/locale";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { WordmarkLink } from "./WordmarkLink";
import styles from "./ContentHeader.module.css";

export interface ContentHeaderProps {
  locale: Locale;
  /** This page's path without the locale prefix, e.g. "/glossary/cac" — what the language switch links to in the other language. */
  path: string;
  /**
   * The width the header's inner row aligns to — the page's own content
   * column, like `SiteFooter`'s. `reading` (760px) for the prose pages;
   * `wide` (the app shell's 1040px) for a page whose body is a tool, where a
   * header narrower than the content under it reads as misaligned.
   */
  width?: "reading" | "wide";
}

/**
 * The header shared by `/how-it-works`, `/glossary` and `/glossary/[term]`
 * (REVIEW-02.md R2-05). One component rather than the same two lines pasted
 * into three page modules, so the next thing added to this header — a nav
 * link, a CTA — is added once and laid out once. Server Component: nothing
 * here is interactive.
 */
export function ContentHeader({ locale, path, width = "reading" }: ContentHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={`${styles.inner} ${styles[width]}`}>
        <WordmarkLink locale={locale} />
        <LocaleSwitcher locale={locale} path={path} />
      </div>
    </header>
  );
}
