import * as React from "react";
import { Button, FormSummary } from "tour-de-growth";

/*
 * What stands between the person and « Save », just above the button: a title
 * that counts, a sentence on saving anyway, one link per field. Invalid lines
 * block the save, missing lines do not — with only missing lines the frame is
 * dashed, not red. It replaces the audit's paragraph of red body text, the
 * loudest thing on its screen. The primary button stays the loudest here.
 */

/** A refused save, in French: one line blocks, two do not. */
export const RefusedSave = () => (
  <div style={{ display: "grid", gap: 26, maxWidth: 560 }}>
    <FormSummary
      title="3 choses avant d'enregistrer"
      lead={"La première bloque l'enregistrement. Les deux autres non : la ligne s'enregistre et l'export la signale."}
      items={[
        { targetId: "signups", label: "Inscrits en juillet 2026", message: "Ce n'est pas un nombre lisible.", kind: "invalid" },
        { targetId: "unit", label: "Unité", kind: "missing" },
        { targetId: "source", label: "D'où vient ce chiffre ?", kind: "missing" },
      ]}
    />
    <div>
      <Button variant="primary">Enregistrer ce chiffre</Button>
    </div>
  </div>
);

/** Only missing fields: nothing blocks, so the frame is dashed — « not yet ». */
export const MissingOnly = () => (
  <div style={{ display: "grid", gap: 26, maxWidth: 560 }}>
    <FormSummary
      title="2 things still to fill in"
      lead="The line saves anyway, and the export flags it as incomplete."
      items={[
        { targetId: "unit", label: "Unit", kind: "missing" },
        { targetId: "source", label: "Where does it come from?", kind: "missing" },
      ]}
    />
    <div>
      <Button variant="primary">Save this number</Button>
    </div>
  </div>
);
