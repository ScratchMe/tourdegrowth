import { Disclosure } from "@/components/core/Disclosure";
import { Tag } from "@/components/core/Tag";
import styles from "./GameJournal.module.css";

export interface JournalEntry {
  q: number;
  /** « Trimestre 1 · janvier à mars ». */
  period: string;
  /** The quarter's churn and its verdict, in words: « 5,7 % · manqué de 0,1 pt ». */
  result: { text: string; tone: "good" | "bad" };
  /** The two cards played, by name. */
  picked: readonly string[];
  /** What happened, one sentence each: the effects, the events, the CEO's line. */
  lines: readonly string[];
}

export interface GameJournalProps {
  /** « Journal de l'année ». */
  title: string;
  /** The quarters played so far, first first. */
  entries: readonly JournalEntry[];
}

/**
 * The year so far, one disclosure per quarter played — game plan §2.6.
 *
 * Rendered from the engine's STRUCTURED journal (`QuarterLog`: ids, effects,
 * events), resolved to words by the island in the page's language. The
 * prototype stored French sentences, so switching language mid-year left the
 * journal in French (plan R10); these props are strings, but they are
 * rebuilt from structure on every render, so the journal always speaks the
 * page's language.
 *
 * Every quarter starts closed, the last one included, where the plan asked
 * for the last one open: `core/Disclosure` is closed by default by design
 * (« always »), and the last quarter was just read in full as the report
 * moment — the journal is for going back, not for reading twice.
 */
export function GameJournal({ title, entries }: GameJournalProps) {
  if (entries.length === 0) return null;

  return (
    <section className={styles.journal} aria-labelledby="game-journal-title" data-testid="game-journal">
      <h2 id="game-journal-title" className={styles.title}>
        {title}
      </h2>
      <div className={styles.entries}>
        {entries.map((entry) => (
          <Disclosure
            key={entry.q}
            data-testid={`game-journal-${entry.q}`}
            summary={
              <span className={styles.summary}>
                <span className={styles.period}>{entry.period}</span>
                <span className={[styles.result, styles[entry.result.tone]].join(" ")}>{entry.result.text}</span>
              </span>
            }
          >
            <div className={styles.body}>
              <ul className={styles.picked}>
                {entry.picked.map((name) => (
                  <li key={name}>
                    <Tag tone="neutral">{name}</Tag>
                  </li>
                ))}
              </ul>
              <ul className={styles.lines}>
                {entry.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
