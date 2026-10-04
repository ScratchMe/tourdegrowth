import * as React from "react";
import { DefinitionTrigger, FieldRow, NumberField } from "tour-de-growth";

/*
 * Two fields that are one statement — the growth engine's commonest shape.
 * From a 480px container they sit side by side, joined by their word, their
 * boxes on one line however their labels and hints wrap; below it they stack.
 * Each field keeps its own message; a message about the pair belongs to the
 * row. The engine draws two shapes, both here:
 *
 * - a count out of a count, joined by `sheet.over` (« out of » / « sur »):
 *   a number's value boxes (`_engine/ValueEditor.tsx`, the `ratio` branch).
 *   Since A18 T1 the boxes are the question itself: typing in them is the
 *   answer, and the three other answers sit one tap under them
 *   (`AnswerSwitch`). The same pair draws each of the two readings that
 *   disagree in `MissingTriage.tsx` (`ReadingFields`);
 * - « At least » / « At most », which name themselves: no joiner, and the
 *   rule about the two is the row's (`_engine/MetricSheet.tsx`, the
 *   estimate). The slides' cost in weeks and people (`deck/AskForm.tsx`)
 *   is the same shape.
 *
 * Every prop is captured from those call sites, run on the engine's example
 * (`exampleState()`, `src/lib/engine/__tests__/fixtures.ts`: August 2026,
 * cohort July 2026, EUR) with the resolved copy (`src/content/engine-copy.ts`,
 * the catalogue's count labels from `engine-catalog.ts`). Paths are under
 * `src/app/[locale]/aarrr-funnel-template/`. `size="sm"`: a sheet of fields.
 */

const Count = (props: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

/**
 * A count out of a count, « out of » between them: the activation rate's two counts on the
 * example (`exampleState()`, English), 144 activated out of 800 sign-ups. The second count is
 * the cohort followed; its hint says which sign-ups to count and ends on the engine's « ? »
 * for « cohort » (`periodHint`, `EngineTerm` drawn as the system's `DefinitionTrigger`,
 * closed). The boxes stay on one line however the labels and hints wrap. Not drawn, because
 * they are the sheet's own paragraphs under the row: the live rate, and the line saying the
 * count is shared, « Same number as for day-30 retention, referred sign-up share, viral
 * coefficient (K) and paid conversion: changing it here changes it everywhere. »
 * (`sheet.sharedHint`, `Sheet.module.css` `.sharedLine`). The row sits in the sheet's 660px
 * (`NumberSheet`'s 720px `--engine-measure`, in a card with 30px sides); narrow the frame
 * under 480px and the two stack.
 */
export const CountOutOfACount = () => (
  <div style={{ maxWidth: 660 }}>
    <FieldRow joiner="out of">
      <Count
        initial={144}
        size="sm"
        label="Activated within 7 days"
        locale="en"
        integer
        parseError="A whole number: these are people."
      />
      <Count
        initial={800}
        size="sm"
        label="Sign-ups from July 2026"
        hint={<>{"Use the sign-ups from July 2026: those from August 2026 haven't had 7 days yet."}<span style={{ marginInlineStart: "var(--space-2)" }}><DefinitionTrigger term={"cohort"} label={"Definition: cohort"} /></span></>}
        locale="en"
        integer
        parseError="A whole number: these are people."
      />
    </FieldRow>
  </div>
);

/**
 * An amount out of a count, in French, on the example: the CAC's €21,000 of spend « sur » 42
 * new paying customers. The amount takes `moneyUnit("EUR", "fr")` and may be a decimal; the
 * count is whole. Neither count is shared, so no line follows the row. The first field spans
 * the joiner's column and its label does not size the columns, so « sur » sits against the box
 * and the longer label runs over both (A11.3, 2026-09-30).
 */
export const AmountOutOfACount = () => (
  <div style={{ maxWidth: 660 }}>
    <FieldRow joiner="sur">
      <Count
        initial={21000}
        size="sm"
        label={"Dépense d'acquisition en août 2026"}
        locale="fr"
        suffix={" €"}
        unitName="euros"
        parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
      />
      <Count
        initial={42}
        size="sm"
        label={"Nouveaux clients payants en août 2026"}
        locale="fr"
        integer
        parseError={"Un nombre entier : on compte des personnes."}
      />
    </FieldRow>
  </div>
);

/**
 * « At least » / « At most »: a pair with no joiner, the answer « I can estimate it »
 * (`MetricSheet.tsx`, the estimate). The example's paid-conversion estimate, 6 to 9 %.
 */
export const AtLeastAtMost = () => (
  <div style={{ maxWidth: 660 }}>
    <FieldRow>
      <Count
        initial={6}
        size="sm"
        label="At least"
        locale="en"
        suffix="%"
        unitName="per cent"
        parseError="Type a number, such as 1,250 or 18.5."
      />
      <Count
        initial={9}
        size="sm"
        label="At most"
        locale="en"
        suffix="%"
        unitName="per cent"
        parseError="Type a number, such as 1,250 or 18.5."
      />
    </FieldRow>
  </div>
);

/**
 * The same pair in French, typed the wrong way round (9 then 6, an unsaved draft): the pair's
 * own message, `sheet.lowAboveHigh`, under the whole row — shown as soon as both are typed,
 * not on save.
 */
export const RangeWithItsMessage = () => (
  <div style={{ maxWidth: 660 }}>
    <FieldRow error={"Échange les deux : le minimum dépasse le maximum."}>
      <Count
        initial={9}
        size="sm"
        label="Au moins"
        locale="fr"
        suffix={" %"}
        unitName="pour cent"
        parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
      />
      <Count
        initial={6}
        size="sm"
        label="Au plus"
        locale="fr"
        suffix={" %"}
        unitName="pour cent"
        parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
      />
    </FieldRow>
  </div>
);
