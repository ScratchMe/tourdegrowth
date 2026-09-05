"use client";

import { useEffect, useState } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
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
   * "deep" = Deep dive: a real Gemini call still happens, so it keeps the
   * original full sequence + open-ended "still working" state.
   */
  variant: "quick" | "deep";
}

// DESIGN-BRIEF.md §06b states a "2-3 s" duration and assumes the real
// backend call finishes roughly within it. In production the real
// /api/submissions call (Gemini generation + Firestore write) has been
// measured taking 30s+ — the multi-model fallback can retry up to 4 times
// at a 20s timeout each (see gemini/client.ts), so worst case is over a
// minute. A 2.7s animation that then sits frozen for another 30-90s reads
// as broken, not "almost done" — so the "deep" variant deliberately
// diverges from the brief's stated timing: real reassurance during an
// unpredictable wait matters more than hitting the "2-3s" figure literally.
// The messages still narrate three real phases once, slower and readable
// (2.6s each — the old 900ms was too fast to actually read), then the
// screen settles into a persistent "still working" state: last message
// held, plus two continuously-animating cues (the numeral placeholder
// breathing, an ellipsis ticking) that are driven by their own CSS/interval
// loops, never by a fixed timeout — so motion never stops, no matter how
// long the real call takes. The parent alone decides when to leave this
// screen, on the real response.
const MESSAGE_DURATION_MS = 2600;
const DOT_TICK_MS = 450;

/** Loading screen — DESIGN-BRIEF.md §06b, extended for real-world latency (see note above). Purely the animation; the real network call happens in the parent while this plays. */
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
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (step >= 2) return; // hold on the last message — the ellipsis below keeps it visibly alive
    const timer = window.setTimeout(() => setStep((s) => s + 1), MESSAGE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [step]);

  // Independent of `step` and of how long the real call takes — this just
  // keeps ticking for as long as the screen is mounted, so there is always
  // something moving even if Gemini takes a full minute.
  useEffect(() => {
    const timer = window.setInterval(() => setDots((d) => (d + 1) % 4), DOT_TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const messages = [UI_STRINGS.loading.message1, UI_STRINGS.loading.message2, UI_STRINGS.loading.message3];
  const stillWorking = step >= 2;

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.numeralWrap}>
        <span className={styles.numeral}>——</span>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => {
          const active = i === step;
          const state = active ? styles.active : i === step + 1 ? styles.next : styles.pending;
          // The copy itself already ends in "..." (see dictionary.ts) — once
          // settled in the persistent "still working" state, that fixed
          // ellipsis is stripped and replaced by the ticking one below, so
          // the two never pile up into "report......".
          const text = active && stillWorking ? tc(msg, locale).replace(/\.+$/, "") : tc(msg, locale);
          return (
            <span key={i} className={`${styles.message} ${state}`}>
              {text}
              {active && stillWorking && (
                <span className={styles.dots} aria-hidden="true">
                  {".".repeat(dots || 1)}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className={styles.segments}>
        {messages.map((_, i) => (
          <span
            key={i}
            className={`${styles.segment} ${i <= step ? styles.filled : ""} ${
              i === step && stillWorking ? styles.pulsing : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
