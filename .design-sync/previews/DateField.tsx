import * as React from "react";
import { DateField } from "tour-de-growth";

/*
 * A month, or a day, in the page's language, on native selects — never
 * <input type="date"> (the browser's language, « 09/29/2026 » in a French
 * tool, and a calendar glyph not ours) nor type="month" (a bare text box in
 * desktop Safari). Nothing is pre-filled with today.
 *
 * Two real callers:
 * - the growth engine's settings card
 *   (`src/app/[locale]/aarrr-funnel-template/_engine/Setup.tsx`: an engine's
 *   Settings, and what « Change » opens from the start screen before one
 *   exists), bilingual: two months side by side, each list the 18 months
 *   ending at the last closed one (`monthsEndingAt` + `formatMonth`), copy
 *   from `src/content/engine-copy.ts` (`setup.*`; the first label is
 *   "Month of the figures" since C42), props captured from the card run for the
 *   engine's example day (`src/lib/engine/__tests__/fixtures.ts`,
 *   `EXAMPLE_TODAY`, 24 September 2026: figures August 2026, cohort July
 *   2026, a 30-day payment window);
 * - the audit's `IsoDateField` (`src/app/(app)/admin/audit/IsoDateField.tsx`),
 *   French only, `size="sm"`: three lists, month names from `Intl` in
 *   French, years this year − 10 to + 3, copy from `labels.ts` (`FORM_COPY`).
 *   Its two checks are reproduced below, so each day story shows the message
 *   the audit shows for it; dates are `lib/audit/__tests__/tracking.test.ts`'s.
 */

type MonthProps = Extract<React.ComponentProps<typeof DateField>, { precision: "month" }>;
type DayProps = Extract<React.ComponentProps<typeof DateField>, { precision: "day" }>;
type DayParts = DayProps["value"];

const MONTHS_EN = [
  ["2026-08", "August 2026"],
  ["2026-07", "July 2026"],
  ["2026-06", "June 2026"],
  ["2026-05", "May 2026"],
  ["2026-04", "April 2026"],
  ["2026-03", "March 2026"],
  ["2026-02", "February 2026"],
  ["2026-01", "January 2026"],
  ["2025-12", "December 2025"],
  ["2025-11", "November 2025"],
  ["2025-10", "October 2025"],
  ["2025-09", "September 2025"],
  ["2025-08", "August 2025"],
  ["2025-07", "July 2025"],
  ["2025-06", "June 2025"],
  ["2025-05", "May 2025"],
  ["2025-04", "April 2025"],
  ["2025-03", "March 2025"],
].map(([value, label]) => ({ value: value!, label: label! }));

const MONTHS_FR = [
  ["2026-08", "août 2026"],
  ["2026-07", "juillet 2026"],
  ["2026-06", "juin 2026"],
  ["2026-05", "mai 2026"],
  ["2026-04", "avril 2026"],
  ["2026-03", "mars 2026"],
  ["2026-02", "février 2026"],
  ["2026-01", "janvier 2026"],
  ["2025-12", "décembre 2025"],
  ["2025-11", "novembre 2025"],
  ["2025-10", "octobre 2025"],
  ["2025-09", "septembre 2025"],
  ["2025-08", "août 2025"],
  ["2025-07", "juillet 2025"],
  ["2025-06", "juin 2025"],
  ["2025-05", "mai 2025"],
  ["2025-04", "avril 2025"],
  ["2025-03", "mars 2025"],
].map(([value, label]) => ({ value: value!, label: label! }));

const Month = (props: { initial: string } & Omit<MonthProps, "value" | "onChange" | "precision">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState(initial);
  return <DateField precision="month" {...rest} value={value} onChange={setValue} />;
};

/** The settings card's grid from 761px: two columns of its 500px content (a 560px card, 30px sides). */
const SetupGrid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--form-gap-md)", maxWidth: 500 }}>
    {children}
  </div>
);

/**
 * `precision="month"`: one list of the months the caller offers, newest first. The engine's
 * two months, in English: the month of the figures, then the cohort followed — drawn only
 * while self-serve is ticked (sales-assisted reads three months, said in a line under the
 * grid).
 */
export const SetupMonths = () => (
  <SetupGrid>
    <Month
      initial="2026-08"
      label={"Month of the figures"}
      hint={"Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last full month."}
      months={MONTHS_EN}
    />
    <Month
      initial="2026-07"
      label={"Cohort you follow"}
      hint={"We follow the sign-ups from July 2026: those from August 2026 haven't had 30 days yet."}
      months={MONTHS_EN}
    />
  </SetupGrid>
);

/**
 * The same two in French: the month names are lower case, and the hints carry their no-break
 * spaces.
 */
export const SetupMonthsFrench = () => (
  <SetupGrid>
    <Month
      initial="2026-08"
      label={"Mois des chiffres"}
      hint={"Visiteurs, inscriptions, dépense, churn et ARPA de ce mois-là. Par défaut : le dernier mois terminé."}
      months={MONTHS_FR}
    />
    <Month
      initial="2026-07"
      label={"Cohorte suivie"}
      hint={"On suit les inscrits en juillet 2026 : ceux inscrits en août 2026 n'ont pas encore eu 30 jours."}
      months={MONTHS_FR}
    />
  </SetupGrid>
);

/** « janvier » … « décembre », by the browser's own French — `IsoDateField`'s expression. */
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, i, 15))),
);
/** This year − 10 to + 3, with this year 2026. */
const YEARS = Array.from({ length: 14 }, (_, i) => 2026 - 10 + i);

/** `IsoDateField`'s two checks (`lib/forms/date.ts`: `isPartialDay`, `isRealDay`) and its `FORM_COPY` messages. */
function dayMessages({ day, month, year }: DayParts): { missing?: string; error?: string } {
  const chosen = [day, month, year].filter(Boolean).length;
  if (chosen > 0 && chosen < 3) return { missing: "Il manque une partie de la date : rien ne s'enregistre avant les trois." };
  if (chosen === 3) {
    const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (d.getUTCMonth() !== Number(month) - 1 || d.getUTCDate() !== Number(day)) return { error: "Ce jour n'existe pas." };
  }
  return {};
}

const IsoDay = (props: { initial: DayParts; label: string; hint?: string }) => {
  const [value, setValue] = React.useState<DayParts>(props.initial);
  return (
    <DateField
      precision="day"
      size="sm"
      label={props.label}
      hint={props.hint}
      value={value}
      onChange={setValue}
      monthNames={MONTH_NAMES}
      years={YEARS}
      partLabels={{ day: "Jour", month: "Mois", year: "Année" }}
      {...dayMessages(value)}
    />
  );
};

/** `precision="day"`: three lists, day–month–year, each with its visible label. A request logged on 1 September 2026 (`ContextEditor.tsx`). */
export const Day = () => <IsoDay label="Demandé le" initial={{ day: "1", month: "09", year: "2026" }} />;

/** Nothing chosen: three « – », no status — a line not chased yet (`ContextEditor.tsx`), under its hint. */
export const DayNotChosen = () => (
  <IsoDay
    label="Relancé le"
    hint={"Remet le compteur à zéro : une ligne relancée hier n'est pas à relancer aujourd'hui."}
    initial={{ day: "", month: "", year: "" }}
  />
);

/** Started, not finished: only the empty part takes the dashed edge, and `FORM_COPY.partialDay` says nothing is stored yet. */
export const DayOnePartMissing = () => <IsoDay label="Reçu le" initial={{ day: "3", month: "09", year: "" }} />;

/** A day the calendar lacks, 31 February 2026: `FORM_COPY.notADay`, not the 3rd of March (`ObservationList.tsx`, a period's end). */
export const DayThatDoesNotExist = () => <IsoDay label="Fin de période" initial={{ day: "31", month: "02", year: "2026" }} />;
