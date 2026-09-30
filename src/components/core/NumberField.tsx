"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type FocusEventHandler, type ReactNode } from "react";
import { displayNumber, parseTypedNumber, regroupTypedNumber } from "@/lib/forms/number";
import { Field } from "./Field";
import { boxStatusClasses, fieldBox } from "./field-parts";
import styles from "./NumberField.module.css";

export interface NumberFieldProps {
  label: ReactNode;
  /** `null` is an empty box, never 0: « 0 referred sign-ups » is a finding, not a missing entry. */
  value: number | null;
  /** The number the box now holds, or `null` when it is empty or cannot be read. */
  onChange: (value: number | null) => void;
  /** Reads and groups as the reader writes: "26,000" (en), "26 000" with a no-break space (fr). */
  locale: "en" | "fr";
  /** A count of people or things: a decimal is not a readable value then. */
  integer?: boolean;
  /** A sign that comes first, inside the box: "€", "£", "$" in English. The figure starts against it. */
  prefix?: string;
  /** A unit that follows, inside the box: "€" in French, "%" (" %" with its no-break space in French). */
  suffix?: string;
  /** The unit as a word for screen readers ("euros", "percent"); the visible sign is hidden from them. */
  unitName?: string;
  /** The magnitude expected, in characters, separators included (9 fits "2,000,000"). Sizes the box when `fit="content"`. */
  digits?: number;
  /**
   * What to say when what was typed cannot be read — or is not whole, with
   * `integer`. Shown when the person leaves the box, never on each keystroke
   * (a screen reader would be interrupted at every key of "12o"), and the
   * text stays on screen as typed.
   */
  parseError: ReactNode;
  hint?: ReactNode;
  /** A rule the caller checks (a range): one treatment with the parse error, the words tell them apart. */
  error?: ReactNode;
  missing?: ReactNode;
  optional?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: ReactNode;
  size?: "sm" | "md";
  /** `content` (default) sizes the box to `digits`; `fill` fills the column. */
  fit?: "fill" | "content";
  id?: string;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

/**
 * A count or an amount, typed the way people write numbers — design system
 * extension 04.
 *
 * A text input with `inputMode`, never `type="number"`, which reads "26 000"
 * as empty in most browsers and changes the value when a trackpad scrolls
 * over it. Digits are grouped AS they are typed, the caret staying between
 * the same digits; what cannot be read stays on screen exactly as typed. The
 * reading and the grouping are the engine's, in `lib/forms/number.ts`.
 *
 * The unit sits inside the box, where the caller's locale and currency put it
 * (€26,000 / 26 000 €, 42 % / 42%): the component does not decide. A count out
 * of a count is always a FieldRow, never two of these in a row of your own.
 */
export function NumberField({
  label,
  value,
  onChange,
  locale,
  integer = false,
  prefix,
  suffix,
  unitName,
  digits,
  parseError,
  hint,
  error,
  missing,
  optional,
  placeholder,
  disabled = false,
  disabledReason,
  size = "md",
  fit = "content",
  id,
  name,
  onBlur,
}: NumberFieldProps) {
  // The typed text is kept alongside the value it produced: while they agree,
  // the person's own spelling stays on screen; when `value` changes from
  // outside (a reset, an import), the box follows it instead.
  const [draft, setDraft] = useState<{ raw: string; value: number | null }>(() => ({
    raw: displayNumber(value, locale),
    value,
  }));
  const [parseShown, setParseShown] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  // Where the caret goes after a regroup, set by onChange and spent below.
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const caret = pendingCaret.current;
    pendingCaret.current = null;
    const el = input.current;
    // Only while the person is in the box: never steal a focus that moved on.
    if (caret === null || !el || el.ownerDocument.activeElement !== el) return;
    el.setSelectionRange(caret, caret);
  });

  const raw = draft.value === value ? draft.raw : displayNumber(value, locale);
  const unreadable = isUnreadable(raw, locale, integer);
  const shownError = parseShown && unreadable ? parseError : error;

  return (
    <Field
      label={label}
      hint={disabled && disabledReason ? disabledReason : hint}
      error={shownError}
      missing={missing}
      optional={optional}
      size={size}
      fit={fit}
      id={id}
    >
      {({ id: controlId, describedBy, status }) => {
        const unitId = unitName ? `${controlId}-unit` : undefined;
        const sized = fit === "content" ? (prefix || suffix ? styles.sizedAffixed : styles.sized) : "";
        const style = digits ? ({ "--field-digits": digits } as CSSProperties) : undefined;
        return (
          <div className={[fieldBox.box, boxStatusClasses(status, disabled)].filter(Boolean).join(" ")} style={style}>
            {prefix ? (
              <span className={fieldBox.affix} aria-hidden="true">
                {prefix}
              </span>
            ) : null}
            <input
              ref={input}
              id={controlId}
              name={name}
              type="text"
              inputMode={integer ? "numeric" : "decimal"}
              autoComplete="off"
              className={[fieldBox.control, styles.control, styles.figure, prefix ? styles.afterPrefix : "", sized]
                .filter(Boolean)
                .join(" ")}
              value={raw}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={status === "invalid" || undefined}
              aria-describedby={[unitId, describedBy].filter(Boolean).join(" ") || undefined}
              onChange={(event) => {
                const el = event.target;
                const inputType = (event.nativeEvent as InputEvent).inputType;
                const { text, caret } = regroupTypedNumber(
                  el.value,
                  el.selectionStart,
                  locale,
                  inputType === "deleteContentForward" ? "forward" : "backward",
                );
                if (text !== el.value) pendingCaret.current = caret;
                const next = parseTypedNumber(text, locale);
                const usable = next !== null && (!integer || Number.isInteger(next)) ? next : null;
                // Once the text reads again, the message goes; it only comes
                // back when the person leaves a box that still cannot be read.
                if (!isUnreadable(text, locale, integer)) setParseShown(false);
                setDraft({ raw: text, value: usable });
                onChange(usable);
              }}
              onBlur={(event) => {
                setParseShown(isUnreadable(event.target.value, locale, integer));
                onBlur?.(event);
              }}
            />
            {suffix ? (
              <span className={fieldBox.affix} aria-hidden="true">
                {suffix}
              </span>
            ) : null}
            {unitName ? (
              <span id={unitId} className="tdg-visually-hidden">
                {unitName}
              </span>
            ) : null}
          </div>
        );
      }}
    </Field>
  );
}

/** Something was typed, and it is not a usable number: unreadable, or not whole where it must be. */
function isUnreadable(raw: string, locale: "en" | "fr", integer: boolean): boolean {
  if (raw.trim() === "") return false;
  const parsed = parseTypedNumber(raw, locale);
  return parsed === null || (integer && !Number.isInteger(parsed));
}
