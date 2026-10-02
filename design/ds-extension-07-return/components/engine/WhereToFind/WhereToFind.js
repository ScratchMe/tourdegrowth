// WhereToFind — design system extension 07. Each tool and the path in it, one
// tap away, with the other numbers the same tool gives.
// Plain React, no JSX.
import React from "react";
import { Disclosure, Tag } from "tour-de-growth";

const h = React.createElement;

/**
 * Closed by default, its summary names the tools ("Where to find it · GA4 ·
 * Mixpanel or Amplitude · Product database"), so a person sees whether it
 * is worth opening without opening it. Open: tool → path, as the catalogue
 * prints them; the person's own tools (Settings) first, tagged; then "Also
 * in GA4: …", links to the other numbers that tool gives (Q8).
 *
 * The trap is NOT in here any more: it is TrapNote, above the value.
 */
export const WhereToFind = ({ label, tools, also = [], yoursLabel, open, onOpenNumber }) => {
  const ordered = [...tools].sort((a, b) => Number(Boolean(b.yours)) - Number(Boolean(a.yours)));
  const summary = h("span", { className: "WhereToFind_summary" },
    h("span", null, label),
    h("span", { className: "WhereToFind_tools" }, ordered.map((t) => t.tool).join(" · ")));
  return h(Disclosure, { summary, size: "md", rule: true, defaultOpen: open, className: "WhereToFind_root" },
    h("dl", { className: "WhereToFind_list" },
      ordered.map((t) =>
        h("div", { key: t.tool, className: "WhereToFind_entry" },
          h("dt", { className: "WhereToFind_tool" }, t.tool, t.yours ? h(Tag, { tone: "neutral" }, yoursLabel) : null),
          h("dd", { className: "WhereToFind_path" }, t.path)))),
    also.map((a) =>
      h("div", { key: a.tool, className: "WhereToFind_also" },
        h("span", { className: "WhereToFind_alsoLabel" }, a.label),
        h("ul", { className: "WhereToFind_alsoList" },
          a.items.map((it) =>
            h("li", { key: it.id },
              h("a", { href: it.href ?? `#${it.id}`, className: "WhereToFind_link", onClick: onOpenNumber ? () => onOpenNumber(it.id) : undefined }, it.label)))))));
};
