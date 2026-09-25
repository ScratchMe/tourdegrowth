import { linesOf, lineOf } from "./deck-lines";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * Slide 2 — "where it leaks, and what that is worth" (§9.3).
 *
 * Left, "the calculation" in four lines, each one recomputable from the
 * numbers printed on the line before (§6.7) — and these are the SAME lines
 * the title's amount was formatted from, which is the whole point: the
 * angles' `s2-export.png` printed "+2 à +3 k€" in its title and "+1 400 à
 * +2 600 €" in its body. Right, the other candidates, ranked, with the
 * unmeasured ones said to be "can't be ruled out" rather than left out.
 *
 * The assumptions ("all else being equal", "paying customers are among the
 * activated") are printed on the slide, never kept for the speaker: a slide
 * is forwarded without its speaker.
 */
export function SlideLeak({ slide, context }: SlideProps) {
  const { strings } = context;
  const calc = linesOf(slide, "calc");
  const annual = lineOf(slide, "annual")?.text;
  const lessThanOne = lineOf(slide, "lessThanOne")?.text;
  const assumption = lineOf(slide, "assumption")?.text;
  const blind = lineOf(slide, "blind")?.text;
  const aside = linesOf(slide, "aside");

  return (
    <SlideFrame slide={slide} context={context}>
      {blind ? (
        <p className={styles.blindLine}>
          <SlideText text={blind} accent={false} />
        </p>
      ) : null}

      <div className={styles.leak}>
        {calc.length > 0 ? (
          <section className={styles.calcCard}>
            <h4 className={styles.cardEyebrow}>{strings.slide.calcTitle}</h4>
            <dl className={styles.calcLines}>
              {calc.map((line) => (
                <div key={line.step} className={styles.calcLine}>
                  <dt className={styles.calcStep}>{strings.whatIf[line.step]}</dt>
                  <dd className={styles.calcValue}>
                    <SlideText text={line.text} accent={false} />
                  </dd>
                </div>
              ))}
            </dl>
            {lessThanOne ? <p className={styles.calcNote}>{lessThanOne}</p> : null}
            {annual ? (
              <p className={styles.calcAnnual}>
                <SlideText text={annual} accent={false} />
              </p>
            ) : null}
            {assumption ? <p className={styles.calcNote}>{assumption}</p> : null}
          </section>
        ) : null}

        {aside.length > 0 ? (
          <section className={styles.asideCard}>
            <h4 className={styles.cardEyebrow}>{strings.slide.leakAside}</h4>
            <ul className={styles.asideList}>
              {aside.map((line) => (
                <li key={line.stage} className={styles.asideRow} data-tone={line.tone}>
                  <span className={styles.asideStage}>{line.stage}</span>
                  <span className={styles.asideText}>
                    <SlideText text={line.text} accent={false} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SlideFrame>
  );
}
