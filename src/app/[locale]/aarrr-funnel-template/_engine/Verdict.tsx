import type { EngineStrings } from "@/lib/engine/strings";
import type { SlideTitle } from "@/lib/engine/types";
import { accentRuns, fill } from "./text";
import styles from "./Board.module.css";

/**
 * The board's verdict title (spec §7 E2.2): the peloton sentence, from the
 * SAME template and the same formatted values as the deck's first slide
 * (`deck.ts` picks the key, §9.3) — so the screen and the slide cannot word
 * one diagnosis two ways. Its `**…**` segment is the red accent, large text
 * only (40px stencil: `--accent-mark` at 3.57:1 on the page ground, AA for
 * large text).
 *
 * The board's heading and its focus target: entering the board (after the
 * setup, an import, closing the slides) puts focus here, never on the first
 * paint of a returning visit (R-19).
 */
/** A title's words without its accent marks: where it is set too small for the red to be read (`TotalBand`). */
export function titleText(title: SlideTitle, strings: EngineStrings): string {
  return accentRuns(fill(strings.slideTitles[title.key], title.values))
    .map((run) => run.text)
    .join("");
}

export function Verdict({
  title,
  strings,
  id = "engine-verdict",
}: {
  title: SlideTitle;
  strings: EngineStrings;
  /**
   * The hybrid's engine shown (A18 T5) has its own verdict under « Moteur affiché »: another id, since the board's
   * heading and focus target is then the total band's title.
   */
  id?: string;
}) {
  const text = fill(strings.slideTitles[title.key], title.values);
  return (
    <h2 id={id} className={styles.verdict} tabIndex={-1} data-testid={id}>
      {accentRuns(text).map((run, i) =>
        run.accent ? (
          <span key={i} className={styles.verdictAccent}>
            {run.text}
          </span>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </h2>
  );
}
