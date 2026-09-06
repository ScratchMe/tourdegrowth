"use client";

import { useEffect } from "react";
import { DetourCard } from "@/components/core/DetourCard";
import { Button } from "@/components/core/Button";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import styles from "./NotFoundScreen.module.css";

export interface ErrorScreenProps {
  locale: Locale;
  error: Error & { digest?: string };
  /** Next's error-boundary reset: re-renders the segment that threw. */
  reset: () => void;
}

/**
 * The 500 counterpart of `NotFoundScreen` — REVIEW-02.md R2-23. R-26 gave
 * the product its own 404; an unexpected throw in a Server Component (a
 * Firestore outage on `/r/<id>`, say) still fell through to Next's bare
 * error document, unstyled and unbranded. This is the `fault` tone of
 * `DetourCard`: the red card is reserved for OUR failures, and this is one.
 *
 * Copy is the quiz's own error screen (DESIGN-BRIEF.md §06c) — same words,
 * same status: nothing new to review. The `digest` Next attaches to a
 * server error is shown small under the card, the way the quiz shows its
 * error code: enough to find the request in the logs, nothing about our
 * internals. Same layout module as the 404 on purpose — the two are one
 * family in two temperatures.
 */
export function ErrorScreen({ locale, error, reset }: ErrorScreenProps) {
  const t = UI_STRINGS.quiz;

  useEffect(() => {
    // The server already logged the real error; this is for the browser
    // console, where the digest is otherwise the only trace.
    console.error(error);
  }, [error]);

  return (
    <>
      <main className={styles.main}>
        <WordmarkLink locale={locale} />

        <DetourCard tone="fault" eyebrow={tc(t.errorEyebrow, locale)} title={tc(t.errorTitle, locale)}>
          {tc(t.errorBody, locale)}
        </DetourCard>

        <Button onClick={reset}>{tc(t.errorRetry, locale)}</Button>

        {error.digest && (
          <MetaLabel size="xs" uppercase={false}>
            {error.digest}
          </MetaLabel>
        )}
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
