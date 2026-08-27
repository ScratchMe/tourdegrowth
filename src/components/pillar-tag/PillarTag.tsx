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
  /**
   * Show the `/20` denominator after the score. DESIGN-BRIEF.md's own two
   * formats differ by context: the landing preview (§01) reads bare `18
   * Acquisition`, but the result screens (§02/§04) read `18/20 Acquisition`
   * — same component, same recipe, different text. Defaults to false (the
   * landing-preview format) since that's this component's original context.
   */
  showMax?: boolean;
  /**
   * Keep the full pillar name at every width instead of abbreviating below
   * 760px. DESIGN-BRIEF.md only calls for the 3-letter abbreviation
   * ("Acq/Act/Ret/Ref/Rev") on the landing preview's mobile card (§01) — its
   * own mobile result-screen example (§02) spells out `18/20 Acquisition`
   * in full. Defaults to false (abbreviate), matching this component's
   * original landing-preview context.
   */
  fullLabel?: boolean;
  /**
   * Stretch the tag to fill its container width, with the score pinned to
   * the left edge and the pillar name to the right (desktop only — see
   * PillarTag.module.css). DESIGN-BRIEF.md §02 desktop stacks the five tags
   * in the same 400px column as the score card itself; a compact chip
   * sized to its own text (this component's original landing-preview
   * behavior) reads as narrower and mis-aligned against that card, not as
   * one continuous block. Defaults to false.
   */
  stretch?: boolean;
}

/**
 * One `"18 Acquisition"` (or, on the result screens, `"18/20 Acquisition"`)
 * tag. Renders both the full label and a 3-letter abbreviation ("Acq") and
 * lets CSS pick one per breakpoint (DESIGN-BRIEF.md: "stage tags abbreviated
 * to Acq/Act/Ret/Ref/Rev" on mobile) — no JS viewport detection, no
 * hydration mismatch risk.
 */
export function PillarTag({
  pillar,
  score,
  locale,
  weak = false,
  showMax = false,
  fullLabel = false,
  stretch = false,
}: PillarTagProps) {
  const label = tc(UI_STRINGS.pillars[pillar], locale);

  return (
    <span className={`${styles.tag} ${weak ? styles.weak : ""} ${stretch ? styles.stretch : ""}`}>
      <strong className={styles.score}>
        {score}
        {showMax ? "/20" : ""}
      </strong>
      <span className={fullLabel ? undefined : styles.labelFull}>{label}</span>
      {!fullLabel && <span className={styles.labelShort}>{label.slice(0, 3)}</span>}
    </span>
  );
}
