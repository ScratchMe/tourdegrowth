"use client";

import { Disclosure } from "@/components/core/Disclosure";
import { TextArea } from "@/components/core/TextArea";
import { missingDefinitionFields, type DefinitionDraft } from "@/lib/audit/definitions";
import { Checkbox } from "@/components/core/Checkbox";
import { Field } from "@/components/core/Field";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { DEFINITION_FIELD_LABELS, FORM_COPY } from "./labels";
import styles from "./page.module.css";

/**
 * L'éditeur d'une définition de métrique.
 *
 * Une `MetricDefinition` est immuable et adressée par `id@version`
 * (AUDIT.md §3) : cet écran ne modifie donc JAMAIS la définition
 * enregistrée, il édite un brouillon que `upsertDefinition` compare au
 * contenu déjà posé en enregistrant la ligne. Identique → même référence ;
 * différent → version suivante, l'ancienne reste. C'est ce qui fait qu'une
 * observation relevée il y a trois semaines continue de vouloir dire ce
 * qu'elle voulait dire.
 *
 * **Les quatre champs du haut sont ceux que le validateur exige** ; les axes
 * en dessous sont ceux qui font qu'un chiffre veut dire deux choses. Ils ne
 * sont pas tous pertinents pour toutes les lignes, et l'outil ne prétend pas
 * savoir lesquels : c'est le PIÈGE de la fiche, à gauche, qui le dit — et il
 * est écrit pour chaque ligne par le catalogue, pas deviné ici.
 */
export function DefinitionEditor({
  draft,
  currentRef,
  onChange,
}: {
  draft: DefinitionDraft;
  /** La référence déjà posée sur l'entrée, quand il y en a une. */
  currentRef: string | undefined;
  onChange: (draft: DefinitionDraft) => void;
}) {
  const missing = missingDefinitionFields(draft);

  function patch(next: Partial<DefinitionDraft>) {
    onChange({ ...draft, ...next });
  }

  return (
    <div className={styles.fieldGroup} data-testid="definition-fields">
      <p className={styles.muted}>
        {currentRef ? (
          <>
            Définition en vigueur : <strong>{currentRef}</strong>. La modifier frappe une nouvelle version — l&apos;ancienne reste, et les
            observations qui la référencent gardent leur sens.
          </>
        ) : (
          <>
            Aucune définition posée pour cette ligne. Les quatre premiers champs sont ceux que le validateur exige ; sans eux, le fichier
            s&apos;écrit quand même et signale la ligne comme incomplète.
          </>
        )}
      </p>

      <TextField
        size="sm"
        id="def-unit"
        label={DEFINITION_FIELD_LABELS.unit}
        missing={missing.includes("unit") ? FORM_COPY.missing : undefined}
        hint="Jamais déduite du nom de la métrique. « euro », « pourcentage », « jours », « clients »."
        value={draft.unit ?? ""}
        onChange={(unit) => patch({ unit })}
      />

      <Field
        size="sm"
        id="def-numerator"
        label={DEFINITION_FIELD_LABELS.numeratorPopulation}
        missing={missing.includes("numeratorPopulation") ? FORM_COPY.missing : undefined}
        hint="Qui est compté au-dessus de la barre, et à quel instant."
      >
        {({ id: controlId, describedBy }) => (
          <TextArea
            id={controlId}
            aria-describedby={describedBy}
            value={draft.numeratorPopulation ?? ""}
            onChange={(numeratorPopulation) => patch({ numeratorPopulation })}
            maxLength={400}
          />
        )}
      </Field>

      <Field
        size="sm"
        id="def-denominator"
        label={DEFINITION_FIELD_LABELS.denominatorPopulation}
        missing={missing.includes("denominatorPopulation") ? FORM_COPY.missing : undefined}
        hint="L'axe qui a produit le bug K-factor de ce dépôt (R2-01) : un dénominateur qui ne compte que ceux qui ont déjà converti donne un ratio qui ne peut pas descendre sous 1. Écrire « sans objet » pour une valeur absolue."
      >
        {({ id: controlId, describedBy }) => (
          <TextArea
            id={controlId}
            aria-describedby={describedBy}
            value={draft.denominatorPopulation ?? ""}
            onChange={(denominatorPopulation) => patch({ denominatorPopulation })}
            maxLength={400}
          />
        )}
      </Field>

      <TextField
        size="sm"
        id="def-scope"
        label={DEFINITION_FIELD_LABELS.scope}
        missing={missing.includes("scope") ? FORM_COPY.missing : undefined}
        hint="Entité, ligne de produit, région. Écrire « tout » plutôt que laisser vide."
        value={draft.scope ?? ""}
        onChange={(scope) => patch({ scope })}
      />

      <Disclosure summary="Les axes qui font qu'un chiffre veut dire deux choses">
        <div className={styles.fieldGroup}>
          <p className={styles.muted}>
            Facultatifs, et c&apos;est là que se joue la plupart des écarts. Renseigner ceux que le piège de la fiche nomme ; laisser vides
            les autres — un axe vide n&apos;entre pas dans la définition et ne frappe pas de version.
          </p>

          <TextField
            size="sm"
            id="def-gross"
            label={DEFINITION_FIELD_LABELS.grossOrNet}
            hint="Brut ou net de quoi : remises, retours, réactivations, remboursements."
            value={draft.grossOrNet ?? ""}
            onChange={(grossOrNet) => patch({ grossOrNet })}
          />

          <Select
            size="sm"
            id="def-cohort"
            label={DEFINITION_FIELD_LABELS.cohortOrSnapshot}
            hint="Une rétention en cohorte et une rétention en photo ne racontent pas la même histoire, et la seconde masque toujours la première."
            value={draft.cohortOrSnapshot ?? ""}
            placeholder="— non précisé —"
            options={[
              { value: "cohort" as const, label: "Cohorte" },
              { value: "snapshot" as const, label: "Photo (snapshot)" },
            ]}
            onChange={(value) => patch({ cohortOrSnapshot: value === "" ? undefined : value })}
          />

          <TextField
            size="sm"
            id="def-counting"
            label={DEFINITION_FIELD_LABELS.countingRule}
            hint="Pour toute rétention : exactement au jour N, au jour N ou après, ou par plage. Trois règles, trois courbes."
            value={draft.countingRule ?? ""}
            onChange={(countingRule) => patch({ countingRule })}
          />

          <TextField
            size="sm"
            id="def-attr-model"
            label={DEFINITION_FIELD_LABELS.attributionModel}
            hint="Premier contact, dernier contact, linéaire, data-driven."
            value={draft.attributionModel ?? ""}
            onChange={(attributionModel) => patch({ attributionModel })}
          />

          <TextField
            size="sm"
            id="def-attr-window"
            label={DEFINITION_FIELD_LABELS.attributionWindow}
            hint="La fenêtre retenue, et si elle est celle de l'outil ou un choix."
            value={draft.attributionWindow ?? ""}
            onChange={(attributionWindow) => patch({ attributionWindow })}
          />

          <Field
            size="sm"
            id="def-costs-in"
            label={DEFINITION_FIELD_LABELS.costsIncluded}
            hint="Un poste par ligne. Ce qui est DANS le calcul."
          >
            {({ id: controlId, describedBy }) => (
              <TextArea
                id={controlId}
                aria-describedby={describedBy}
                value={(draft.costsIncluded ?? []).join("\n")}
                onChange={(value) => patch({ costsIncluded: toLines(value) })}
                maxLength={600}
              />
            )}
          </Field>

          <Field
            size="sm"
            id="def-costs-out"
            label={DEFINITION_FIELD_LABELS.costsExcluded}
            hint="Un poste par ligne. Souvent plus parlant que la liste du dessus : un CAC sans salaires ni outils n'est pas un CAC."
          >
            {({ id: controlId, describedBy }) => (
              <TextArea
                id={controlId}
                aria-describedby={describedBy}
                value={(draft.costsExcluded ?? []).join("\n")}
                onChange={(value) => patch({ costsExcluded: toLines(value) })}
                maxLength={600}
              />
            )}
          </Field>

          <TextField
            size="sm"
            id="def-horizon"
            label={DEFINITION_FIELD_LABELS.horizon}
            hint="Pour toute valeur projetée : le plafond de durée de vie retenu. « À l'infini » est un choix, et il se dit."
            value={draft.horizon ?? ""}
            onChange={(horizon) => patch({ horizon })}
          />

          <Checkbox
            id="def-tool-default"
            label={DEFINITION_FIELD_LABELS.toolDefault}
            hint="À cocher quand la règle ci-dessus est le réglage par défaut de l'outil et que personne ne l'a choisie. C'est souvent le vrai constat de la ligne."
            checked={draft.toolDefault === true}
            onChange={(checked) => patch({ toolDefault: checked ? true : undefined })}
          />
        </div>
      </Disclosure>

    </div>
  );
}

/** Un poste par ligne — la forme d'édition naturelle d'une liste de coûts. */
function toLines(value: string): string[] {
  return value.split("\n").map((line) => line.trim());
}
