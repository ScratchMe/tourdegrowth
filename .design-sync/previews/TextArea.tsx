import * as React from "react";
import { Field, QuestionCard, TextArea } from "tour-de-growth";

/*
 * The multi-line input. Standing alone under a QuestionCard (the Deep dive's
 * last screen), `label` is REQUIRED: the visible prompt sits in the card
 * above rather than in a <label>, so without it the field would have no
 * accessible name at all (REVIEW.md R-19). Inside a form it sits in a Field
 * (extension 04), which gives it its visible label, and `label` is left out.
 *
 * `maxLength` is a soft cap — the counter turns over and the edge goes 3px
 * red, but typing is never blocked. Real enforcement is server-side, in two
 * independent places (SPEC-ADDENDUM-02 §1.4). Unlike TextField, the count is
 * always shown: a multi-line field has the room.
 */

// The Deep dive's last screen, `app/(app)/deep-dive/[id]/page.tsx:265-278`, copy from
// `content/free-context.ts` (label, placeholder) and its 500-character cap
// (`FREE_CONTEXT_MAX_LENGTH`). The page's pitch line between the card and the field is the
// page's, not this component's, and is left out.
const DEEP_DIVE = {
  en: {
    label: "Any specific context we should know about? (optional)",
    placeholder: "E.g.: we sell to accounting firms, long sales cycle, trust is a bigger blocker than price...",
  },
  fr: {
    label: "Un contexte particulier qu'on devrait connaître ? (optionnel)",
    placeholder: "Ex. : on vend à des cabinets comptables, cycle de vente long, le vrai frein c'est la confiance plus que le prix…",
  },
};

const Standalone = ({ locale, initial }: { locale: "en" | "fr"; initial: string }) => {
  const [value, setValue] = React.useState(initial);
  const t = DEEP_DIVE[locale];
  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
      <QuestionCard>{t.label}</QuestionCard>
      <TextArea value={value} onChange={setValue} maxLength={500} placeholder={t.placeholder} label={t.label} />
    </div>
  );
};

/**
 * Empty: the placeholder shows an example, the counter reads 0/500. Submitting
 * it empty IS how you skip this screen — the label says "(optional)" and there
 * is no Skip button.
 */
export const Empty = () => <Standalone locale="en" initial="" />;

/** The same screen in French: « (optionnel) » in the question, « Ex. : … » in the placeholder. */
export const EmptyInFrench = () => <Standalone locale="fr" initial="" />;

/** Filled, well under the cap: the sentence the e2e suite types (`e2e/returning-visitor.spec.ts:104`). */
export const Filled = () => <Standalone locale="en" initial="We sell to accounting firms and trust is the blocker." />;

/** Over the cap (567/500): red border, red counter, and the text still types. A founder's own words. */
export const OverLimit = () => (
  <Standalone
    locale="en"
    initial={
      "We sell scheduling software to independent physiotherapists. Most churn happens in the first month, and we have never worked out why. " +
      "Acquisition is mostly word of mouth from two physio schools, which we cannot scale, and we have never measured what a customer costs us. " +
      "Pricing is one flat plan we set three years ago and have not revisited since, though several customers have asked for a team tier. " +
      "We have no referral mechanism at all beyond people telling each other in the staff room, " +
      "and we have never asked a single customer to introduce us to another clinic."
    }
  />
);

/**
 * Inside a Field: the Field's label names it, its hint is read before the
 * count. The audit's definition editor (French only),
 * `admin/audit/DefinitionEditor.tsx:72-88`: `size="sm"`, the default four
 * rows, a 400 cap; label `DEFINITION_FIELD_LABELS.numeratorPopulation`
 * (labels.ts:188), filled with what `e2e/audit-rows.spec.ts:196` types. The
 * same field empty, with its « à compléter » message, is Field's `Missing`.
 */
export const InAField = () => {
  const [value, setValue] = React.useState("revenu récurrent normalisé du mois clos");
  return (
    <div style={{ maxWidth: 560 }}>
      <Field size="sm" label="Population au numérateur" hint="Qui est compté au-dessus de la barre, et à quel instant.">
        {({ id, describedBy }) => <TextArea id={id} aria-describedby={describedBy} value={value} onChange={setValue} maxLength={400} />}
      </Field>
    </div>
  );
};
