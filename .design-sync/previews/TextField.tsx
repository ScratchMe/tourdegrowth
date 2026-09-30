import * as React from "react";
import { TextField } from "tour-de-growth";

/*
 * One line of text: TextArea's family, one line tall, with the field's 6px
 * radius so a field and a button side by side no longer read as two buttons.
 * `maxLength` is a SOFT limit: typing is never blocked, the count shows in the
 * label row from 80% of it and turns red past it.
 *
 * Every story mirrors a real call. Strings are the product's, copied
 * verbatim: the growth engine's from `src/content/engine-copy.ts` (EN and FR,
 * `{n}` filled the way `fillTemplate` fills it), the audit's from
 * `src/app/(app)/admin/audit/` (French only). Limits are `TEXT_LIMITS`
 * (`src/lib/engine/catalog-shape.ts:483`). No product call passes `optional`
 * (the engine writes « (optional) » into the label), `countLabel`,
 * `placeholder` on these fields, or `disabled`, so no story does.
 */

const NB = " ";

const Live = ({ initial, ...rest }: { initial: string } & Omit<React.ComponentProps<typeof TextField>, "value" | "onChange">) => {
  const [value, setValue] = React.useState(initial);
  return <TextField {...rest} value={value} onChange={setValue} />;
};

const Pair = ({ children }: { children: React.ReactNode }) => <div style={{ display: "grid", gap: 26, maxWidth: 560 }}>{children}</div>;

// The engine's setup, `_engine/Setup.tsx:207-215`: default size, limit TEXT_LIMITS.companyLabel = 60.
// engine-copy.ts:176-180 (setup.companyLabel, setup.companyHint).
const COMPANY = {
  en: { label: "Your SaaS or company name (optional)", hint: "It only appears on your slides, and stays on this device like everything else." },
  fr: { label: "Nom de ton SaaS ou de ton entreprise (facultatif)", hint: "Il n'apparaît que sur tes slides, et reste sur cet appareil comme le reste." },
};

/** Empty: the setup's name field as it first appears. No placeholder, no count yet. English, then French. */
export const Empty = () => (
  <Pair>
    <Live initial="" label={COMPANY.en.label} hint={COMPANY.en.hint} maxLength={60} />
    <Live initial="" label={COMPANY.fr.label} hint={COMPANY.fr.hint} maxLength={60} />
  </Pair>
);

/**
 * Filled, well under the limit: still no count — it costs no line until it
 * matters. The name is the product's own example company (engine-copy.ts:1478,
 * `example.company`).
 */
export const Filled = () => (
  <Pair>
    <Live initial="Example SaaS" label={COMPANY.en.label} hint={COMPANY.en.hint} maxLength={60} />
    <Live initial="Exemple SaaS" label={COMPANY.fr.label} hint={COMPANY.fr.hint} maxLength={60} />
  </Pair>
);

/*
 * The ask on the slides, `_engine/deck/AskForm.tsx:169-179` (through
 * `DraftText`, :58-80): `size="sm"`, limit TEXT_LIMITS.askWhat = 120, and the
 * error set the moment the text runs past it, with
 * `fillTemplate(sheet.tooLong, { n: 120 })` (engine-copy.ts:502). Label:
 * engine-copy.ts:972 (`ask.what`). The typed asks start from the engine's own
 * sample (`what` in content/__tests__/engine-copy.test.ts) and add the deck
 * tests' bullets (« refaire l'onboarding », « instrumenter J30 »).
 */

/** Near the limit: from 96 of 120 the count appears at the end of the label row (100/120, 109/120). */
export const NearTheLimit = () => (
  <Pair>
    <Live
      size="sm"
      label="What (120 characters)"
      maxLength={120}
      initial="€80,000 and two people for a quarter, to rebuild the onboarding and then instrument day-30 retention"
    />
    <Live
      size="sm"
      label="Quoi (120 caractères)"
      maxLength={120}
      initial={`80${NB}000${NB}€ et deux personnes pendant un trimestre, pour refaire l'onboarding et instrumenter la rétention à J30`}
    />
  </Pair>
);

/** Past the soft limit (124/120, 131/120): red count, 3px red edge, the product's message — and typing still works. */
export const OverTheLimit = () => (
  <Pair>
    <Live
      size="sm"
      label="What (120 characters)"
      maxLength={120}
      error="120 characters at most."
      initial="€80,000 and two people for a quarter, to rebuild the onboarding, instrument day-30 retention and set up a referral programme"
    />
    <Live
      size="sm"
      label="Quoi (120 caractères)"
      maxLength={120}
      error="120 caractères au plus."
      initial={`80${NB}000${NB}€ et deux personnes pendant un trimestre, pour refaire l'onboarding, instrumenter la rétention à J30 et lancer le parrainage`}
    />
  </Pair>
);

/**
 * Invalid, empty, after a refused save: the engine's activation event
 * (`_engine/ValueEditor.tsx:217-225`, a text value, limit TEXT_LIMITS.value =
 * 120). Label: the metric's name (`src/content/engine-catalog.ts:256`); message:
 * `fillTemplate(workbench.saveNeeds, { fields: name })` (engine-copy.ts:572).
 */
export const Invalid = () => (
  <Pair>
    <Live size="sm" label="Activation event" maxLength={120} error="To save, still missing: Activation event" initial="" />
    <Live size="sm" label="Événement d'activation" maxLength={120} error={`Pour enregistrer, il manque${NB}: Événement d'activation`} initial="" />
  </Pair>
);

/**
 * Missing — still to fill in, saves anyway: dashed, never red. The audit's
 * definition editor on a new row, `admin/audit/DefinitionEditor.tsx:62-70`:
 * label `DEFINITION_FIELD_LABELS.unit`, message `FORM_COPY.missing`
 * (labels.ts:187, :117), and its hint.
 */
export const Missing = () => (
  <div style={{ maxWidth: 560 }}>
    <Live
      size="sm"
      label="Unité"
      missing="À compléter — l'export signalera cette ligne comme incomplète."
      hint={`Jamais déduite du nom de la métrique. «${NB}euro${NB}», «${NB}pourcentage${NB}», «${NB}jours${NB}», «${NB}clients${NB}».`}
      initial=""
    />
  </div>
);
