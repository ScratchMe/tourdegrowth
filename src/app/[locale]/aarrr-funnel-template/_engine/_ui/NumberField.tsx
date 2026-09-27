"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { parseTypedNumber, regroupTypedNumber } from "./number";
import styles from "./ui.module.css";

function show(value: number | null, locale: "en" | "fr"): string {
  if (value === null) return "";
  // Grouped as the reader writes it; U+00A0 rather than Intl's U+202F, the
  // same rule as the engine's formatter (§6.2).
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 6 })
    .format(value)
    .replace(/\u202F/g, "\u00A0");
}

/**
 * A number field for COUNTS and amounts (spec D6: every rate is entered as
 * counts). A text input with `inputmode`, not `type="number"`: a number
 * input rejects "26 000" outright in most browsers and silently drops what
 * it cannot parse, where this one keeps what was typed on screen and says
 * it cannot read it.
 *
 * `value` is null when the box is empty — distinct from zero, which is a
 * real value ("0 referred sign-ups" is a finding, not a missing entry).
 *
 * Thousands are grouped AS the person types (Antoine, 2026-09-26: an MRR of
 * 2 000 000 typed as "2000000" stayed a row of zeros). The pure part —
 * what the text becomes, where the caret goes — is `number.ts`, tested on
 * its own; this component only puts the caret back once React has written
 * the new text, in a layout effect so the person never sees it jump.
 */
export function NumberField({
  id,
  value,
  onChange,
  locale,
  integer = false,
  unit,
  describedBy,
  invalidMessage,
}: {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  locale: "en" | "fr";
  /** Counts are whole people; a rate or an amount may carry decimals. */
  integer?: boolean;
  /** A unit shown after the box ("%", "€", "days") — outside the field, never typed. */
  unit?: string;
  describedBy?: string;
  /** Said under the box when what was typed is not a number. */
  invalidMessage: string;
}) {
  // The typed text is kept alongside the value it produced: while they agree,
  // the person's own spelling stays on screen; when `value` changes from
  // outside (a reset, a switch of mode), the display follows it instead.
  const [draft, setDraft] = useState<{ raw: string; value: number | null }>({ raw: show(value, locale), value });
  const input = useRef<HTMLInputElement>(null);
  // Where the caret goes after a regroup, set by onChange and spent by the effect below.
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const caret = pendingCaret.current;
    pendingCaret.current = null;
    const el = input.current;
    // Only while the person is in the box: never steal a focus that moved on.
    if (caret === null || !el || el.ownerDocument.activeElement !== el) return;
    el.setSelectionRange(caret, caret);
  });
  const raw = draft.value === value ? draft.raw : show(value, locale);
  const parsed = parseTypedNumber(raw, locale);
  const invalid = raw.trim() !== "" && (parsed === null || (integer && !Number.isInteger(parsed)));
  const errorId = `${id}-parse`;

  return (
    <>
      <span className={styles.numberRow}>
        <input
          ref={input}
          id={id}
          className={styles.control}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          autoComplete="off"
          value={raw}
          aria-invalid={invalid || undefined}
          aria-describedby={[describedBy, invalid ? errorId : null].filter(Boolean).join(" ") || undefined}
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
            setDraft({ raw: text, value: usable });
            onChange(usable);
          }}
        />
        {unit ? (
          <span className={styles.unit} aria-hidden="true">
            {unit}
          </span>
        ) : null}
      </span>
      {invalid ? (
        <p className={styles.error} id={errorId}>
          {invalidMessage}
        </p>
      ) : null}
    </>
  );
}
