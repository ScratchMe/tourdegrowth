"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import styles from "./TextArea.module.css";

export interface TextAreaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "className" | "maxLength" | "onChange" | "value" | "aria-label"
  > {
  value: string;
  onChange: (value: string) => void;
  /**
   * Display and soft-cap only — the counter turns over, typing is never
   * blocked. Real enforcement is server-side (see the deep-dive API route).
   */
  maxLength: number;
  /**
   * Accessible name. Required in the type on purpose: the visible prompt sits
   * in a QuestionCard above rather than in a `<label>`, so without it the
   * field announces as an unnamed text area (REVIEW.md R-19).
   */
  label: string;
}

/**
 * The system's only text input — design system extension 01.
 *
 * A flat paper card you type into. It also defines what any future input
 * looks like here, so keep it plain: no resize handle, no floating label, no
 * icon inside the field, no count inside the field.
 *
 * The counter is honest — it reports the real count and only past `maxLength`
 * does it turn `--text-alert`, together with a solid red field border. The
 * reader is over, they can see it, they decide.
 */
export function TextArea({ value, onChange, maxLength, label, ...rest }: TextAreaProps) {
  const id = useId();
  const counterId = `${id}-count`;
  const over = value.length > maxLength;

  return (
    <div className={styles.wrap}>
      <textarea
        className={[styles.field, over ? styles.fieldOverLimit : ""].filter(Boolean).join(" ")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        aria-invalid={over || undefined}
        aria-describedby={counterId}
        rows={4}
        {...rest}
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
