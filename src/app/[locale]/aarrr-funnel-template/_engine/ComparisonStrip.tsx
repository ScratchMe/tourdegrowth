import type { EngineStrings } from "@/lib/engine/strings";
import type { Interval } from "@/lib/engine/types";
import styles from "./Sheet.module.css";

/** The domain's candidate upper bounds, in percent (§8.3). */
const DOMAINS = [5, 10, 20, 50, 100] as const;

/** The smallest domain holding the highest value drawn, with 20 % of room to spare — so a mark is never pinned to the end of the track. */
export function stripDomain(highest: number): number {
  return DOMAINS.find((d) => d >= highest * 1.2) ?? 100;
}

const pct = (v: number, domain: number) => `${Math.min(100, Math.max(0, (v / domain) * 100))}%`;

/**
 * The comparison strip of a stage's drawer (spec §8.3) — the one place a
 * rate is drawn against its reference, with the bounds WRITTEN at both ends
 * ("0" … "50 %"), because a bar without its scale invites a comparison of
 * lengths the numbers don't support.
 *
 * Decorative (`aria-hidden`): the sentence next to it says the same thing in
 * words, and a screen reader would get nothing from a 12px track. Nothing is
 * ever written INSIDE the track — the target's mark carries its label beside
 * it, above the track.
 *
 * Drawn in percent only: the six candidates are all rates, and the strip is
 * shown for nothing else.
 */
export function ComparisonStrip({
  value,
  below,
  reference,
  target,
  formatBound,
  strings,
}: {
  /** The number, as an interval: a point when measured, a hatched segment when a range. */
  value: Interval | null;
  /** Drawn in the diagnosis red when the number sits below its comparator. */
  below: boolean;
  reference?: Interval;
  target?: number;
  /** "50 %" / "50%" — the caller owns the locale. */
  formatBound: (v: number) => string;
  strings: EngineStrings;
}) {
  const highest = Math.max(value?.hi ?? 0, reference?.hi ?? 0, target ?? 0);
  if (highest <= 0) return null;
  const domain = stripDomain(highest);
  const range = value && value.lo !== value.hi;

  return (
    <div className={styles.strip} aria-hidden="true" data-testid="engine-strip" data-domain={domain}>
      <div className={styles.stripMarks}>
        {target !== undefined ? (
          <span className={styles.stripTargetLabel} style={{ left: pct(target, domain) }}>
            {strings.workbench.targetMark}
          </span>
        ) : null}
      </div>
      <div className={styles.stripTrack}>
        {reference ? (
          <span
            className={styles.stripReference}
            style={{ left: pct(reference.lo, domain), width: `calc(${pct(reference.hi, domain)} - ${pct(reference.lo, domain)} + 2px)` }}
          />
        ) : null}
        {value ? (
          range ? (
            <span
              className={[styles.stripRange, below ? styles.stripBelow : ""].filter(Boolean).join(" ")}
              style={{ left: pct(value.lo, domain), width: `calc(${pct(value.hi, domain)} - ${pct(value.lo, domain)} + 4px)` }}
            />
          ) : (
            <span
              className={[styles.stripValue, below ? styles.stripBelow : ""].filter(Boolean).join(" ")}
              style={{ left: pct(value.lo, domain) }}
            />
          )
        ) : null}
        {target !== undefined ? <span className={styles.stripTarget} style={{ left: pct(target, domain) }} /> : null}
      </div>
      <div className={styles.stripBounds}>
        <span>{formatBound(0)}</span>
        <span>{formatBound(domain)}</span>
      </div>
    </div>
  );
}
