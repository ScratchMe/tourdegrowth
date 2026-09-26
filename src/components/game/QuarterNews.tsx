"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Button } from "@/components/core/Button";
import type { Mood } from "@/lib/game/types";
import { DgMail, type DgMailProps } from "./DgMail";
import { EventClipping, type EventClippingProps } from "./EventClipping";
import styles from "./QuarterNews.module.css";

/** One figure under the verdict — the report's own strings, formatted once. */
export interface NewsFigure {
  key: string;
  label: string;
  value: string;
}

export type QuarterNewsBody =
  /** The quarter's verdict: churn against its target, stamped hit or missed, and the three other figures. */
  | {
      kind: "result";
      /** « Résiliations » — the figure the quarter is judged on. */
      metric: string;
      value: string;
      /** « objectif 5,6 % ». */
      note: string;
      /** « manqué de 0,5 pt » — in words; the stamp's colour repeats it. */
      status: { text: string; tone: "good" | "bad" };
      figures: readonly NewsFigure[];
    }
  /** The CEO's mid-quarter email. */
  | { kind: "mail"; mail: DgMailProps }
  /** Something that happened inside Flixo: the survey's answers, the presentation. */
  | { kind: "note"; text: string }
  /** A public event, on paper — with its « pourquoi » and, here, its stamp. */
  | { kind: "clipping"; clipping: EventClippingProps }
  /** The CEO's closing line, his face at the quarter's end mood. */
  | { kind: "boss"; line: string; mood: Mood; face?: ReactNode };

export type QuarterNewsItem = QuarterNewsBody & {
  /** The eyebrow over the card: « Le verdict », « Pendant ce temps, dehors »… */
  label: string;
};

export interface QuarterNewsProps {
  /** 1 to 4: `data-q`, and the report underneath is `game-report-{q}`. */
  q: number;
  /** « Fin du trimestre ». */
  eyebrow: string;
  /** « Trimestre 2 · avril à juin » — the dialog's name. */
  period: string;
  items: readonly QuarterNewsItem[];
  /** « 2 sur 5 », one per item, already filled. */
  progress: readonly string[];
  labels: { next: string; finish: string; skip: string };
  /** The primary button: the island moves the focus there when the screen opens. */
  primaryRef?: Ref<HTMLButtonElement>;
  /** Read to its end (« Voir le bilan »), or cut short (« Passer au bilan », Escape). */
  onDone: (how: "read" | "skipped") => void;
}

/**
 * The quarter's news, one at a time, over everything — Antoine's second
 * pass on the report (2026-09-26), after La Bataille du budget's end of
 * round: the report reads well afterwards, but a DGCCRF inspection printed
 * among five other blocks is not NOTICED. So the quarter lands first here,
 * card by card, and the report stays underneath for re-reading.
 *
 * A native modal `<dialog>`: the top layer covers the page, the page behind
 * is inert (no Tab reaches it, no screen reader reads it), and Escape is the
 * dialog's own `cancel` — treated as « Passer au bilan ». The focus lives on
 * the primary button, which stays the same element from the first card to
 * the last, so Enter reads the quarter through; each new card is announced
 * by the stage, a polite live region read whole.
 *
 * Every animation is CSS and every element rests in its final state, so
 * under `prefers-reduced-motion` (motion.css) the cards simply appear.
 */
export function QuarterNews({ q, eyebrow, period, items, progress, labels, primaryRef, onDone }: QuarterNewsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const last = index >= items.length - 1;
  const item = items[Math.min(index, items.length - 1)];

  useEffect(() => {
    const dialog = dialogRef.current;
    // `showModal` puts the dialog in the top layer and makes the rest of the
    // page inert. A DOM without it (an old engine) still shows the dialog,
    // `open`, as a fixed layer — only the inertness is lost.
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    // `showModal` focuses the first control, « Passer au bilan »; the reader's
    // place is the primary button, which Enter then presses card after card.
    dialog?.querySelector<HTMLButtonElement>("[data-news-primary]")?.focus();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  const next = () => {
    if (last) return onDone("read");
    setIndex((i) => i + 1);
    // A long card (an inspection, on a phone) may have been scrolled; the next
    // one starts at its top, where its label says what it is.
    dialogRef.current?.scrollTo({ top: 0 });
  };

  if (!item) return null;
  const control = item.kind === "clipping" && item.clipping.kind === "control";

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`game-news-${q}-title`}
      aria-describedby={`game-news-${q}-stage`}
      onCancel={(event) => {
        event.preventDefault();
        onDone("skipped");
      }}
      data-testid="game-news"
      data-q={q}
    >
      <div className={styles.frame}>
        <header className={styles.top}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id={`game-news-${q}-title`} className={styles.period}>
              {period}
            </h2>
          </div>
          <Button variant="quiet" onClick={() => onDone("skipped")} data-testid="game-news-skip">
            {labels.skip}
          </Button>
        </header>

        <ol className={styles.dots} aria-hidden="true">
          {items.map((it, i) => (
            <li
              key={`${it.kind}-${i}`}
              className={[styles.dot, i < index ? styles.done : "", i === index ? styles.current : ""]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </ol>

        {/* The stage: one card at a time. `key` remounts the card, so its
            entrance plays for every news; the live region around it says it. */}
        <div
          id={`game-news-${q}-stage`}
          className={[styles.stage, control ? styles.shake : ""].filter(Boolean).join(" ")}
          aria-live="polite"
          aria-atomic="true"
        >
          <article key={index} className={styles.card} data-kind={item.kind} data-testid="game-news-item">
            <p className={styles.label}>{item.label}</p>
            <NewsBody item={item} />
          </article>
        </div>

        <footer className={styles.bottom}>
          <p className={styles.count} data-testid="game-news-count">
            {progress[index]}
          </p>
          <Button ref={primaryRef} onClick={next} data-news-primary="" data-testid="game-news-next">
            {last ? labels.finish : labels.next}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function NewsBody({ item }: { item: QuarterNewsItem }) {
  switch (item.kind) {
    case "result":
      return (
        <div className={styles.result}>
          <p className={styles.metric}>{item.metric}</p>
          <p className={styles.value} data-testid="game-news-value">
            {item.value}
          </p>
          <p className={styles.note}>{item.note}</p>
          <p className={styles.verdict} data-tone={item.status.tone} data-testid="game-news-verdict">
            {item.status.text}
          </p>
          <dl className={styles.figures}>
            {item.figures.map((figure) => (
              <div key={figure.key} className={styles.figure}>
                <dt>{figure.label}</dt>
                <dd>{figure.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "mail":
      return <DgMail header={item.mail.header} body={item.mail.body} />;
    case "note":
      return <p className={styles.noteText}>{item.text}</p>;
    case "clipping":
      return (
        <div className={styles.clipping}>
          <EventClipping {...item.clipping} />
        </div>
      );
    case "boss":
      return (
        <div className={[styles.boss, item.mood === "angry" ? styles.angry : ""].filter(Boolean).join(" ")} data-mood={item.mood}>
          {item.face ? (
            <span className={styles.face} aria-hidden="true">
              {item.face}
            </span>
          ) : null}
          <p className={styles.bossLine}>{item.line}</p>
        </div>
      );
  }
}
