import { DotGrid, DotLegend } from "@/components/viz/DotGrid";
import { fillTemplate } from "@/lib/engine/format";
import { positionLabel } from "@/lib/engine/phrases";
import type { CandidateId } from "@/lib/engine/types";
import { columnGrid, signupsGrid } from "../visual-model";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

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
            medium="slide"
            grid={signupsGrid(derived.peloton.referredPerHundred)}
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
            <DotGrid medium="slide" grid={c.grid} highlighted={Boolean(c.stamp)} label={`${c.row.label} — ${c.row.text}`} />
            <p className={styles.columnSource}>
              <SlideText text={c.caption} accent={false} />
            </p>
          </section>
        ))}
      </div>

      <div className={styles.legend}>
        <DotLegend
          aria-hidden
          medium="slide"
          items={[
            ...(referred ? [{ mark: "referred" as const, label: referred.text }] : []),
            { mark: "filled", label: t.legendMeasured },
            { mark: "range", label: t.legendRange },
            { mark: "unknown", label: t.legendUnknown },
          ]}
        />
        <p className={styles.legendNote}>{t.slideSameHundred}</p>
      </div>
    </SlideFrame>
  );
}
