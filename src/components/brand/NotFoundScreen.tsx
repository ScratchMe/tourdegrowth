import { Button } from "@/components/core/Button";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { tc, type Translatable } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import styles from "./NotFoundScreen.module.css";

export interface NotFoundScreenProps {
  locale: Locale;
  title: Translatable;
  body: Translatable;
  cta: Translatable;
}

/**
 * The shape both 404s share — REVIEW.md R-26.
 *
 * There are two, and they say different things: a result id that names
 * nothing ("this link may be wrong"), and an address that matches no page at
 * all. Only the words differ, so only the words are passed in — sharing the
 * markup is what stops the two from drifting into looking like different
 * products.
 *
 * The footer is deliberate on both: a dead link is a real entry point, and
 * the one thing it must not be is a cul-de-sac.
 */
export function NotFoundScreen({ locale, title, body, cta }: NotFoundScreenProps) {
  return (
    <>
      <main className={styles.main}>
        <WordmarkLink locale={locale} />
        <h1 className={styles.title}>{tc(title, locale)}</h1>
        <p className={styles.body}>{tc(body, locale)}</p>
        <Button href={localePath(locale)}>{tc(cta, locale)}</Button>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
