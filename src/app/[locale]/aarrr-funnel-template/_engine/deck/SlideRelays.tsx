import { DotGrid, DotLegend } from "@/components/viz/DotGrid";
import type { MotionDerived } from "@/lib/engine/types";
import { columnGrid } from "../visual-model";
import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

type SlgDerived = Extract<MotionDerived, { motion: "slg" }>;

/**
 * `slg:peloton` — sales-assisted's funnel in three relays (engine spec
 * §18.5.1, §18.8.2). The peloton counts its four columns on the same 100
 * sign-ups; these three can't share a base, so each relay is its own grid on
 * its own 100 — leads (or MQLs), closed opportunities, new customers — each
 * with its three months over it, and a rule between them. The footer says
 * it (« Chaque grille a sa propre base de 100 », §18.8.2), once: nothing on
 * this slide multiplies one relay into the next.
 *
 * In a column, the peloton's order: the base and its months, the numeral
 * (« ? » for a relay nobody measures, never 0) and the stamp beside it when
 * the diagnosis names it, what the relay counts, the grid, the source. Every
 * word is the model's `relay` row; the grid is drawn from the derived
 * interval — a position, not words.
 */
export function SlideRelays({ slide, context }: SlideProps) {
  const { strings, derived } = context;
  const t = strings.peloton;
  const rows = rowsOf(slide, "relay");
  const upstream = rowOf(slide, "upstream");
  const footer = rowOf(slide, "footer")?.text;
  const slg = derived.motions.find((m): m is SlgDerived => m.motion === "slg");

  const columns = (slg?.relays.columns ?? []).flatMap((col) => {
    const row = rows.find((r) => r.id === col.metric);
    if (!row) return [];
    const unknown = row.value === "";
    return [{ metric: col.metric, row, unknown, grid: columnGrid(unknown ? null : col.perHundred) }];
  });

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      {upstream ? (
        <p className={styles.upstream}>
          <Arrow direction="right" className={styles.upstreamArrow} />
          <SlideText text={upstream.text} accent={false} />
        </p>
      ) : null}

      <div className={styles.relays}>
        {columns.map((c) => (
          <section key={c.metric} className={styles.relay} data-column={c.metric} data-unknown={c.unknown || undefined} data-testid={`slide-relay-${c.metric}`}>
            <p className={styles.relayBase}>
              <SlideText text={c.row.base} accent={false} />
            </p>
            <div className={styles.numeralRow}>
              <p className={[styles.numeral, c.unknown ? styles.numeralUnknown : ""].filter(Boolean).join(" ")} data-testid={`slide-numeral-${c.metric}`}>
                <SlideText text={c.unknown ? "?" : c.row.value} accent={false} />
              </p>
              {c.row.stamp ? (
                <span className={styles.stamp} data-testid="slide-stamp">
                  {c.row.stamp}
                </span>
              ) : null}
            </div>
            <h4 className={styles.columnLabel}>{c.row.label}</h4>
            <DotGrid medium="slide" grid={c.grid} highlighted={Boolean(c.row.stamp)} label={`${c.row.label} — ${c.row.text}`} />
            <p className={styles.columnSource}>
              <SlideText text={c.unknown ? t.legendUnknown : c.row.source} accent={false} />
            </p>
          </section>
        ))}
      </div>

      <div className={styles.legend}>
        <DotLegend
          aria-hidden
          medium="slide"
          items={[
            { mark: "filled", label: t.legendMeasured },
            { mark: "range", label: t.legendRange },
            { mark: "unknown", label: t.legendUnknown },
          ]}
        />
      </div>
    </SlideFrame>
  );
}
