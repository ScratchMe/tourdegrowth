// Board stand-in for the synced MetaLabel (components/brand/MetaLabel). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const MetaLabel = ({ size = "sm", tone = "muted", uppercase = true, wide, as = "div", children, className, ...rest }) =>
  h(as, {
    className: cx("MetaLabel_label", `MetaLabel_${size}`, `MetaLabel_${tone}`, uppercase && "MetaLabel_uppercase", wide && "MetaLabel_wide", className),
    ...rest,
  }, children);
