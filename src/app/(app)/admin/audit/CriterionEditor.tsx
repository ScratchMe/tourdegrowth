"use client";

import { TextArea } from "@/components/core/TextArea";
import { CRITERION_KINDS, type Criterion, type CriterionKind } from "@/lib/audit/schema";
import { criterionFieldGroups, missingCriterionFields, weakProvenance } from "@/lib/audit/criterion-fields";
import { Field } from "./_ui/Field";
import { NumberInput } from "./_ui/NumberInput";
import { Select } from "./_ui/Select";
import { TextInput } from "./_ui/TextInput";
import { CRITERION_KIND_LABELS, optionsFrom } from "./labels";
import styles from "./page.module.css";

/**
 * Le repère auquel la valeur se compare.
 *
 * Deux niveaux d'exigence, volontairement distincts et affichés
 * différemment : l'**argument** d'un seuil argumenté est ce que le validateur
 * refusera (q5), en rouge ; la **provenance** d'un repère public est du
 * conseil, en gris. Confondre les deux ferait bloquer sur ce qui n'est pas
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
      <Field
        label="Sorte de repère"
        htmlFor="criterionKind"
        hint="Sans repère, un chiffre n'est ni bon ni mauvais — il est juste là. Facultatif : une ligne peut être relevée sans qu'on ait de quoi la juger."
      >
        <Select
          id="criterionKind"
          value={criterion?.kind ?? ("" as CriterionKind)}
          options={[{ id: "" as CriterionKind, label: "— aucun repère —" }, ...optionsFrom(CRITERION_KINDS, CRITERION_KIND_LABELS)]}
          onChange={(kind) => {
            if (!kind) return onChange(undefined);
            // Le changement de sorte GARDE la valeur et jette ce qui n'a plus
            // de sens : une justification collée à un repère public partirait
            // telle quelle dans le fichier sans que rien ne l'affiche.
            onChange({ kind, ...(criterion?.value !== undefined ? { value: criterion.value } : {}) });
          }}
        />
      </Field>

      {criterion ? (
        <>
          <Field label="Valeur du repère" htmlFor="criterionValue" hint="Dans la même unité que la définition ci-dessus, sinon la comparaison ne veut rien dire.">
            <NumberInput id="criterionValue" value={criterion.value ?? null} onChange={(value) => patch({ value: value ?? undefined })} />
          </Field>

          {groups.includes("provenance") ? (
            <div className={styles.fieldGroup} data-testid="criterion-provenance">
              <Field label="Source" htmlFor="criterionSource" hint="Le rapport nommé et son année — « le marché dit 3 % » n'est pas opposable.">
                <TextInput id="criterionSource" value={criterion.source ?? ""} onChange={(source) => patch({ source: source || undefined })} />
              </Field>
              <Field label="Population du repère" htmlFor="criterionPopulation" hint="Sur qui il porte. Un médian SaaS tous segments confondus ne compare rien.">
                <TextInput id="criterionPopulation" value={criterion.population ?? ""} onChange={(population) => patch({ population: population || undefined })} />
              </Field>
              <div className={styles.observationRow}>
                <Field label="Taille de l'échantillon (n)" htmlFor="criterionN">
                  <NumberInput id="criterionN" value={criterion.n ?? null} onChange={(n) => patch({ n: n ?? undefined })} />
                </Field>
                <Field label="Année" htmlFor="criterionYear">
                  <NumberInput id="criterionYear" value={criterion.year ?? null} onChange={(year) => patch({ year: year ?? undefined })} />
                </Field>
              </div>
            </div>
          ) : null}

          {groups.includes("comparability") ? (
            <Field
              label="Définition du repère"
              htmlFor="criterionDefinition"
              hint="Comment LE REPÈRE est calculé. Un churn médian ne dit rien tant qu'on ne sait pas s'il est logo ou revenu — et c'est le piège le plus fréquent d'une comparaison."
            >
              <TextArea
                id="criterionDefinition"
                label="Définition du repère"
                value={criterion.definition ?? ""}
                onChange={(definition) => patch({ definition: definition || undefined })}
                maxLength={300}
              />
            </Field>
          ) : null}

          {groups.includes("argument") ? (
            <Field
              label="Argument"
              htmlFor="criterionJustification"
              hint="Requis. Ce qui rend ce seuil défendable en réunion : pas « c'est la norme », mais ce qui se passe en dessous."
            >
              <TextArea
                id="criterionJustification"
                label="Argument"
                value={criterion.justification ?? ""}
                onChange={(justification) => patch({ justification: justification || undefined })}
                maxLength={400}
              />
            </Field>
          ) : null}

          {missing.length ? (
            <p className={styles.alert} data-testid="criterion-missing">
              Un seuil argumenté porte son argument (q5) : sans lui, l&apos;export refusera cette ligne.
            </p>
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
