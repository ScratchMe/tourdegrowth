// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React, { useLayoutEffect, useRef } from "react";
import { Field, boxStatusClass } from "./Field.js";
const SEPARATORS = {
  // French groups with a non-breaking space (the engine's choice, 2026-09-26)
  // and reads a normal space, a narrow no-break space or a dot as one too.
  fr: { group: "\xA0", decimal: ",", strip: /[\s  .]/g },
  en: { group: ",", decimal: ".", strip: /[\s  ,]/g }
};
const groupAsTyped = (text, locale) => {
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
const NumberField = ({
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
  onBlur
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
  return /* @__PURE__ */ React.createElement(
    Field,
    {
      label,
      hint: disabled && disabledReason ? disabledReason : hint,
      error,
      missing,
      optional,
      size,
      fit,
      id
    },
    ({ id: controlId, describedBy, status }) => {
      const unitId = unitName ? `${controlId}-unit` : void 0;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          className: `Field_box ${boxStatusClass(status, disabled)}`,
          style: digits ? { "--field-digits": digits } : void 0
        },
        prefix ? /* @__PURE__ */ React.createElement("span", { className: "Field_affix", "aria-hidden": "true" }, prefix) : null,
        /* @__PURE__ */ React.createElement(
          "input",
          {
            ref: inputRef,
            id: controlId,
            name,
            type: "text",
            inputMode,
            autoComplete: "off",
            className: "Field_control NumberField_control",
            value,
            placeholder,
            disabled,
            "aria-invalid": status === "invalid" || void 0,
            "aria-describedby": [unitId, describedBy].filter(Boolean).join(" ") || void 0,
            onChange: handleChange,
            onBlur
          }
        ),
        suffix ? /* @__PURE__ */ React.createElement("span", { className: "Field_affix", "aria-hidden": "true" }, suffix) : null,
        unitName ? /* @__PURE__ */ React.createElement("span", { id: unitId, className: "tdg-visually-hidden" }, unitName) : null
      );
    }
  );
};
export {
  NumberField,
  groupAsTyped
};
