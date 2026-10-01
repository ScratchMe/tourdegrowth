import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * « Ce qui a bougé » (engine spec §19.2.6, A14 T1) — one per motion, from the
 * second month, unchecked until the team ticks it (C32 Q5).
 *
 * Up to six numbers, in AARRR order, each « 15 %, puis 18 % (+3 points) »;
 * or, when the two months don't compare, each number with the reason. Every
 * word is the model's (lib/engine/deck-series.ts); the slide places them. The
 * change carries a sign, never a colour: the engine keeps red for the leak,
 * and no arrow, which the slide fonts don't draw. Its own layout comes with
 * the series' screens (T2): it reads the leak slide's « À côté » rows meanwhile.
 */
export function SlideEvolution({ slide, context }: SlideProps) {
  const moved = rowsOf(slide, "evolution");
  const apart = rowsOf(slide, "apart");
  const footer = rowOf(slide, "footer")?.text;
  const rows = [...moved.map((row) => ({ id: row.id, label: row.label, text: row.text })), ...apart];

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      {rows.length > 0 ? (
        <section className={styles.asideCard} data-testid={`slide-evolution-${slide.motion ?? "plg"}`}>
          <ul className={styles.asideList}>
            {rows.map((row) => (
              <li key={row.id} className={styles.asideRow} data-tone="neutral">
                <span className={styles.asideStage}>{row.label}</span>
                <span className={styles.asideText}>
                  <SlideText text={row.text} accent={false} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </SlideFrame>
  );
}
