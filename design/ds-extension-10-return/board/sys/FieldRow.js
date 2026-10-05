// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React, { useId } from "react";
const FieldRow = ({ joiner, error, children }) => {
  const id = `row-${useId().replace(/:/g, "")}`;
  const [first, second] = React.Children.toArray(children);
  return /* @__PURE__ */ React.createElement("div", { className: "Field_row", role: "group", "aria-describedby": error ? `${id}-message` : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "Field_rowGrid" }, first, joiner ? /* @__PURE__ */ React.createElement("span", { className: "Field_joiner" }, joiner) : null, second), error ? /* @__PURE__ */ React.createElement("p", { id: `${id}-message`, className: "Field_message Field_messageInvalid Field_rowMessage" }, error) : null);
};
export {
  FieldRow
};
