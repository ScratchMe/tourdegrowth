import type { ReactNode } from "react";
import { Disclosure } from "@/components/core/Disclosure";
import { Tag } from "@/components/core/Tag";
import { EngineProgress, type NumberStatus } from "./EngineProgress";
import styles from "./NumberList.module.css";

export interface NumberRow {
  /** The catalogue id. */
  id: string;
  name: ReactNode;
  /** The figure, the range or the words as the person gave them; omitted when there are none. */
  value?: ReactNode;
  /** `words`: the person's own words or a choice, set as text, not as a figure. */
  valueKind?: "number" | "words";
  status: NumberStatus | "na";
  /** A Tag for est and cant (neutral), asked and todo (outline: pending), na (neutral). A found number shows its value, no tag. */
  statusLabel?: ReactNode;
  /** A small line under the row: why it can't be found, how far it moved since the month before. */
  note?: ReactNode;
  /** Opens the number's own screen. Absent: the row is read, not opened (a closed month). */
  onOpen?: () => void;
  /** The row's element id: where the focus comes back from the number's screen (« ← Tes chiffres »). */
  elementId?: string;
  /** The row's own; its value and note take `-value` and `-note` after it. */
  "data-testid"?: string;
}

export interface NumberStage {
  id: string;
  /** Stage names stay in English on French screens. */
  name: string;
  /** The stage a TEAM TARGET names (C1). Never set from a published reference. */
  holdsBack?: boolean;
  /** « Freine ici ». */
  holdsLabel?: ReactNode;
  /** « 2 sur 3 trouvés ». */
  foundLabel: string;
  marks: NumberStatus[];
  rows: NumberRow[];
}

export interface NumberListProps {
  /** « Tes chiffres ». */
  title: ReactNode;
  /** An EngineProgress (md) under the title. */
  progress?: ReactNode;
  stages: NumberStage[];
  /** A closed group at the end, its rows after the stages': in the hybrid, the link between the two engines. */
  extra?: { title: ReactNode; rows: NumberRow[]; open?: boolean; "data-testid"?: string };
  headingId?: string;
  "data-testid"?: string;
}

const TAG_TONE: Partial<Record<NumberRow["status"], "neutral" | "outline">> = { est: "neutral", cant: "neutral", na: "neutral", asked: "outline", todo: "outline" };

function Row({ row }: { row: NumberRow }) {
  const testId = row["data-testid"];
  const tone = TAG_TONE[row.status];
  const content = (
    <>
      <span className={styles.name}>{row.name}</span>
      {row.value ? (
        <span className={styles.value} data-kind={row.valueKind ?? "number"} data-testid={testId ? `${testId}-value` : undefined}>
          {row.value}
        </span>
      ) : null}
      {row.statusLabel && tone ? (
        <Tag tone={tone}>
          {row.statusLabel}
        </Tag>
      ) : null}
      {row.note ? (
        <span className={styles.note} data-testid={testId ? `${testId}-note` : undefined}>
          {row.note}
        </span>
      ) : null}
    </>
  );
  return (
    <li className={styles.item}>
      {row.onOpen ? (
        <button type="button" id={row.elementId} className={styles.row} onClick={row.onOpen} data-testid={testId} data-status={row.status}>
          {content}
        </button>
      ) : (
        <div className={styles.row} data-testid={testId} data-status={row.status}>
          {content}
        </div>
      )}
    </li>
  );
}

/**
 * Every number, by stage, in one list — design system extension 07 (brief
 * 07 Q16, C41). It replaces the five stage tabs and their panel of folded
 * rows: the tabs hid four stages out of five, their strip scrolled inside
 * its own box on a phone, and a row unfolded a whole sheet in place. Here
 * every stage is visible and every number is one row — name, value, status
 * — that opens the number's own screen.
 *
 * The funnel's order, always: never sorted by value, status or effort (the
 * next action is NextStep's job). The stage a TEAM TARGET names gets the
 * system's diagnosis — the solid red edge and « Freine ici »; no other red in
 * the list. A found number shows its value and no tag: the value is the
 * status. Pending states (asked, to do) wear the dashed tag, the others the
 * neutral one.
 */
export function NumberList({ title, progress, stages, extra, headingId = "engine-numbers", "data-testid": testId }: NumberListProps) {
  return (
    <section className={styles.root} aria-labelledby={headingId} data-testid={testId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {progress ?? null}
      {stages.map((stage) => (
        <section
          key={stage.id}
          className={[styles.stage, stage.holdsBack ? styles.holds : ""].filter(Boolean).join(" ")}
          aria-labelledby={`${headingId}-${stage.id}`}
          data-testid={testId ? `${testId}-${stage.id}` : undefined}
          data-holds={stage.holdsBack ? "true" : undefined}
        >
          <div className={styles.head}>
            <h3 id={`${headingId}-${stage.id}`} className={styles.stageName}>
              {stage.name}
            </h3>
            {stage.holdsBack ? <Tag tone="alert">{stage.holdsLabel}</Tag> : null}
            <div className={styles.headProgress}>
              <EngineProgress remaining="" marksOnly groups={[{ id: stage.id, label: stage.foundLabel, marks: stage.marks }]} />
              <span className={styles.found}>{stage.foundLabel}</span>
            </div>
          </div>
          <ul className={styles.rows}>
            {stage.rows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </ul>
        </section>
      ))}
      {extra ? (
        <Disclosure summary={extra.title} defaultOpen={extra.open} data-testid={extra["data-testid"]}>
          <ul className={styles.rows}>
            {extra.rows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </section>
  );
}
