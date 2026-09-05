import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import styles from "./LocaleSwitcher.module.css";

const LABELS: Record<Locale, string> = { en: "EN", fr: "FR" };

export interface LocaleSwitcherProps {
  /** The locale currently being shown. */
  locale: Locale;
  /**
   * This page's path WITHOUT the locale prefix, e.g. "/glossary/cac" — for
   * content pages, which carry their language in the URL (R-13).
   *
   * Omit it on app pages. `/r/<id>`, `/quiz` and `/deep-dive/<id>` have no
   * locale prefix by design (`lib/i18n/routes.ts`: a shared result must keep
   * its URL forever, and since R-09 a result has no language of its own — it
   * renders in the READER's). The switch then points at `?lang=<locale>` on
   * the current address, which the proxy folds into the locale cookie, so the
   * choice carries on to `/quiz` afterwards too.
   */
  path?: string;
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
 * On a result page it is also the only way a reader can act on R-09 at all:
 * the verdict follows their language, but nothing let them say what it is —
 * reported by Antoine, who had to reach for `?lang=` by hand.
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
            // A query-only href resolves against the current URL, so the
            // path is preserved without this component having to know it.
            href={path === undefined ? `?lang=${candidate}` : localePath(candidate, path)}
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
