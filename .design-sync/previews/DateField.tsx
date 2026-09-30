import * as React from "react";
import { DateField } from "tour-de-growth";

/*
 * A month, or a day, in the page's language, on native selects — never
 * <input type="date"> (the browser's language, « 09/29/2026 » in a French
 * tool, and a calendar glyph not ours) nor type="month" (a bare text box in
 * desktop Safari). Strings from brief 04.
 */

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** `precision="month"`: one list of the months the caller offers, newest first. */
export const Month = () => {
  const [value, setValue] = React.useState("2026-08");
  return (
    <div style={{ maxWidth: 480 }}>
      <DateField
        precision="month"
        label="Month for flows"
        hint="Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last full month."
        value={value}
        onChange={setValue}
        months={[
          { value: "2026-08", label: "August 2026" },
          { value: "2026-07", label: "July 2026" },
          { value: "2026-06", label: "June 2026" },
          { value: "2026-05", label: "May 2026" },
        ]}
      />
    </div>
  );
};

/** `precision="day"`, in French: three lists, each with its visible label; only the empty part takes the dashed edge. */
export const DayOnePartMissing = () => {
  const [value, setValue] = React.useState({ day: "29", month: "09", year: "" });
  return (
    <DateField
      precision="day"
      label="Début de la mission"
      value={value}
      onChange={setValue}
      monthNames={MOIS}
      years={[2025, 2026, 2027]}
      partLabels={{ day: "Jour", month: "Mois", year: "Année" }}
      missing={"À compléter : l'export signalera cette ligne comme incomplète."}
    />
  );
};
