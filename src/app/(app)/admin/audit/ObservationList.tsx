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
  type ValueStatus,
} from "@/lib/audit/schema";
import { Field } from "@/components/core/Field";
import { NumberField } from "@/components/core/NumberField";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { IsoDateField } from "./IsoDateField";
import { MatrixEditor, blankMatrix } from "./MatrixEditor";
import {
  CONFIDENCE_LABELS,
  OBSERVATION_GAP_TEXT,
  OBTAINED_HOW_LABELS,
  PERIOD_TYPE_LABELS,
  SOURCE_KIND_LABELS,
  optionsFrom,
  FORM_COPY,
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
            <IsoDateField
              id={`obs-${index}-start`}
              label="Début de période"
              value={observation.periodStart}
              onChange={(periodStart) => patch(index, { periodStart })}
            />
            <IsoDateField
              id={`obs-${index}-end`}
              label="Fin de période"
              value={observation.periodEnd}
              onChange={(periodEnd) => patch(index, { periodEnd })}
            />
            <Select
              size="sm"
              id={`obs-${index}-type`}
              label="Type de période"
              value={observation.periodType}
              options={optionsFrom(PERIOD_TYPES, PERIOD_TYPE_LABELS)}
              onChange={(periodType) => periodType && patch(index, { periodType })}
            />
          </div>

          <ValueField editor={editor} index={index} value={observation.value} onChange={(value) => patch(index, { value })} />

          <div className={styles.observationRow}>
            <TextField
              size="sm"
              id={`obs-${index}-system`}
              label="Système source"
              hint="Le système NOMMÉ : Stripe, Salesforce, le tableur de la finance."
              value={observation.sourceSystem ?? ""}
              onChange={(sourceSystem) => patch(index, { sourceSystem: sourceSystem || undefined })}
            />
            <Select
              size="sm"
              id={`obs-${index}-kind`}
              label="Sorte de source"
              hint="Du plus fiable au moins fiable. C'est cette valeur que la confiance lit."
              value={observation.sourceKind}
              options={optionsFrom(SOURCE_KINDS, SOURCE_KIND_LABELS)}
              onChange={(sourceKind) => sourceKind && patch(index, { sourceKind })}
            />
            <Select
              size="sm"
              id={`obs-${index}-how`}
              label="Comment obtenu"
              value={observation.obtainedHow}
              options={optionsFrom(OBTAINED_HOW, OBTAINED_HOW_LABELS)}
              onChange={(obtainedHow) => obtainedHow && patch(index, { obtainedHow })}
            />
          </div>

          <div className={styles.observationRow}>
            <TextField
              size="sm"
              id={`obs-${index}-role`}
              label="Rôle du fournisseur"
              hint="Un RÔLE, jamais un nom : « le DAF », pas « Sophie ». Un livrable ne désigne personne."
              value={observation.providedByRole ?? ""}
              onChange={(providedByRole) => patch(index, { providedByRole: providedByRole || undefined })}
            />
            <IsoDateField
              id={`obs-${index}-asof`}
              label="Tiré le"
              hint="La date à laquelle le chiffre a été sorti, DISTINCTE de la fin de période : un mois d'août tiré le 2 septembre n'a pas fini de bouger."
              value={observation.asOf}
              onChange={(asOf) => patch(index, { asOf })}
            />
            <NumberField
              size="sm"
              id={`obs-${index}-lag`}
              label="Délai de stabilisation (jours)"
              hint="Facultatif. Combien de jours après la clôture le chiffre ne bouge plus."
              value={observation.freshnessLagDays ?? null}
              onChange={(freshnessLagDays) => patch(index, { freshnessLagDays: freshnessLagDays ?? undefined })}
              locale="fr"
              parseError={FORM_COPY.notANumber}
            />
          </div>

          {observations.length > 1 ? (
            <Select
              size="sm"
              id={`obs-${index}-contradicts`}
              label="Contredit"
              hint="Deux chiffres du même créneau qui ne disent pas la même chose : le lien entre eux EST le constat."
              value={observation.contradicts ?? ""}
              placeholder="— aucune —"
              options={observations
                .map((other, i) => ({ other, i }))
                .filter(({ i }) => i !== index)
                .map(({ other, i }) => ({ value: other.id, label: `Observation ${i + 1}${other.sourceSystem ? ` — ${other.sourceSystem}` : ""}` }))}
              onChange={(contradicts) => patch(index, { contradicts: contradicts || undefined })}
            />
          ) : null}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChange(observations.filter((_, i) => i !== index))}
            data-testid={`remove-observation-${index}`}
          >
            Retirer cette observation
          </Button>
        </Card>
      ))}

      <Button size="sm" variant="secondary" onClick={() => onChange([...observations, blankObservation()])} data-testid="add-observation">
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
  const hint = "Laisser vide tant que le chiffre n'est pas reçu : une observation sans valeur est une demande en cours, pas une absence.";

  if (editor === "number") {
    return (
      <NumberField
        size="sm"
        id={`obs-${index}-value`}
        label="Valeur"
        hint={hint}
        value={typeof value === "number" ? value : null}
        onChange={onChange}
        locale="fr"
        parseError={FORM_COPY.notANumber}
      />
    );
  }
  if (editor === "text") {
    return (
      <Field
        size="sm"
        id={`obs-${index}-value`}
        label="Valeur"
        hint="Ce que l'entreprise dit, dans ses mots. Cette ligne se répond en une phrase, pas en un nombre."
      >
        {({ id: controlId, describedBy }) => (
          <TextArea
            id={controlId}
            aria-describedby={describedBy}
            value={typeof value === "string" ? value : ""}
            onChange={(next) => onChange(next || null)}
            maxLength={400}
          />
        )}
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
