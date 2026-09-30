"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { TextArea } from "@/components/core/TextArea";
import { buildFinding, missingFindingFields, type FindingDraft } from "@/lib/audit/finding-draft";
import { GAPS, SYSTEM_CAUSES, type Finding } from "@/lib/audit/schema";
import { Field } from "@/components/core/Field";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { IsoDateField } from "./IsoDateField";
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
        <Button size="sm" variant="secondary" onClick={onClose} data-testid="close-finding">
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

        <TextField
          size="sm"
          id="finding-title"
          label="Titre"
          hint="Une phrase, celle qui s'imprimera."
          value={draft.title}
          onChange={(value) => set("title", value)}
          autoFocus
        />

        <Select
          size="sm"
          id="finding-gap"
          label="Écart"
          hint="Ce qui manque, pas un jugement — c'est le cadre de restitution."
          value={draft.gap ?? ""}
          placeholder="— à choisir —"
          options={optionsFrom(GAPS, GAP_LABELS)}
          onChange={(gap) => set("gap", gap === "" ? undefined : gap)}
        />

        <Select
          size="sm"
          id="finding-cause"
          label="Cause système"
          hint="Liste fermée, jamais un champ libre : un livrable ne nomme pas une personne."
          value={draft.cause ?? ""}
          placeholder="— à choisir —"
          options={optionsFrom(SYSTEM_CAUSES, SYSTEM_CAUSE_LABELS)}
          onChange={(cause) => set("cause", cause === "" ? undefined : cause)}
        />

        <MetaLabel size="xs" wide>
          Le 5C
        </MetaLabel>
        <Field size="sm" id="finding-criteria" label="Critère" hint="Ce à quoi on compare, et d'où le seuil vient.">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.criteria}
              onChange={(value) => set("criteria", value)}
              maxLength={400}
              data-testid="finding-criteria"
            />
          )}
        </Field>
        <Field size="sm" id="finding-condition" label="Condition" hint="Ce qui est, avec sa source et sa date d'arrêté.">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.condition}
              onChange={(value) => set("condition", value)}
              maxLength={400}
              data-testid="finding-condition"
            />
          )}
        </Field>
        <Field size="sm" id="finding-consequence" label="Conséquence" hint="Ce que ça coûte, chiffré quand c'est possible.">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.consequence}
              onChange={(value) => set("consequence", value)}
              maxLength={400}
              data-testid="finding-consequence"
            />
          )}
        </Field>
        <Field size="sm" id="finding-corrective" label="Action corrective" hint="Ce qu'il faudrait faire.">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.correctiveAction}
              onChange={(value) => set("correctiveAction", value)}
              maxLength={400}
              data-testid="finding-corrective"
            />
          )}
        </Field>

        <MetaLabel size="xs" wide>
          Decision Ledger
        </MetaLabel>
        <p className={styles.muted}>
          Problème → preuves → hypothèse → décision → attendu. Ce qui a été obtenu, appris et ce qui suit se remplissent à la passe
          suivante, pas ici.
        </p>
        <Field size="sm" id="ledger-problem" label="Problème">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.ledger.problem}
              onChange={(v) => setLedger("problem", v)}
              maxLength={400}
              data-testid="ledger-problem"
            />
          )}
        </Field>
        <Field size="sm" id="ledger-evidence" label="Preuves">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.ledger.evidence}
              onChange={(v) => setLedger("evidence", v)}
              maxLength={400}
              data-testid="ledger-evidence"
            />
          )}
        </Field>
        <Field size="sm" id="ledger-hypothesis" label="Hypothèse">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.ledger.hypothesis}
              onChange={(v) => setLedger("hypothesis", v)}
              maxLength={400}
              data-testid="ledger-hypothesis"
            />
          )}
        </Field>
        <Field size="sm" id="ledger-decision" label="Décision">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.ledger.decision}
              onChange={(v) => setLedger("decision", v)}
              maxLength={400}
              data-testid="ledger-decision"
            />
          )}
        </Field>
        <Field size="sm" id="ledger-expected" label="Attendu">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.ledger.expected}
              onChange={(v) => setLedger("expected", v)}
              maxLength={400}
              data-testid="ledger-expected"
            />
          )}
        </Field>

        <MetaLabel size="xs" wide>
          Action convenue
        </MetaLabel>
        <p className={styles.muted} data-testid="agreed-hint">
          À remplir en entretien, pas à la rédaction : un plan d&apos;action écrit seul n&apos;engage personne.
        </p>
        <Field size="sm" id="agreed-action" label="Ce qui a été convenu">
          {({ id: controlId, describedBy }) => (
            <TextArea
              id={controlId}
              aria-describedby={describedBy}
              value={draft.agreedAction?.action ?? ""}
              onChange={(value) => set("agreedAction", { ...draft.agreedAction, action: value })}
              maxLength={400}
              data-testid="agreed-action"
            />
          )}
        </Field>
        <TextField
          size="sm"
          id="agreed-owner"
          label="Rôle qui porte"
          hint="Un rôle, jamais un nom."
          value={draft.agreedAction?.ownerRole ?? ""}
          onChange={(value) => set("agreedAction", { action: draft.agreedAction?.action ?? "", ...draft.agreedAction, ownerRole: value })}
        />
        <IsoDateField
          id="agreed-date"
          label="Échéance"
          value={draft.agreedAction?.date ?? ""}
          onChange={(value) => set("agreedAction", { action: draft.agreedAction?.action ?? "", ...draft.agreedAction, date: value })}
        />

        {missing.length > 0 ? (
          <p className={styles.muted} data-testid="finding-missing">
            Il manque : {missing.map((field) => MISSING_LABELS[field]).join(", ")}.
          </p>
        ) : null}

        <div className={styles.screenActions}>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
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
