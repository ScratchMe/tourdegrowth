// Board stand-in for the synced Segmented (components/core/Segmented). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const Segmented = ({ options, value, onChange, label, labelledBy, size = "md", className }) =>
  h("div", { className: cx("Segmented_group", `Segmented_${size}`, className), role: "radiogroup", "aria-label": labelledBy ? undefined : label, "aria-labelledby": labelledBy },
    h("div", { className: "Segmented_track" },
      options.map((o) =>
        h("button", {
          key: o.id,
          type: "button",
          role: "radio",
          "aria-checked": o.id === value ? "true" : "false",
          className: cx("Segmented_option", o.id === value && "Segmented_on"),
          onClick: onChange ? () => onChange(o.id) : undefined,
        }, o.label))));
