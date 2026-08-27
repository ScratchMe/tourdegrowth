"use client";

import { useEffect, useState } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  locale: Locale;
  onDone: () => void;
}

// 3 messages x 900ms = 2.7s total, landing inside DESIGN-BRIEF.md §06b's
// stated "2-3 s" duration (its "~1.3s each" would total 3.9s — calibrated
// down to fit the duration it actually states, not the per-message figure).
const MESSAGE_DURATION_MS = 900;

/** Loading screen — DESIGN-BRIEF.md §06b. Purely a timed animation for now; nothing real is being computed yet (steps 6-7). */
export function LoadingScreen({ locale, onDone }: LoadingScreenProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        if (step >= 2) {
          onDone();
        } else {
          setStep((s) => s + 1);
        }
      },
      MESSAGE_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [step, onDone]);

  const messages = [UI_STRINGS.loading.message1, UI_STRINGS.loading.message2, UI_STRINGS.loading.message3];

  return (
    <div className={styles.wrap}>
      <div className={styles.numeralWrap}>
        <span className={styles.numeral}>——</span>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => {
          const state = i === step ? styles.active : i === step + 1 ? styles.next : styles.pending;
          return (
            <span key={i} className={`${styles.message} ${state}`}>
              {tc(msg, locale)}
            </span>
          );
        })}
      </div>

      <div className={styles.segments}>
        {messages.map((_, i) => (
          <span key={i} className={`${styles.segment} ${i <= step ? styles.filled : ""}`} />
        ))}
      </div>
    </div>
  );
}
