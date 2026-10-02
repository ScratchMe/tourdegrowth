import * as React from "react";
import { GlossaryTerm, StageScore, StageScores } from "tour-de-growth";

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
 * The five stage names on a result screen's score sheet — every one carries
 * a trigger. Scores are the product's own sample result
 * (lib/submissions/sample.ts), whose weakest stage is Retention: its row is
 * red and its "?" alert.
 */
export const InStageScores = () => {
  const [open, setOpen] = React.useState("");
  const rows = [
    { id: "acquisition", label: "Acquisition", score: 18 },
    { id: "activation", label: "Activation", score: 12 },
    { id: "retention", label: "Retention", score: 8 },
    { id: "referral", label: "Referral", score: 16 },
    { id: "revenue", label: "Revenue", score: 20 },
  ] as const;
  return (
    <StageScores label="Score per stage, out of 20" style={{ maxWidth: 420 }}>
      {rows.map((r) => (
        <StageScore key={r.id} stage={r.label} score={r.score} tone={r.id === "retention" ? "alert" : "neutral"}>
          <GlossaryTerm
            id={r.id}
            locale="en"
            openId={open}
            onOpenChange={(id) => setOpen(id ?? "")}
            tone={r.id === "retention" ? "alert" : "muted"}
            {...LABELS}
          />
        </StageScore>
      ))}
    </StageScores>
  );
};

/**
 * One term, open, so the whole thing can be read without a click: acq-3, with
 * the trigger right after "customer acquisition cost". The panel opens in the
 * top layer (`placement="auto"`), out of the paragraph's flow: the room kept
 * under the paragraph is only there so it lands inside this story's cell.
 * It is the ONLY story here that opens one — a page shows one panel at a
 * time, and a second story opening its own would close this one.
 */
export const Open = () => {
  const [open, setOpen] = React.useState("cac");
  return (
    <div style={{ paddingBottom: 200 }}>
      <p style={{ font: "17px/1.6 Inter, sans-serif", margin: 0, maxWidth: 420 }}>
        {"Do you know your customer acquisition cost"}
        <GlossaryTerm id="cac" locale="en" openId={open} onOpenChange={(id) => setOpen(id ?? "")} {...LABELS} />
        {", even roughly?"}
      </p>
    </div>
  );
};

/**
 * French: ret-3, whose "?" keeps its non-breaking space after the trigger,
 * with the French labels. Closed on purpose: only one panel is open on a page
 * (see Open), and the French definition itself is DefinitionPopover's French.
 */
export const French = () => {
  const [open, setOpen] = React.useState("");
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
