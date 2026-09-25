import { DERIVED_SHAPES, LTV_CAP_MONTHS } from "@/lib/engine/catalog-shape";
import type { DerivedId } from "@/lib/engine/types";
import { linesOf } from "./deck-lines";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText, fill } from "./slide-text";
import styles from "./deck.module.css";

type FigureId = "cac" | "payback" | "ltv" | "ltv-cac";
const DERIVED_OF: Record<Exclude<FigureId, "cac">, DerivedId> = {
  payback: "rev.cac-payback",
  ltv: "rev.ltv",
  "ltv-cac": "rev.ltv-cac",
};

/** The "commonly cited" payback reference: its low bound, read from the catalogue shape rather than retyped. */
const PAYBACK_REFERENCE_MONTHS = DERIVED_SHAPES.find((s) => s.id === "rev.cac-payback")?.benchmark?.lo ?? null;

/**
 * Slide 4 — "what a customer brings in" (§9.3). Four tiles, then one bar.
 *
 * The bar is a timeline in months, 0 to the 36-month lifetime cap: the stretch
 * a customer spends paying back their acquisition cost is solid ink, the rest
 * is the margin the LTV counts. A tick marks the commonly cited 12-month
 * payback, labelled as a reference and never as a pass mark. When the payback
 * can't be computed the bar is drawn as unknown — hatched, with a "?" — rather
 * than empty, because an empty bar reads as zero and zero is a measurement
 * (DS v3 §5.5).
 *
 * The CAC's variant is always written under it: "media only" and "fully
 * loaded" are two different numbers wearing the same name (§6.8).
 */
export function SlideUnitEconomics({ slide, context }: SlideProps) {
  const { strings, metrics, derivedCopy, derived } = context;
  const figures = linesOf(slide, "figure");
  const figure = (id: FigureId) => figures.find((f) => f.id === id);

  const labelOf = (id: FigureId): string =>
    id === "cac"
      ? (metrics.find((m) => m.id === "acq.cac")?.name ?? "CAC")
      : (derivedCopy.find((d) => d.id === DERIVED_OF[id])?.name ?? id);

  const variant =
    derived.unit.cacVariant !== null
      ? metrics.find((m) => m.id === "acq.cac")?.variants?.find((v) => v.id === derived.unit.cacVariant)?.label
      : undefined;

  const payback = derived.unit.payback;
  // Geometry only: a position on a 0-36 month axis, never a printed figure.
  const paybackEnd = payback.kind === "known" ? Math.min(payback.value.hi, LTV_CAP_MONTHS) : null;
  const paybackStart = payback.kind === "known" ? Math.min(payback.value.lo, LTV_CAP_MONTHS) : null;
  const pct = (months: number) => `${(months / LTV_CAP_MONTHS) * 100}%`;

  const tiles: FigureId[] = ["cac", "payback", "ltv", "ltv-cac"];

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.unit}>
        <ul className={styles.figureRow}>
          {tiles.map((id) => {
            const line = figure(id);
            const known = Boolean(line?.value);
            return (
              <li key={id} className={styles.figure} data-known={known || undefined}>
                <span className={styles.figureLabel}><SlideText text={labelOf(id)} accent={false} /></span>
                <span className={[styles.figureValue, known ? "" : styles.figureUnknown].join(" ")}>
                  {known ? line!.value : "?"}
                </span>
                {id === "cac" && variant ? <span className={styles.figureNote}>{variant}</span> : null}
                {line?.note ? <span className={styles.figureNote}>{line.note}</span> : null}
              </li>
            );
          })}
        </ul>

        <figure className={styles.timeline} aria-hidden="true">
          <div className={[styles.timelineTrack, paybackEnd === null ? styles.timelineUnknown : ""].join(" ")}>
            {paybackEnd !== null && paybackStart !== null ? (
              <>
                <span className={styles.timelinePayback} style={{ width: pct(paybackStart) }} />
                {paybackEnd > paybackStart ? (
                  <span
                    className={styles.timelineRange}
                    style={{ left: pct(paybackStart), width: pct(paybackEnd - paybackStart) }}
                  />
                ) : null}
              </>
            ) : (
              <span className={styles.timelineQuestion}>?</span>
            )}
            {PAYBACK_REFERENCE_MONTHS !== null ? (
              <span className={styles.timelineTick} style={{ left: pct(PAYBACK_REFERENCE_MONTHS) }} />
            ) : null}
          </div>
          <div className={styles.timelineScale}>
            <span>0</span>
            {PAYBACK_REFERENCE_MONTHS !== null ? (
              <span className={styles.timelineTickLabel} style={{ left: pct(PAYBACK_REFERENCE_MONTHS) }}>
                {fill(strings.units.months, { n: PAYBACK_REFERENCE_MONTHS })} · {strings.slide.unitReference}
              </span>
            ) : null}
            <span className={styles.timelineCap}>
              {fill(strings.units.months, { n: LTV_CAP_MONTHS })} · {strings.slide.unitCap}
            </span>
          </div>
        </figure>
      </div>
    </SlideFrame>
  );
}
