import type { ReactNode } from "react";
import type { Interval } from "@/lib/engine/types";
import styles from "./WorthBars.module.css";

export interface WorthBarsProps {
  /** « Coûte » · « 1 900 € » · the CAC (an estimate: its range). */
  cost: { label: ReactNode; value: ReactNode; amount: Interval };
  /**
   * « Rapporte » · « ~1 500 € » · the LTV. `amount: null` = unknown (no gross margin): the dashed, hatched « ? » box
   * across the track, `value` « ? », and `unknown` says what is missing. Never an empty bar: it would read as zero.
   */
  brings: { label: ReactNode; value: ReactNode; amount: Interval | null; unknown?: ReactNode };
  /** « il manque ~400 € » (short), « ~1 000 € de plus » (more), « les deux peuvent se croiser » (maybe: no bracket). */
  gap?: { label: ReactNode; kind: "short" | "more" | "maybe" };
  className?: string;
  "data-testid"?: string;
}

const pct = (x: number, top: number) => `${Math.max(0, Math.min(100, (x / top) * 100))}%`;

/**
 * What one new customer costs and what it brings back in margin over its
 * counted life — design system extension 09 (Q3): two ink bars on one
 * scale. A dashed guide carries the end of the cost across both rows, so
 * the eye reads at once whether the margin reaches it; the gap is measured
 * by a bracket and named in words. Never a colour.
 *
 * A range (an estimate upstream): solid to its low end, hatched to its high
 * end. The rows' text is real text; the bars are decoration (`aria-hidden`),
 * so a screen reader hears « Coûte 1 900 €. Rapporte ~1 500 €. Il manque ~400 € ».
 */
export function WorthBars({ cost, brings, gap, className, "data-testid": testId }: WorthBarsProps) {
  const b = brings.amount;
  const top = Math.max(cost.amount.hi, b ? b.hi : cost.amount.hi * 1.25) || 1;
  const cEnd = cost.amount.hi;
  return (
    <dl className={[styles.root, className].filter(Boolean).join(" ")} data-testid={testId}>
      {/* The line where the cost ends, across both rows, behind the bars. */}
      <div className={styles.guide} aria-hidden="true">
        <span className={styles.costLine} style={{ left: pct(cEnd, top) }} />
      </div>
      <dt className={`${styles.label} ${styles.rowCost}`}>{cost.label}</dt>
      <dd className={`${styles.track} ${styles.rowCost}`} aria-hidden="true">
        <span className={styles.bar} style={{ width: pct(cost.amount.lo, top) }} />
        {cost.amount.hi > cost.amount.lo ? (
          <span className={styles.range} style={{ left: pct(cost.amount.lo, top), width: pct(cost.amount.hi - cost.amount.lo, top) }} />
        ) : null}
      </dd>
      <dd className={`${styles.value} ${styles.rowCost}`}>{cost.value}</dd>
      <dt className={`${styles.label} ${styles.rowBrings}`}>{brings.label}</dt>
      <dd className={`${styles.track} ${styles.rowBrings}`} aria-hidden="true">
        {b ? (
          <>
            <span className={styles.bar} style={{ width: pct(b.lo, top) }} />
            {b.hi > b.lo ? <span className={styles.range} style={{ left: pct(b.lo, top), width: pct(b.hi - b.lo, top) }} /> : null}
            {gap && gap.kind !== "maybe" ? (
              <span className={styles.bracket} style={{ left: pct(Math.min(b.hi, cEnd), top), width: pct(Math.abs(b.hi - cEnd), top) }} />
            ) : null}
          </>
        ) : (
          <span className={styles.unknown}>
            <span className={styles.unknownMark}>?</span>
          </span>
        )}
      </dd>
      <dd className={`${styles.value} ${styles.rowBrings}`}>{brings.value}</dd>
      {gap ? <dd className={styles.gap}>{gap.label}</dd> : null}
      {!b && brings.unknown ? <dd className={styles.gap}>{brings.unknown}</dd> : null}
    </dl>
  );
}
