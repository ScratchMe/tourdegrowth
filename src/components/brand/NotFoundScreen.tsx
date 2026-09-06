import { DetourCard } from "@/components/core/DetourCard";
import { Button } from "@/components/core/Button";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { tc, type Translatable } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import styles from "./NotFoundScreen.module.css";

export interface NotFoundScreenProps {
  locale: Locale;
  /** Mono eyebrow — "Detour" for an unknown address, "Lost result" for a shared id that names nothing. */
  eyebrow: Translatable;
  title: Translatable;
  body: Translatable;
  cta: Translatable;
}

/**
 * The shape both 404s share — REVIEW.md R-26, rebuilt on `DetourCard` by
 * design system extension 01.
 *
 * There are two, and they say different things: a result id that names
 * nothing ("this link may be wrong"), and an address that matches no page at
 * all. Only the words differ, so only the words are passed in — sharing the
 * markup is what stops the two from drifting into looking like different
 * products.
 *
 * Both are the `wrongTurn` tone, never `fault`: the reader took a wrong turn,
 * nothing broke, and the red card would blame them for it.
 *
 * The footer is deliberate on both: a dead link is a real entry point, and
 * the one thing it must not be is a cul-de-sac.
 */
export function NotFoundScreen({ locale, eyebrow, title, body, cta }: NotFoundScreenProps) {
  return (
    <>
      <main className={styles.main}>
        <WordmarkLink locale={locale} />

        <DetourCard eyebrow={tc(eyebrow, locale)} title={tc(title, locale)}>
          {tc(body, locale)}
        </DetourCard>

        <Button href={localePath(locale)}>{tc(cta, locale)}</Button>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
