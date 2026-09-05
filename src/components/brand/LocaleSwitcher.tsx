import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import styles from "./LocaleSwitcher.module.css";

const LABELS: Record<Locale, string> = { en: "EN", fr: "FR" };

export interface LocaleSwitcherProps {
  /** The locale currently being shown. */
  locale: Locale;
  /** This page's path WITHOUT the locale prefix, e.g. "/glossary/cac". */
  path: string;
}

/**
 * The language switch — REVIEW.md R-13.
 *
 * The app has been bilingual since its first functional commit (a CLAUDE.md
 * non-negotiable), but nothing in the interface ever let anyone switch:
 * `setLocale` on the locale context was never called from anywhere, and
 * `?lang=` is not something a visitor guesses. The only people who ever saw
 * the French version were those whose browser already asked for it.
 *
 * Plain `<a>` elements, deliberately, not `next/link`: `<html lang>` is
 * rendered by the ROOT layout, which a client-side navigation reuses without
 * re-rendering. Switching language through a soft navigation therefore left
 * `lang="en"` on a French page — invisible to crawlers, which see the server
 * render, but wrong for screen readers and for browser translation. A real
 * navigation costs one page load on an action nobody performs twice.
 */
export function LocaleSwitcher({ locale, path }: LocaleSwitcherProps) {
  return (
    <nav className={styles.wrap} aria-label="Language">
      {LOCALES.map((candidate) => {
        const current = candidate === locale;
        return (
          <a
            key={candidate}
            href={localePath(candidate, path)}
            hrefLang={candidate}
            aria-current={current ? "true" : undefined}
            className={`${styles.link} ${current ? styles.current : ""}`}
          >
            {LABELS[candidate]}
          </a>
        );
      })}
    </nav>
  );
}
