import { STATUS_KEY } from "@/lib/engine/strings";
import type { CandidateId, Interval, MetricStatus, PelotonColumn } from "@/lib/engine/types";
import { linesOf, lineOf } from "./deck-lines";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText, fill } from "./slide-text";
import styles from "./deck.module.css";

type ColumnId = "signups" | PelotonColumn["metric"];

/**
 * A 10 × 10 grid of the same 100 sign-ups — engine spec §8.1, D5.
 *
 * Counts, not lengths: there is no scale to defend, and an unknown has a
 * shape of its own — the whole grid in dashed red with a "?" on a paper disc
 * — instead of an empty bar that would read as zero. A range is hatched from
 * its low to its high bound, so "6 à 9" is six solid dots and three striped
 * ones, never "7.5".
 */
export function DotGrid({
  filled,
  hatched = 0,
  referred = 0,
  unknown = false,
  label,
}: {
  filled: number;
  hatched?: number;
  referred?: number;
  unknown?: boolean;
  label: string;
}) {
  const dots = Array.from({ length: 100 }, (_, i) => {
    if (unknown) return styles.dotUnknown;
    if (i < referred) return styles.dotReferred;
    if (i < filled) return styles.dotFilled;
    if (i < filled + hatched) return styles.dotRange;
    return styles.dotEmpty;
  });
  return (
    <div className={styles.gridWrap} role="img" aria-label={label}>
      <div className={styles.grid} aria-hidden="true">
        {dots.map((cls, i) => (
          <span key={i} className={`${styles.dot} ${cls}`} />
        ))}
      </div>
      {unknown ? (
        <span className={styles.gridUnknown} aria-hidden="true">
          ?
        </span>
      ) : null}
    </div>
  );
}

/** Integers under 100: the one number a grid shows that needs no formatter — a count of dots. */
function dotsOf(perHundred: Interval | null): { filled: number; hatched: number } | null {
  if (!perHundred) return null;
  const lo = Math.max(0, Math.min(100, Math.round(perHundred.lo)));
  const hi = Math.max(lo, Math.min(100, Math.round(perHundred.hi)));
  return { filled: lo, hatched: hi - lo };
}

/**
 * Slide 1 — "where the engine stands" (§9.3). Four columns counted on the
 * same 100 sign-ups: sign-ups (with the referred ones in red), activated,
 * active at day 30, paying. Order inside a column is the reference slide's:
 * numeral → label → grid → source — a numeral under the grid touches the
 * dots (the mistake the spec's own mock-up made).
 */
export function SlidePeloton({ slide, context }: SlideProps) {
  const { strings, derived, state } = context;
  const snapshot = state.snapshots[0];
  const t = strings.peloton;
  const columnLines = linesOf(slide, "column");
  const upstream = lineOf(slide, "upstream")?.text;

  const named = derived.diagnosis.state === "clear" || derived.diagnosis.state === "shared" ? derived.diagnosis.named : [];
  const stampFor = (metric: CandidateId): string | null => {
    if (!named.includes(metric)) return null;
    const kind = derived.diagnosis.positions[metric]?.comparator?.kind;
    return kind === "target" ? strings.diagnosis.stampTarget : strings.diagnosis.stampReference;
  };

  const referredDots = dotsOf(derived.peloton.referredPerHundred);
  const referredLegend =
    lineOf(slide, "legendReferred")?.text ??
    (referredDots ? fill(t.legendReferred, { n: referredDots.filled }) : null);

  const labels: Record<ColumnId, string> = {
    signups: t.signups,
    "act.rate": t.activated,
    "ret.d30": t.d30,
    "rev.paid-conversion": fill(t.paid, { n: state.setup.paidWindowDays }),
  };

  const columns: { id: ColumnId; dots: { filled: number; hatched: number } | null; status: MetricStatus | null }[] = [
    { id: "signups", dots: { filled: 100, hatched: 0 }, status: null },
    ...derived.peloton.columns.map((c) => ({
      id: c.metric as ColumnId,
      dots: dotsOf(c.perHundred),
      status: snapshot?.metrics[c.metric]?.status ?? "todo",
    })),
  ];

  return (
    <SlideFrame slide={slide} context={context}>
      {upstream ? (
        <p className={styles.upstream}>
          <Arrow direction="down" className={styles.upstreamArrow} />
          <SlideText text={upstream} accent={false} />
        </p>
      ) : null}

      <div className={styles.peloton}>
        {columns.map((column) => {
          const line = columnLines.find((l) => l.metric === column.id);
          const unknown = column.dots === null;
          // The numeral is the model's finished string; failing that, a
          // dot count is the one figure a grid can state by itself.
          const numeral =
            line?.value ??
            (unknown
              ? "?"
              : column.dots!.hatched === 0
                ? String(column.dots!.filled)
                : fill(strings.units.range, { lo: column.dots!.filled, hi: column.dots!.filled + column.dots!.hatched }));
          const source = line?.source ?? (unknown ? t.legendUnknown : "");
          const stamp = column.id === "signups" ? null : stampFor(column.id);
          const status = column.status ? strings.status[STATUS_KEY[column.status]] : "";
          const aria = fill(t.aria, {
            n: numeral,
            population: labels[column.id].toLowerCase(),
            status,
            source,
            cohort: context.model.footer.cohort ?? "",
          });
          return (
            <section key={column.id} className={styles.column} data-column={column.id} data-unknown={unknown || undefined}>
              <p className={[styles.numeral, unknown ? styles.numeralUnknown : ""].join(" ")}>
                <SlideText text={numeral} accent={false} />
              </p>
              <h4 className={styles.columnLabel}>{labels[column.id]}</h4>
              <div className={styles.gridSlot}>
                <DotGrid
                  filled={column.dots?.filled ?? 0}
                  hatched={column.dots?.hatched ?? 0}
                  referred={column.id === "signups" ? (referredDots?.filled ?? 0) : 0}
                  unknown={unknown}
                  label={column.id === "signups" ? `${numeral} — ${labels.signups}` : aria}
                />
                {stamp ? <span className={styles.stamp}>{stamp}</span> : null}
              </div>
              {source ? (
                <p className={styles.columnSource}>
                  <SlideText text={source} accent={false} />
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      <div className={styles.legend}>
        <ul className={styles.legendItems}>
          {referredLegend ? (
            <li>
              <span className={`${styles.dot} ${styles.dotReferred} ${styles.legendDot}`} aria-hidden="true" />
              {referredLegend}
            </li>
          ) : null}
          <li>
            <span className={`${styles.dot} ${styles.dotFilled} ${styles.legendDot}`} aria-hidden="true" />
            {t.legendMeasured}
          </li>
          <li>
            <span className={`${styles.dot} ${styles.dotRange} ${styles.legendDot}`} aria-hidden="true" />
            {t.legendRange}
          </li>
          <li>
            <span className={`${styles.dot} ${styles.dotUnknown} ${styles.legendDot}`} aria-hidden="true" />
            {t.legendUnknown}
          </li>
        </ul>
        <p className={styles.legendNote}>{t.sameHundred}</p>
      </div>
    </SlideFrame>
  );
}
