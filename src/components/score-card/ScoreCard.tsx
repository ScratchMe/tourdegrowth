import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { PillarTag } from "@/components/pillar-tag/PillarTag";
import type { Pillar } from "@/lib/scoring/pillars";
import styles from "./ScoreCard.module.css";

interface ScoreCardProps {
  total: number;
  pillars: { pillar: Pillar; score: number }[];
  weakestPillar: Pillar;
  locale: Locale;
  /** e.g. "Sample B2B SaaS" — appended after the "Overall Growth Score" label. Omit for a real result. */
  caption?: string;
  /** e.g. "Stage 5/5" — shown at the right of the top row. */
  stageLabel?: string;
  /** `preview` = landing hero card (118px/84px numeral). `full` = result screens (144px/110px). */
  size?: "preview" | "full";
  /** Roast mode swaps the card's border/shadow from --ink to --red (DESIGN-BRIEF.md §04). */
  roast?: boolean;
  /** One-line summary under the numeral (DESIGN-BRIEF.md §02/§04) — Inter 500 neutral, 600 roast. Omit to show no line at all (landing preview doesn't have one). */
  headline?: string;
  /** The landing preview renders its own wrapping tag row here; the result screens lay pillar tags out themselves alongside the card instead. Defaults to true. */
  showTags?: boolean;
}

export function ScoreCard({
  total,
  pillars,
  weakestPillar,
  locale,
  caption,
  stageLabel,
  size = "preview",
  roast = false,
  headline,
  showTags = true,
}: ScoreCardProps) {
  return (
    <div
      className={`${styles.card} ${size === "full" ? styles.full : styles.preview} ${roast ? styles.roast : ""}`}
    >
      <div className={styles.topRow}>
        <span className={styles.label}>
          {tc(UI_STRINGS.scoreCard.label, locale)}
          {caption ? ` — ${caption}` : ""}
        </span>
        {stageLabel ? <span className={styles.label}>{stageLabel}</span> : null}
      </div>

      <div className={styles.numeralRow}>
        <span className={styles.numeral}>{total}</span>
        <span className={styles.suffix}>/100</span>
      </div>

      {headline ? (
        <p className={`${styles.headline} ${roast ? styles.headlineRoast : ""}`}>{headline}</p>
      ) : null}

      {showTags ? (
        <div className={styles.tags}>
          {pillars.map((p) => (
            <PillarTag
              key={p.pillar}
              pillar={p.pillar}
              score={p.score}
              locale={locale}
              weak={p.pillar === weakestPillar}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
