// Board stand-in for the synced Callout (components/core/Callout). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const Callout = ({ tone, action, children, className, ...rest }) =>
  h("div", { className: cx("Callout_callout", `Callout_${tone}`, className), ...rest },
    h("div", { className: "Callout_body" }, children),
    action ? h("div", { className: "Callout_action" }, action) : null);
