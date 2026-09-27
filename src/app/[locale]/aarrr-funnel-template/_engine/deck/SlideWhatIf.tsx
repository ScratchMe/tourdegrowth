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
}: {
  title: string;
  /** « Avec cet « Et si » » on a lever's slide, « Avec les « Et si » » on the one that adds them up. */
  withLabel: string;
  todayLabel: string;
  changeLabel: string;
  rows: ChangeRow[];
  testId: string;
}) {
  return (
    <section className={styles.changeCard} data-testid={testId}>
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
 * A what-if slide: one lever the team moved, alone (« Et si » cumulés,
 * Antoine 2026-09-26). The title says what it is worth on the MRR in twelve
 * months — or asks the question plainly when that can't be computed, or
 * when the lever was tested downward and there is no gain to say. Under it,
 * the growth figures a leadership meeting asks about (MRR, NRR, GRR, CAC,
 * LTV, payback) and the month's funnel, today and with that one what-if.
 * The model's assumptions replace the common footer, as on the leak slide:
 * a projection is only as honest as what it takes for granted, and a slide
 * travels without its speaker.
 */
export function SlideWhatIf({ slide, context }: SlideProps) {
  const s = context.strings.slide;
  const footer = rowOf(slide, "footer")?.text;
  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      <div className={styles.whatIf}>
        <ChangeTable
          title={s.whatIfKpis}
          todayLabel={s.whatIfToday}
          withLabel={s.whatIfWithOne}
          changeLabel={s.whatIfChange}
          rows={rowsOf(slide, "kpi")}
          testId={`slide-kpis-${slide.id}`}
        />
        <ChangeTable
          title={s.whatIfFunnel}
          todayLabel={s.whatIfToday}
          withLabel={s.whatIfWithOne}
          changeLabel={s.whatIfChange}
          rows={rowsOf(slide, "funnelStep")}
          testId={`slide-funnel-${slide.id}`}
        />
      </div>
    </SlideFrame>
  );
}
