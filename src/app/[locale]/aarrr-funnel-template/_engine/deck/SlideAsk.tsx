import { rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * Slide 6 — "what we are asking for" (§9.3). The only slide whose words the
 * user writes (D10): the request itself, its cost, and up to three bullets
 * of what it funds. The rest is the engine's, already formatted by the model
 * — "how we'll know" (the success metric, its current value, its target, the
 * first checkpoint) and "what to measure first" (the missing numbers the user
 * kept checked, each with its repair cost and the role that holds it).
 *
 * When the diagnosis can't name a leak, the model's title asks for the
 * measurement instead ("we're asking for a meeting to measure what's missing
 * first") — often the most honest thing a Head of Growth can put in front of
 * a leadership team.
 */
export function SlideAsk({ slide, context }: SlideProps) {
  const { strings } = context;
  const bullets = rowsOf(slide, "bullet");
  const cost = rowsOf(slide, "cost")[0];
  const know = rowsOf(slide, "know");
  const measure = rowsOf(slide, "measure");

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.ask}>
        {bullets.length > 0 || cost ? (
          <section className={styles.askBlock} data-testid="slide-ask-funds">
            <h4 className={styles.cardEyebrow}>{strings.slide.askFunds}</h4>
            {cost ? <p className={styles.askCost}>{cost.text}</p> : null}
            {bullets.length > 0 ? (
              <ul className={styles.askList}>
                {bullets.map((row, i) => (
                  <li key={i}>{row.text}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {know.length > 0 ? (
          <section className={styles.askBlock} data-testid="slide-ask-know">
            <h4 className={styles.cardEyebrow}>{strings.slide.askKnow}</h4>
            {know.map((row) => (
              <div key={row.metric} className={styles.askKnow}>
                <p className={styles.askMetric}>
                  <SlideText text={row.metric} accent={false} />
                </p>
                <p className={styles.askMove}>
                  <span>{row.current || "?"}</span>
                  <Arrow className={styles.askArrow} />
                  <span>{row.target || "?"}</span>
                </p>
                <p className={styles.askMeta}>{row.checkpoint}</p>
              </div>
            ))}
          </section>
        ) : null}

        {measure.length > 0 ? (
          <section className={`${styles.askBlock} ${styles.askMeasure}`} data-testid="slide-ask-measure">
            <h4 className={styles.cardEyebrow}>{strings.slide.askMeasure}</h4>
            <ul className={styles.askList}>
              {measure.map((row) => (
                <li key={row.metric}>
                  <span className={styles.askMetric}>
                    <SlideText text={row.metric} accent={false} />
                  </span>
                  <span className={styles.askMeta}>{[row.repair, row.role].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SlideFrame>
  );
}
