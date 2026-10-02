import type { ReactNode } from "react";
import styles from "./EngineProgress.module.css";

/** A number's answer, as the marks draw it: found, estimated, asked, can't find, to do. */
export type NumberStatus = "found" | "est" | "asked" | "cant" | "todo";

export const NUMBER_STATUSES: readonly NumberStatus[] = ["found", "est", "asked", "cant", "todo"];

export interface EngineProgressGroup {
  id: string;
  /** Read for the group by a screen reader: « Acquisition : trouvé, trouvé, à faire ». */
  label: string;
  marks: NumberStatus[];
}

export interface EngineProgressProps {
  /** What remains, always first: « 4 à faire » · « Plus qu'un » · « Plus rien à faire ». Never « fini » while a number has no answer. */
  remaining: ReactNode;
  /** The counts after it: « 7 trouvés · 2 estimés · 1 demandé · 3 introuvables ». */
  counts?: ReactNode;
  /** md only: one group per stage, in the funnel's order. */
  groups?: EngineProgressGroup[];
  /** The marks' legend: the board shows it once, under « Tes chiffres ». */
  legend?: { status: NumberStatus; label: string }[];
  legendLabel?: string;
  /** md: the sentence and the marks (the board). sm: the sentence only, in a number screen's header. */
  size?: "md" | "sm";
  /** The marks list's accessible name. */
  label?: string;
  /** The marks only, no sentence: a stage's head in NumberList, where its « 2 sur 3 trouvés » is the words. */
  marksOnly?: boolean;
  className?: string;
  "data-testid"?: string;
}

const MARK_CLASS: Record<NumberStatus, string | undefined> = {
  found: styles.found,
  est: styles.est,
  asked: styles.asked,
  cant: styles.cant,
  todo: styles.todo,
};

/**
 * Progress told by what remains — design system extension 07 (brief 07
 * Q13). The sentence leads with what is LEFT (« 6 à faire »), never « fini »
 * while a number has no answer; the counts follow, quieter. « À faire »
 * counts the numbers with no answer: an estimate, a request out or « je ne le
 * trouve pas » is an answer, counted, never « to go ».
 *
 * The marks are one per number, in the funnel's order, a gap between stages:
 * the board's map in one line. Five kinds, drawn without colour (ink and
 * `--viz-axis` on paper): found, a filled dot; estimated, the peloton's
 * hatch; asked, a dashed ring (« not yet »); can't find, a struck ring; to
 * do, a thin ring. Never a percentage bar: seventeen numbers of very
 * different effort do not make a percentage.
 */
export function EngineProgress({
  remaining,
  counts,
  groups = [],
  legend,
  legendLabel,
  size = "md",
  label,
  marksOnly = false,
  className,
  "data-testid": testId,
}: EngineProgressProps) {
  return (
    <div className={[styles.root, styles[size], className ?? ""].filter(Boolean).join(" ")} data-testid={testId}>
      {marksOnly ? null : (
        <p className={styles.text}>
          <strong className={styles.remaining} data-testid={testId ? `${testId}-remaining` : undefined}>
            {remaining}
          </strong>
          {counts ? (
            <span className={styles.counts} data-testid={testId ? `${testId}-counts` : undefined}>
              {counts}
            </span>
          ) : null}
        </p>
      )}
      {size === "md" && groups.length > 0 ? (
        <ol className={styles.groups} aria-label={label}>
          {groups.map((group) => (
            <li key={group.id} className={styles.group} aria-label={group.label}>
              {group.marks.map((mark, i) => (
                // A stage's marks never reorder: the index is each one's identity.
                <span key={i} className={[styles.mark, MARK_CLASS[mark]].join(" ")} aria-hidden="true" data-mark={mark} />
              ))}
            </li>
          ))}
        </ol>
      ) : null}
      {legend ? (
        <ul className={styles.legend} aria-label={legendLabel}>
          {legend.map((item) => (
            <li key={item.status}>
              <span className={[styles.mark, MARK_CLASS[item.status]].join(" ")} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
