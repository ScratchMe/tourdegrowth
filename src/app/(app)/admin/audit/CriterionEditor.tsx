"use client";

import { TextArea } from "@/components/core/TextArea";
import { CRITERION_KINDS, type Criterion } from "@/lib/audit/schema";
import { criterionFieldGroups, missingCriterionFields, weakProvenance } from "@/lib/audit/criterion-fields";
import { Field } from "@/components/core/Field";
import { NumberField } from "@/components/core/NumberField";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { CRITERION_KIND_LABELS, optionsFrom, FORM_COPY } from "./labels";
import styles from "./page.module.css";

/**
 * Sous l'argument d'un seuil argumenté tant qu'il est vide ; repris dans le
 * résumé au-dessus du bouton. TODO: à relire (convention 6) — l'ancien
 * paragraphe disait « l'export refusera cette ligne », ce qui est faux :
 * l'export écrit le fichier, c'est le validateur qui signale (même correction
 * que celle de la définition, JOURNAL.md, phase 1.3b).
 */
export const CRITERION_ARGUMENT_MISSING = "Un seuil argumenté porte son argument (q5) : sans lui, le validateur signalera cette ligne.";

/**
 * Le repère auquel la valeur se compare.
 *
 * Deux niveaux d'exigence, volontairement distincts et affichés
 * différemment : l'**argument** d'un seuil argumenté est ce que le validateur
 * refusera (q5), dit sous le champ et dans le résumé au-dessus du bouton ; la
 * **provenance** d'un repère public est du conseil, en gris. Confondre les deux ferait bloquer sur ce qui n'est pas
 * bloquant, ou passer sous silence ce qui l'est.
 */
export function CriterionEditor({ criterion, onChange }: { criterion: Criterion | undefined; onChange: (criterion: Criterion | undefined) => void }) {
  const groups = criterion ? criterionFieldGroups(criterion.kind) : [];
  const missing = criterion ? missingCriterionFields(criterion) : [];
  const weak = criterion ? weakProvenance(criterion) : [];

  function patch(next: Partial<Criterion>) {
    if (!criterion) return;
    onChange({ ...criterion, ...next });
  }

  return (
    <div className={styles.fieldGroup} data-testid="criterion-fields">
      <Select
        size="sm"
        id="criterionKind"
        label="Sorte de repère"
        hint="Sans repère, un chiffre n'est ni bon ni mauvais — il est juste là. Facultatif : une ligne peut être relevée sans qu'on ait de quoi la juger."
        value={criterion?.kind ?? ""}
        placeholder="— aucun repère —"
        options={optionsFrom(CRITERION_KINDS, CRITERION_KIND_LABELS)}
        onChange={(kind) => {
          if (!kind) return onChange(undefined);
          // Le changement de sorte GARDE la valeur et jette ce qui n'a plus
          // de sens : une justification collée à un repère public partirait
          // telle quelle dans le fichier sans que rien ne l'affiche.
          onChange({ kind, ...(criterion?.value !== undefined ? { value: criterion.value } : {}) });
        }}
      />

      {criterion ? (
        <>
          <NumberField
            size="sm"
            id="criterionValue"
            label="Valeur du repère"
            hint="Dans la même unité que la définition ci-dessus, sinon la comparaison ne veut rien dire."
            value={criterion.value ?? null}
            onChange={(value) => patch({ value: value ?? undefined })}
            locale="fr"
            parseError={FORM_COPY.notANumber}
          />

          {groups.includes("provenance") ? (
            <div className={styles.fieldGroup} data-testid="criterion-provenance">
              <TextField
                size="sm"
                id="criterionSource"
                label="Source"
                hint="Le rapport nommé et son année — « le marché dit 3 % » n'est pas opposable."
                value={criterion.source ?? ""}
                onChange={(source) => patch({ source: source || undefined })}
              />
              <TextField
                size="sm"
                id="criterionPopulation"
                label="Population du repère"
                hint="Sur qui il porte. Un médian SaaS tous segments confondus ne compare rien."
                value={criterion.population ?? ""}
                onChange={(population) => patch({ population: population || undefined })}
              />
              <div className={styles.observationRow}>
                <NumberField
                  size="sm"
                  id="criterionN"
                  label="Taille de l'échantillon (n)"
                  value={criterion.n ?? null}
                  onChange={(n) => patch({ n: n ?? undefined })}
                  locale="fr"
                  parseError={FORM_COPY.notANumber}
                />
                <NumberField
                  size="sm"
                  id="criterionYear"
                  label="Année"
                  value={criterion.year ?? null}
                  onChange={(year) => patch({ year: year ?? undefined })}
                  locale="fr"
                  parseError={FORM_COPY.notANumber}
                />
              </div>
            </div>
          ) : null}

          {groups.includes("comparability") ? (
            <Field
              size="sm"
              id="criterionDefinition"
              label="Définition du repère"
              hint="Comment LE REPÈRE est calculé. Un churn médian ne dit rien tant qu'on ne sait pas s'il est logo ou revenu — et c'est le piège le plus fréquent d'une comparaison."
            >
              {({ id: controlId, describedBy }) => (
                <TextArea
                  id={controlId}
                  aria-describedby={describedBy}
                  value={criterion.definition ?? ""}
                  onChange={(definition) => patch({ definition: definition || undefined })}
                  maxLength={300}
                />
              )}
            </Field>
          ) : null}

          {groups.includes("argument") ? (
            <Field
              size="sm"
              id="criterionJustification"
              label="Argument"
              hint="Requis. Ce qui rend ce seuil défendable en réunion : pas « c'est la norme », mais ce qui se passe en dessous."
              missing={missing.length ? CRITERION_ARGUMENT_MISSING : undefined}
            >
              {({ id: controlId, describedBy }) => (
                <TextArea
                  id={controlId}
                  aria-describedby={describedBy}
                  value={criterion.justification ?? ""}
                  onChange={(justification) => patch({ justification: justification || undefined })}
                  maxLength={400}
                />
              )}
            </Field>
          ) : null}

          {weak.length ? (
            <p className={styles.muted} data-testid="criterion-weak">
              Repère sans {weak.join(", ")}. Le fichier l&apos;accepte — une réunion, moins.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
