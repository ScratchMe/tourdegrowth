// NumberList — design system extension 07. Every number, by stage, in one
// list: the board's map, and the way into each number's screen.
// Plain React, no JSX.
import React from "react";
import { Disclosure, MetaLabel, Tag } from "tour-de-growth";
import { EngineProgress } from "./EngineProgress.js";

const h = React.createElement;

const cx = (...c) => c.filter(Boolean).join(" ");

const TAG_TONE = { est: "neutral", asked: "outline", cant: "neutral", todo: "outline" };

const Row = ({ row }) =>
  h("li", { className: "NumberList_item" },
    h("button", {
      type: "button",
      className: cx("NumberList_row", row.status === "todo" && "NumberList_rowTodo"),
      onClick: row.onOpen,
      "aria-describedby": row.describedBy,
    },
      h("span", { className: "NumberList_name" }, row.name),
      row.value ? h("span", { className: "NumberList_value" }, row.value) : null,
      row.statusLabel && TAG_TONE[row.status]
        ? h(Tag, { tone: TAG_TONE[row.status], className: "NumberList_tag" }, row.statusLabel)
        : null,
      row.note ? h("span", { className: "NumberList_note" }, row.note) : null));

/**
 * Replaces the five stage tabs and their panel of folded rows (Q16). Each
 * stage is a heading with its marks and "2 of 3 found"; each number a row —
 * name, value, status — that opens the number's own screen (not a sheet
 * unfolded in place). The stage a TEAM TARGET names gets the diagnosis
 * edge (solid red) and the "Holds you back" tag; no other red.
 *
 * A found number shows its value and no tag: the value is the status.
 * Pending states (asked, to do) wear the dashed tag; estimated and "can't
 * find" the neutral one. `progress` (an EngineProgress) sits under the
 * title: what remains, the marks, their legend. Computed numbers (and, in the hybrid, the link)
 * sit in a closed Disclosure at the end: they are read, never typed.
 */
export const NumberList = ({ title, progress, stages, computed, headingId = "engine-numbers" }) =>
  h("section", { className: "NumberList_root", "aria-labelledby": headingId },
    h("h2", { id: headingId, className: "NumberList_title" }, title),
    progress ?? null,
    stages.map((stage) =>
      h("section", {
        key: stage.id,
        className: cx("NumberList_stage", stage.holdsBack && "NumberList_holds"),
        "aria-labelledby": `${headingId}-${stage.id}`,
      },
        h("div", { className: "NumberList_head" },
          h("h3", { id: `${headingId}-${stage.id}`, className: "NumberList_stageName" }, stage.name),
          stage.holdsBack ? h(Tag, { tone: "alert" }, stage.holdsLabel) : null,
          h("div", { className: "NumberList_headProgress" },
            h(EngineProgress, { remaining: "", groups: [{ id: stage.id, label: stage.foundLabel, marks: stage.marks }] }),
            h(MetaLabel, { size: "xs", uppercase: false }, stage.foundLabel))),
        h("ul", { className: "NumberList_rows" }, stage.rows.map((row) => h(Row, { key: row.id, row }))))),
    computed
      ? h(Disclosure, { summary: computed.title, size: "md", rule: true, defaultOpen: computed.open, className: "NumberList_computed" },
          h("ul", { className: "NumberList_rows" }, computed.rows.map((row) => h(Row, { key: row.id, row }))))
      : null);
