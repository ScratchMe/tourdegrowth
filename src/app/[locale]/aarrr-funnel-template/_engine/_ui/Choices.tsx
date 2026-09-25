import type { ReactNode } from "react";
import styles from "./ui.module.css";

export interface Choice<Id extends string> {
  id: Id;
  label: string;
  /** Shown under the label, for a disabled option that says why ("coming soon"). */
  note?: string;
  disabled?: boolean;
}

/**
 * A question with a handful of closed answers, as native radios inside a
 * `<fieldset>` whose `<legend>` is the VISIBLE question — the one control of
 * the engine that names itself without a `Field`.
 *
 * Radios rather than `Segmented` because it takes more than three options
 * (the status question has four, triage six) and because arrows move between
 * them for free, which is what a keyboard user expects of "pick one".
 * Nothing is pre-selected unless the caller passes a value: the status of a
 * number nobody has looked at is "to fill in", never "found" (spec §4.1).
 */
export function Choices<Id extends string>({
  name,
  legend,
  hint,
  value,
  options,
  onChange,
  columns = 1,
  children,
}: {
  name: string;
  legend: string;
  hint?: string;
  value: Id | null;
  options: readonly Choice<Id>[];
  onChange: (id: Id) => void;
  /** 2 for the status question's 2×2 grid (spec §7 E3); it collapses to one column on a phone. */
  columns?: 1 | 2;
  children?: ReactNode;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      <div className={[styles.choices, columns === 2 ? styles.choicesTwo : ""].filter(Boolean).join(" ")}>
        {options.map((option) => {
          const id = `${name}-${option.id}`;
          return (
            <label
              key={option.id}
              htmlFor={id}
              className={[styles.choice, option.disabled ? styles.choiceDisabled : ""].filter(Boolean).join(" ")}
            >
              <input
                id={id}
                className={styles.radio}
                type="radio"
                name={name}
                value={option.id}
                checked={value === option.id}
                disabled={option.disabled}
                onChange={() => onChange(option.id)}
              />
              <span className={styles.choiceText}>
                <span>{option.label}</span>
                {option.note ? <span className={styles.choiceNote}>{option.note}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {children}
    </fieldset>
  );
}
