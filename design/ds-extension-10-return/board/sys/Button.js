// Board stand-in for the synced Button (components/core/Button): same props,
// same class names as _ds_bundle.css, nothing else. Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const Button = ({ variant = "primary", size = "md", fullWidth, className, children, href, ...rest }) => {
  const cls = cx("Button_button", `Button_${size}`, `Button_${variant}`, fullWidth && "Button_fullWidth", className);
  return href ? h("a", { className: cls, href, ...rest }, children) : h("button", { type: "button", className: cls, ...rest }, children);
};
