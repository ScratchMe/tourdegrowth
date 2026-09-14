"use client";

import { Button } from "@/components/core/Button";
import { TextArea } from "@/components/core/TextArea";
import { MANDATE_LEVELS, type Entry, type Exposure, type MandateLevel, type Tracking } from "@/lib/audit/schema";
import { chaseState } from "@/lib/audit/tracking";
import { DateInput } from "./_ui/DateInput";
import { Field } from "./_ui/Field";
import { NumberInput } from "./_ui/NumberInput";
import { Select } from "./_ui/Select";
import { TextInput } from "./_ui/TextInput";
import { CHASE_STATE_LABELS, MANDATE_LEVEL_LABELS, optionsFrom } from "./labels";
import styles from "./page.module.css";

/**
 * Ce qui entoure la valeur : la décision en jeu, l'exposition chiffrée, la
 * gouvernance de la ligne, et le pilotage de la demande.
 *
 * Les quatre s'appliquent à **tous** les statuts, y compris `absent` — c'est
 * même là qu'ils portent le plus : une ligne que l'entreprise n'a pas, dont
 * personne n'est propriétaire et qui n'a jamais servi dans une décision est
 * le constat type de cet outil.
 */
export function ContextEditor({
  entry,
  defaultDecision,
  today,
  onChange,
}: {
  entry: Entry;
  /** La décision que le catalogue attache à cette ligne — jamais saisie à la main la première fois. */
  defaultDecision: string | undefined;
  today: string;
  onChange: (next: Partial<Entry>) => void;
}) {
  const tracking = entry.tracking ?? {};
  const state = chaseState(entry.tracking, today);

  function patchTracking(next: Partial<Tracking>) {
    onChange({ tracking: { ...tracking, ...next } });
  }

  function patchExposure(next: Partial<Exposure>) {
    const base: Exposure = entry.exposure ?? { inputs: [], calculation: "", range: "" };
    onChange({ exposure: { ...base, ...next } });
  }

  const inputs = entry.exposure?.inputs ?? [];

  return (
    <div className={styles.fieldGroup} data-testid="context-fields">
      <Field
        label="La décision en jeu"
        htmlFor="decisionAtStake"
        hint="Vide, la ligne n'entre pas dans la grille des constats. C'est ce qui sépare un chiffre intéressant d'un chiffre qui fait bouger quelque chose."
      >
        <TextArea
          id="decisionAtStake"
          label="La décision en jeu"
          value={entry.decisionAtStake ?? ""}
          onChange={(decisionAtStake) => onChange({ decisionAtStake: decisionAtStake || undefined })}
          maxLength={400}
        />
      </Field>
      {defaultDecision && !entry.decisionAtStake ? (
        <Button
          compact
          variant="secondary"
          onClick={() => onChange({ decisionAtStake: defaultDecision })}
          data-testid="use-catalog-decision"
        >
          Reprendre celle de la fiche
        </Button>
      ) : null}

      <Field
        label="Écart à la convention canonique"
        htmlFor="canonicalDeviation"
        hint="Ce que le glossaire appelle cette métrique, moins ce que l'entreprise en fait. Souvent un constat à lui seul."
      >
        <TextArea
          id="canonicalDeviation"
          label="Écart à la convention canonique"
          value={entry.canonicalDeviation ?? ""}
          onChange={(canonicalDeviation) => onChange({ canonicalDeviation: canonicalDeviation || undefined })}
          maxLength={400}
        />
      </Field>

      <div className={styles.observationRow}>
        <Field label="Propriétaire (rôle)" htmlFor="ownerRole" hint="Un RÔLE, jamais un nom. « Personne » est une réponse, et souvent la bonne.">
          <TextInput id="ownerRole" value={entry.ownerRole ?? ""} onChange={(ownerRole) => onChange({ ownerRole: ownerRole || undefined })} />
        </Field>
        <Field
          label="Dernière fois qu'elle a servi dans une décision"
          htmlFor="lastReviewedInADecision"
          hint="« Jamais » compte, et se dit. Un chiffre produit tous les mois que personne ne regarde est une dépense, pas une mesure."
        >
          <TextInput
            id="lastReviewedInADecision"
            value={entry.lastReviewedInADecision ?? ""}
            onChange={(value) => onChange({ lastReviewedInADecision: value || undefined })}
          />
        </Field>
      </div>

      <div className={styles.fieldGroup} data-testid="exposure-fields">
        <p className={styles.muted}>
          <strong>Exposition</strong> — uniquement des chiffres que l&apos;entreprise a fournis (budget, volume, ticket moyen), jamais un taux
          estimé. C&apos;est ce qui rend un constat chiffrable sans rien inventer.
        </p>
        {inputs.map((input, index) => (
          <div key={index} className={styles.observationRow}>
            <Field label="Libellé" htmlFor={`exposure-${index}-label`}>
              <TextInput
                id={`exposure-${index}-label`}
                value={input.label}
                onChange={(label) => patchExposure({ inputs: inputs.map((it, i) => (i === index ? { ...it, label } : it)) })}
              />
            </Field>
            <Field label="Valeur" htmlFor={`exposure-${index}-value`}>
              <NumberInput
                id={`exposure-${index}-value`}
                value={input.value}
                onChange={(value) => patchExposure({ inputs: inputs.map((it, i) => (i === index ? { ...it, value: value ?? 0 } : it)) })}
              />
            </Field>
            <Field label="Fourni par" htmlFor={`exposure-${index}-source`} hint="Qui a donné ce chiffre, et d'où il sort.">
              <TextInput
                id={`exposure-${index}-source`}
                value={input.source}
                onChange={(source) => patchExposure({ inputs: inputs.map((it, i) => (i === index ? { ...it, source } : it)) })}
              />
            </Field>
          </div>
        ))}
        <Button
          compact
          variant="secondary"
          onClick={() => patchExposure({ inputs: [...inputs, { label: "", value: 0, source: "" }] })}
          data-testid="add-exposure-input"
        >
          Ajouter un chiffre fourni
        </Button>
        <Field label="Calcul" htmlFor="exposureCalculation" hint="Écrit en toutes lettres, pour qu'il se refasse en séance.">
          <TextArea
            id="exposureCalculation"
            label="Calcul"
            value={entry.exposure?.calculation ?? ""}
            onChange={(calculation) => patchExposure({ calculation })}
            maxLength={400}
          />
        </Field>
        <Field label="Fourchette" htmlFor="exposureRange" hint="Une fourchette, jamais un chiffre unique : c'est une estimation et elle doit le dire.">
          <TextInput id="exposureRange" value={entry.exposure?.range ?? ""} onChange={(range) => patchExposure({ range })} />
        </Field>
      </div>

      <div className={styles.fieldGroup} data-testid="tracking-fields">
        <div className={styles.observationHead}>
          <p className={styles.muted}>
            <strong>Pilotage</strong> — sert à savoir quoi relancer. Ne s&apos;imprime jamais dans un constat.
          </p>
          <span className={styles.muted} data-testid="chase-state">
            {CHASE_STATE_LABELS[state]}
          </span>
        </div>
        <div className={styles.observationRow}>
          <Field label="Demandé le" htmlFor="requestedOn">
            <DateInput id="requestedOn" value={tracking.requestedOn ?? ""} onChange={(requestedOn) => patchTracking({ requestedOn: requestedOn || undefined })} />
          </Field>
          <Field label="Relancé le" htmlFor="chasedOn" hint="Remet le compteur à zéro : une ligne relancée hier n'est pas à relancer aujourd'hui.">
            <DateInput id="chasedOn" value={tracking.chasedOn ?? ""} onChange={(chasedOn) => patchTracking({ chasedOn: chasedOn || undefined })} />
          </Field>
          <Field label="Reçu le" htmlFor="receivedOn">
            <DateInput id="receivedOn" value={tracking.receivedOn ?? ""} onChange={(receivedOn) => patchTracking({ receivedOn: receivedOn || undefined })} />
          </Field>
        </div>
        <div className={styles.observationRow}>
          <Field label="Adressée à (rôle)" htmlFor="routedTo" hint="Groupe la vue collecte : préparer une réunion plutôt que parcourir 25 lignes.">
            <TextInput id="routedTo" value={tracking.routedTo ?? ""} onChange={(routedTo) => patchTracking({ routedTo: routedTo || undefined })} />
          </Field>
          <Field
            label="Ce qui débloquerait"
            htmlFor="mandateLevel"
            hint="Politique, jamais technique : le CAC chargé est trivial à calculer et demande souvent un directeur."
          >
            <Select
              id="mandateLevel"
              value={tracking.mandateLevel ?? "none"}
              options={optionsFrom(MANDATE_LEVELS, MANDATE_LEVEL_LABELS)}
              onChange={(mandateLevel: MandateLevel) => patchTracking({ mandateLevel })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
