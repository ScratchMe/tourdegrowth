import styles from "./StampedPillar.module.css";

export interface StampedPillarProps {
  pillar: string;
  score: number;
  total?: number;
  /** e.g. "dead last" / "bon dernier" — localized by the caller. */
  suffix: string;
}

/**
 * The one "spray-stamped" element on the Roast result screen — replaces the
 * weakest pillar's normal `PillarChip` entirely. Carried forward from the
 * app's original StampedTag (iteration 1), restyled onto the v2 tokens: the
 * DS v2 bundle's 17-component set doesn't cover this roast-only effect (the
 * addendum never touches the roast score screen), so this is preserved
 * rather than dropped. Never reused for anything else; do not rotate any
 * other element to match.
 */
export function StampedPillar({ pillar, score, total = 20, suffix }: StampedPillarProps) {
  return (
    <span className={styles.stamped}>
      {score}/{total} {pillar.toUpperCase()} — {suffix}
    </span>
  );
}
