import { CashWarning } from "@/components/engine/CashWarning";
import { PaybackChart } from "@/components/engine/PaybackChart";
import type { Motion } from "@/lib/engine/types";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** Each engine's picture on the 1 920 canvas: its column's width, compact, drawn at its real size so its type never scales. */
export const UNIT_BOTH_CHART = { width: 780, height: 150 } as const;

type Tile = { id: string; label: string; value: string; note: string; wide?: boolean };

/**
 * `unit-economics` in the hybrid — « deux moteurs en regard » (engine spec
 * §18.8.2), side by side since design system extension 09 (Q12, A20.d T4.d):
 * self-serve then sales-assisted, two columns, never summed and never sorted
 * by any value, never one axis for both (§18.6.4). Each column: the engine's
 * name, its five tiles — the CAC with its variant, the LTV, the LTV:CAC, the
 * payback, the cash tied up (with « ne revient pas toute » when its customer
 * leaves first) — and its picture (`PaybackChart`, compact: its months on the
 * axis row; none without a margin, its tiles say what is missing), then its
 * warning when it has one.
 *
 * Under both, one note: GRR and NRR for self-serve, the renewal for
 * sales-assisted, what the cash assumes, the dotted reference. The footer is
 * the model's: the two segments, the lifetime cap, a company-wide margin, two
 * CACs that count different spend. A figure that can't be computed is « ? »
 * and says what is missing, never a 0.
 */
export function SlideUnitBoth({ slide, context }: SlideProps) {
  const { strings } = context;
  const footer = rowOf(slide, "footer")?.text;
  const assume = rowOf(slide, "assume");
  const names = strings.hybrid.motionName;

  const column = (motion: Motion) => {
    const of = <K extends "cac" | "ltv" | "ltvCac" | "payback" | "cash">(kind: K) => rowsOf(slide, kind).find((row) => (row as Record<string, string>).motion === motion);
    const cac = of("cac");
    const tiles: Tile[] = [
      cac ? { id: "cac", label: cac.label, value: cac.value, note: cac.variant } : null,
      ...(["ltv", "ltvCac", "payback", "cash"] as const).map((kind) => {
        const row = of(kind);
        return row ? { id: kind === "ltvCac" ? "ltv-cac" : kind, label: row.label, value: row.value, note: row.note, wide: kind === "cash" } : null;
      }),
    ].filter((tile): tile is Tile => tile !== null);
    const warning = rowsOf(slide, "warning").find((row) => (row as Record<string, string>).motion === motion);
    // Without a margin, the column draws no « ? » box: its tiles already say what is missing, and a box there pushed
    // the body under a three-line title.
    const drawn = slide.paybackCharts?.[motion];
    const chart = drawn && drawn.story !== "unknown" ? drawn : undefined;
    return (
      <section key={motion} className={styles.unitEngine} data-testid={`slide-unit-${motion}`}>
        <h4 className={styles.unitEngineName}>{names[motion]}</h4>
        <ul className={`${styles.figureRow} ${styles.figureRowEngine}`}>
          {tiles.map((tile) => {
            const known = tile.value !== "";
            return (
              <li
                key={tile.id}
                className={[styles.figure, tile.wide ? styles.figureWide : ""].filter(Boolean).join(" ")}
                data-known={known || undefined}
                data-testid={`slide-figure-${motion}-${tile.id}`}
              >
                <span className={styles.figureLabel}>
                  <SlideText text={tile.label} accent={false} />
                </span>
                <span className={[styles.figureValue, known ? "" : styles.figureUnknown].filter(Boolean).join(" ")}>{known ? tile.value : "?"}</span>
                {tile.note ? <span className={styles.figureNote}>{tile.note}</span> : null}
              </li>
            );
          })}
        </ul>
        {chart ? (
          <PaybackChart
            story={chart.story}
            monthlyMargin={chart.monthlyMargin}
            cac={chart.cac}
            lifetime={chart.lifetime}
            payback={chart.payback}
            reference={chart.reference}
            width={UNIT_BOTH_CHART.width}
            height={UNIT_BOTH_CHART.height}
            labels={chart.labels}
            summary={chart.summary}
            id={`payback-${motion}`}
            size="sm"
            data-testid={`slide-payback-chart-${motion}`}
          />
        ) : null}
        {warning ? (
          <CashWarning maybe={warning.maybe === "true"} className={styles.unitWarning} data-testid={`slide-unit-warning-${motion}`}>
            {warning.text}
          </CashWarning>
        ) : null}
      </section>
    );
  };

  return (
    <SlideFrame slide={slide} context={context} footer={footer} footerDense>
      <div className={styles.unitBoth}>
        {column("plg")}
        {column("slg")}
        {assume ? (
          <p className={`${styles.unitLine} ${styles.unitBothNote}`} data-testid="slide-unit-note">
            {assume.text}
          </p>
        ) : null}
      </div>
    </SlideFrame>
  );
}
