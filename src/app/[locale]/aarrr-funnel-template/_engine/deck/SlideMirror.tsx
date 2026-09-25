import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * Slide 5 — "what we declare, what we measure" (§9.3). Opt-in: the deck
 * screen offers it unchecked, with the reason (D13) — the Tour is a
 * self-assessment, and this slide is only worth projecting when the gap IS
 * the argument.
 *
 * The counts come first, blind spots leading, each labelled in the number
 * it prints (« 1 angle mort », « 2 angles morts » — the model's
 * `verdictCount` rows). Then one row per bridge that is not coherent, in the
 * model's order, quoting the Tour's answer word for word next to what was
 * actually found (the row's `text`) under its verdict in the singular
 * (`tag`). A coherent bridge is a count, not a row: the slide is about the
 * gaps. The Tour's score appears in the footer, and only on this slide (§9.1).
 */
export function SlideMirror({ slide, context }: SlideProps) {
  const counts = rowsOf(slide, "verdictCount");
  const gaps = rowsOf(slide, "bridge").filter((row) => row.verdict !== "" && row.verdict !== "coherent");
  const tourFooter = rowOf(slide, "tourFooter")?.text;

  return (
    <SlideFrame slide={slide} context={context} footer={tourFooter}>
      <div className={styles.mirror}>
        <ul className={styles.mirrorCounts}>
          {counts.map((row) => (
            <li key={row.id} className={styles.mirrorCount} data-verdict={row.id}>
              <span className={styles.mirrorCountValue}>{row.value}</span>
              <span className={styles.mirrorCountLabel}>{row.label}</span>
            </li>
          ))}
        </ul>

        {gaps.length > 0 ? (
          <ul className={styles.mirrorRows}>
            {gaps.map((row) => (
              <li key={row.questionId} className={styles.mirrorRow} data-verdict={row.verdict}>
                <span className={styles.mirrorVerdict}>{row.tag}</span>
                <span className={styles.mirrorMetric}>
                  <SlideText text={row.label} accent={false} />
                </span>
                <span className={styles.mirrorAnswer}>
                  <SlideText text={row.text} accent={false} />
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SlideFrame>
  );
}
