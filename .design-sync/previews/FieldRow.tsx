import * as React from "react";
import { FieldRow, NumberField } from "tour-de-growth";

/*
 * Two fields that are one statement — the growth engine's commonest shape.
 * From a 480px container they sit side by side, joined by their word, their
 * boxes on one line however their labels wrap; below it they stack. A message
 * about the pair belongs to the row. Strings from brief 04 (under review).
 */

const Count = (props: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

/** A count out of a count, in a sheet (`sm`). Narrow the frame under 480px and they stack, « out of » between them. */
export const CountOutOfACount = () => (
  <div style={{ maxWidth: 760 }}>
    <FieldRow joiner="out of">
      <Count initial={26000} label="Activated within 7 days" locale="en" integer digits={9} size="sm" parseError="That isn't a readable number." />
      <Count initial={120000} label="Signed up in July 2026" locale="en" integer digits={9} size="sm" parseError="That isn't a readable number." />
    </FieldRow>
  </div>
);

/** A range, in French, with the pair's own message under the whole row. */
export const RangeWithItsMessage = () => (
  <div style={{ maxWidth: 760 }}>
    <FieldRow joiner="à" error="Le minimum dépasse le maximum.">
      <Count initial={40} label="Bas de la fourchette" locale="fr" suffix={" %"} digits={4} size="sm" parseError="Ce n'est pas un nombre lisible." />
      <Count initial={20} label="Haut de la fourchette" locale="fr" suffix={" %"} digits={4} size="sm" parseError="Ce n'est pas un nombre lisible." />
    </FieldRow>
  </div>
);
