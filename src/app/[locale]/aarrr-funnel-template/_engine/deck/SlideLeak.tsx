import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * The steps of the chain, in the order they recompute from one another (§6.7). An app with subscriptions and a usage
 * stream (§21.7.2) has three more after `times`: the second stream's two lines and the sum of both.
 */
const CHAIN_STEPS = new Set(["today", "if", "then", "times", "usage-then", "usage-times", "sum"]);

/**
 * Slide 2 — "where it leaks, and what that is worth" (§9.3).
 *
 * Left, "the calculation" in four lines (seven for an app with two streams), each one recomputable from the
 * numbers printed on the line before (§6.7) — and these are the SAME lines
 * the title's amount was read from (`buildDeck` takes the title's figure from
 * the chain's "× ARPA" line), which is the whole point: the angles'
 * `s2-export.png` printed "+2 à +3 k€" in its title and "+1 400 à +2 600 €"
 * in its body. Right, under « À côté » / "Alongside" (the heading §9.3 gives
 * that column), every other candidate and where it stands — the unmeasured
 * ones said to be "can't be ruled out", never left out. Each of those rows
 * carries its candidate's name (`label`), its standing (`text`) and its
 * emphasis (`tone`): the model decided all three, the slide draws them.
 *
 * The assumptions ("all else being equal", "paying customers are among the
 * activated") are printed on the slide, never kept for the speaker: a slide
 * is forwarded without its speaker. The model says them once, in the
 * `footer` row that replaces this slide's common footer.
 */
export function SlideLeak({ slide, context }: SlideProps) {
  const { strings } = context;
  const calc = rowsOf(slide, "calc");
  const chain = calc.filter((row) => CHAIN_STEPS.has(row.key));
  const after = calc.filter((row) => !CHAIN_STEPS.has(row.key));
  const blind = rowOf(slide, "blind")?.text;
  const footer = rowOf(slide, "footer")?.text;
  const aside = rowsOf(slide, "aside");

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      {blind ? (
        <p className={styles.blindLine}>
          <SlideText text={blind} accent={false} />
        </p>
      ) : null}

      {/* A stage with no price has no chain (C9): « À côté » then takes the whole width, not an orphan column. */}
      <div className={styles.leak} data-calc={chain.length > 0 ? "true" : "false"}>
        {chain.length > 0 ? (
          <section className={styles.calcCard}>
            <h4 className={styles.cardEyebrow}>{strings.slide.calcTitle}</h4>
            <dl className={styles.calcLines}>
              {chain.map((row) => (
                <div key={row.key} className={styles.calcLine}>
                  <dt className={styles.calcStep}>{row.label}</dt>
                  <dd className={styles.calcValue}>
                    <SlideText text={row.text} accent={false} />
                  </dd>
                </div>
              ))}
            </dl>
            {after.map((row) => (
              <p key={row.key} className={row.key === "annual" ? styles.calcAnnual : styles.calcNote}>
                <SlideText text={row.text} accent={false} />
              </p>
            ))}
          </section>
        ) : null}

        {aside.length > 0 ? (
          <section className={styles.asideCard}>
            <h4 className={styles.cardEyebrow}>{strings.slide.leakAside}</h4>
            <ul className={styles.asideList}>
              {aside.map((row) => (
                <li key={row.id} className={styles.asideRow} data-tone={row.tone}>
                  <span className={styles.asideStage}>{row.label}</span>
                  <span className={styles.asideText}>
                    <SlideText text={row.text} accent={false} />
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
