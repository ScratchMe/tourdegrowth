// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React, { useId } from "react";
import { Field } from "./Field.js";
const Choices = ({
  legend,
  options,
  value = null,
  onChange,
  columns = 1,
  hint,
  error,
  missing,
  optional,
  size = "md",
  name: nameProp,
  id
}) => {
  const auto = useId().replace(/:/g, "");
  const name = nameProp ?? `choices-${auto}`;
  return /* @__PURE__ */ React.createElement(
    Field,
    {
      group: true,
      label: legend,
      hint,
      error,
      missing,
      optional,
      size,
      id
    },
    ({ id: groupId, status }) => /* @__PURE__ */ React.createElement("div", { className: `Choices_root ${size === "sm" ? "Choices_sm" : "Choices_md"}` }, /* @__PURE__ */ React.createElement("div", { className: `Choices_list ${columns === 2 ? "Choices_columns2" : ""}` }, options.map((o) => {
      const noteId = o.note || o.disabledNote ? `${groupId}-${o.value}-note` : void 0;
      return /* @__PURE__ */ React.createElement(
        "label",
        {
          key: o.value,
          className: `Choices_option ${o.disabled ? "Choices_disabled" : ""}`
        },
        /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "radio",
            className: "Choices_input",
            name,
            value: o.value,
            checked: value === o.value,
            disabled: o.disabled,
            "aria-describedby": noteId,
            "aria-invalid": status === "invalid" || void 0,
            onChange: () => onChange(o.value)
          }
        ),
        /* @__PURE__ */ React.createElement("span", { className: "Choices_text" }, /* @__PURE__ */ React.createElement("span", null, o.label), o.disabled && o.disabledNote ? /* @__PURE__ */ React.createElement("span", { id: noteId, className: "Choices_note" }, o.disabledLead ? /* @__PURE__ */ React.createElement("span", { className: "Choices_noteLead" }, o.disabledLead, " \u2014 ") : null, o.disabledNote) : o.note ? /* @__PURE__ */ React.createElement("span", { id: noteId, className: "Choices_note" }, o.note) : null)
      );
    })))
  );
};
export {
  Choices
};
