import type { CSSProperties } from "react";
import { CashWarning } from "@/components/engine/CashWarning";
import { InstallPaybackChart } from "@/components/engine/InstallPaybackChart";
import { PaybackChart } from "@/components/engine/PaybackChart";
import { installChartGeometry } from "@/lib/viz/install-payback-chart";
import { rowOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

type Tile = { id: string; label: string; value: string; note: string };

/** The picture's size on the 1 920 canvas: the lower band's left column, drawn at its real size so its type never scales. */
export const UNIT_CHART = { width: 900, height: 330 } as const;

/**
 * Slide 4 — "what a customer brings in" (§9.3), with the money of design
 * system extension 09 (Q12, A20.d T4.c). Read alone, without its speaker:
 *
 * - six tiles in one row — the CAC, the LTV, the LTV:CAC (with the commonly
 *   cited 3:1 in context, never a verdict), the payback, the months after
 *   payback (below zero, the customer leaves first: the loss in months) and
 *   the cash tied up (« ne revient pas toute » with the loss);
 * - under them, the picture that explains them (`PaybackChart`): one
 *   customer, month by month, the margin it brings back against what it cost;
 * - beside it: GRR and NRR in one line (they were two tiles), the
 *   long-payback warning when it applies (C49), what the cash figure
 *   assumes, and the lifetime cap.
 *
 * The tiles print the model's rows as they are: `label`, `value` and the line
 * under it (`note` — for the CAC its variant, always written because "media
 * only" and "fully loaded" are two numbers wearing the same name, §6.8; for a
 * figure that can't be computed, which input is missing). An empty `value`
 * prints « ? », never a 0 — and never a margin-less LTV, the flattering
 * version the glossary warns against (§5.7). Ink only: a certain loss titles
 * the slide in ink (C48, C53), a warning wears the advice's dashed edge.
 *
 * A consumer app's slide (§21.7.3) has five tiles — the cost per install, its
 * value over 12 months, over 36 months, their ratio and its payback; no
 * months after payback, no cash — and `InstallPaybackChart` in the picture's
 * place: an install pays back along a curve, not a line. It reads
 * `slide.installChart`, which only an app's slide carries.
 */
export function SlideUnitEconomics({ slide, context }: SlideProps) {
  const cac = rowOf(slide, "cac");
  const retention = rowOf(slide, "retention");
  const warning = rowOf(slide, "warning");
  const assume = rowOf(slide, "assume");
  const cap = rowOf(slide, "cap");
  const chart = slide.paybackChart;
  const install = slide.installChart;

  const tiles: Tile[] = [
    cac ? { id: "cac", label: cac.label, value: cac.value, note: cac.variant } : null,
    ...(["value12", "ltv", "ltvCac", "payback", "after", "cash"] as const).map((kind) => {
      const row = rowOf(slide, kind);
      return row ? { id: kind === "ltvCac" ? "ltv-cac" : kind, label: row.label, value: row.value, note: row.note } : null;
    }),
  ].filter((tile): tile is Tile => tile !== null);

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.unit}>
        {/* The money's six tiles in one row; an app has five (`--figure-columns`), the SaaS's row doesn't change. */}
        <ul className={`${styles.figureRow} ${styles.figureRowSix}`} style={install ? ({ "--figure-columns": 5 } as CSSProperties) : undefined}>
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

        <div className={styles.unitLower}>
          {install ? (
            <InstallPaybackChart
              geometry={installChartGeometry({ curve: install.curve, cost: install.cost, payback: install.payback, story: install.story, ...UNIT_CHART })}
              labels={install.labels}
              summary={install.summary}
              id={`install-payback-${slide.id}`}
              data-testid="slide-install-payback-chart"
            />
          ) : chart ? (
            <PaybackChart
              story={chart.story}
              monthlyMargin={chart.monthlyMargin}
              cac={chart.cac}
              lifetime={chart.lifetime}
              payback={chart.payback}
              reference={chart.reference}
              width={UNIT_CHART.width}
              height={UNIT_CHART.height}
              labels={chart.labels}
              summary={chart.summary}
              id={`payback-${slide.id}`}
              data-testid="slide-payback-chart"
            />
          ) : null}
          <div className={styles.unitSide}>
            {retention ? (
              <p className={styles.unitLine} data-testid="slide-unit-retention">
                {retention.text}
              </p>
            ) : null}
            {warning ? (
              <CashWarning maybe={warning.maybe === "true"} className={styles.unitWarning} data-testid="slide-unit-warning">
                {warning.text}
              </CashWarning>
            ) : null}
            {assume ? (
              <p className={styles.unitLine} data-testid="slide-unit-assume">
                {assume.text}
              </p>
            ) : null}
            {cap ? <p className={styles.unitLine}>{cap.text}</p> : null}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
