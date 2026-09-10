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
 */

const LABELS = {
  closeLabel: "Close",
  labelTemplate: "Definition: {term}",
  moreLabel: "Learn more →",
};

/** The five pillar names on a result screen — every one carries a trigger. */
export const InPillarChips = () => {
  const [open, setOpen] = React.useState("");
  const rows = [
    { id: "acquisition", label: "Acquisition", score: 18 },
    { id: "activation", label: "Activation", score: 12 },
    { id: "retention", label: "Retention", score: 8 },
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

/** One term, open, so the whole thing can be read without a click. */
export const Open = () => {
  const [open, setOpen] = React.useState("cac");
  return (
    <p style={{ font: "17px/1.6 Inter, sans-serif", margin: 0, maxWidth: 420 }}>
      Do you know your customer acquisition cost{" "}
      <GlossaryTerm id="cac" locale="en" openId={open} onOpenChange={(id) => setOpen(id ?? "")} {...LABELS} /> on your
      main channel?
    </p>
  );
};

/** French: same id, different definition and different link labels. */
export const French = () => {
  const [open, setOpen] = React.useState("churn");
  return (
    <p style={{ font: "17px/1.6 Inter, sans-serif", margin: 0, maxWidth: 420 }}>
      Connais-tu ta principale cause de churn{" "}
      <GlossaryTerm
        id="churn"
        locale="fr"
        openId={open}
        onOpenChange={(id) => setOpen(id ?? "")}
        closeLabel="Fermer"
        labelTemplate="Définition : {term}"
        moreLabel="En savoir plus →"
      />{" "}
      ?
    </p>
  );
};
