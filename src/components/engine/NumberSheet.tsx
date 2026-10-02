"use client";

import { useId, type ReactNode, type Ref } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { Tag } from "@/components/core/Tag";
import styles from "./NumberSheet.module.css";

/** The boxes where Enter submits, as in a browser's own forms (HTML's implicit submission): not a checkbox, a button or a textarea. */
const TEXT_INPUTS = new Set(["text", "search", "url", "email", "tel", "number"]);

export interface NumberSheetProps {
  /** « Acquisition · 1 sur 3 » — the stage and the number's place in it. */
  position?: ReactNode;
  /** What remains: « 17 à faire ». */
  progress?: ReactNode;
  /**
   * The number's name, the screen's heading. Absent only where the caller
   * already names the number above the sheet (a board row, until A18 T2).
   */
  name?: ReactNode;
  /** The heading's id; unique by default. It takes the focus when a person MOVES to this screen, never on first paint. */
  headingId?: string;
  headingRef?: Ref<HTMLHeadingElement>;
  /** The catalogue's effort (« Seul, 5 min »): a neutral tag — an effort is not pending. */
  effort?: ReactNode;
  /** « Définition → », the glossary page, in a new tab so the sheet in progress is not lost. */
  definitionLabel?: ReactNode;
  definitionHref?: string;
  /** The one-liner, from the catalogue. */
  definition: ReactNode;
  /** « Formule » and the formula, on one mono line. */
  formulaLabel?: ReactNode;
  formula?: ReactNode;
  /** What was answered in the Tour, one line, when the engine is linked to it. */
  tour?: ReactNode;
  /** A TrapNote — open, before the value. */
  trap?: ReactNode;
  /** A WhereToFind — folded, its summary naming the tools. */
  where?: ReactNode;
  /** An AnswerSwitch: the value first, the three other answers under it. */
  answer?: ReactNode;
  /** A HowItCompares: reference, target, verdict. */
  compare?: ReactNode;
  /** A folded Disclosure, « Ta définition et une note ». */
  words?: ReactNode;
  /** One primary (« Enregistrer et continuer → ») and quiet ones. */
  actions?: ReactNode;
  /** What the save said: saved, refused and why, the device refusing to keep it. Under the actions. */
  footer?: ReactNode;
  /** Enter in a text box. The caller decides whether that saves (a request is saved by its copy, not by Enter). */
  onSubmit?: () => void;
  /** A computed number: definition, formula, trap and reference; no answer, no words. */
  readOnly?: boolean;
  /** The paper card around the sheet. Off where the sheet sits inside another surface (a board row, until A18 T2). */
  framed?: boolean;
  className?: string;
  "data-testid"?: string;
}

/**
 * One number's screen — design system extension 07 (brief 07 Q6, Q14): one
 * question, and its knowledge attached to what it explains. It fixes the
 * ORDER of the blocks; the caller fills them:
 *
 *   position · progress → name, effort, « Définition → » → the one-liner and
 *   the formula → the Tour → the trap (open) → where to find it (folded) →
 *   the value → how it compares → the definition and a note (folded) →
 *   the actions → what the save said.
 *
 * Not a `<form>`, unlike the return's: a form is a carrier, and if its submit
 * ever ran without this code (before hydration, or a handler that throws),
 * the browser would put what was typed in a URL — and nothing typed in the
 * engine leaves the device (ENGINE.md §11.4, `engine-boundary.test.ts`).
 * Enter in a text box calls `onSubmit` instead, as a form would.
 */
export function NumberSheet({
  position,
  progress,
  name,
  headingId,
  headingRef,
  effort,
  definitionLabel,
  definitionHref,
  definition,
  formulaLabel,
  formula,
  tour,
  trap,
  where,
  answer,
  compare,
  words,
  actions,
  footer,
  onSubmit,
  readOnly = false,
  framed = true,
  className,
  "data-testid": testId,
}: NumberSheetProps) {
  const ownId = useId();
  const titleId = headingId ?? `${ownId}-title`;
  const body = (
    <div
      className={styles.body}
      role={name ? "group" : undefined}
      aria-labelledby={name ? titleId : undefined}
      onKeyDown={(event) => {
        if (!onSubmit || event.key !== "Enter" || event.nativeEvent.isComposing) return;
        if (!(event.target instanceof HTMLInputElement) || !TEXT_INPUTS.has(event.target.type)) return;
        event.preventDefault();
        onSubmit();
      }}
    >
      {position || progress ? (
        <div className={styles.header}>
          {position ? (
            <MetaLabel size="sm" tone="muted">
              {position}
            </MetaLabel>
          ) : (
            <span />
          )}
          {progress ? <div className={styles.progress}>{progress}</div> : null}
        </div>
      ) : null}
      {name || effort || definitionHref ? (
        <div className={styles.identity}>
          {name ? (
            <h2 id={titleId} ref={headingRef} tabIndex={-1} className={styles.name}>
              {name}
            </h2>
          ) : null}
          {effort || definitionHref ? (
            <div className={styles.meta}>
              {effort ? <Tag tone="neutral">{effort}</Tag> : null}
              {definitionHref ? (
                <Button variant="quiet" size="sm" href={definitionHref} hard target="_blank" rel="noopener">
                  {definitionLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <p className={styles.lede}>{definition}</p>
      {formula ? (
        <p className={styles.formula}>
          <span className={styles.formulaLabel}>{formulaLabel}</span>
          <code className={styles.formulaText}>{formula}</code>
        </p>
      ) : null}
      {tour ? <p className={styles.tour}>{tour}</p> : null}
      {trap ?? null}
      {where ?? null}
      {readOnly ? null : (answer ?? null)}
      {compare ?? null}
      {readOnly ? null : (words ?? null)}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
      {footer ?? null}
    </div>
  );
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");
  return framed ? (
    <Card elevation="flat" tone="paper" className={classes} data-testid={testId}>
      {body}
    </Card>
  ) : (
    <div className={classes} data-testid={testId}>
      {body}
    </div>
  );
}
