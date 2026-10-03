// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React from "react";
import { Field, boxStatusClass, shouldShowCount } from "./Field.js";
const TextField = ({
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
  autoComplete,
  spellCheck,
  onBlur
}) => {
  const count = value.length;
  const over = maxLength != null && count > maxLength;
  const counter = shouldShowCount(count, maxLength) ? { count, max: maxLength, over, label: countLabel?.(count, maxLength) } : void 0;
  return /* @__PURE__ */ React.createElement(
    Field,
    {
      label,
      hint: disabled && disabledReason ? disabledReason : hint,
      error,
      missing,
      optional,
      counter,
      size,
      fit,
      id
    },
    ({ id: controlId, describedBy, status }) => /* @__PURE__ */ React.createElement("div", { className: `Field_box ${boxStatusClass(over ? "invalid" : status, disabled)}` }, /* @__PURE__ */ React.createElement(
      "input",
      {
        id: controlId,
        name,
        type,
        className: "Field_control",
        value,
        placeholder,
        disabled,
        inputMode,
        autoComplete,
        spellCheck,
        "aria-invalid": status === "invalid" || over || void 0,
        "aria-describedby": describedBy,
        onChange: (e) => onChange(e.target.value),
        onBlur
      }
    ))
  );
};
export {
  TextField
};
