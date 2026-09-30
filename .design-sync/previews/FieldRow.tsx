import * as React from "react";
import { FieldRow, NumberField } from "tour-de-growth";

/*
 * Two fields that are one statement — the growth engine's commonest shape.
 * From a 480px container they sit side by side, joined by their word, their
 * boxes on one line however their labels and hints wrap; below it they stack.
 * Each field keeps its own message; a message about the pair belongs to the
 * row. The engine draws two shapes, both here:
 *
 * - a count out of a count, joined by `sheet.over` (« out of » / « sur »):
 *   the metric sheet's « I have it » (`_engine/ValueEditor.tsx`, the `ratio`
 *   branch; the same pair in `MissingTriage.tsx`'s two readings);
 * - « At least » / « At most », which name themselves: no joiner, and the
 *   rule about the two is the row's (`_engine/MetricSheet.tsx`, the estimate).
 *
 * Paths are under `src/app/[locale]/aarrr-funnel-template/`; copy is
 * `src/content/engine-copy.ts` and the catalogue's count labels
 * (`engine-catalog.ts`) filled for the engine's example
 * (`src/lib/engine/example.ts`: August 2026, cohort July 2026, EUR), whose
 * numbers these are. `size="sm"`: a sheet of fields.
 */

const Count = (props: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

/**
 * A count out of a count, « out of » between them: the activation rate's two
 * counts, 144 activated out of 800 sign-ups (18 %). The second count is the
 * followed cohort, shared by five numbers, and its hint says so
 * (`sheet.sharedHint`); the boxes stay on one line above it. The row sits in
 * the sheet's 760px (`Board.module.css`, `.metricBody`); narrow the frame
 * under 480px and the two stack.
 */
export const CountOutOfACount = () => (
  <div style={{ maxWidth: 760 }}>
    <FieldRow joiner="out of">
      <Count initial={144} size="sm" label="Activated within 7 days" locale="en" integer parseError="A whole number: these are people." />
      <Count
        initial={800}
        size="sm"
        label="Sign-ups from July 2026"
        hint="Same number as for day-30 retention, referred sign-up share, viral coefficient (K) and paid conversion: changing it here changes it everywhere."
        locale="en"
        integer
        parseError="A whole number: these are people."
      />
    </FieldRow>
  </div>
);

/**
 * An amount out of a count, in French: the CAC's spend, « 21 000 € », sur 42
 * new paying customers. The amount takes `moneyUnit("EUR", "fr")` and may be
 * a decimal; the count is whole. The first field spans the joiner's column
 * and its label does not size the columns, so « sur » sits against the box
 * and the longer label runs over both (A11.3, 2026-09-30).
 */
export const AmountOutOfACount = () => (
  <div style={{ maxWidth: 760 }}>
    <FieldRow joiner="sur">
      <Count
        initial={21000}
        size="sm"
        label="Dépense d'acquisition en août 2026"
        locale="fr"
        suffix={" €"}
        unitName="euros"
        parseError="Ce n'est pas un nombre lisible."
      />
      <Count
        initial={42}
        size="sm"
        label="Nouveaux clients payants en août 2026"
        locale="fr"
        integer
        parseError={"Un nombre entier : on compte des personnes."}
      />
    </FieldRow>
  </div>
);

/** « At least » / « At most »: a pair with no joiner. The example's paid-conversion estimate, 6 to 9 %. */
export const AtLeastAtMost = () => (
  <div style={{ maxWidth: 760 }}>
    <FieldRow>
      <Count initial={6} size="sm" label="At least" locale="en" suffix="%" unitName="per cent" parseError="That isn't a readable number." />
      <Count initial={9} size="sm" label="At most" locale="en" suffix="%" unitName="per cent" parseError="That isn't a readable number." />
    </FieldRow>
  </div>
);

/**
 * The same pair in French, typed the wrong way round (9 then 6): the pair's
 * own message, `sheet.lowAboveHigh`, under the whole row — shown as soon as
 * both are typed, not on save.
 */
export const RangeWithItsMessage = () => (
  <div style={{ maxWidth: 760 }}>
    <FieldRow error="Le minimum dépasse le maximum.">
      <Count
        initial={9}
        size="sm"
        label="Au moins"
        locale="fr"
        suffix={" %"}
        unitName="pour cent"
        parseError="Ce n'est pas un nombre lisible."
      />
      <Count
        initial={6}
        size="sm"
        label="Au plus"
        locale="fr"
        suffix={" %"}
        unitName="pour cent"
        parseError="Ce n'est pas un nombre lisible."
      />
    </FieldRow>
  </div>
);
