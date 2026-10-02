// Transcribed for the board: the synced component as returned in brief 04
// (components/core/<Name>/<Name>.jsx), JSX turned into React.createElement
// by esbuild --jsx=transform, imports pointed at this folder. Not ported.
import React, { useId } from "react";
const cx = (...c) => c.filter(Boolean).join(" ");
const fieldStatus = ({ error, missing }) => error ? "invalid" : missing ? "missing" : void 0;
const boxStatusClass = (status, disabled) => cx(
  status === "invalid" && "Field_boxInvalid",
  status === "missing" && "Field_boxMissing",
  disabled && "Field_boxDisabled"
);
const shouldShowCount = (count, max, reveal = 0.8) => max != null && count >= Math.ceil(max * reveal);
const Field = ({
  label,
  hint,
  error,
  missing,
  optional,
  counter,
  size = "md",
  fit = "fill",
  group = false,
  labelId: labelIdProp,
  id: idProp,
  className,
  children
}) => {
  const auto = useId().replace(/:/g, "");
  const id = idProp ?? `field-${auto}`;
  const labelId = labelIdProp ?? `${id}-label`;
  const hintId = hint ? `${id}-hint` : void 0;
  const status = fieldStatus({ error, missing });
  const message = error || missing;
  const messageId = message ? `${id}-message` : void 0;
  const counterId = counter ? `${id}-count` : void 0;
  const describedBy = [messageId, hintId, counterId].filter(Boolean).join(" ") || void 0;
  const control = typeof children === "function" ? children({ id, labelId, describedBy, status, invalid: status === "invalid" }) : children;
  const labelContent = /* @__PURE__ */ React.createElement(React.Fragment, null, label, optional ? /* @__PURE__ */ React.createElement("span", { className: "Field_optional" }, optional) : null);
  const counterEl = counter ? /* @__PURE__ */ React.createElement(
    "span",
    {
      id: counterId,
      className: cx("Field_counter", counter.over && "Field_counterOver"),
      "aria-label": counter.label
    },
    counter.count,
    "/",
    counter.max
  ) : null;
  const after = /* @__PURE__ */ React.createElement("div", { className: "Field_after" }, message ? /* @__PURE__ */ React.createElement(
    "p",
    {
      id: messageId,
      className: cx(
        "Field_message",
        status === "invalid" ? "Field_messageInvalid" : "Field_messageMissing"
      )
    },
    message
  ) : null, hint ? /* @__PURE__ */ React.createElement("p", { id: hintId, className: "Field_hint" }, hint) : null);
  const frame = cx(
    "Field_field",
    size === "sm" ? "Field_sm" : "Field_md",
    fit === "content" && "Field_content",
    className
  );
  if (group) {
    return /* @__PURE__ */ React.createElement("fieldset", { className: cx(frame, "Field_fieldset"), "aria-describedby": describedBy }, /* @__PURE__ */ React.createElement("legend", { className: "Field_legend" }, /* @__PURE__ */ React.createElement("span", { className: "Field_labelRow" }, /* @__PURE__ */ React.createElement("span", { id: labelId, className: "Field_label" }, labelContent), counterEl)), /* @__PURE__ */ React.createElement("div", { className: "Field_groupBody" }, control, after));
  }
  return /* @__PURE__ */ React.createElement("div", { className: frame }, /* @__PURE__ */ React.createElement("div", { className: "Field_labelRow" }, /* @__PURE__ */ React.createElement("label", { id: labelId, htmlFor: id, className: "Field_label" }, labelContent), counterEl), control, after);
};
export {
  Field,
  boxStatusClass,
  fieldStatus,
  shouldShowCount
};
