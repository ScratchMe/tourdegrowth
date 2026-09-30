"use client";

import { useState } from "react";
import { DateField } from "@/components/core/DateField";
import { dayPartsFromIso, isoFromDayParts, isPartialDay, isRealDay, type DayParts } from "@/lib/forms/date";
import { FORM_COPY } from "./labels";

/** « janvier » … « décembre », by the browser's own French. */
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, i, 15))),
);

/**
 * A day the audit stores as `yyyy-mm-dd` — the form the schema keeps
 * everywhere (`Pass.date`, `requestedOn`, `drawnOn`…) — picked as three lists
 * in French (design system extension 04, Q10). It replaces
 * `<input type="date">`, which spoke the browser's language and drew a
 * calendar glyph the system did not choose.
 *
 * A composition of `DateField`, not a copy of it: what it adds is the
 * mission file's format. Parts chosen but not all three stay on screen and
 * are not stored (nothing half-chosen goes into the file); the 31st of
 * February says so rather than becoming the 3rd of March.
 */
export function IsoDateField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  // The parts chosen, alongside the date they made: while the stored date is
  // that one, the parts stay as chosen; when it changes from outside (an
  // import, another row), the lists follow it.
  const [draft, setDraft] = useState<{ parts: DayParts; iso: string }>(() => ({ parts: dayPartsFromIso(value), iso: value }));
  const parts = draft.iso === value ? draft.parts : dayPartsFromIso(value);
  const partial = isPartialDay(parts);
  const impossible = !partial && Boolean(parts.day && parts.month && parts.year) && !isRealDay(parts);

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 14 }, (_, i) => thisYear - 10 + i);
  const stored = Number(parts.year);
  if (parts.year && !years.includes(stored)) years.push(stored);
  years.sort((a, b) => a - b);

  return (
    <DateField
      precision="day"
      size="sm"
      id={id}
      label={label}
      hint={hint}
      value={parts}
      monthNames={MONTH_NAMES}
      years={years}
      partLabels={FORM_COPY.dayParts}
      error={impossible ? FORM_COPY.notADay : undefined}
      missing={partial ? FORM_COPY.partialDay : undefined}
      onChange={(next) => {
        const iso = isoFromDayParts(next);
        setDraft({ parts: next, iso });
        if (iso !== value) onChange(iso);
      }}
    />
  );
}
