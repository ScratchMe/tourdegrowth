"use client";

import { DetourCard } from "@/components/core/DetourCard";
import { Button } from "@/components/core/Button";
import { ERROR_SCREEN_STRINGS } from "@/lib/i18n/error-screen-strings";
import { tc } from "@/lib/i18n/translatable";
import styles from "@/components/brand/NotFoundScreen.module.css";
import "./globals.css";

/**
 * The last-resort boundary — REVIEW-02.md R2-23 — for a throw in a ROOT
 * layout, where no shell exists yet, so it must render `<html>`/`<body>`
 * itself. Deliberately minimal: no locale context (there is none), so
 * English; no `next/font` (the tokens' fallback stacks apply). It should
 * essentially never render — the two root layouts only read a header and a
 * cookie — but when it does, it still looks like the product.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = ERROR_SCREEN_STRINGS;
  return (
    <html lang="en">
      <body>
        <main className={styles.main}>
          <DetourCard tone="fault" eyebrow={tc(t.errorEyebrow, "en")} title={tc(t.errorTitle, "en")}>
            {tc(t.errorBody, "en")}
            {error.digest ? ` (${error.digest})` : null}
          </DetourCard>
          <Button onClick={reset}>{tc(t.errorRetry, "en")}</Button>
        </main>
      </body>
    </html>
  );
}
