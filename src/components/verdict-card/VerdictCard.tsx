import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import styles from "./VerdictCard.module.css";

interface VerdictCardProps {
  pillar: Pillar;
  score: number;
  sentence: string;
  locale: Locale;
  /** Red-soft variant for the "Where you're losing time" section (DESIGN-BRIEF.md §02). */
  weak?: boolean;
}

/** One Strengths/Weaknesses sub-card: a mono "Pillar — score/20" label above a sentence. */
export function VerdictCard({ pillar, score, sentence, locale, weak = false }: VerdictCardProps) {
  const label = tc(UI_STRINGS.pillars[pillar], locale);

  return (
    <div className={`${styles.card} ${weak ? styles.weak : ""}`}>
      <span className={styles.label}>
        {label} — {score}/20
      </span>
      <p className={styles.sentence}>{sentence}</p>
    </div>
  );
}
