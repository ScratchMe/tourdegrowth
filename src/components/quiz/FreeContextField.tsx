import type { TextareaHTMLAttributes } from "react";
import styles from "./FreeContextField.module.css";

export interface FreeContextFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "maxLength" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  /** Client-side limit — display and soft-cap only. The real enforcement is server-side (see the deep-dive API route); never rely on this alone. */
  maxLength: number;
  /**
   * Accessible name. The visible prompt sits in a QuestionCard above rather
   * than in a `<label>`, so without this the field announces as an unnamed
   * text area (REVIEW.md R-19).
   */
  "aria-label": string;
}

/**
 * The free-text context field on the Deep dive's last screen
 * (SPEC-ADDENDUM-02.md §1) — a plain textarea plus its character counter,
 * built to the spec's exact visual parameters rather than adapted from a
 * design-system component (none of the 17 covers a multi-line text input).
 * Deliberately does not hard-block typing past `maxLength` — the counter
 * turning red is the only feedback, so pasting a long block never feels
 * like it silently ate the end of what was pasted; the real cap is the
 * server-side truncation.
 */
export function FreeContextField({ value, onChange, maxLength, ...rest }: FreeContextFieldProps) {
  const overLimit = value.length > maxLength;

  return (
    <div>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      <div className={[styles.counter, overLimit ? styles.counterOverLimit : ""].filter(Boolean).join(" ")}>
        {value.length}/{maxLength}
      </div>
    </div>
  );
}
