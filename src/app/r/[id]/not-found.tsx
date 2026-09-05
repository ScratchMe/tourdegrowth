import { Button } from "@/components/core/Button";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { localePath } from "@/lib/i18n/routes";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import styles from "./not-found.module.css";

// Not the DESIGN-BRIEF.md §06c error screen (that's the "calculation
// failed" state, step 9) — this is a plain "no submission at this id"
// 404, e.g. a mistyped or since-deleted result link.
export default async function ResultNotFound() {
  const locale = await resolveRequestLocale();
  const t = UI_STRINGS.result;

  return (
    <>
      <main className={styles.main}>
        <WordmarkLink locale={locale} />
        <h1 className={styles.title}>{tc(t.notFoundTitle, locale)}</h1>
        <p className={styles.body}>{tc(t.notFoundBody, locale)}</p>
        <Button href={localePath(locale)}>{tc(t.notFoundCta, locale)}</Button>
      </main>

      {/* A dead shared link is a real entry point — give it somewhere to go. */}
      <SiteFooter locale={locale} />
    </>
  );
}
