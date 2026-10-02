// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React from "react";
import { Field, boxStatusClass } from "./Field.js";
import { Select } from "./Select.js";
const DateField = (props) => props.precision === "month" ? /* @__PURE__ */ React.createElement(MonthField, { ...props }) : /* @__PURE__ */ React.createElement(DayField, { ...props });
const MonthField = ({ months, ...rest }) => /* @__PURE__ */ React.createElement(Select, { ...rest, options: months });
const DayField = ({
  label,
  value,
  onChange,
  monthNames,
  years,
  partLabels,
  partPlaceholder = "\u2013",
  hint,
  error,
  missing,
  optional,
  disabled = false,
  size = "md",
  id
}) => {
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const set = (part) => (e) => onChange({ ...value, [part]: e.target.value });
  return /* @__PURE__ */ React.createElement(
    Field,
    {
      group: true,
      label,
      hint,
      error,
      missing,
      optional,
      size,
      fit: "content",
      id
    },
    ({ id: groupId, status }) => {
      const part = (key, options, chars) => /* @__PURE__ */ React.createElement("div", { className: "DateField_part" }, /* @__PURE__ */ React.createElement("label", { className: "DateField_partLabel", htmlFor: `${groupId}-${key}` }, partLabels[key]), /* @__PURE__ */ React.createElement(
        "select",
        {
          id: `${groupId}-${key}`,
          className: [
            "Select_control",
            boxStatusClass(value[key] === "" ? status : void 0, false),
            value[key] === "" && "Select_empty"
          ].filter(Boolean).join(" "),
          style: { width: `calc(${chars}ch + 3.5em)` },
          value: value[key],
          disabled,
          "aria-invalid": status === "invalid" && value[key] === "" || void 0,
          onChange: set(key)
        },
        /* @__PURE__ */ React.createElement("option", { value: "" }, partPlaceholder),
        options.map((o) => /* @__PURE__ */ React.createElement("option", { key: o.value, value: o.value }, o.label))
      ));
      return /* @__PURE__ */ React.createElement("div", { className: "DateField_parts" }, part("day", days.map((d) => ({ value: d, label: d })), 2), part(
        "month",
        monthNames.map((m, i) => ({ value: String(i + 1).padStart(2, "0"), label: m })),
        Math.max(...monthNames.map((m) => m.length))
      ), part("year", years.map((y) => ({ value: String(y), label: String(y) })), 4));
    }
  );
};
export {
  DateField
};
