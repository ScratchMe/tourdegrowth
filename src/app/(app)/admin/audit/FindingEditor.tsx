"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { TextArea } from "@/components/core/TextArea";
import { buildFinding, missingFindingFields, type FindingDraft } from "@/lib/audit/finding-draft";
import { GAPS, SYSTEM_CAUSES, type Finding, type Gap, type SystemCause } from "@/lib/audit/schema";
import { DateInput } from "./_ui/DateInput";
import { Field } from "./_ui/Field";
import { Select } from "./_ui/Select";
import { TextInput } from "./_ui/TextInput";
import { GAP_LABELS, SYSTEM_CAUSE_LABELS, optionsFrom } from "./labels";
import styles from "./page.module.css";

/**
 * L'éditeur d'un constat : le 5C, l'écart, le Decision Ledger et l'action
 * convenue.
 *
 * **Trois champs seulement bloquent** (`missingFindingFields`) : les valeurs
 * référencées, l'écart et la cause système. Le reste part en chaînes vides —
 * même discipline que partout ici, le fichier dit ce qui reste à faire
 * plutôt que d'interdire de l'enregistrer.
 *
 * **L'écart et la cause ne sont pas présélectionnés.** Ce sont des
 * vocabulaires fermés dont chaque valeur s'imprimera dans un livrable ; en
 * défauter un reviendrait à écrire une phrase à la place de l'auditeur
 * (même règle que le statut d'une ligne, 1.3a).
 *
 * **L'action convenue se remplit EN ENTRETIEN**, et l'écran le dit. C'est la
 * différence entre un plan d'action rédigé seul dans un coin — que personne
 * ne tient — et un engagement pris devant la personne qui devra le tenir.
 *
 * **Les trois champs de retour du Ledger ne sont pas là.** `actual`,
 * `learning` et `next` se remplissent à la passe suivante ; les offrir
 * maintenant en ferait des cases à remplir à la rédaction, l'inverse de leur
 * usage.
 */
export function FindingEditor({
  draft: initial,
  rowNames,
  onSave,
  onClose,
}: {
  draft: FindingDraft;
  /** `metricId` → nom de la ligne, pour dire de quoi le constat parle. */
  rowNames: Map<string, string>;
  onSave: (finding: Finding) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<FindingDraft>(initial);
  const set = <K extends keyof FindingDraft>(key: K, value: FindingDraft[K]) => setDraft({ ...draft, [key]: value });
  const setLedger = (key: keyof FindingDraft["ledger"], value: string) =>
    setDraft({ ...draft, ledger: { ...draft.ledger, [key]: value } });

  const missing = missingFindingFields(draft);
  const ready = missing.length === 0;

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Constat</h2>
        <Button compact variant="secondary" onClick={onClose} data-testid="close-finding">
          Retour
        </Button>
      </div>

      <Card elevation="panel" className={styles.form} data-testid="finding-form">
        <MetaLabel size="xs" wide>
          Repose sur
        </MetaLabel>
        <ul className={styles.errorList} data-testid="finding-refs">
          {draft.refs.map((ref) => (
            <li key={ref.metricId}>{rowNames.get(ref.metricId) ?? ref.metricId}</li>
          ))}
        </ul>

        <Field label="Titre" htmlFor="finding-title" hint="Une phrase, celle qui s'imprimera.">
          <TextInput id="finding-title" value={draft.title} onChange={(value) => set("title", value)} autoFocus />
        </Field>

        <Field
          label="Écart"
          htmlFor="finding-gap"
          hint="Ce qui manque, pas un jugement — c'est le cadre de restitution."
        >
          <Select
            id="finding-gap"
            value={(draft.gap ?? "") as Gap | ""}
            options={[{ id: "" as const, label: "— à choisir —" }, ...optionsFrom(GAPS, GAP_LABELS)]}
            onChange={(id) => set("gap", (id === "" ? undefined : (id as Gap)) as Gap | undefined)}
          />
        </Field>

        <Field
          label="Cause système"
          htmlFor="finding-cause"
          hint="Liste fermée, jamais un champ libre : un livrable ne nomme pas une personne."
        >
          <Select
            id="finding-cause"
            value={(draft.cause ?? "") as SystemCause | ""}
            options={[{ id: "" as const, label: "— à choisir —" }, ...optionsFrom(SYSTEM_CAUSES, SYSTEM_CAUSE_LABELS)]}
            onChange={(id) => set("cause", (id === "" ? undefined : (id as SystemCause)) as SystemCause | undefined)}
          />
        </Field>

        <MetaLabel size="xs" wide>
          Le 5C
        </MetaLabel>
        <Field label="Critère" htmlFor="finding-criteria" hint="Ce à quoi on compare, et d'où le seuil vient.">
          <TextArea
            id="finding-criteria"
            label="Critère"
            value={draft.criteria}
            onChange={(value) => set("criteria", value)}
            maxLength={400}
            data-testid="finding-criteria"
          />
        </Field>
        <Field label="Condition" htmlFor="finding-condition" hint="Ce qui est, avec sa source et sa date d'arrêté.">
          <TextArea
            id="finding-condition"
            label="Condition"
            value={draft.condition}
            onChange={(value) => set("condition", value)}
            maxLength={400}
            data-testid="finding-condition"
          />
        </Field>
        <Field label="Conséquence" htmlFor="finding-consequence" hint="Ce que ça coûte, chiffré quand c'est possible.">
          <TextArea
            id="finding-consequence"
            label="Conséquence"
            value={draft.consequence}
            onChange={(value) => set("consequence", value)}
            maxLength={400}
            data-testid="finding-consequence"
          />
        </Field>
        <Field label="Action corrective" htmlFor="finding-corrective" hint="Ce qu'il faudrait faire.">
          <TextArea
            id="finding-corrective"
            label="Action corrective"
            value={draft.correctiveAction}
            onChange={(value) => set("correctiveAction", value)}
            maxLength={400}
            data-testid="finding-corrective"
          />
        </Field>

        <MetaLabel size="xs" wide>
          Decision Ledger
        </MetaLabel>
        <p className={styles.muted}>
          Problème → preuves → hypothèse → décision → attendu. Ce qui a été obtenu, appris et ce qui suit se remplissent à la passe
          suivante, pas ici.
        </p>
        <Field label="Problème" htmlFor="ledger-problem">
          <TextArea
            id="ledger-problem"
            label="Problème"
            value={draft.ledger.problem}
            onChange={(v) => setLedger("problem", v)}
            maxLength={400}
            data-testid="ledger-problem"
          />
        </Field>
        <Field label="Preuves" htmlFor="ledger-evidence">
          <TextArea
            id="ledger-evidence"
            label="Preuves"
            value={draft.ledger.evidence}
            onChange={(v) => setLedger("evidence", v)}
            maxLength={400}
            data-testid="ledger-evidence"
          />
        </Field>
        <Field label="Hypothèse" htmlFor="ledger-hypothesis">
          <TextArea
            id="ledger-hypothesis"
            label="Hypothèse"
            value={draft.ledger.hypothesis}
            onChange={(v) => setLedger("hypothesis", v)}
            maxLength={400}
            data-testid="ledger-hypothesis"
          />
        </Field>
        <Field label="Décision" htmlFor="ledger-decision">
          <TextArea
            id="ledger-decision"
            label="Décision"
            value={draft.ledger.decision}
            onChange={(v) => setLedger("decision", v)}
            maxLength={400}
            data-testid="ledger-decision"
          />
        </Field>
        <Field label="Attendu" htmlFor="ledger-expected">
          <TextArea
            id="ledger-expected"
            label="Attendu"
            value={draft.ledger.expected}
            onChange={(v) => setLedger("expected", v)}
            maxLength={400}
            data-testid="ledger-expected"
          />
        </Field>

        <MetaLabel size="xs" wide>
          Action convenue
        </MetaLabel>
        <p className={styles.muted} data-testid="agreed-hint">
          À remplir en entretien, pas à la rédaction : un plan d&apos;action écrit seul n&apos;engage personne.
        </p>
        <Field label="Ce qui a été convenu" htmlFor="agreed-action">
          <TextArea
            id="agreed-action"
            label="Ce qui a été convenu"
            value={draft.agreedAction?.action ?? ""}
            onChange={(value) => set("agreedAction", { ...draft.agreedAction, action: value })}
            maxLength={400}
            data-testid="agreed-action"
          />
        </Field>
        <Field label="Rôle qui porte" htmlFor="agreed-owner" hint="Un rôle, jamais un nom.">
          <TextInput
            id="agreed-owner"
            value={draft.agreedAction?.ownerRole ?? ""}
            onChange={(value) => set("agreedAction", { action: draft.agreedAction?.action ?? "", ...draft.agreedAction, ownerRole: value })}
          />
        </Field>
        <Field label="Échéance" htmlFor="agreed-date">
          <DateInput
            id="agreed-date"
            value={draft.agreedAction?.date ?? ""}
            onChange={(value) => set("agreedAction", { action: draft.agreedAction?.action ?? "", ...draft.agreedAction, date: value })}
          />
        </Field>

        {missing.length > 0 ? (
          <p className={styles.muted} data-testid="finding-missing">
            Il manque : {missing.map((field) => MISSING_LABELS[field]).join(", ")}.
          </p>
        ) : null}

        <div className={styles.screenActions}>
          <Button compact variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            compact
            data-testid="save-finding"
            {...(ready ? {} : { disabled: true })}
            onClick={() => {
              const built = buildFinding(draft);
              if (built) onSave(built);
            }}
          >
            Enregistrer
          </Button>
        </div>
      </Card>
    </section>
  );
}

const MISSING_LABELS: Record<"refs" | "gap" | "cause", string> = {
  refs: "au moins une valeur référencée",
  gap: "l'écart",
  cause: "la cause système",
};
