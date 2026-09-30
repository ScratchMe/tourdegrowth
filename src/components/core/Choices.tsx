"use client";

import { useId, type ReactNode } from "react";
import { Field } from "./Field";
import styles from "./Choices.module.css";

export interface ChoiceOption<V extends string = string> {
  value: V;
  label: ReactNode;
  /** A quiet second line under the label. */
  note?: ReactNode;
  /** Shown dashed, « not yet ». Always give it its reason. */
  disabled?: boolean;
  /** The word that leads the reason, set in 600: "Coming soon" / « Bientôt ». */
  disabledLead?: ReactNode;
  /** The reason, at full contrast. */
  disabledNote?: ReactNode;
}

export interface ChoicesProps<V extends string = string> {
  /** The question, visible, as the fieldset's legend. */
  legend: ReactNode;
  /** Two to six. Past that it is a Select; on/off is a Checkbox. */
  options: readonly ChoiceOption<V>[];
  /** `null`: nothing chosen. Never default to the first option. */
  value?: V | null;
  onChange: (value: V) => void;
  /** 2: two columns from a 560px group, one below — short, parallel options only (the 2×2 status question). */
  columns?: 1 | 2;
  hint?: ReactNode;
  error?: ReactNode;
  missing?: ReactNode;
  optional?: string;
  /** `md`: 64px rows, the legend is the question. `sm`: 44px rows, for a sheet. */
  size?: "sm" | "md";
  name?: string;
  id?: string;
}

/**
 * Pick one of a handful, as cards — design system extension 04. A real radio
 * group: a fieldset whose visible legend is the question, native radios
 * underneath (arrow keys move between options, nothing moves on until the
 * form is saved), each drawn with AnswerOption's ring.
 *
 * Not AnswerOption generalised (Q12): AnswerOption is a button that answers
 * and moves the quiz on after one tap; Choices waits for a save. Same look,
 * two behaviours — never AnswerOption in a form, never Choices advancing on
 * change. Nothing is chosen unless the caller says so.
 */
export function Choices<V extends string = string>({
  legend,
  options,
  value = null,
  onChange,
  columns = 1,
  hint,
  error,
  missing,
  optional,
  size = "md",
  name: nameProp,
  id,
}: ChoicesProps<V>) {
  const auto = useId().replace(/:/g, "");
  const name = nameProp ?? `choices-${auto}`;
  return (
    <Field group label={legend} hint={hint} error={error} missing={missing} optional={optional} size={size} id={id}>
      {({ id: groupId, status }) => (
        <div className={[styles.root, size === "sm" ? styles.sm : ""].filter(Boolean).join(" ")}>
          <div className={[styles.list, columns === 2 ? styles.columns2 : ""].filter(Boolean).join(" ")}>
            {options.map((option) => {
              const inputId = `${groupId}-${option.value}`;
              const note = option.disabled && option.disabledNote ? option.disabledNote : option.note;
              const noteId = note ? `${inputId}-note` : undefined;
              return (
                <label
                  key={option.value}
                  htmlFor={inputId}
                  className={[styles.option, option.disabled ? styles.disabled : ""].filter(Boolean).join(" ")}
                >
                  <input
                    id={inputId}
                    type="radio"
                    className={styles.input}
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    disabled={option.disabled}
                    aria-describedby={noteId}
                    aria-invalid={status === "invalid" || undefined}
                    onChange={() => onChange(option.value)}
                  />
                  <span className={styles.text}>
                    <span>{option.label}</span>
                    {note ? (
                      <span id={noteId} className={styles.note}>
                        {option.disabled && option.disabledLead ? (
                          <span className={styles.noteLead}>{option.disabledLead} — </span>
                        ) : null}
                        {note}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </Field>
  );
}
