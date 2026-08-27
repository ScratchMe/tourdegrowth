import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import styles from "./PillarTag.module.css";

interface PillarTagProps {
  pillar: Pillar;
  score: number;
  locale: Locale;
  /** The weak pillar gets the red/dashed treatment (DESIGN-BRIEF.md §01/§02). */
  weak?: boolean;
}

/**
 * One `"18 Acquisition"` tag. Renders both the full label and a 3-letter
 * abbreviation ("Acq") and lets CSS pick one per breakpoint (DESIGN-BRIEF.md:
 * "stage tags abbreviated to Acq/Act/Ret/Ref/Rev" on mobile) — no JS
 * viewport detection, no hydration mismatch risk.
 */
export function PillarTag({ pillar, score, locale, weak = false }: PillarTagProps) {
  const label = tc(UI_STRINGS.pillars[pillar], locale);

  return (
    <span className={`${styles.tag} ${weak ? styles.weak : ""}`}>
      <strong className={styles.score}>{score}</strong>
      <span className={styles.labelFull}>{label}</span>
      <span className={styles.labelShort}>{label.slice(0, 3)}</span>
    </span>
  );
}
