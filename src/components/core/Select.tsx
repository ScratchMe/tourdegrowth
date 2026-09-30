"use client";

import type { FocusEventHandler, ReactNode } from "react";
import { Field } from "./Field";
import { selectClasses } from "./field-parts";

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup<V extends string = string> {
  /** The group's heading, an `<optgroup>` label: read by screen readers, never chosen. */
  label: string;
  options: readonly SelectOption<V>[];
}

export interface SelectProps<V extends string = string> {
  label: ReactNode;
  /** `""` is "not chosen yet", and only with a `placeholder`. */
  value: V | "";
  onChange: (value: V | "") => void;
  /** Past three values: two or three are a Segmented, a handful to compare are Choices. */
  options: readonly (SelectOption<V> | SelectOptionGroup<V>)[];
  /**
   * Adds an empty first option ("Choose…" / « Choisir… ») that stays choosable,
   * so « not chosen yet » is a value the person can go back to: a source nobody
   * picked is not the first tool in the list. Without it, the caller passes a
   * real choice — the browser never pre-selects one for the person.
   */
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  missing?: ReactNode;
  optional?: string;
  disabled?: boolean;
  disabledReason?: ReactNode;
  size?: "sm" | "md";
  /** `content` for a short closed value (a currency); full width otherwise. */
  fit?: "fill" | "content";
  id?: string;
  name?: string;
  onBlur?: FocusEventHandler<HTMLSelectElement>;
}

const isGroup = <V extends string>(item: SelectOption<V> | SelectOptionGroup<V>): item is SelectOptionGroup<V> =>
  "options" in item;

/**
 * A closed list past three values — design system extension 04. Always the
 * NATIVE `<select>`: keyboard, type-to-find, screen readers and the phone's
 * own picker work without a line of ours, and on a phone the system's list
 * is better than anything we would draw. Never a custom dropdown, never a
 * free-text field for a closed list.
 */
export function Select<V extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  missing,
  optional,
  disabled = false,
  disabledReason,
  size = "md",
  fit = "fill",
  id,
  name,
  onBlur,
}: SelectProps<V>) {
  return (
    <Field
      label={label}
      hint={disabled && disabledReason ? disabledReason : hint}
      error={error}
      missing={missing}
      optional={optional}
      size={size}
      fit={fit}
      id={id}
    >
      {({ id: controlId, describedBy, status }) => (
        <select
          id={controlId}
          name={name}
          className={selectClasses({ status, empty: value === "", size, fit })}
          value={value}
          disabled={disabled}
          aria-invalid={status === "invalid" || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value as V | "")}
          onBlur={onBlur}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((item) =>
            isGroup(item) ? (
              <optgroup key={item.label} label={item.label}>
                {item.options.map(renderOption)}
              </optgroup>
            ) : (
              renderOption(item)
            ),
          )}
        </select>
      )}
    </Field>
  );
}

function renderOption<V extends string>(option: SelectOption<V>) {
  return (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  );
}
