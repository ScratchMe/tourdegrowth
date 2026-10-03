import type { ReactNode } from "react";
import { MrrCurve } from "@/components/engine/MrrCurve";
import type { SlideCurve } from "@/lib/engine/types";
import { rowOf, rowsOf, type DeckRows } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import styles from "./deck.module.css";

type ChangeRow = DeckRows["kpi"] | DeckRows["funnelStep"];

/**
 * One of the what-if slides' two tables — the growth figures, or the month's
 * funnel: today, with the what-if(s), and the change (lib/engine/deck.ts,
 * 2026-09-26). The model wrote every cell; this places them. A figure that
 * can't be computed prints "?" in each column, never a 0 (the unit-economics
 * slide's rule), and one the what-if doesn't move says so in a word — the
 * row's `tone` says which, so the emphasis never depends on reading a word.
 */
export function ChangeTable({
  title,
  withLabel,
  todayLabel,
  changeLabel,
  rows,
  testId,
  bare = false,
}: {
  title: string;
  /** « Avec cet « Et si » » on a lever's slide, « Avec les « Et si » » on the one that adds them up. */
  withLabel: string;
  todayLabel: string;
  changeLabel: string;
  rows: ChangeRow[];
  testId: string;
  /** Inside another card (the curve's, extension 09): no card of its own. */
  bare?: boolean;
}) {
  return (
    <section className={bare ? styles.changeBare : styles.changeCard} data-testid={testId}>
      <h4 className={styles.cardEyebrow}>{title}</h4>
      <table className={styles.changeTable}>
        <thead>
          <tr>
            <td />
            <th scope="col">{todayLabel}</th>
            <th scope="col">{withLabel}</th>
            <th scope="col">{changeLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-tone={row.tone} data-testid={`${testId}-${row.id}`}>
              <th scope="row">{row.label}</th>
              <td>{row.today || "?"}</td>
              <td>{row.projected || "?"}</td>
              <td className={styles.changeCell}>{row.change || "?"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/**
 * The curve's canvas on a slide: the half-column's inner width (1 920
 * canvas). Its height is what the column leaves under a title on two lines
 * (measured on every lever of the example, 2026-10-03): tall alone, lower
 * over the funnel's steps or the drawn levers.
 */
export const SLIDE_CURVE = { width: 650, height: 250, heightShared: 135 } as const;

/** A what-if slide's curve (design system extension 09, Q11): drawn at the slide's own size, its words from the model. */
export function SlideCurveCard({ curve, slideId, shared = false, children }: { curve: SlideCurve; slideId: string; shared?: boolean; children?: ReactNode }) {
  return (
    <section className={styles.curveCard} data-testid={`slide-curve-${slideId}`}>
      <MrrCurve
        medium="slide"
        width={SLIDE_CURVE.width}
        height={shared ? SLIDE_CURVE.heightShared : SLIDE_CURVE.height}
        id={`slide-curve-${slideId.replace(/[^a-z0-9]/gi, "-")}`}
        today={curve.today}
        whatif={curve.whatif}
        keys={curve.keys}
        start={curve.start}
        xLabels={curve.xLabels}
        summary={curve.summary}
      />
      {children}
    </section>
  );
}

/**
 * A what-if slide: one lever the team moved, alone (« Et si » cumulés,
 * Antoine 2026-09-26). The title says what it is worth on the MRR in twelve
 * months — or asks the question plainly when that can't be computed, or
 * when the lever was tested downward and there is no gain to say. Under it,
 * the growth figures a leadership meeting asks about (MRR, NRR, GRR, CAC,
 * LTV, payback) and the month's funnel, today and with that one what-if.
 * The model's assumptions replace the common footer, as on the leak slide:
 * a projection is only as honest as what it takes for granted, and a slide
 * travels without its speaker.
 *
 * Design system extension 09 (Q11, A20.d T4.b): left, the MRR's curve —
 * today's pace against this what-if — then the steps of the month's funnel
 * the lever moves, or one line saying it leaves the funnel as it is: a row of
 * « stable » says nothing (the text export keeps every step); right, one
 * table: the MRR and the ARR in twelve months, the NRR, one new customer,
 * the cash tied up.
 */
export function SlideWhatIf({ slide, context }: SlideProps) {
  const s = context.strings.slide;
  const footer = rowOf(slide, "footer")?.text;
  const moved = rowsOf(slide, "funnelStep").filter((r) => r.tone === "moved");
  const stepsMove = moved.length > 0;
  return (
    <SlideFrame slide={slide} context={context} footer={footer} footerDense>
      <div className={styles.whatIf}>
        <div className={styles.whatIfSide}>
          {(() => {
            // The steps the lever moves: in the curve's card when there is one — two cards would not hold
            // under a title on three lines (measured, 2026-10-03).
            const funnel = stepsMove ? (
              <ChangeTable
                // Sales-assisted reads a quarter where self-serve reads the month's funnel (§18.5.5).
                title={slide.motion === "slg" ? s.whatIfQuarter : s.whatIfFunnel}
                todayLabel={s.whatIfToday}
                withLabel={s.whatIfWithOne}
                changeLabel={s.whatIfChange}
                rows={moved}
                testId={`slide-funnel-${slide.id}`}
                bare={Boolean(slide.curve)}
              />
            ) : null;
            const note = stepsMove ? null : (
              <p className={styles.funnelNote} data-testid={`slide-funnel-note-${slide.id}`}>
                {slide.motion === "slg" ? s.quarterUnmoved : s.funnelUnmoved}
              </p>
            );
            return slide.curve ? (
              <>
                <SlideCurveCard curve={slide.curve} slideId={slide.id} shared={stepsMove}>
                  {funnel}
                </SlideCurveCard>
                {note}
              </>
            ) : (
              <>
                {funnel}
                {note}
              </>
            );
          })()}
        </div>
        <ChangeTable
          title={s.whatIfKpis}
          todayLabel={s.whatIfToday}
          withLabel={s.whatIfWithOne}
          changeLabel={s.whatIfChange}
          rows={rowsOf(slide, "kpi")}
          testId={`slide-kpis-${slide.id}`}
        />
      </div>
    </SlideFrame>
  );
}
