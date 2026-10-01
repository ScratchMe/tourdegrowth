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
 * Left, the levers — each on one line with today's value, the target (a
 * drawn arrow between them: a typed "→" is in none of the slide fonts,
 * §10.4) and what it brings on its own. Right, the growth numbers with all
 * the what-ifs at once, then the model's sentence that sets the whole
 * against the sum of the parts: the funnel levers multiply, so the whole is
 * more, and that difference is the compounding. The month's funnel is on
 * each lever's slide and in the text export, not here: with eight levers,
 * three tables side by side ran under the footer (measured, 2026-09-27).
 * The assumptions that applied are the dense footer.
 */
export function SlideScenario({ slide, context }: SlideProps) {
  const s = context.strings;
  const levers = rowsOf(slide, "lever");
  const together = rowOf(slide, "together")?.text;
  const footer = rowOf(slide, "footer")?.text;
  // Self-serve's keeps its v1 test ids; sales-assisted's (`slg:scenario`) gets its own, both can be on screen.
  const prefix = slide.id === "scenario" ? "slide-scenario" : "slide-slg-scenario";

  return (
    <SlideFrame slide={slide} context={context} footer={footer} footerDense>
      <div className={styles.scenario}>
        <section
          className={[styles.leverCard, levers.length >= DENSE_FROM ? styles.leverDense : ""].filter(Boolean).join(" ")}
          data-testid={`${prefix}-levers`}
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
        </section>
        <div className={styles.scenarioSide}>
          <ChangeTable
            title={s.slide.whatIfKpis}
            todayLabel={s.slide.whatIfToday}
            withLabel={s.slide.whatIfWithAll}
            changeLabel={s.slide.whatIfChange}
            rows={rowsOf(slide, "kpi")}
            testId={`slide-kpis-${slide.id}`}
          />
          {together ? (
            <p className={styles.together} data-testid={`${prefix}-together`}>
              <SlideText text={together} accent={false} />
            </p>
          ) : null}
        </div>
      </div>
    </SlideFrame>
  );
}
