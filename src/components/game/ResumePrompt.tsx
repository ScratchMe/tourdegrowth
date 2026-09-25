import type { Ref } from "react";
import { Button } from "@/components/core/Button";
import styles from "./ResumePrompt.module.css";

export interface ResumeAction {
  label: string;
  onClick: () => void;
}

export interface ResumePromptProps {
  /**
   * The question. A year in progress: `resume.title`. A finished year:
   * `resume.finished`, filled with the ending's title — the sentence IS the
   * heading there, there is nothing to ask above it.
   */
  title: string;
  /**
   * « Précédemment chez Flixo »: `resume.previously` and one `resume.quarterLine`
   * per quarter played, filled. Only for a year in progress.
   */
  previously?: { heading: string; lines: readonly string[] };
  /** « Reprendre », or « Revoir le bilan » for a finished year. The primary action. */
  accept: ResumeAction;
  /** « Recommencer », or « Rejouer l'année ». */
  restart: ResumeAction;
  /** The island moves focus here when the prompt opens (plan §3.5). */
  titleRef?: Ref<HTMLHeadingElement>;
}

/**
 * « Reprendre l'année en cours ? » — plan §2.6 and §3.7, GAME-BRIEF P15.
 *
 * Takes the call's place, in the night, when a save with at least one
 * quarter played is found after mount. « Précédemment chez Flixo » is La
 * Bataille's recap, kept for the one moment it earns its place: coming back.
 * A save with no quarter played is restored silently — there is nothing to
 * lose, so nothing to ask.
 *
 * Resuming is the primary: the save is the player's work, and starting over
 * is one deliberate click away, never the default a tired Enter lands on.
 */
export function ResumePrompt({ title, previously, accept, restart, titleRef }: ResumePromptProps) {
  return (
    <section className={styles.prompt} aria-labelledby="game-resume-title" data-testid="game-resume">
      <h2 id="game-resume-title" ref={titleRef} tabIndex={-1} className={styles.title}>
        {title}
      </h2>
      {previously && previously.lines.length ? (
        <div className={styles.previously}>
          <h3 className={styles.previouslyTitle}>{previously.heading}</h3>
          <ol className={styles.lines}>
            {previously.lines.map((line, i) => (
              <li key={i} className={styles.line}>
                {line}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      <div className={styles.actions}>
        <Button onClick={accept.onClick} data-testid="game-resume-accept">
          {accept.label}
        </Button>
        <Button variant="secondary" onClick={restart.onClick} data-testid="game-resume-restart">
          {restart.label}
        </Button>
      </div>
    </section>
  );
}
