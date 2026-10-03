import type { ReactNode } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Tag } from "@/components/core/Tag";
import styles from "./MoneyBlock.module.css";

export interface MoneyFigure {
  key: string;
  /** « MRR » · « ARR, le MRR × 12 ». */
  label: ReactNode;
  /** A fact, to the unit: « 48 000 € ». */
  value: ReactNode;
}

export interface MoneyFact {
  key: string;
  /** « Dépensé en acquisition ce mois-ci » · « Immobilisé à ce rythme » and its « ? ». */
  label: ReactNode;
  /** « 93 480 € » · « ~990 000 € » — or null: the dashed, hatched « ? » box, never 0. */
  value: ReactNode | null;
  /** With no value, what is missing (« il manque la marge brute »). */
  missing?: ReactNode;
}

export interface MoneyBlockProps {
  /** « L'argent · août 2026 ». */
  eyebrow: ReactNode;
  headingId?: string;
  /** MRR then ARR, side by side. null in the hybrid: the total band carries them. */
  figures: MoneyFigure[] | null;
  worth: {
    /** « Ce que vaut un nouveau client ». */
    title: ReactNode;
    /** The finding's name: the loss (an ink tag) or its maybe (`maybe`: dashed). None when it pays back or can't be said. */
    tag?: { label: ReactNode; maybe?: boolean };
    /** The finding in words: « Chaque nouveau client coûte 1 900 € et rapporte ~1 500 € de marge : tu perds ~400 € sur chacun. » */
    finding: ReactNode;
    /** WorthBars. */
    bars?: ReactNode;
    /** The finding's figure in time: « Un client reste ~17 mois ; rembourser son coût en prendrait 21 : il part avant. » */
    months?: ReactNode;
    /** With no margin, why nothing is computed on revenue; with a maybe, where the range comes from. */
    note?: ReactNode;
  };
  cash?: {
    /** « Trésorerie ». */
    title: ReactNode;
    facts: MoneyFact[];
    /** Does it come back, and when. */
    line?: ReactNode;
    /** CashWarning, or nothing. Never with a certain loss. */
    warning?: ReactNode;
    /** What the cash figure assumes (a floor, a linear return, monthly billing). */
    assumptions?: ReactNode;
  };
  className?: string;
  "data-testid"?: string;
}

/**
 * The money on the board — design system extension 09 (Q1–Q6). One flat,
 * ruled block, not a card (the peloton stays the one raised card), right
 * after the diagnosis. No button, no field: it adds no control to the board
 * but the « ? » of the words it teaches.
 *
 * 1. `figures` — the MRR and its ARR, side by side, MRR first: it is the
 *    typed fact; the ARR is « the MRR × 12 », said in its label.
 * 2. `worth` — what one new customer is worth: the finding first, in words,
 *    and named by a tag when there is one — the loss in ink, solid (today's
 *    numbers say so), its « maybe » dashed (not yet). Never red: the loss is
 *    arithmetic on the team's own numbers, not the stage a target names.
 *    Then the bars, then the months: a loss IS a payback longer than the
 *    lifetime, said here, inside the finding, never as a second piece of news.
 * 3. `cash` — the month's acquisition spend and the cash it keeps tied up,
 *    whether and when it comes back, the warning slot, the assumptions.
 */
export function MoneyBlock({ eyebrow, headingId = "engine-money-title", figures, worth, cash, className, "data-testid": testId }: MoneyBlockProps) {
  const part = (name: string) => (testId ? `${testId}-${name}` : undefined);
  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-labelledby={headingId} data-testid={testId}>
      <MetaLabel as="h2" id={headingId} size="sm" tone="muted" wide>
        {eyebrow}
      </MetaLabel>
      {figures ? (
        <dl className={styles.figures}>
          {figures.map((f) => (
            <div key={f.key} className={styles.figure} data-testid={part(`figure-${f.key}`)}>
              <dt className={styles.figureLabel}>{f.label}</dt>
              <dd className={styles.figureValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className={styles.part}>
        <h3 className={styles.partTitle}>{worth.title}</h3>
        <p className={styles.finding} data-testid={part("finding")}>
          {worth.tag ? (
            <>
              <Tag tone={worth.tag.maybe ? "outline" : "ink"} className={styles.tag} data-testid={part("tag")}>
                {worth.tag.label}
              </Tag>{" "}
            </>
          ) : null}
          {worth.finding}
        </p>
        {worth.bars ?? null}
        {worth.months ? (
          <p className={styles.months} data-testid={part("months")}>
            {worth.months}
          </p>
        ) : null}
        {worth.note ? <p className={styles.note}>{worth.note}</p> : null}
      </div>
      {cash ? (
        <div className={styles.part} data-testid={part("cash")}>
          <h3 className={styles.partTitle}>{cash.title}</h3>
          <dl className={styles.facts}>
            {cash.facts.map((f) => (
              <div key={f.key} className={styles.fact} data-testid={part(`fact-${f.key}`)}>
                <dt className={styles.factLabel}>{f.label}</dt>
                {/* An unknown is the dashed « ? » box, never 0, and says what is missing. */}
                {f.value === null ? (
                  <dd className={styles.factValue}>
                    <span className={styles.unknown}>
                      <span className={styles.unknownMark}>?</span>
                    </span>
                    {f.missing ? <span className={styles.missing}>{f.missing}</span> : null}
                  </dd>
                ) : (
                  <dd className={styles.factValue}>{f.value}</dd>
                )}
              </div>
            ))}
          </dl>
          {cash.line ? <p className={styles.cashLine}>{cash.line}</p> : null}
          {cash.warning ?? null}
          {cash.assumptions ? <p className={styles.assumptions}>{cash.assumptions}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
