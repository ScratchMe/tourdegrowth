// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React from "react";
const TextArea = ({
  value,
  onChange,
  maxLength,
  label,
  id,
  invalid = false,
  placeholder,
  "aria-describedby": describedBy,
  rows
}) => {
  const over = value.length > maxLength;
  const counterId = id ? `${id}-count` : void 0;
  return /* @__PURE__ */ React.createElement("div", { className: "TextArea_wrap" }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      id,
      className: [
        "TextArea_field",
        over && "TextArea_fieldOverLimit",
        invalid && "TextArea_fieldInvalid"
      ].filter(Boolean).join(" "),
      value,
      rows,
      placeholder,
      "aria-label": label,
      "aria-invalid": invalid || over || void 0,
      "aria-describedby": [describedBy, counterId].filter(Boolean).join(" ") || void 0,
      onChange: (e) => onChange(e.target.value)
    }
  ), /* @__PURE__ */ React.createElement(
    "span",
    {
      id: counterId,
      className: over ? "TextArea_counter TextArea_counterOverLimit" : "TextArea_counter"
    },
    value.length,
    "/",
    maxLength
  ));
};
export {
  TextArea
};
