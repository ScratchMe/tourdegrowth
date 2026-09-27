import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { ChangeTable } from "./SlideWhatIf";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

/** Past this many levers the card takes a denser step, so eight of them still end above the footer. */
const DENSE_FROM = 4;

/**
 * The « together » slide: every lever the team moved, at once (Antoine,
 * 2026-09-26: « une slide qui prend en compte tous les "Et si ?" cumulés
 * avec effet sur MRR, NRR, GRR, CAC, LTV »). Present only when two or more
 * moved: with one, it would repeat that lever's slide.
 *
 * Left, the levers — each with today's value, the target (a drawn arrow
 * between them: a typed "→" is in none of the slide fonts, §10.4) and what
 * it brings on its own — then the model's sentence that sets the whole
 * against the sum of the parts: the funnel levers multiply, so the whole is
 * more, and that difference is the compounding. Then the same two tables as
 * a lever's slide, with all the what-ifs at once. The assumptions that
 * applied are the footer.
 */
export function SlideScenario({ slide, context }: SlideProps) {
  const s = context.strings;
  const levers = rowsOf(slide, "lever");
  const together = rowOf(slide, "together")?.text;
  const footer = rowOf(slide, "footer")?.text;

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      <div className={styles.scenario}>
        <section
          className={[styles.leverCard, levers.length >= DENSE_FROM ? styles.leverDense : ""].filter(Boolean).join(" ")}
          data-testid="slide-scenario-levers"
        >
          <h4 className={styles.cardEyebrow}>{s.scenario.aloneTitle}</h4>
          <ul className={styles.leverList}>
            {levers.map((lever) => (
              <li key={lever.id} className={styles.leverRow} data-testid={`slide-lever-${lever.id}`}>
                <span className={styles.leverName}>{lever.label}</span>
                <span className={styles.leverMove}>
                  {lever.from}
                  <Arrow />
                  {lever.to}
                </span>
                <span className={styles.leverGain}>{lever.gain || "?"}</span>
              </li>
            ))}
          </ul>
          {together ? (
            <p className={styles.together} data-testid="slide-scenario-together">
              <SlideText text={together} accent={false} />
            </p>
          ) : null}
        </section>
        <ChangeTable
          title={s.slide.whatIfKpis}
          todayLabel={s.slide.whatIfToday}
          withLabel={s.slide.whatIfWithAll}
          changeLabel={s.slide.whatIfChange}
          rows={rowsOf(slide, "kpi")}
          testId="slide-kpis-scenario"
        />
        <ChangeTable
          title={s.slide.whatIfFunnel}
          todayLabel={s.slide.whatIfToday}
          withLabel={s.slide.whatIfWithAll}
          changeLabel={s.slide.whatIfChange}
          rows={rowsOf(slide, "funnelStep")}
          testId="slide-funnel-scenario"
        />
      </div>
    </SlideFrame>
  );
}
