// Board stand-in for the synced GlossaryTerm (components/glossary/GlossaryTerm):
// the term, its "?" (DefinitionTrigger) and, when `openId` is this term, its
// popover. The terms are the glossary entries COPY.md proposes (board/glossary.js).
// Not ported.
import React from "react";
import { cx } from "./_cx.js";
import { GLOSSARY } from "../glossary.js";
const h = React.createElement;

export const GlossaryTerm = ({ id, locale, openId, onOpenChange, tone = "muted", closeLabel, labelTemplate, moreLabel, children }) => {
  const entry = GLOSSARY[id]?.[locale] ?? { term: String(id), definition: "" };
  const open = openId === id;
  const term = children ?? entry.term;
  return h("span", { className: cx("GlossaryTerm_anchor", open && "GlossaryTerm_anchorOpen"), style: { position: "relative" } },
    term,
    h("button", {
      type: "button",
      className: cx("DefinitionTrigger_trigger", `DefinitionTrigger_${tone}`, open && "DefinitionTrigger_open"),
      "aria-label": labelTemplate.replace("{term}", entry.term),
      "aria-expanded": open ? "true" : "false",
      onClick: onOpenChange ? () => onOpenChange(open ? null : id) : undefined,
    }, "?"),
    open ? h("span", { className: "DefinitionPopover_popover DefinitionPopover_anchored", role: "dialog", "aria-label": entry.term, style: { position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 5, display: "block" } },
      h("span", { className: "DefinitionPopover_topRow", style: { display: "flex" } },
        h("span", { className: "DefinitionPopover_term" }, entry.term),
        h("button", { type: "button", className: "DefinitionPopover_closeButton" }, closeLabel)),
      h("span", { className: "DefinitionPopover_definition", style: { display: "block" } }, entry.definition),
      moreLabel ? h("a", { className: "DefinitionPopover_more", href: "#glossary" }, moreLabel) : null) : null);
};
