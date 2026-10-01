import { DERIVED_SHAPES } from "@/lib/engine/catalog-shape";
import { formatDuration } from "@/lib/engine/format";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** The commonly cited payback reference, read from the catalogue shape rather than retyped (§5.7). */
const PAYBACK_REFERENCE_MONTHS = DERIVED_SHAPES.find((s) => s.id === "rev.cac-payback")?.benchmark?.lo ?? null;

/**
 * `unit-economics` in the hybrid — « deux motions en regard » (engine spec
 * §18.8.2). One table, two columns, self-serve then sales-assisted — never
 * sorted by any value, never a bar that sets them on one axis (§18.6.4):
 * the CAC with its variant, the payback, what a customer brings in, the
 * customers lost in a year (one unit per line, C25 Q5), LTV:CAC. A figure
 * that can't be computed says which input is missing, in the cell.
 *
 * The payback's commonly cited reference sits under the table as context,
 * as the self-serve slide prints it on its timeline — never a pass mark.
 * The footer is the model's: the two segments, the lifetime cap, a
 * company-wide margin, two CACs that count different spend.
 */
export function SlideUnitBoth({ slide, context }: SlideProps) {
  const { strings, ctx } = context;
  const rows = rowsOf(slide, "unitRow");
  const footer = rowOf(slide, "footer")?.text;
  const names = strings.hybrid.motionName;

  return (
    <SlideFrame slide={slide} context={context} footer={footer} footerDense>
      <div className={styles.unitBoth}>
        <table className={styles.unitTable} data-testid="slide-unit-table">
          <thead>
            <tr>
              <td />
              <th scope="col" data-testid="slide-unit-col-plg">
                {names.plg}
              </th>
              <th scope="col" data-testid="slide-unit-col-slg">
                {names.slg}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} data-testid={`slide-unit-row-${row.id}`}>
                <th scope="row">{row.label}</th>
                <td>
                  <SlideText text={row.plg} accent={false} />
                </td>
                <td>
                  <SlideText text={row.slg} accent={false} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {PAYBACK_REFERENCE_MONTHS !== null ? (
          <p className={styles.unitReference}>
            {strings.slide.unitRows.payback} · {formatDuration(PAYBACK_REFERENCE_MONTHS, "months", ctx, strings.units)} · {strings.slide.unitReference}
          </p>
        ) : null}
      </div>
    </SlideFrame>
  );
}
