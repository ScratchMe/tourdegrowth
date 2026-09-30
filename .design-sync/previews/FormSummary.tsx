import * as React from "react";
import { Button, FormSummary } from "tour-de-growth";

/*
 * What stands between the person and saving, just above the button: a title
 * that counts, a sentence on saving anyway, one link per field — each moves
 * focus into its field, which also says it under itself. It replaced the
 * audit's paragraph of red body text, the loudest thing on its screen; the
 * primary button stays the loudest here.
 *
 * Its one product call is the audit's row editor (French only),
 * `app/(app)/admin/audit/RowEditor.tsx:117-129` and `:286-304`: the title is
 * `FORM_COPY.summaryTitle(n)`, the lead `FORM_COPY.summaryLead`
 * (labels.ts:125-127), the labels `DEFINITION_FIELD_LABELS` (labels.ts:186-190),
 * the link targets the fields' ids (`DEFINITION_FIELD_IDS`, RowEditor.tsx:334),
 * and the button « Enregistrer cette ligne » follows it. Every line it passes is
 * `kind: "missing"` — a row saves anyway — so the frame is always dashed,
 * « not yet ». The component also takes `invalid` lines (they block the save
 * and turn the frame red), but no product call produces one, so no story shows it.
 */

const LEAD = "La ligne s'enregistre quand même — l'export la signalera comme incomplète plutôt que de faire croire qu'elle est finie.";

const AboveTheButton = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: 26, maxWidth: 560 }}>
    {children}
    <div>
      <Button>Enregistrer cette ligne</Button>
    </div>
  </div>
);

/**
 * A row with a value and a new definition: `seedDefinition` fills only the
 * scope (the mission's, never empty), so `missingDefinitionFields` returns the
 * other three required fields. `summaryTitle(3)`; no message after a label.
 */
export const ThreeFields = () => (
  <AboveTheButton>
    <FormSummary
      title="3 champs à compléter"
      lead={LEAD}
      items={[
        { targetId: "def-unit", label: "Unité", kind: "missing" },
        { targetId: "def-numerator", label: "Population au numérateur", kind: "missing" },
        { targetId: "def-denominator", label: "Population au dénominateur", kind: "missing" },
      ]}
    />
  </AboveTheButton>
);

/**
 * The definition complete, an argued threshold chosen without its argument:
 * one line, the singular title `summaryTitle(1)`, and the field's own message
 * after a dash (`CRITERION_ARGUMENT_MISSING`, CriterionEditor.tsx:20).
 */
export const OneFieldWithItsMessage = () => (
  <AboveTheButton>
    <FormSummary
      title="Un champ à compléter"
      lead={LEAD}
      items={[
        {
          targetId: "criterionJustification",
          label: "Argument",
          message: "Un seuil argumenté porte son argument (q5) : sans lui, le validateur signalera cette ligne.",
          kind: "missing",
        },
      ]}
    />
  </AboveTheButton>
);
