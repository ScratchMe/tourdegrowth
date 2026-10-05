// Board stand-in for the synced DataTable (components/core/DataTable): the
// same markup and class names, without sorting. Not ported.
import React from "react";
import { cx } from "./_cx.js";
const h = React.createElement;

export const DataTable = ({ caption, captionHidden = false, columns, rows, rowHeader, size = "md", className, ...rest }) => {
  const headerKey = rowHeader ?? columns[0]?.key;
  return h("table", { className: cx("DataTable_table", `DataTable_${size}`, className), ...rest },
    h("caption", { className: captionHidden ? "tdg-visually-hidden" : "DataTable_caption" }, caption),
    h("thead", null,
      h("tr", null, columns.map((col) => h("th", { key: col.key, scope: "col", className: col.numeric ? "DataTable_numeric" : undefined }, col.header)))),
    h("tbody", null,
      rows.map((row) =>
        h("tr", { key: row.id },
          columns.map((col) => {
            const text = row.cells[col.key];
            const className = col.numeric ? "DataTable_numeric" : undefined;
            return col.key === headerKey
              ? h("th", { key: col.key, scope: "row", className }, text)
              : h("td", { key: col.key, className }, text);
          })))));
};
