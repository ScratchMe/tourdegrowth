"use client";

import { Disclosure } from "@/components/core/Disclosure";
import { TextArea } from "@/components/core/TextArea";
import { missingDefinitionFields, type DefinitionDraft } from "@/lib/audit/definitions";
import { Field } from "./_ui/Field";
import { Select } from "./_ui/Select";
import { TextInput } from "./_ui/TextInput";
import { DEFINITION_FIELD_LABELS } from "./labels";
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

      <Field label={DEFINITION_FIELD_LABELS.unit} htmlFor="def-unit" hint="Jamais déduite du nom de la métrique. « euro », « pourcentage », « jours », « clients ».">
        <TextInput id="def-unit" value={draft.unit ?? ""} onChange={(unit) => patch({ unit })} />
      </Field>

      <Field
        label={DEFINITION_FIELD_LABELS.numeratorPopulation}
        htmlFor="def-numerator"
        hint="Qui est compté au-dessus de la barre, et à quel instant."
      >
        <TextArea
          id="def-numerator"
          label={DEFINITION_FIELD_LABELS.numeratorPopulation}
          value={draft.numeratorPopulation ?? ""}
          onChange={(numeratorPopulation) => patch({ numeratorPopulation })}
          maxLength={400}
        />
      </Field>

      <Field
        label={DEFINITION_FIELD_LABELS.denominatorPopulation}
        htmlFor="def-denominator"
        hint="L'axe qui a produit le bug K-factor de ce dépôt (R2-01) : un dénominateur qui ne compte que ceux qui ont déjà converti donne un ratio qui ne peut pas descendre sous 1. Écrire « sans objet » pour une valeur absolue."
      >
        <TextArea
          id="def-denominator"
          label={DEFINITION_FIELD_LABELS.denominatorPopulation}
          value={draft.denominatorPopulation ?? ""}
          onChange={(denominatorPopulation) => patch({ denominatorPopulation })}
          maxLength={400}
        />
      </Field>

      <Field label={DEFINITION_FIELD_LABELS.scope} htmlFor="def-scope" hint="Entité, ligne de produit, région. Écrire « tout » plutôt que laisser vide.">
        <TextInput id="def-scope" value={draft.scope ?? ""} onChange={(scope) => patch({ scope })} />
      </Field>

      <Disclosure summary="Les axes qui font qu'un chiffre veut dire deux choses">
        <div className={styles.fieldGroup}>
          <p className={styles.muted}>
            Facultatifs, et c&apos;est là que se joue la plupart des écarts. Renseigner ceux que le piège de la fiche nomme ; laisser vides
            les autres — un axe vide n&apos;entre pas dans la définition et ne frappe pas de version.
          </p>

          <Field label={DEFINITION_FIELD_LABELS.grossOrNet} htmlFor="def-gross" hint="Brut ou net de quoi : remises, retours, réactivations, remboursements.">
            <TextInput id="def-gross" value={draft.grossOrNet ?? ""} onChange={(grossOrNet) => patch({ grossOrNet })} />
          </Field>

          <Field
            label={DEFINITION_FIELD_LABELS.cohortOrSnapshot}
            htmlFor="def-cohort"
            hint="Une rétention en cohorte et une rétention en photo ne racontent pas la même histoire, et la seconde masque toujours la première."
          >
            <Select
              id="def-cohort"
              value={draft.cohortOrSnapshot ?? ""}
              options={[
                { id: "" as const, label: "— non précisé —" },
                { id: "cohort" as const, label: "Cohorte" },
                { id: "snapshot" as const, label: "Photo (snapshot)" },
              ]}
              onChange={(value) => patch({ cohortOrSnapshot: value === "" ? undefined : value })}
            />
          </Field>

          <Field
            label={DEFINITION_FIELD_LABELS.countingRule}
            htmlFor="def-counting"
            hint="Pour toute rétention : exactement au jour N, au jour N ou après, ou par plage. Trois règles, trois courbes."
          >
            <TextInput id="def-counting" value={draft.countingRule ?? ""} onChange={(countingRule) => patch({ countingRule })} />
          </Field>

          <Field label={DEFINITION_FIELD_LABELS.attributionModel} htmlFor="def-attr-model" hint="Premier contact, dernier contact, linéaire, data-driven.">
            <TextInput id="def-attr-model" value={draft.attributionModel ?? ""} onChange={(attributionModel) => patch({ attributionModel })} />
          </Field>

          <Field label={DEFINITION_FIELD_LABELS.attributionWindow} htmlFor="def-attr-window" hint="La fenêtre retenue, et si elle est celle de l'outil ou un choix.">
            <TextInput id="def-attr-window" value={draft.attributionWindow ?? ""} onChange={(attributionWindow) => patch({ attributionWindow })} />
          </Field>

          <Field label={DEFINITION_FIELD_LABELS.costsIncluded} htmlFor="def-costs-in" hint="Un poste par ligne. Ce qui est DANS le calcul.">
            <TextArea
              id="def-costs-in"
              label={DEFINITION_FIELD_LABELS.costsIncluded}
              value={(draft.costsIncluded ?? []).join("\n")}
              onChange={(value) => patch({ costsIncluded: toLines(value) })}
              maxLength={600}
            />
          </Field>

          <Field
            label={DEFINITION_FIELD_LABELS.costsExcluded}
            htmlFor="def-costs-out"
            hint="Un poste par ligne. Souvent plus parlant que la liste du dessus : un CAC sans salaires ni outils n'est pas un CAC."
          >
            <TextArea
              id="def-costs-out"
              label={DEFINITION_FIELD_LABELS.costsExcluded}
              value={(draft.costsExcluded ?? []).join("\n")}
              onChange={(value) => patch({ costsExcluded: toLines(value) })}
              maxLength={600}
            />
          </Field>

          <Field label={DEFINITION_FIELD_LABELS.horizon} htmlFor="def-horizon" hint="Pour toute valeur projetée : le plafond de durée de vie retenu. « À l'infini » est un choix, et il se dit.">
            <TextInput id="def-horizon" value={draft.horizon ?? ""} onChange={(horizon) => patch({ horizon })} />
          </Field>

          <div className={styles.checkboxRow}>
            <input
              id="def-tool-default"
              type="checkbox"
              checked={draft.toolDefault === true}
              onChange={(event) => patch({ toolDefault: event.target.checked ? true : undefined })}
            />
            <label htmlFor="def-tool-default">{DEFINITION_FIELD_LABELS.toolDefault}</label>
          </div>
          <p className={styles.muted}>
            À cocher quand la règle ci-dessus est le réglage par défaut de l&apos;outil et que personne ne l&apos;a choisie. C&apos;est
            souvent le vrai constat de la ligne.
          </p>
        </div>
      </Disclosure>

      {missing.length ? (
        <p className={styles.alert} data-testid="definition-missing">
          Il manque : {missing.map((field) => DEFINITION_FIELD_LABELS[field].toLowerCase()).join(", ")}. La ligne s&apos;enregistre quand
          même — l&apos;export la signalera comme incomplète plutôt que de faire croire qu&apos;elle est finie.
        </p>
      ) : null}
    </div>
  );
}

/** Un poste par ligne — la forme d'édition naturelle d'une liste de coûts. */
function toLines(value: string): string[] {
  return value.split("\n").map((line) => line.trim());
}
