import * as React from "react";
import { GlossaryTerm, PillarChip } from "tour-de-growth";

/*
 * Trigger and popover wired together — this is what the product actually
 * mounts. The definition text comes from the glossary content by `id`, so a
 * caller never types a definition.
 *
 * `openId` / `onOpenChange` are the CALLER's state, deliberately: "one
 * popover at a time" is per screen, and the quiz and the result page each
 * keep their own. Pass the same pair to every term on a screen.
 *
 * Questions: content/copy-library.ts, split on the anchor the way
 * QuestionText does it (no space before the trigger); labels: dictionary.ts
 * (`glossary`).
 */

const LABELS = {
  closeLabel: "Close",
  labelTemplate: "Definition: {term}",
  moreLabel: "Learn more →",
};

/**
 * The five pillar names on a result screen — every one carries a trigger.
 * Scores are the product's own sample result (lib/submissions/sample.ts),
 * whose weakest pillar is Retention: its chip is red and its "?" alert.
 */
export const InPillarChips = () => {
  const [open, setOpen] = React.useState("");
  const rows = [
    { id: "acquisition", label: "Acquisition", score: 18 },
    { id: "activation", label: "Activation", score: 12 },
    { id: "retention", label: "Retention", score: 8 },
    { id: "referral", label: "Referral", score: 16 },
    { id: "revenue", label: "Revenue", score: 20 },
  ] as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
      {rows.map((r) => (
        <PillarChip key={r.id} pillar={r.label} score={r.score} total={20} weak={r.id === "retention"} stretch>
          <GlossaryTerm
            id={r.id}
            locale="en"
            openId={open}
            onOpenChange={(id) => setOpen(id ?? "")}
            tone={r.id === "retention" ? "alert" : "muted"}
            {...LABELS}
          />
        </PillarChip>
      ))}
    </div>
  );
};

/** One term, open, so the whole thing can be read without a click: acq-3, with the trigger right after "customer acquisition cost". */
export const Open = () => {
  const [open, setOpen] = React.useState("cac");
  return (
    <p style={{ font: "17px/1.6 Inter, sans-serif", margin: 0, maxWidth: 420 }}>
      {"Do you know your customer acquisition cost"}
      <GlossaryTerm id="cac" locale="en" openId={open} onOpenChange={(id) => setOpen(id ?? "")} {...LABELS} />
      {", even roughly?"}
    </p>
  );
};

/** French: same id, the French definition and link labels — ret-3, whose "?" keeps its non-breaking space after the trigger. */
export const French = () => {
  const [open, setOpen] = React.useState("churn");
  return (
    <p style={{ font: "17px/1.6 Inter, sans-serif", margin: 0, maxWidth: 420 }}>
      {"Connais-tu ta principale cause de churn"}
      <GlossaryTerm
        id="churn"
        locale="fr"
        openId={open}
        onOpenChange={(id) => setOpen(id ?? "")}
        closeLabel="Fermer"
        labelTemplate={"Définition : {term}"}
        moreLabel="En savoir plus →"
      />
      {" ?"}
    </p>
  );
};
