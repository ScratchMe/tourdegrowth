import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * `total` — « deux moteurs, un total » (engine spec §18.6.2, §18.8.2), the
 * hybrid's first slide. Two blocks, self-serve then sales-assisted, ALWAYS
 * in that order whatever their values: each one's MRR and new MRR of the
 * month as the sum prints them, and the stage its diagnosis names with the
 * slide it is on. Between them, the link — drawn as an arrow, said as a
 * share of the pipeline and never as an attribution. Then the sums, which
 * a reader can redo on a calculator.
 *
 * Text only, on purpose (§18.6.4, rule 3): no bar, no gauge, nothing that
 * puts the two motions on one axis. The footer prints rule S8, who counts
 * where. Every word is the model's (`totalBlock`, `link`, `sum`, `footer`).
 */
export function SlideTotal({ slide, context }: SlideProps) {
  const { strings } = context;
  const t = strings.total;
  const blocks = rowsOf(slide, "totalBlock");
  const link = rowOf(slide, "link");
  const sums = rowsOf(slide, "sum");
  const footer = rowOf(slide, "footer")?.text;

  const block = (row: (typeof blocks)[number]) => (
    <section key={row.id} className={styles.totalBlock} data-testid={`slide-total-${row.id}`}>
      <h4 className={styles.cardEyebrow}>{row.label}</h4>
      <dl className={styles.totalFigures}>
        <div>
          <dt>{t.mrr}</dt>
          <dd className={row.mrr ? styles.totalValue : `${styles.totalValue} ${styles.figureUnknown}`}>{row.mrr || "?"}</dd>
        </div>
        <div>
          <dt>{t.newMrr}</dt>
          <dd className={row.newMrr ? styles.totalSmall : `${styles.totalSmall} ${styles.figureUnknown}`}>{row.newMrr || "?"}</dd>
        </div>
      </dl>
      {row.stage ? (
        <p className={styles.totalStage}>
          <SlideText text={row.stage} accent={false} />
        </p>
      ) : null}
    </section>
  );

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      <div className={styles.total}>
        <div className={styles.totalBlocks}>
          {blocks[0] ? block(blocks[0]) : null}
          <div className={styles.totalLink} data-testid="slide-total-link">
            <Arrow className={styles.totalArrow} />
            {link ? (
              <>
                <p className={styles.totalLinkText}>
                  <SlideText text={link.text} accent={false} />
                </p>
                <p className={styles.totalLinkNote}>
                  <SlideText text={link.note} accent={false} />
                </p>
              </>
            ) : null}
          </div>
          {blocks[1] ? block(blocks[1]) : null}
        </div>
        {sums.length ? (
          <ul className={styles.totalSums} data-testid="slide-total-sums">
            {sums.map((sum) => (
              <li key={sum.id}>
                <SlideText text={sum.text} accent={false} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SlideFrame>
  );
}
