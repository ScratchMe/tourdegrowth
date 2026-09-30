import * as React from "react";
import { Field, Segmented, TextArea } from "tour-de-growth";

/*
 * Field gives a control in a form its VISIBLE label, its hint and its message.
 * TextField, NumberField, Select, DateField and Choices render their own;
 * Field is reached for directly only to wrap something else — here a
 * TextArea and a Segmented — with a render prop that hands the control its
 * id, its label's id and what describes it.
 *
 * Every story mirrors a real call. Strings are the product's, copied
 * verbatim: the growth engine's from `src/content/engine-copy.ts` (EN and FR,
 * `{n}` filled the way `fillTemplate` fills it), the audit's from
 * `src/app/(app)/admin/audit/` (French only — the tool is). The engine marks
 * an optional field inside its label, « (optional) » / « (facultatif) »; no
 * product call passes the `optional` prop, so no story does either.
 */

const NB = " ";

// engine-copy.ts:463-467 (sheet.definitionNote, sheet.definitionNoteHint)
const DEFINITION = {
  en: { label: "Your definition (optional)", hint: 'For example "active = at least one project edited". It appears in the slides\' appendix and in the requests you copy.' },
  fr: {
    label: "Ta définition (facultatif)",
    hint: `Par exemple «${NB}actif = au moins un projet modifié${NB}». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies.`,
  },
};

/**
 * The engine's metric sheet, `_engine/MetricSheet.tsx:501-518` (`DefinitionNote`):
 * `size="sm"`, a two-row TextArea capped (softly) at `TEXT_LIMITS.definitionNote`
 * = 200. The error prop is only set after a refused save (see `Invalid`).
 */
const DefinitionNote = ({ locale, initial, error }: { locale: "en" | "fr"; initial: string; error?: string }) => {
  const [value, setValue] = React.useState(initial);
  const t = DEFINITION[locale];
  return (
    <Field size="sm" label={t.label} hint={t.hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <TextArea id={id} value={value} onChange={setValue} maxLength={200} invalid={invalid} aria-describedby={describedBy} rows={2} />
      )}
    </Field>
  );
};

const Pair = ({ children }: { children: React.ReactNode }) => <div style={{ display: "grid", gap: 26, maxWidth: 560 }}>{children}</div>;

/**
 * Around a TextArea: the engine's « your definition », filled with the very
 * example its hint gives. Well under 200, so the count is quiet; the hint sits
 * under it. English, then French.
 */
export const AroundTextArea = () => (
  <Pair>
    <DefinitionNote locale="en" initial="active = at least one project edited" />
    <DefinitionNote locale="fr" initial="actif = au moins un projet modifié" />
  </Pair>
);

/**
 * A Segmented named by its Field (`group`, `labelledBy`): the legend is the
 * words on screen. The engine's setup, `_engine/Setup.tsx:186-195` — no hint,
 * default size, 7 days pre-set as in the setup (`activationWindowDays` 7).
 * Labels: engine-copy.ts:172 and 174 (`{n} jours` in French).
 */
export const AroundSegmented = () => {
  const [en, setEn] = React.useState<"7" | "14" | "30">("7");
  const [fr, setFr] = React.useState<"7" | "14" | "30">("7");
  return (
    <Pair>
      <Field group label="Activation window">
        {({ labelId }) => (
          <Segmented
            labelledBy={labelId}
            value={en}
            onChange={setEn}
            options={[
              { id: "7", label: "7 days" },
              { id: "14", label: "14 days" },
              { id: "30", label: "30 days" },
            ]}
          />
        )}
      </Field>
      <Field group label="Fenêtre d'activation">
        {({ labelId }) => (
          <Segmented
            labelledBy={labelId}
            value={fr}
            onChange={setFr}
            options={[
              { id: "7", label: `7${NB}jours` },
              { id: "14", label: `14${NB}jours` },
              { id: "30", label: `30${NB}jours` },
            ]}
          />
        )}
      </Field>
    </Pair>
  );
};

/**
 * Invalid — cannot be saved as it is: after a refused save, the same
 * definition field over its 200-character limit. The message is
 * `fillTemplate(sheet.tooLong, { n: 200 })` (engine-copy.ts:502,
 * sheet-problems.ts:51-52): a red rule and 600 weight, read before the hint;
 * the TextArea takes the 3px red edge and its count turns red (226/200,
 * 230/200). The typed definitions are a person's words, lengthened from the
 * hint's own example.
 */
export const Invalid = () => (
  <Pair>
    <DefinitionNote
      locale="en"
      error="200 characters at most."
      initial="active = at least one project edited in the first 7 days, by someone other than the person who signed up; a project created from a template doesn't count, and neither does an edit made by our own team during an onboarding call"
    />
    <DefinitionNote
      locale="fr"
      error="200 caractères au plus."
      initial={`actif = au moins un projet modifié dans les 7 premiers jours, par quelqu'un d'autre que la personne inscrite${NB}; un projet créé depuis un modèle ne compte pas, ni une modification faite par notre équipe pendant un appel d'onboarding`}
    />
  </Pair>
);

/**
 * Missing — still to fill in, saves anyway: a dashed rule in body ink, « not
 * yet », never red. The audit's definition editor on a new row,
 * `admin/audit/DefinitionEditor.tsx:72-88`: label from
 * `DEFINITION_FIELD_LABELS.numeratorPopulation`, message
 * `FORM_COPY.missing` (labels.ts:117). The message is read before the hint.
 */
export const Missing = () => {
  const [value, setValue] = React.useState("");
  return (
    <div style={{ maxWidth: 560 }}>
      <Field
        size="sm"
        label="Population au numérateur"
        missing="À compléter — l'export signalera cette ligne comme incomplète."
        hint="Qui est compté au-dessus de la barre, et à quel instant."
      >
        {({ id, describedBy }) => <TextArea id={id} aria-describedby={describedBy} value={value} onChange={setValue} maxLength={400} />}
      </Field>
    </div>
  );
};
