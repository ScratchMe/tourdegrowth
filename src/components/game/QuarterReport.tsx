import type { ReactNode, Ref } from "react";
import { Button } from "@/components/core/Button";
import { DataTable } from "@/components/core/DataTable";
import { Tag } from "@/components/core/Tag";
import type { Mood } from "@/lib/game/types";
import { DgMail, type DgMailProps } from "./DgMail";
import { EventClipping, type EventClippingProps } from "./EventClipping";
import styles from "./QuarterReport.module.css";

export interface ReportFigure {
  /** Stable key, also the table column: "churn", "target", "subs", "mrr", "patience". */
  key: string;
  label: string;
  /** Formatted by `lib/game/format.ts`, the same string the dashboard printed. */
  value: string;
  /**
   * A line under the value — churn's target (« objectif 5,6 % »). The target
   * is a number of the report, but the copy states it as a sentence about
   * churn, so it sits with churn rather than as a sixth figure with no label.
   */
  note?: string;
  /**
   * Only on churn: « objectif atteint » / « manqué de 0,1 pt », in WORDS — the
   * colour repeats it. `bad` for any miss: the prototype's coral and crimson
   * are one token at night (world-night.css rule 2), the size of the miss is
   * in the number.
   */
  status?: { text: string; tone: "good" | "bad" };
}

export interface QuarterReportProps {
  /** 1 to 4: `game-report-{q}`. */
  q: number;
  /** « Trimestre 1 · janvier à mars » — the report's heading, focused when the report opens. */
  period: string;
  headingRef?: Ref<HTMLHeadingElement>;
  /** The two cards played, by name. */
  picked: readonly string[];
  /** Churn (with its target as `note` and its status), subscribers, revenue, patience — in that order. */
  figures: readonly ReportFigure[];
  /** « Ce que tes actions ont fait ». */
  effectsHeading: string;
  /** One filled line per card: « Offre de pause : −5 % de résiliations ce trimestre, l'effet monte encore ». */
  effects: readonly string[];
  /** Private events of the quarter, one sentence each (the data presentation, the survey's answers). */
  notes?: readonly string[];
  /**
   * « Pourquoi le churn a bougé : +0,4 pt » and its lines, each already filled
   * and adding up to the heading. Empty lines: no block.
   */
  drivers?: { heading: string; lines: readonly string[] };
  /** The CEO's mid-quarter email. */
  mail?: DgMailProps;
  /** Public events, on paper. */
  clippings?: readonly EventClippingProps[];
  /** The CEO's closing line (« Le DG : « … » »), his face beside it at the quarter's end mood. */
  boss: { line: string; mood: Mood; face?: ReactNode };
  /** « Le DG t'appelle → », or « Voir le bilan de l'année → » after the last quarter. */
  next: { label: string; onClick: () => void };
}

/**
 * The quarter report as its own moment — game plan §1.2 R1, §2.6, §3.5.
 *
 * The prototype printed it UNDER the hand of twelve cards while the next call
 * opened above: you scrolled ~1 000px to read what had just happened. Here it
 * takes the call's place, gets the focus, and holds the screen until the
 * player asks for the next call. Order of reading, top to bottom: what you
 * played, what the numbers did, what your actions did, what the CEO wrote,
 * what the outside world printed, what the CEO says.
 *
 * The five figures are drawn once as a row for the eye and once as a
 * `DataTable` for screen readers (plan §2.6): the row is laid out for
 * reading at a glance and is hidden from assistive technology; the table
 * carries the same strings with their headers.
 */
export function QuarterReport({
  q,
  period,
  headingRef,
  picked,
  figures,
  effectsHeading,
  effects,
  notes = [],
  drivers,
  mail,
  clippings = [],
  boss,
  next,
}: QuarterReportProps) {
  const headingId = `game-report-${q}-title`;

  return (
    <section className={styles.report} aria-labelledby={headingId} data-testid={`game-report-${q}`}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.period} ref={headingRef} tabIndex={-1}>
          {period}
        </h2>
        <ul className={styles.picked}>
          {picked.map((name) => (
            <li key={name}>
              {/*
               * `ink` is the inverse fill — amber at night, the colour these
               * two cards wore when they were ticked. `neutral` is the sunken
               * fill, which IS the report's own ground: it vanished.
               */}
              <Tag tone="ink">{name}</Tag>
            </li>
          ))}
        </ul>
      </header>

      <div className={styles.figures} aria-hidden="true">
        {figures.map((figure) => (
          <div key={figure.key} className={styles.figure}>
            <span className={styles.figureLabel}>{figure.label}</span>
            <span className={styles.figureValue}>{figure.value}</span>
            {figure.note ? <span className={styles.figureNote}>{figure.note}</span> : null}
            {figure.status ? (
              <span className={[styles.status, styles[figure.status.tone]].join(" ")}>{figure.status.text}</span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="tdg-visually-hidden">
        <DataTable
          caption={period}
          size="sm"
          columns={figures.map((figure) => ({ key: figure.key, header: figure.label, numeric: true }))}
          rows={[
            {
              id: `q${q}`,
              cells: Object.fromEntries(
                figures.map((figure) => [
                  figure.key,
                  [figure.value, figure.note, figure.status?.text].filter(Boolean).join(" · "),
                ]),
              ),
            },
          ]}
        />
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>{effectsHeading}</h3>
        <ul className={styles.lines}>
          {effects.map((line) => (
            <li key={line}>{line}</li>
          ))}
          {notes.map((line) => (
            <li key={line} className={styles.note}>
              {line}
            </li>
          ))}
        </ul>
      </div>

      {drivers && drivers.lines.length > 0 ? (
        <div className={styles.block} data-testid={`game-report-${q}-drivers`}>
          <h3 className={styles.blockTitle}>{drivers.heading}</h3>
          <ul className={styles.lines}>
            {drivers.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {mail ? <DgMail header={mail.header} body={mail.body} /> : null}

      {clippings.length > 0 ? (
        <div className={styles.clippings}>
          {clippings.map((clipping) => (
            <EventClipping key={clipping.kind} {...clipping} />
          ))}
        </div>
      ) : null}

      <div className={[styles.boss, boss.mood === "angry" ? styles.angry : ""].filter(Boolean).join(" ")} data-mood={boss.mood}>
        {boss.face ? (
          <span className={styles.face} aria-hidden="true">
            {boss.face}
          </span>
        ) : null}
        <p className={styles.bossLine}>{boss.line}</p>
      </div>

      <div className={styles.next}>
        <Button onClick={next.onClick} data-testid="game-report-next">
          {next.label}
        </Button>
      </div>
    </section>
  );
}
