"use client";

import { useState } from "react";
import { parseTypedNumber } from "./number";
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
  const raw = draft.value === value ? draft.raw : show(value, locale);
  const parsed = parseTypedNumber(raw, locale);
  const invalid = raw.trim() !== "" && (parsed === null || (integer && !Number.isInteger(parsed)));
  const errorId = `${id}-parse`;

  return (
    <>
      <span className={styles.numberRow}>
        <input
          id={id}
          className={styles.control}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          autoComplete="off"
          value={raw}
          aria-invalid={invalid || undefined}
          aria-describedby={[describedBy, invalid ? errorId : null].filter(Boolean).join(" ") || undefined}
          onChange={(event) => {
            const text = event.target.value;
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
