// Board stand-in for the synced Tag (components/core/Tag). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const Tag = ({ tone = "neutral", children, className, ...rest }) =>
  h("span", { className: cx("Tag_tag", `Tag_${tone}`, className), ...rest }, children);
