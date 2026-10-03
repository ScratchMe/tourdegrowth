// Board stand-in for the synced Card (components/core/Card). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const Card = ({ elevation = "raised", tone = "paper", padding, className, style, children, ...rest }) =>
  h("div", {
    className: cx("Card_card", `Card_${elevation}`, `Card_${tone}`, padding == null && "Card_padDefault", className),
    style: padding == null ? style : { ...style, padding },
    ...rest,
  }, children);
