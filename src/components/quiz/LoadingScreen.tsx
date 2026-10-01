"use client";

import { useEffect, useState } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { formatElapsed, waitProgress } from "@/lib/quiz/wait-progress";
import type { Locale } from "@/lib/i18n/locale";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  locale: Locale;
  /**
   * "quick" = Quick mode (SPEC-ADDENDUM-01.md §0): no real wait left to
   * narrate (scoring + verdict lookup is now synchronous, only a Firestore
   * write remains), so this just shows the first message briefly rather
   * than the full 3-message sequence, per the addendum: "garde un état de
   * transition bref (200-400ms, une seule des trois phrases suffit)".
   * "deep" = Deep dive: a real Gemini call still happens (9 to 70 s
   * measured), so the screen tells that wait by the clock (A14.6).
   */
  variant: "quick" | "deep";
}

// DESIGN-BRIEF.md §06b planned a 2–3 s wait with three rotating messages
// and a three-segment bar filling in step with them. The Deep dive's real
// wait is one request to four generations, measured between 9 and 70 s
// (GEMINI.md §2), and nothing reports progress before its answer. Until
// 2026-10-01 the bar still followed the messages on a fixed 2.6 s timer: full
// at 5.2 s, then a minute at "complete", under three steps that no real step
// followed. Since A14.6 (approved by Antoine the same day), the screen tells
// the wait by the clock:
// - one message, the one that is true for the whole wait (drafting the
//   report), with its ticking dots;
// - one bar that follows the time spent against the minute it usually
//   takes, slowing as it goes and never full (`lib/quiz/wait-progress.ts`);
// - the time spent beside it, as a clock;
// - after STILL_WORKING_AFTER_MS, R2-09's line that this is expected.
// The bar and the clock are for the eye only: inside the live region they
// would be read out every second.
const STILL_WORKING_AFTER_MS = 5_200;

/** How often the clock and the bar move. Four times a second keeps the seconds on time. */
const TICK_MS = 250;

/** Loading screen — DESIGN-BRIEF.md §06b, extended for real-world latency (see note above). Purely the display; the real network call happens in the parent, which alone decides when to leave this screen, on the real response. */
export function LoadingScreen({ locale, variant }: LoadingScreenProps) {
  if (variant === "quick") return <QuickLoadingScreen locale={locale} />;
  return <DeepDiveLoadingScreen locale={locale} />;
}

/** Brief, single-message transition — see the `variant` doc above. No open-ended "still working" state: the real wait behind it is near-instant now. */
function QuickLoadingScreen({ locale }: { locale: Locale }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.numeralWrap}>
        <span className={styles.numeral}>——</span>
      </div>
      <div className={styles.messages}>
        <span className={`${styles.message} ${styles.active}`}>{tc(UI_STRINGS.loading.message1, locale)}</span>
      </div>
    </div>
  );
}

function DeepDiveLoadingScreen({ locale }: { locale: Locale }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const timer = window.setInterval(() => setElapsed(performance.now() - start), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  // The copy ends in an ellipsis (three dots in English, "…" in French since
  // copy review v1): it gives way to the ticking one below, never both.
  const message = tc(UI_STRINGS.loading.message3, locale).replace(/(?:\.+|…)$/, "");

  return (
    <div className={styles.wrap} role="status" aria-live="polite" data-testid="deep-dive-wait">
      <div className={styles.numeralWrap}>
        <span className={styles.numeral}>——</span>
      </div>

      <div className={styles.messages}>
        <span className={`${styles.message} ${styles.active}`}>
          {message}
          {/* Three dots, uncovered one to three by a CSS loop (design audit
              S-19), switched off under reduced motion, where the three stay. */}
          <span className={styles.dots} aria-hidden="true">
            ...
          </span>
        </span>
      </div>

      <div className={styles.progress} aria-hidden="true">
        <span className={styles.track}>
          <span className={styles.fill} style={{ width: `${(waitProgress(elapsed) * 100).toFixed(2)}%` }} data-testid="wait-fill" />
        </span>
        <span className={styles.clock} data-testid="wait-clock">
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* REVIEW-02.md R2-09: once the first seconds have passed and the call is
          still going, say how long this normally takes. The clock shows it is
          alive; this says it is EXPECTED. */}
      {elapsed >= STILL_WORKING_AFTER_MS && (
        <p className={styles.hint} data-testid="still-working-hint">
          {tc(UI_STRINGS.loading.stillWorkingHint, locale)}
        </p>
      )}
    </div>
  );
}
