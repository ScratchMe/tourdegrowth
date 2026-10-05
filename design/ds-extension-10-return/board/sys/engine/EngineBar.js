// Board stand-in for the synced EngineBar (components/engine/EngineBar, the live
// system, 2026-10-04): its markup and class names, so the live CSS draws
// it (system-snapshot.css). Unchanged by extension 10. Not ported.
import React from "react";
import { Button, Disclosure, MetaLabel, Tag } from "tour-de-growth";

const h = React.createElement;

/**
 * One line that says what you are looking at — engine, how it sells, month —
 * then two controls: the menu ("Engine, month and file", a Disclosure) and
 * Settings. Replaces five things on today's board: the engine line and its
 * `+`, the eyebrow, "Back to step by step", the month selector and "Remind
 * me", and the actions row (save, import, erase, enter as a table) with the
 * backup band (Q15).
 *
 * `groups` fill the menu: each a heading and its items (Buttons, a Select).
 * `note` closes the menu (the backup sentence, while the engine needs one).
 * `pending` is the dashed tag beside the line ("Never saved") — pending,
 * hence dashed (constraint 7).
 */
export const EngineBar = ({
  line,
  pending,
  menuLabel,
  groups = [],
  note,
  menuOpen,
  settingsLabel,
  onSettings,
}) =>
  h("div", { className: "EngineBar_root" },
    h("div", { className: "EngineBar_top" },
      h("p", { className: "EngineBar_line" },
        h(MetaLabel, { as: "div", size: "sm", tone: "ink", className: "EngineBar_what" }, line),
        pending ? h(Tag, { tone: "outline" }, pending) : null),
      h(Button, { variant: "quiet", size: "sm", onClick: onSettings, className: "EngineBar_settings" }, settingsLabel)),
    h(Disclosure, { summary: menuLabel, size: "md", rule: true, defaultOpen: menuOpen, className: "EngineBar_menu" },
      h("div", { className: "EngineBar_groups" },
        groups.map((g) =>
          h("section", { key: g.title, className: "EngineBar_group", "aria-label": g.title },
            h(MetaLabel, { as: "h3", size: "xs", tone: "muted" }, g.title),
            h("ul", { className: "EngineBar_items" }, g.items.map((item, i) => h("li", { key: i }, item)))))),
      note ? h("p", { className: "EngineBar_note" }, note) : null));
