"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { TextArea } from "@/components/core/TextArea";
import type { DefinitionDraft } from "@/lib/audit/definitions";
import { observationGaps, type ValueEditor } from "@/lib/audit/observation-fields";
import {
  OBTAINED_HOW,
  PERIOD_TYPES,
  SOURCE_KINDS,
  confidenceOf,
  type Matrix,
  type Observation,
  type ObtainedHow,
  type PeriodType,
  type SourceKind,
  type ValueStatus,
} from "@/lib/audit/schema";
import { MatrixEditor, blankMatrix } from "./MatrixEditor";
import { DateInput } from "./_ui/DateInput";
import { Field } from "./_ui/Field";
import { NumberInput } from "./_ui/NumberInput";
import { Select } from "./_ui/Select";
import { TextInput } from "./_ui/TextInput";
import {
  CONFIDENCE_LABELS,
  OBSERVATION_GAP_TEXT,
  OBTAINED_HOW_LABELS,
  PERIOD_TYPE_LABELS,
  SOURCE_KIND_LABELS,
  optionsFrom,
} from "./labels";
import styles from "./page.module.css";

/**
 * La série d'observations d'une ligne.
 *
 * **Une valeur est une série, jamais un scalaire** (AUDIT.md §3, décision 1) :
 * un NRR de 105 % stable et un NRR de 105 % qui descend de 120 % sont deux
 * entreprises. L'écran reflète ça — on ajoute des observations, on ne
 * remplace pas « la » valeur.
 *
 * Trois choses que cet écran tient et qu'un formulaire ordinaire n'aurait
 * pas :
 *
 * 1. **La date de tirage (`asOf`) est distincte de la fin de période.** Un
 *    chiffre d'août tiré le 2 septembre et le même tiré le 30 ne valent pas
 *    pareil — les remboursements et les impayés n'ont pas fini de tomber.
 * 2. **La confiance est DÉRIVÉE et affichée, jamais saisie.** `confidenceOf`
 *    lit la sorte de source et la complétude de la définition. Une case
 *    « confiance : haute » remplie au ressenti ne se défend pas en réunion.
 * 3. **`contradicts` pointe vers une autre observation de la même ligne.**
 *    Deux MRR qui divergent ne sont pas un problème de collecte, c'est le
 *    constat — et le lien entre les deux est ce qui permettra de l'écrire.
 */
export function ObservationList({
  status,
  observations,
  editor,
  definition,
  onChange,
}: {
  status: ValueStatus;
  observations: Observation[];
  editor: ValueEditor;
  /** Le brouillon de définition en cours — `confidenceOf` n'en lit que la complétude. */
  definition: DefinitionDraft;
  onChange: (observations: Observation[]) => void;
}) {
  const gaps = observationGaps(status, observations);

  function patch(index: number, next: Partial<Observation>) {
    onChange(observations.map((obs, i) => (i === index ? { ...obs, ...next } : obs)));
  }

  return (
    <div className={styles.fieldGroup} data-testid="observation-list">
      {gaps.length ? (
        <p className={styles.alert} data-testid="observation-gaps">
          {gaps.map((gap) => OBSERVATION_GAP_TEXT[gap]).join(" ")}
        </p>
      ) : null}

      {observations.map((observation, index) => (
        <Card key={observation.id} elevation="panel" className={styles.observation} data-testid={`observation-${index}`}>
          <div className={styles.observationHead}>
            <MetaLabel size="xs" wide>
              Observation {index + 1}
            </MetaLabel>
            <span className={styles.muted} data-testid={`confidence-${index}`}>
              {CONFIDENCE_LABELS[confidenceOf(observation, definition)]}
            </span>
          </div>

          <div className={styles.observationRow}>
            <Field label="Début de période" htmlFor={`obs-${index}-start`}>
              <DateInput id={`obs-${index}-start`} value={observation.periodStart} onChange={(periodStart) => patch(index, { periodStart })} />
            </Field>
            <Field label="Fin de période" htmlFor={`obs-${index}-end`}>
              <DateInput id={`obs-${index}-end`} value={observation.periodEnd} onChange={(periodEnd) => patch(index, { periodEnd })} />
            </Field>
            <Field label="Type de période" htmlFor={`obs-${index}-type`}>
              <Select
                id={`obs-${index}-type`}
                value={observation.periodType}
                options={optionsFrom(PERIOD_TYPES, PERIOD_TYPE_LABELS)}
                onChange={(periodType: PeriodType) => patch(index, { periodType })}
              />
            </Field>
          </div>

          <ValueField editor={editor} index={index} value={observation.value} onChange={(value) => patch(index, { value })} />

          <div className={styles.observationRow}>
            <Field label="Système source" htmlFor={`obs-${index}-system`} hint="Le système NOMMÉ : Stripe, Salesforce, le tableur de la finance.">
              <TextInput
                id={`obs-${index}-system`}
                value={observation.sourceSystem ?? ""}
                onChange={(sourceSystem) => patch(index, { sourceSystem: sourceSystem || undefined })}
              />
            </Field>
            <Field label="Sorte de source" htmlFor={`obs-${index}-kind`} hint="Du plus fiable au moins fiable. C'est cette valeur que la confiance lit.">
              <Select
                id={`obs-${index}-kind`}
                value={observation.sourceKind}
                options={optionsFrom(SOURCE_KINDS, SOURCE_KIND_LABELS)}
                onChange={(sourceKind: SourceKind) => patch(index, { sourceKind })}
              />
            </Field>
            <Field label="Comment obtenu" htmlFor={`obs-${index}-how`}>
              <Select
                id={`obs-${index}-how`}
                value={observation.obtainedHow}
                options={optionsFrom(OBTAINED_HOW, OBTAINED_HOW_LABELS)}
                onChange={(obtainedHow: ObtainedHow) => patch(index, { obtainedHow })}
              />
            </Field>
          </div>

          <div className={styles.observationRow}>
            <Field label="Rôle du fournisseur" htmlFor={`obs-${index}-role`} hint="Un RÔLE, jamais un nom : « le DAF », pas « Sophie ». Un livrable ne désigne personne.">
              <TextInput
                id={`obs-${index}-role`}
                value={observation.providedByRole ?? ""}
                onChange={(providedByRole) => patch(index, { providedByRole: providedByRole || undefined })}
              />
            </Field>
            <Field
              label="Tiré le"
              htmlFor={`obs-${index}-asof`}
              hint="La date à laquelle le chiffre a été sorti, DISTINCTE de la fin de période : un mois d'août tiré le 2 septembre n'a pas fini de bouger."
            >
              <DateInput id={`obs-${index}-asof`} value={observation.asOf} onChange={(asOf) => patch(index, { asOf })} />
            </Field>
            <Field
              label="Délai de stabilisation (jours)"
              htmlFor={`obs-${index}-lag`}
              hint="Facultatif. Combien de jours après la clôture le chiffre ne bouge plus."
            >
              <NumberInput
                id={`obs-${index}-lag`}
                value={observation.freshnessLagDays ?? null}
                onChange={(freshnessLagDays) => patch(index, { freshnessLagDays: freshnessLagDays ?? undefined })}
              />
            </Field>
          </div>

          {observations.length > 1 ? (
            <Field
              label="Contredit"
              htmlFor={`obs-${index}-contradicts`}
              hint="Deux chiffres du même créneau qui ne disent pas la même chose : le lien entre eux EST le constat."
            >
              <Select
                id={`obs-${index}-contradicts`}
                value={observation.contradicts ?? ""}
                options={[
                  { id: "", label: "— aucune —" },
                  ...observations
                    .map((other, i) => ({ other, i }))
                    .filter(({ i }) => i !== index)
                    .map(({ other, i }) => ({ id: other.id, label: `Observation ${i + 1}${other.sourceSystem ? ` — ${other.sourceSystem}` : ""}` })),
                ]}
                onChange={(contradicts) => patch(index, { contradicts: contradicts || undefined })}
              />
            </Field>
          ) : null}

          <Button
            compact
            variant="secondary"
            onClick={() => onChange(observations.filter((_, i) => i !== index))}
            data-testid={`remove-observation-${index}`}
          >
            Retirer cette observation
          </Button>
        </Card>
      ))}

      <Button compact variant="secondary" onClick={() => onChange([...observations, blankObservation()])} data-testid="add-observation">
        Ajouter une observation
      </Button>
    </div>
  );
}

function ValueField({
  editor,
  index,
  value,
  onChange,
}: {
  editor: ValueEditor;
  index: number;
  value: Observation["value"];
  onChange: (value: Observation["value"]) => void;
}) {
  const hint = "Laisser vide tant que le chiffre n'est pas reçu : une observation sans valeur est une demande en cours, pas une absence.";

  if (editor === "number") {
    return (
      <Field label="Valeur" htmlFor={`obs-${index}-value`} hint={hint}>
        <NumberInput id={`obs-${index}-value`} value={typeof value === "number" ? value : null} onChange={onChange} />
      </Field>
    );
  }
  if (editor === "text") {
    return (
      <Field label="Valeur" htmlFor={`obs-${index}-value`} hint="Ce que l'entreprise dit, dans ses mots. Cette ligne se répond en une phrase, pas en un nombre.">
        <TextArea
          id={`obs-${index}-value`}
          label="Valeur"
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next || null)}
          maxLength={400}
        />
      </Field>
    );
  }
  return (
    <div className={styles.fieldGroup}>
      <MetaLabel size="xs" wide>
        Valeur
      </MetaLabel>
      {/*
        La matrice affichée avant toute saisie est LOCALE : elle n'est écrite
        dans l'observation qu'au premier changement. Sans ça, ajouter une
        observation poserait déjà une valeur (une matrice de cellules vides),
        et l'écran cesserait de dire « il manque une valeur » alors que rien
        n'a été relevé.
      */}
      <MatrixEditor
        id={`obs-${index}`}
        value={isMatrix(value) ? value : blankMatrix(editor === "row" ? 2 : 3, 1)}
        columnPlaceholder={editor === "row" ? "NRR" : "J30"}
        {...(editor === "row" ? { singleRow: true } : {})}
        onChange={onChange}
      />
    </div>
  );
}

function isMatrix(value: Observation["value"]): value is Matrix {
  return typeof value === "object" && value !== null && "columns" in value && "rows" in value;
}

/**
 * Une observation neuve. La valeur part à `null` — une observation sans
 * valeur est légitime (« demandé, pas encore reçu ») et le validateur
 * l'accepte ; ce qu'il refuse, c'est une ligne MESURÉE dont aucune
 * observation n'a de valeur.
 *
 * `null` **y compris pour les matrices**, alors que l'écran en affiche une
 * vide. Une matrice de cellules vides est une valeur du point de vue du
 * validateur (elle n'est pas `null`), donc la poser à la création ferait
 * taire l'avertissement « il manque une valeur » sur une ligne où rien n'a
 * été relevé. Trouvé en capture : le cas scalaire affichait bien
 * l'avertissement, le cas matrice non.
 *
 * Aucune date n'est pré-remplie : deviner un mois clos ferait enregistrer une
 * période que personne n'a choisie, et c'est exactement le genre de valeur
 * par défaut qui finit dans un livrable.
 */
export function blankObservation(): Observation {
  return {
    id: crypto.randomUUID(),
    periodStart: "",
    periodEnd: "",
    periodType: "month",
    value: null,
    sourceKind: "raw-extract-self",
    obtainedHow: "self-service",
    asOf: "",
  };
}
