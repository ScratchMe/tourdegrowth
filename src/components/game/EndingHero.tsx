import type { Ref } from "react";
import styles from "./EndingHero.module.css";

export interface EndingHeroProps {
  /** « Décembre · applaudissements » — `endings[id].eyebrow`. */
  eyebrow: string;
  /** The stamped headline, `endings[id].title`. */
  title: string;
  /** `endings[id].text`, already filled with the formatted figures. */
  text: string;
  /**
   * `endings[id].win`. Decides the eyebrow's ink — green for the two winning
   * endings, alert red otherwise — and nothing else: the words already say
   * which it is, the color only repeats them.
   */
  win: boolean;
  /**
   * Plays the stamp once. The island passes it on the way INTO December and
   * not when a player comes back to a finished year (« Revoir le bilan »):
   * a headline that lands again on every visit stops being a moment.
   */
  stamp?: boolean;
  /** The island moves focus here when December opens (plan §3.5). */
  titleRef?: Ref<HTMLHeadingElement>;
}

/**
 * December's headline — plan §2.6, GAME-BRIEF §5.11 point 1.
 *
 * The first thing on paper after the night: the eyebrow says which of the
 * seven endings this is, the title lands like the score numeral does
 * (`tdg-stamp`), and the text is the story told with the year's numbers.
 * The reduced-motion rule of motion.css takes the stamp off; the title is
 * then simply there.
 *
 * `data-win` lets a spec check the eyebrow's meaning without reading a color.
 */
export function EndingHero({ eyebrow, title, text, win, stamp = true, titleRef }: EndingHeroProps) {
  return (
    <header className={styles.hero} data-testid="game-ending" data-win={win}>
      <p className={`${styles.eyebrow} ${win ? styles.win : styles.lose}`}>{eyebrow}</p>
      <h2 ref={titleRef} tabIndex={-1} className={[styles.title, stamp ? styles.stamp : ""].filter(Boolean).join(" ")}>
        {title}
      </h2>
      <p className={styles.text}>{text}</p>
    </header>
  );
}
