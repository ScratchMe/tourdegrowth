// EngineProgress — design system extension 07. What remains, first; then one
// mark per number, grouped by stage.
// Plain React, no JSX.
import React from "react";

const h = React.createElement;

const STATUSES = ["found", "est", "asked", "cant", "todo"];

/**
 * Progress told honestly (Q13): the sentence leads with what REMAINS ("4 to
 * go"), never "done" while a number has no answer; the counts follow. The
 * marks are one per number, in funnel order, a gap between stages — the
 * board's map in one line. Five kinds, drawn without colour:
 *
 *   found  ● ink            est   ◍ hatched (the peloton's range)
 *   asked  ◌ dashed ring    cant  ⊘ struck ring          todo  ○ thin ring
 *
 * `size="sm"` is the number screen's header: the sentence only, no marks.
 */
export const EngineProgress = ({ remaining, counts, groups = [], legend, legendLabel, size = "md", label }) =>
  h("div", { className: `EngineProgress_root EngineProgress_${size}` },
    h("p", { className: "EngineProgress_text" },
      h("strong", { className: "EngineProgress_remaining" }, remaining),
      counts ? h("span", { className: "EngineProgress_counts" }, counts) : null),
    size === "md" && groups.length
      ? h("ol", { className: "EngineProgress_groups", "aria-label": label },
          groups.map((g) =>
            h("li", { key: g.id, className: "EngineProgress_group", "aria-label": g.label },
              g.marks.map((m, i) =>
                h("span", { key: i, className: `EngineProgress_mark EngineProgress_${STATUSES.includes(m) ? m : "todo"}`, "aria-hidden": "true" })))))
      : null,
    legend
      ? h("ul", { className: "EngineProgress_legend", "aria-label": legendLabel },
          legend.map((l) =>
            h("li", { key: l.status },
              h("span", { className: `EngineProgress_mark EngineProgress_${l.status}`, "aria-hidden": "true" }),
              l.label)))
      : null);
