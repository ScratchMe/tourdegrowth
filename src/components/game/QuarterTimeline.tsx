import styles from "./QuarterTimeline.module.css";

export interface TimelineSegment {
  /** Stable key: "q1"… "q4", "december". */
  key: string;
  /** « T1 », « Décembre ». */
  title: string;
  /** « janv.–mars » — absent for December. */
  range?: string;
  status: "done" | "current" | "upcoming";
  /**
   * A played quarter's outcome: the churn it ended on, formatted by the same
   * formatter as the dashboard, and the word that says hit or missed — the
   * colour only repeats it.
   */
  result?: { value: string; word: string; hit: boolean };
}

export interface QuarterTimelineProps {
  /** « Ton année, trimestre par trimestre ». */
  label: string;
  /** Four quarters and December, in order. */
  segments: readonly TimelineSegment[];
}

/**
 * Where the player is in the year — game plan §1.3 (La Bataille's episode
 * strip, cut down to what serves) and §2.6.
 *
 * The system's solid/dashed grammar, moved to the night: a played quarter is
 * a solid rule with its result, the current one a thick amber rule (the
 * night's selection colour, the same as a ticked card), what is still to come
 * a dashed one. An ordered list with `aria-current="step"`, because a
 * sequence of steps is what it is — never a progressbar with a number that
 * says less than the words.
 */
export function QuarterTimeline({ label, segments }: QuarterTimelineProps) {
  return (
    <ol className={styles.timeline} aria-label={label} data-testid="game-timeline">
      {segments.map((segment) => (
        <li
          key={segment.key}
          className={[styles.segment, styles[segment.status]].join(" ")}
          aria-current={segment.status === "current" ? "step" : undefined}
          data-status={segment.status}
        >
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.title}>{segment.title}</span>
          {segment.range ? <span className={styles.range}>{segment.range}</span> : null}
          {segment.result ? (
            <span className={styles.result}>
              <span className={styles.value}>{segment.result.value}</span>{" "}
              <span className={segment.result.hit ? styles.hit : styles.missed}>{segment.result.word}</span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
