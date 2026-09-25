import { DERIVED_SHAPES, LTV_CAP_MONTHS } from "@/lib/engine/catalog-shape";
import { formatDuration } from "@/lib/engine/format";
import { rowOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** The commonly cited payback reference, read from the catalogue shape rather than retyped (§5.7). */
const PAYBACK_REFERENCE_MONTHS = DERIVED_SHAPES.find((s) => s.id === "rev.cac-payback")?.benchmark?.lo ?? null;

type Tile = { id: string; label: string; value: string; note: string };

/**
 * Slide 4 — "what a customer brings in" (§9.3). Four tiles, then one bar.
 *
 * The tiles print the model's rows as they are: its name (`label`), its
 * figure (`value`) and the line under it (`note` — for the CAC its variant,
 * always written because "media only" and "fully loaded" are two different
 * numbers wearing the same name, §6.8; for a figure that can't be computed,
 * which input is missing). An empty `value` prints "?", never a 0 — and
 * never a margin-less LTV, which is the flattering version the glossary
 * warns against (§5.7).
 *
 * The bar is a timeline in months, from 0 to the 36-month lifetime cap: the
 * stretch a customer spends paying back their acquisition cost is solid ink,
 * a range is hatched. A dashed tick marks the commonly cited 12 months,
 * labelled as a reference and never as a pass mark. When the payback can't
 * be computed the whole bar is the unknown shape — hatched, dashed, a "?" —
 * because an empty bar reads as zero, and zero is a measurement. The axis
 * ends on the model's `cap` sentence when there is an LTV for it to cap, and
 * on its bare 36 months otherwise.
 */
export function SlideUnitEconomics({ slide, context }: SlideProps) {
  const { strings, derived, ctx } = context;
  const cac = rowOf(slide, "cac");
  const cap = rowOf(slide, "cap");

  const tiles: Tile[] = [
    cac ? { id: "cac", label: cac.label, value: cac.value, note: cac.variant } : null,
    ...(["payback", "ltv", "ltvCac"] as const).map((kind) => {
      const row = rowOf(slide, kind);
      return row ? { id: kind === "ltvCac" ? "ltv-cac" : kind, label: row.label, value: row.value, note: row.note } : null;
    }),
  ].filter((tile): tile is Tile => tile !== null);

  // Geometry only: where the payback falls on a 0-36 month axis, never a printed figure.
  const payback = derived.unit.payback;
  const start = payback.kind === "known" ? Math.min(payback.value.lo, LTV_CAP_MONTHS) : null;
  const end = payback.kind === "known" ? Math.min(payback.value.hi, LTV_CAP_MONTHS) : null;
  const pct = (months: number) => `${(months / LTV_CAP_MONTHS) * 100}%`;

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.unit}>
        <ul className={styles.figureRow}>
          {tiles.map((tile) => {
            const known = tile.value !== "";
            return (
              <li key={tile.id} className={styles.figure} data-known={known || undefined} data-testid={`slide-figure-${tile.id}`}>
                <span className={styles.figureLabel}>
                  <SlideText text={tile.label} accent={false} />
                </span>
                <span className={[styles.figureValue, known ? "" : styles.figureUnknown].filter(Boolean).join(" ")}>{known ? tile.value : "?"}</span>
                {tile.note ? <span className={styles.figureNote}>{tile.note}</span> : null}
              </li>
            );
          })}
        </ul>

        <figure className={styles.timeline} aria-hidden="true">
          <div className={[styles.timelineTrack, start === null ? styles.timelineUnknown : ""].filter(Boolean).join(" ")}>
            {start !== null && end !== null ? (
              <>
                <span className={styles.timelinePayback} style={{ width: pct(start) }} />
                {end > start ? <span className={styles.timelineRange} style={{ left: pct(start), width: pct(end - start) }} /> : null}
              </>
            ) : (
              <span className={styles.timelineQuestion}>?</span>
            )}
            {PAYBACK_REFERENCE_MONTHS !== null ? <span className={styles.timelineTick} style={{ left: pct(PAYBACK_REFERENCE_MONTHS) }} /> : null}
          </div>
          <div className={styles.timelineScale}>
            <span>0</span>
            {PAYBACK_REFERENCE_MONTHS !== null ? (
              <span className={styles.timelineTickLabel} style={{ left: pct(PAYBACK_REFERENCE_MONTHS) }}>
                {formatDuration(PAYBACK_REFERENCE_MONTHS, "months", ctx, strings.units)} · {strings.slide.unitReference}
              </span>
            ) : null}
            <span className={styles.timelineCap}>{cap?.text ?? formatDuration(LTV_CAP_MONTHS, "months", ctx, strings.units)}</span>
          </div>
        </figure>
      </div>
    </SlideFrame>
  );
}
