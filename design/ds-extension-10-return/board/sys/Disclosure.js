// Board stand-in for the synced Disclosure (components/core/Disclosure), WITH
// the delta proposed in components/core/Disclosure/Disclosure.delta.md:
// `defaultOpen`, and `open` + `onOpenChange` for a disclosure another control
// opens (the trap's "Write it in your definition"). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const Disclosure = ({ summary, children, size = "md", rule = true, className, open, defaultOpen, onOpenChange, id, ...rest }) =>
  h("details", {
    className: cx("Disclosure_wrap", `Disclosure_${size}`, rule && "Disclosure_ruled", className),
    open: open ?? defaultOpen ?? false,
    id,
    onToggle: onOpenChange ? (e) => onOpenChange(e.currentTarget.open) : undefined,
    ...rest,
  },
    h("summary", { className: "Disclosure_summary" },
      h("span", { className: "Disclosure_summaryText" }, summary),
      h("span", { className: "Disclosure_marker", "aria-hidden": "true" })),
    h("div", { className: "Disclosure_content" }, children));
