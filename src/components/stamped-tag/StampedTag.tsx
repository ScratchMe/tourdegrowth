import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import styles from "./StampedTag.module.css";

interface StampedTagProps {
  pillar: Pillar;
  score: number;
  locale: Locale;
}

/**
 * The one "spray-stamped" element on the Roast result screen (DESIGN-BRIEF.md
 * §04) — replaces the weakest pillar's normal tag entirely. Never reused for
 * anything else; do not rotate any other element to match.
 */
export function StampedTag({ pillar, score, locale }: StampedTagProps) {
  const label = tc(UI_STRINGS.pillars[pillar], locale).toUpperCase();
  const suffix = tc(UI_STRINGS.result.stampedSuffix, locale);

  return (
    <span className={styles.stamped}>
      {score}/20 {label} — {suffix}
    </span>
  );
}
