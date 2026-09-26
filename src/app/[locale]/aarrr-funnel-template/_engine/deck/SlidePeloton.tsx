import { fillTemplate } from "@/lib/engine/format";
import { positionLabel } from "@/lib/engine/phrases";
import type { CandidateId } from "@/lib/engine/types";
import { columnGrid, signupsGrid, type GridModel } from "../visual-model";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

const DOT_CLASS = {
  filled: styles.dotFilled,
  referred: styles.dotReferred,
  range: styles.dotRange,
  referredRange: styles.dotReferredRange,
  empty: styles.dotEmpty,
} as const;

/**
 * A 10 × 10 grid of the same 100 sign-ups — engine spec §8.1, D5 — drawn
 * from the board's own model (`visual-model.ts`), so the screen and the
 * slide can't draw one column two ways.
 *
 * Counts, not lengths: there is no scale to defend, and an unknown has a
 * shape of its own — the whole grid hatched, a dashed edge, a "?" on a paper
 * disc — instead of an empty grid that would read as zero. A range is solid
 * to its low bound and hatched to its high one, so "6 à 9" is six solid dots
 * and three striped ones, never "7.5".
 */
function DotGrid({ grid, highlighted, label }: { grid: GridModel; highlighted: boolean; label: string }) {
  if (grid.kind === "unknown") {
    return (
      <div className={`${styles.grid} ${styles.gridUnknown}`} role="img" aria-label={label}>
        <span className={styles.gridQuestion} aria-hidden="true">
          ?
        </span>
      </div>
    );
  }
  return (
    <div className={[styles.grid, highlighted ? styles.gridHighlighted : ""].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {grid.dots.map((dot, i) => (
        <span key={i} className={`${styles.dot} ${DOT_CLASS[dot]}`} aria-hidden="true" />
      ))}
    </div>
  );
}

/**
 * Slide 1 — "where the engine stands" (§9.3). Four columns counted on the
 * same 100 sign-ups: sign-ups (the referred ones ringed), activated, active
 * at day 30, paying. Inside a column the order is the reference slide's:
 * numeral → label → grid → source — a numeral under the grid touches the
 * dots (the mistake the spec's own mock-up made).
 *
 * Every word is the model's (`column`, `upstream`, `legendReferred` rows):
 * the numeral is the row's `value` — "" for an unknown column, which the
 * slide draws as "?", never as a 0 — and the caption is the row's `source`,
 * or its whole `text` when there is no number to cite a source for. The grid
 * is the one thing drawn from the derived intervals: a position, not words.
 *
 * The one red is the diagnosis: the column the diagnosis names takes it on
 * its dots and carries the stamp, which says it in words beside the numeral
 * — never on top of the grid, where it would hide the dots it is about.
 */
export function SlidePeloton({ slide, context }: SlideProps) {
  const { strings, derived, model } = context;
  const t = strings.peloton;
  const rows = rowsOf(slide, "column");
  const upstream = rowOf(slide, "upstream");
  const referred = rowOf(slide, "legendReferred");

  const named = derived.diagnosis.state === "clear" || derived.diagnosis.state === "shared" ? derived.diagnosis.named : [];
  // The same words as the board's position label: the side follows the metric's direction.
  const stampOf = (metric: CandidateId): string | null => {
    if (!named.includes(metric)) return null;
    const p = derived.diagnosis.positions[metric];
    return p ? positionLabel(p.position, p.comparator, strings) : null;
  };

  // The columns in the peloton's own order; each placed from its model row.
  const columns = derived.peloton.columns.flatMap((col) => {
    const row = rows.find((r) => r.id === col.metric);
    if (!row) return [];
    const unknown = row.value === "";
    return [
      {
        metric: col.metric,
        row,
        unknown,
        caption: unknown ? row.text : row.source,
        grid: columnGrid(unknown ? null : col.perHundred),
        stamp: stampOf(col.metric),
      },
    ];
  });

  return (
    <SlideFrame slide={slide} context={context}>
      {upstream ? (
        <p className={styles.upstream}>
          <Arrow direction="down" className={styles.upstreamArrow} />
          <SlideText text={upstream.text} accent={false} />
        </p>
      ) : null}

      <div className={styles.peloton}>
        <section className={styles.column} data-column="signups">
          <div className={styles.numeralRow}>
            <p className={styles.numeral}>100</p>
          </div>
          <h4 className={styles.columnLabel}>{t.signups}</h4>
          <DotGrid
            grid={signupsGrid(derived.peloton.referredPerHundred)}
            highlighted={false}
            label={referred ? `${referred.label} — 100, ${referred.text}` : `${t.signups} — 100`}
          />
          <p className={styles.columnSource}>{fillTemplate(strings.visual.cohortOf, { cohort: model.footer.cohort ?? "" })}</p>
        </section>

        {columns.map((c) => (
          <section key={c.metric} className={styles.column} data-column={c.metric} data-unknown={c.unknown || undefined}>
            <div className={styles.numeralRow}>
              <p className={[styles.numeral, c.unknown ? styles.numeralUnknown : ""].filter(Boolean).join(" ")} data-testid={`slide-numeral-${c.metric}`}>
                <SlideText text={c.unknown ? "?" : c.row.value} accent={false} />
              </p>
              {c.stamp ? (
                <span className={styles.stamp} data-testid="slide-stamp">
                  {c.stamp}
                </span>
              ) : null}
            </div>
            <h4 className={styles.columnLabel}>{c.row.label}</h4>
            <DotGrid grid={c.grid} highlighted={Boolean(c.stamp)} label={`${c.row.label} — ${c.row.text}`} />
            <p className={styles.columnSource}>
              <SlideText text={c.caption} accent={false} />
            </p>
          </section>
        ))}
      </div>

      <div className={styles.legend}>
        <ul className={styles.legendItems} aria-hidden="true">
          {referred ? (
            <li>
              <span className={`${styles.swatch} ${styles.dotReferred}`} />
              {referred.text}
            </li>
          ) : null}
          <li>
            <span className={`${styles.swatch} ${styles.dotFilled}`} />
            {t.legendMeasured}
          </li>
          <li>
            <span className={`${styles.swatch} ${styles.dotRange}`} />
            {t.legendRange}
          </li>
          <li>
            <span className={`${styles.swatch} ${styles.swatchUnknown}`} />
            {t.legendUnknown}
          </li>
        </ul>
        <p className={styles.legendNote}>{t.slideSameHundred}</p>
      </div>
    </SlideFrame>
  );
}
