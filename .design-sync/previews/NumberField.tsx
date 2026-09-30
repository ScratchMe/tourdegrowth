import * as React from "react";
import { NumberField } from "tour-de-growth";

/*
 * A count or an amount, typed the way people write numbers: a text input with
 * `inputMode`, never `type="number"`, grouped AS it is typed (type into these),
 * figures set right in tabular Inter, in a box as wide as the magnitude
 * (`digits`, 9 characters when the caller gives none). The unit sits inside
 * the box where the caller's locale puts it — the engine asks
 * `_engine/sources.ts` (`moneyUnit`, `percentUnit`), the component does not
 * decide. `value` is a number, or `null` for an empty box — never 0. What
 * cannot be read stays on screen as typed, and the parse error comes when the
 * person leaves the box: a still cannot show it (it needs typed text), and it
 * looks exactly like `Invalid`.
 *
 * Every story is one real call: the growth engine
 * (`src/app/[locale]/aarrr-funnel-template/_engine/`, bilingual, copy from
 * `src/content/engine-copy.ts` and `engine-catalog.ts`) or the audit
 * (`src/app/(app)/admin/audit/`, French only, copy from `labels.ts` and the
 * editors). Numbers are the engine's example (`src/lib/engine/example.ts`:
 * reference month August 2026, cohort July 2026, EUR) or an e2e's.
 */

const Live = (props: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

/**
 * An amount in English: the sign comes first, the figure starts against it.
 * The metric sheet's « I only have the amount » (`ValueEditor.tsx`, the
 * `amount` branch) for the CAC: `moneyUnit("EUR", "en")` gives `prefix` and
 * `unitName`. €500 is the example's CAC, €21,000 of spend over 42 customers.
 */
export const AmountEnglish = () => (
  <Live
    initial={500}
    size="sm"
    label="CAC"
    hint="Without both counts, the number will be marked approximate: it can't be recounted."
    locale="en"
    prefix="€"
    unitName="euros"
    parseError="That isn't a readable number."
  />
);

/** The same field in French: `moneyUnit("EUR", "fr")` puts the sign after the figure, which sits against it. */
export const AmountFrench = () => (
  <Live
    initial={500}
    size="sm"
    label="CAC"
    hint={"Sans les deux comptes, le chiffre sera marqué approximatif : on ne peut pas le recompter."}
    locale="fr"
    suffix="€"
    unitName="euros"
    parseError="Ce n'est pas un nombre lisible."
  />
);

/**
 * No sign in the box when the label already carries the currency: the slide
 * builder's cost (`deck/AskForm.tsx`, « An amount »), label
 * `deckUi.askAmount` filled with the page's currency sign. 26,000 is the
 * value `e2e/engine-forms.spec.ts` types there, grouped as the field groups it.
 */
export const CurrencyInTheLabel = () => (
  <Live initial={26000} size="sm" label="Amount (€)" locale="en" parseError="That isn't a readable number." />
);

/**
 * A rate in French, « % » after its no-break space (`percentUnit("fr")`):
 * the team target on a metric sheet (`MetricSheet.tsx`, `TargetField`), in a
 * five-character box. The engine writes « (facultatif) » into the label
 * itself; it never passes `optional`. 20 % is the example's activation target.
 */
export const PercentTarget = () => (
  <Live
    initial={20}
    size="sm"
    label="Ta cible (facultatif)"
    hint={"Seule une cible d'équipe permet de dire quelle étape freine."}
    locale="fr"
    digits={5}
    suffix={" %"}
    unitName="pour cent"
    parseError="Ce n'est pas un nombre lisible."
  />
);

/**
 * Empty: `null`, not 0 — the audit says why in the field's own hint. An
 * observation's value (`ObservationList.tsx`, `ValueField`), French only, no
 * unit, default width: the narrow box already says « a number goes here ».
 */
export const Empty = () => (
  <Live
    initial={null}
    size="sm"
    label="Valeur"
    hint={"Laisser vide tant que le chiffre n'est pas reçu : une observation sans valeur est une demande en cours, pas une absence."}
    locale="fr"
    parseError="Ce n'est pas un nombre lisible."
  />
);

/**
 * Invalid, from a rule the caller checks: the rate-only field
 * (`ValueEditor.tsx`, the `rate` branch) after a save was tried, with
 * `workbench.percentRange`. The message comes first, the hint stays. 140 on
 * the activation rate is the case `_engine/__tests__/sheet-draft.test.ts`
 * refuses with this rule.
 */
export const Invalid = () => (
  <Live
    initial={140}
    size="sm"
    label="Activation rate"
    hint="Without both counts, the number will be marked approximate: it can't be recounted."
    error="A rate sits between 0 and 100%."
    locale="en"
    digits={5}
    suffix="%"
    unitName="per cent"
    parseError="That isn't a readable number."
  />
);
