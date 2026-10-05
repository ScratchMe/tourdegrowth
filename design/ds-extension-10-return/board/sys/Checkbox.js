// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React, { useId } from "react";
const cx = (...c) => c.filter(Boolean).join(" ");
const Checkbox = ({
  label,
  checked,
  onChange,
  hint,
  invalid = false,
  disabled = false,
  disabledReason,
  size = "sm",
  id: idProp,
  name,
  describedBy
}) => {
  const auto = useId().replace(/:/g, "");
  const id = idProp ?? `check-${auto}`;
  const note = disabled && disabledReason ? disabledReason : hint;
  const noteId = note ? `${id}-hint` : void 0;
  return /* @__PURE__ */ React.createElement(
    "label",
    {
      htmlFor: id,
      className: cx(
        "Checkbox_row",
        size === "md" && "Checkbox_md",
        invalid && "Checkbox_invalid",
        disabled && "Checkbox_disabled"
      )
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        id,
        name,
        type: "checkbox",
        className: "Checkbox_input",
        checked,
        disabled,
        "aria-invalid": invalid || void 0,
        "aria-describedby": [noteId, describedBy].filter(Boolean).join(" ") || void 0,
        onChange: (e) => onChange(e.target.checked)
      }
    ),
    /* @__PURE__ */ React.createElement("span", { className: "Checkbox_text" }, /* @__PURE__ */ React.createElement("span", null, label), note ? /* @__PURE__ */ React.createElement("span", { id: noteId, className: "Checkbox_hint" }, note) : null)
  );
};
export {
  Checkbox
};
