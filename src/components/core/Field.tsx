"use client";

import { useId, type ReactNode } from "react";
import { describedByIds, fieldStatus, type FieldStatus } from "@/lib/forms/field";
import styles from "./Field.module.css";

/** What a Field hands the control it wraps. */
export interface FieldControlProps {
  /** The control's id: the `<label for>` already points at it. */
  id: string;
  /** The label's id, for a control named by `aria-labelledby` (Segmented). */
  labelId: string;
  /** Message, hint and count ids, in reading order. Put it on the control. */
  describedBy: string | undefined;
  status: FieldStatus;
  invalid: boolean;
}

export interface FieldCounter {
  count: number;
  max: number;
  over?: boolean;
  /** The count in words, localized: "52 of 60 characters". */
  label?: string;
}

export interface FieldProps {
  /** Visible label, a sentence in sentence case. Required: an accessible name alone is not enough in a form. */
  label: ReactNode;
  /** A quiet line under the control: what to type, where the value goes. */
  hint?: ReactNode;
  /** Invalid: what was typed cannot be saved as it is. The edge turns 3px red, the message sits behind a red rule. Wins over `missing`. */
  error?: ReactNode;
  /** Still to fill in, but the form saves anyway (the audit's incomplete line). Dashed edge and message, never red. */
  missing?: ReactNode;
  /** The localized word for "optional" ("optional" / « facultatif »). Its presence marks the field optional; a required field carries no mark. */
  optional?: string;
  /** The soft-limit count in the label row. TextField fills it in; pass it yourself only around a control of your own. */
  counter?: FieldCounter;
  /** `md` (default): one question, 48px control, the legend is the question. `sm`: a sheet of fields, 44px control. Never both in one form. */
  size?: "sm" | "md";
  /** `fill` (default) fills the column; `content` sizes the box to what it holds (a number, a currency). */
  fit?: "fill" | "content";
  /** A fieldset whose legend is the label: radios, checkboxes, a date in parts, a Segmented. */
  group?: boolean;
  id?: string;
  labelId?: string;
  className?: string;
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
}

/**
 * The visible label, the hint and the message around one control, or the
 * legend around a group of them (`group`) — design system extension 04.
 *
 * Every control in a form gets its VISIBLE label from a Field: an accessible
 * name alone is anonymous to half the people using it (the audit learned it
 * three times). TextField, NumberField, Select, DateField and Choices render
 * their own; reach for Field directly only to wrap something else — a
 * TextArea, a Segmented, a list of Checkboxes — with a render prop:
 *
 *   <Field label="Your definition" optional="optional">
 *     {(p) => <TextArea id={p.id} aria-describedby={p.describedBy} … />}
 *   </Field>
 *
 * Never a placeholder as the label, never a red label, and never an error
 * while the person is still typing: a parse error on blur, a missing field on
 * save.
 */
export function Field({
  label,
  hint,
  error,
  missing,
  optional,
  counter,
  size = "md",
  fit = "fill",
  group = false,
  labelId: labelIdProp,
  id: idProp,
  className,
  children,
}: FieldProps) {
  const auto = useId().replace(/:/g, "");
  const id = idProp ?? `field-${auto}`;
  const labelId = labelIdProp ?? `${id}-label`;
  const status = fieldStatus({ error, missing });
  const message = status === "invalid" ? error : status === "missing" ? missing : null;
  const hintId = hint ? `${id}-hint` : undefined;
  const messageId = message ? `${id}-message` : undefined;
  const counterId = counter ? `${id}-count` : undefined;
  // The message is read first: it is the reason the person is back here.
  const describedBy = describedByIds(messageId, hintId, counterId);

  const control =
    typeof children === "function" ? children({ id, labelId, describedBy, status, invalid: status === "invalid" }) : children;

  const labelContent = (
    <>
      {label}
      {optional ? <span className={styles.optional}>{optional}</span> : null}
    </>
  );

  const counterEl = counter ? (
    <span
      id={counterId}
      className={[styles.counter, counter.over ? styles.counterOver : ""].filter(Boolean).join(" ")}
      aria-label={counter.label}
    >
      {counter.count}/{counter.max}
    </span>
  ) : null;

  const after = (
    <div className={styles.after}>
      {message ? (
        <p
          id={messageId}
          className={[styles.message, status === "invalid" ? styles.messageInvalid : styles.messageMissing].join(" ")}
        >
          {message}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );

  const frame = [styles.field, size === "sm" ? styles.sm : styles.md, fit === "content" ? styles.content : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  if (group) {
    return (
      <fieldset className={`${frame} ${styles.fieldset}`} aria-describedby={describedBy}>
        <legend className={styles.legend}>
          <span className={styles.labelRow}>
            <span id={labelId} className={styles.label}>
              {labelContent}
            </span>
            {counterEl}
          </span>
        </legend>
        <div className={styles.groupBody}>
          {control}
          {after}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={frame}>
      <div className={styles.labelRow}>
        <label id={labelId} htmlFor={id} className={styles.label}>
          {labelContent}
        </label>
        {counterEl}
      </div>
      {control}
      {after}
    </div>
  );
}
