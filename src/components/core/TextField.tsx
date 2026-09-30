"use client";

import type { FocusEventHandler, HTMLAttributes, ReactNode } from "react";
import { shouldShowCount } from "@/lib/forms/field";
import { Field } from "./Field";
import { boxStatusClasses, fieldBox } from "./field-parts";

export interface TextFieldProps {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  missing?: ReactNode;
  /** The localized word for "optional". */
  optional?: string;
  /**
   * A SOFT limit: typing is never blocked (a hard `maxlength` silently cut a
   * pasted definition mid-word). The count shows in the label row from 80% of
   * it and turns red past it, with a 3px red edge; the save refuses and says
   * why.
   */
  maxLength?: number;
  /** The count in words, localized: (count, max) => "52 of 60 characters". */
  countLabel?: (count: number, max: number) => string;
  /** An example ("Northwind"), never the label again: it goes the moment they type. */
  placeholder?: string;
  disabled?: boolean;
  /** Why it is disabled, shown in place of the hint. A disabled field never hides its reason. */
  disabledReason?: ReactNode;
  size?: "sm" | "md";
  fit?: "fill" | "content";
  id?: string;
  name?: string;
  type?: "text" | "email" | "url" | "search" | "tel";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  spellCheck?: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

/**
 * One line of text — design system extension 04. TextArea's family, one line
 * tall: the same fill, edge, 16px value and soft limit, with the field's
 * smaller radius so a field and a button side by side no longer read as two
 * buttons. Not for a number (NumberField), a closed list (Select), a date
 * (DateField) or more than a sentence (TextArea).
 */
export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  missing,
  optional,
  maxLength,
  countLabel,
  placeholder,
  disabled = false,
  disabledReason,
  size = "md",
  fit = "fill",
  id,
  name,
  type = "text",
  inputMode,
  autoComplete = "off",
  spellCheck,
  onBlur,
}: TextFieldProps) {
  const count = value.length;
  const over = maxLength !== undefined && count > maxLength;
  const counter =
    maxLength !== undefined && shouldShowCount(count, maxLength)
      ? { count, max: maxLength, over, label: countLabel?.(count, maxLength) }
      : undefined;

  return (
    <Field
      label={label}
      hint={disabled && disabledReason ? disabledReason : hint}
      error={error}
      missing={missing}
      optional={optional}
      counter={counter}
      size={size}
      fit={fit}
      id={id}
    >
      {({ id: controlId, describedBy, status }) => (
        <div className={[fieldBox.box, boxStatusClasses(over ? "invalid" : status, disabled)].filter(Boolean).join(" ")}>
          <input
            id={controlId}
            name={name}
            type={type}
            className={fieldBox.control}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            inputMode={inputMode}
            autoComplete={autoComplete}
            spellCheck={spellCheck}
            aria-invalid={status === "invalid" || over || undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
          />
        </div>
      )}
    </Field>
  );
}
