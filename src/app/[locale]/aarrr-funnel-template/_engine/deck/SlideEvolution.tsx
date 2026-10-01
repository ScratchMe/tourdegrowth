import { rowOf, rowsOf } from "./deck-rows";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { Arrow, SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * « Ce qui a bougé » (engine spec §19.2.6, A14 T1-T2) — one per motion, from
 * the second month, unchecked until the team ticks it (C32 Q5).
 *
 * Up to six numbers, in AARRR order — never sorted by how far they moved —
 * each on its own line: its name, the month before, a drawn arrow (the slide
 * fonts have no « → », §10.4), this month, and the change. The change carries
 * a sign, never a colour: the engine keeps red for the leak. When the two
 * months don't compare, each number says why instead. Every word and every
 * figure is the model's (lib/engine/deck-series.ts); the slide places them,
 * and the footer says the rule once.
 */
export function SlideEvolution({ slide, context }: SlideProps) {
  const moved = rowsOf(slide, "evolution");
  const apart = rowsOf(slide, "apart");
  const footer = rowOf(slide, "footer")?.text;
  const testId = `slide-evolution-${slide.motion ?? "plg"}`;

  return (
    <SlideFrame slide={slide} context={context} footer={footer}>
      {moved.length > 0 ? (
        <ul className={styles.evolutionList} data-testid={testId}>
          {moved.map((row) => (
            <li key={row.id} className={styles.evolutionRow} data-tone={row.tone} data-toward={row.toward === "true" ? "true" : undefined}>
              <span className={styles.evolutionName}>
                <SlideText text={row.label} accent={false} />
              </span>
              {row.tone === "stable" ? (
                <span className={styles.evolutionMove} aria-hidden="true">
                  {row.now}
                </span>
              ) : (
                <span className={styles.evolutionMove} aria-hidden="true">
                  <span>{row.before}</span>
                  <Arrow className={styles.evolutionArrow} />
                  <span>{row.now}</span>
                </span>
              )}
              <span className={styles.evolutionChange}>
                {/* The row's own words, so the change reads the same here, on the board and in the text export. */}
                <span className="tdg-visually-hidden">{row.text}</span>
                <span aria-hidden="true">{row.change}</span>
                {row.toward === "true" ? (
                  <span className={styles.evolutionToward} aria-hidden="true">
                    {context.strings.slide.evolutionToward}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {apart.length > 0 ? (
        <ul className={styles.evolutionList} data-testid={testId}>
          {apart.map((row) => (
            <li key={row.id} className={styles.evolutionRow} data-tone="apart">
              <span className={styles.evolutionName}>
                <SlideText text={row.label} accent={false} />
              </span>
              <span className={styles.evolutionReason}>
                <SlideText text={row.text} accent={false} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </SlideFrame>
  );
}
