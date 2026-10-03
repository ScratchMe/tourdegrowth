// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React from "react";
import { Field, boxStatusClass } from "./Field.js";
const isGroup = (item) => Array.isArray(item.options);
const renderOption = (o) => /* @__PURE__ */ React.createElement("option", { key: o.value, value: o.value, disabled: o.disabled }, o.label);
const Select = ({
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
  onBlur
}) => /* @__PURE__ */ React.createElement(
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
  ({ id: controlId, describedBy, status }) => /* @__PURE__ */ React.createElement(
    "select",
    {
      id: controlId,
      name,
      className: [
        "Select_control",
        boxStatusClass(status, false),
        value === "" && "Select_empty"
      ].filter(Boolean).join(" "),
      value,
      disabled,
      "aria-invalid": status === "invalid" || void 0,
      "aria-describedby": describedBy,
      onChange: (e) => onChange(e.target.value),
      onBlur
    },
    placeholder != null ? /* @__PURE__ */ React.createElement("option", { value: "" }, placeholder) : null,
    options.map(
      (item) => isGroup(item) ? /* @__PURE__ */ React.createElement("optgroup", { key: item.label, label: item.label }, item.options.map(renderOption)) : renderOption(item)
    )
  )
);
export {
  Select
};
