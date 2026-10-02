// Board stand-in for the synced DotGrid (components/viz/DotGrid). Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const DotGrid = ({ grid, label, highlighted, medium = "screen", className }) =>
  grid.kind === "unknown"
    ? h("div", { className: cx("DotGrid_unknown", className), role: "img", "aria-label": label }, h("span", { className: "DotGrid_question", "aria-hidden": "true" }, "?"))
    : h("div", { className: cx("DotGrid_grid", `DotGrid_${medium}`, highlighted && "DotGrid_highlighted", className), role: "img", "aria-label": label },
        grid.dots.map((d, i) => h("span", { key: i, className: cx("DotGrid_dot", `DotGrid_${d}`) })));
