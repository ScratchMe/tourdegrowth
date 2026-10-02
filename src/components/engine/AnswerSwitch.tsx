"use client";

import { useId, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import styles from "./AnswerSwitch.module.css";

export type OtherAnswer = "estimate" | "ask" | "cant";

export interface AnswerSwitchProps {
  /** « Pas de chiffre sous la main ? » / "No figure to hand?" — names the group of the three other answers. */
  legend: ReactNode;
  /** The other answers, in this order: estimate · ask · can't find. A number that is words has no estimate. */
  options: { value: OtherAnswer; label: ReactNode }[];
  /** null: the value boxes. One of the three: its editor. Nothing is chosen by default. */
  answer?: OtherAnswer | null;
  onAnswer?: (answer: OtherAnswer) => void;
  /** The boxes (counts over counts, the rate alone, an amount, words), with what is said under them. */
  value?: ReactNode;
  /** Once a value is typed: where it comes from. */
  source?: ReactNode;
  /** The chosen answer's editor: the range and its basis · the role and the request · the triage. */
  editor?: ReactNode;
  /** « ← J'ai le chiffre, finalement ». */
  backLabel: ReactNode;
  onBack?: () => void;
  /** The group's label id; unique by default. */
  legendId?: string;
  "data-testid"?: string;
}

/**
 * The value is the question, and the three other answers sit one tap under
 * it — design system extension 07 (brief 07 Q7). Most numbers, most months,
 * are « je l'ai »: the boxes come first, and « Pas de chiffre sous la main ? »
 * offers to estimate, to ask, or to say it can't be found.
 *
 * The three are toggle buttons (`aria-pressed`), not radios: choosing one
 * swaps the boxes for its editor, « ← J'ai le chiffre, finalement » brings
 * them back, and what was typed stays until the save. Nothing is chosen for
 * the person: empty boxes and no other answer is « à faire », as before.
 */
export function AnswerSwitch({
  legend,
  options,
  answer = null,
  onAnswer,
  value,
  source,
  editor,
  backLabel,
  onBack,
  legendId,
  "data-testid": testId,
}: AnswerSwitchProps) {
  const ownId = useId();
  const groupLabel = legendId ?? `${ownId}-legend`;
  return (
    <div className={styles.root} data-testid={testId} data-answer={answer ?? "value"}>
      {answer ? (
        <div className={styles.editor}>
          <Button variant="quiet" size="sm" onClick={onBack} className={styles.back}>
            {backLabel}
          </Button>
          {editor}
        </div>
      ) : (
        <div className={styles.value}>
          {value}
          {source ?? null}
        </div>
      )}
      <div className={styles.others} role="group" aria-labelledby={groupLabel}>
        <span id={groupLabel} className={styles.legend}>
          {legend}
        </span>
        <ul className={styles.options}>
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className={styles.option}
                aria-pressed={answer === o.value}
                onClick={onAnswer ? () => onAnswer(o.value) : undefined}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
