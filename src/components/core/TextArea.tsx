"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { describedByIds } from "@/lib/forms/field";
import styles from "./TextArea.module.css";

export interface TextAreaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "className" | "maxLength" | "onChange" | "value" | "aria-label" | "aria-describedby"
  > {
  value: string;
  onChange: (value: string) => void;
  /**
   * Display and soft-cap only — the counter turns over, typing is never
   * blocked. Real enforcement is server-side (see the deep-dive API route).
   */
  maxLength: number;
  /**
   * Accessible name. REQUIRED when the TextArea stands alone under a
   * QuestionCard: the visible prompt sits above rather than in a `<label>`,
   * so without it the field announces as an unnamed text area (REVIEW.md
   * R-19). Left out inside a Field (extension 04), whose `<label for>` names
   * it: a second name would override the visible one.
   */
  label?: string;
  /** From the Field around it: its message is invalid. The same 3px red edge as past the limit. */
  invalid?: boolean;
  /** The Field's message and hint; the counter's id is added after them. */
  "aria-describedby"?: string;
}

/**
 * The multi-line text input — design system extension 01.
 *
 * A flat paper card you type into, in the field family since extension 04
 * (Field wraps it and gives it its visible label). Keep it plain: no resize
 * handle, no floating label, no icon inside the field, no count inside the
 * field — the count sits under it, always shown, as a multi-line field has
 * the room.
 *
 * The counter is honest — it reports the real count and only past `maxLength`
 * does it turn `--text-alert`, together with a solid red field border. The
 * reader is over, they can see it, they decide.
 */
export function TextArea({
  value,
  onChange,
  maxLength,
  label,
  invalid = false,
  "aria-describedby": describedBy,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const id = useId();
  const counterId = `${id}-count`;
  const over = value.length > maxLength;

  return (
    <div className={styles.wrap}>
      <textarea
        {...rest}
        rows={rows}
        className={[styles.field, over ? styles.fieldOverLimit : "", invalid ? styles.fieldInvalid : ""]
          .filter(Boolean)
          .join(" ")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        aria-invalid={invalid || over || undefined}
        aria-describedby={describedByIds(describedBy, counterId)}
      />
      <div
        id={counterId}
        aria-live="polite"
        className={[styles.counter, over ? styles.counterOverLimit : ""].filter(Boolean).join(" ")}
      >
        {value.length}/{maxLength}
      </div>
    </div>
  );
}
