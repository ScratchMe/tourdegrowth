// Board stand-in for the synced WhatIfFigures (components/engine/
// WhatIfFigures): the live markup and class names, unchanged by extension 10.
// The panel's figures, today, with the what-ifs and the change, in short
// tables by meaning; under 520px the "today" column folds into a line under
// the what-if value. Not ported.
import React from "react";

const h = React.createElement;

export const WhatIfFigures = ({ groups, columns, moved, todayLine = (v) => v }) =>
  h("div", { className: "WhatIfFigures_root", "data-moved": moved ? "true" : "false" },
    groups.map((g) =>
      h("table", { key: g.id, className: "WhatIfFigures_table" },
        h("caption", { className: "WhatIfFigures_caption" }, g.title),
        h("thead", null,
          h("tr", null,
            h("th", { scope: "col" }, columns.figure),
            h("th", { scope: "col", className: moved ? "WhatIfFigures_numeric WhatIfFigures_todayColumn" : "WhatIfFigures_numeric" }, columns.today),
            moved ? h("th", { scope: "col", className: "WhatIfFigures_numeric" }, columns.whatif) : null,
            moved ? h("th", { scope: "col", className: "WhatIfFigures_numeric" }, columns.change) : null)),
        h("tbody", null,
          g.rows.map((r) =>
            h("tr", { key: r.id },
              h("th", { scope: "row" }, r.label, r.missing ? h("span", { className: "WhatIfFigures_missing" }, r.missing) : null),
              h("td", { className: moved ? "WhatIfFigures_numeric WhatIfFigures_todayColumn" : "WhatIfFigures_numeric" }, r.today),
              moved ? h("td", { className: "WhatIfFigures_numeric" }, r.whatif, h("span", { className: "WhatIfFigures_todayLine" }, todayLine(r.today))) : null,
              moved ? h("td", { className: "WhatIfFigures_numeric WhatIfFigures_change" }, r.change) : null))))));
