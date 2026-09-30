"use client";

import { useId, type ReactNode } from "react";
import { describedByIds } from "@/lib/forms/field";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  /** The sentence: the visible label, and the whole row is the target. */
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: ReactNode;
  /** Set by the Field group that carries the message (a required confirmation). */
  invalid?: boolean;
  disabled?: boolean;
  /** Why it is disabled, under the sentence. */
  disabledReason?: ReactNode;
  /** `sm` (default) sets the sentence in --body-md; `md` in --body-lg, for a one-question screen. */
  size?: "sm" | "md";
  id?: string;
  name?: string;
  /** More ids to describe it by, such as its group's message. */
  describedBy?: string;
  /** Set on the native control, for tests. */
  "data-testid"?: string;
}

/**
 * Yes / no, with its sentence as its visible label — design system extension
 * 04. The whole row is the target, 44px tall. One checkbox stands on its own
 * row; a list of them is a Field `group` (a fieldset with its legend) of plain
 * rows split by the dashed rule — never cards, which mean « the one chosen ».
 * Never for a choice between options (Choices) or one of two or three states
 * (Segmented), and never an `<input type="checkbox">` written by hand.
 */
export function Checkbox({
  label,
  checked,
  onChange,
  hint,
  invalid = false,
  disabled = false,
  disabledReason,
  size = "sm",
  id: idProp,
  name,
  describedBy,
  "data-testid": testId,
}: CheckboxProps) {
  const auto = useId().replace(/:/g, "");
  const id = idProp ?? `check-${auto}`;
  const note = disabled && disabledReason ? disabledReason : hint;
  const noteId = note ? `${id}-hint` : undefined;
  return (
    <label
      htmlFor={id}
      className={[styles.row, size === "md" ? styles.md : "", invalid ? styles.invalid : "", disabled ? styles.disabled : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        id={id}
        name={name}
        data-testid={testId}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedByIds(describedBy, noteId)}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.text}>
        <span>{label}</span>
        {note ? (
          <span id={noteId} className={styles.hint}>
            {note}
          </span>
        ) : null}
      </span>
    </label>
  );
}
