import React, { useLayoutEffect, useRef } from "react";
import { Field, boxStatusClass } from "../Field/Field.jsx";

const SEPARATORS = {
  // French groups with a non-breaking space (the engine's choice, 2026-09-26)
  // and reads a normal space, a narrow no-break space or a dot as one too.
  fr: { group: " ", decimal: ",", strip: /[\s  .]/g },
  en: { group: ",", decimal: ".", strip: /[\s  ,]/g },
};

/**
 * Regroups the digits of what was typed, as it is typed ("2000000" →
 * "2 000 000" / "2,000,000"). Anything it cannot read comes back exactly as
 * typed — "12o" stays "12o" — so nothing the person typed is thrown away.
 * The engine's own parser stays the source of truth for the value; this only
 * decides what the box shows.
 */
export const groupAsTyped = (text, locale) => {
  const sep = SEPARATORS[locale] ?? SEPARATORS.en;
  const bare = text.replace(sep.strip, "");
  const match = bare.match(new RegExp(`^(-?)(\\d*)(\\${sep.decimal}\\d*)?$`));
  if (!match || bare === "" || bare === "-") return text;
  const [, sign, int, frac = ""] = match;
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep.group);
  return `${sign}${grouped}${frac}`;
};

const digitsAfter = (text, caret) => text.slice(caret).replace(/\D/g, "").length;

const caretForDigitsAfter = (text, n) => {
  let seen = 0;
  for (let i = text.length; i > 0; i -= 1) {
    if (seen === n) return i;
    if (/\d/.test(text[i - 1])) seen += 1;
  }
  return seen === n ? 0 : text.length;
};

/**
 * NumberField — a count or an amount, typed the way people write numbers.
 *
 * A text input with `inputMode`, never `type="number"` (which empties
 * "26 000" in most browsers). An empty box is `null` for the caller, never 0.
 * The unit sits inside the box, before or after as the caller's locale and
 * currency say (Q7): "26 000 €", "€26,000", "42 %".
 */
export const NumberField = ({
  label,
  value,
  onChange,
  locale = "en",
  group = true,
  prefix,
  suffix,
  unitName,
  digits,
  inputMode = "decimal",
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
}) => {
  const inputRef = useRef(null);
  const pendingCaret = useRef(null);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el && pendingCaret.current != null && document.activeElement === el) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
    }
    pendingCaret.current = null;
  }, [value]);

  const handleChange = (event) => {
    const typed = event.target.value;
    if (!group) {
      onChange(typed);
      return;
    }
    const after = digitsAfter(typed, event.target.selectionStart ?? typed.length);
    const shown = groupAsTyped(typed, locale);
    pendingCaret.current = caretForDigitsAfter(shown, after);
    onChange(shown);
  };

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
      {({ id: controlId, describedBy, status }) => {
        const unitId = unitName ? `${controlId}-unit` : undefined;
        return (
          <div
            className={`Field_box ${boxStatusClass(status, disabled)}`}
            style={digits ? { "--field-digits": digits } : undefined}
          >
            {prefix ? (
              <span className="Field_affix" aria-hidden="true">
                {prefix}
              </span>
            ) : null}
            <input
              ref={inputRef}
              id={controlId}
              name={name}
              type="text"
              inputMode={inputMode}
              autoComplete="off"
              className="Field_control NumberField_control"
              value={value}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={status === "invalid" || undefined}
              aria-describedby={[unitId, describedBy].filter(Boolean).join(" ") || undefined}
              onChange={handleChange}
              onBlur={onBlur}
            />
            {suffix ? (
              <span className="Field_affix" aria-hidden="true">
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
};
