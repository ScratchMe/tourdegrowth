"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { TextArea } from "@/components/core/TextArea";
import type { AuditCatalogRow } from "@/content/audit-catalog";
import type { DefinitionDraft } from "@/lib/audit/definitions";
import { entryFieldGroups, selectableStatuses } from "@/lib/audit/entry-fields";
import { valueEditorFor } from "@/lib/audit/observation-fields";
import { Disclosure } from "@/components/core/Disclosure";
import {
  ABSENT_CAUSES,
  DEFAULT_ABSENT_CAUSE,
  REPAIR_SCALES,
  SYSTEM_CAUSES,
  VALUE_STATUSES,
  normalizeEntry,
  type AbsentCause,
  type Entry,
  type MetricDefinition,
  type RepairScale,
  type SystemCause,
  type ValueStatus,
} from "@/lib/audit/schema";
import { ContextEditor } from "./ContextEditor";
import { CriterionEditor } from "./CriterionEditor";
import { DefinitionEditor } from "./DefinitionEditor";
import { ObservationList } from "./ObservationList";
import { Field } from "./_ui/Field";
import { Select } from "./_ui/Select";
import {
  ABSENT_CAUSE_LABELS,
  REPAIR_SCALE_LABELS,
  SYSTEM_CAUSE_LABELS,
  VALUE_STATUS_HINTS,
  VALUE_STATUS_LABELS,
  optionsFrom,
} from "./labels";
import styles from "./page.module.css";

/**
 * L'éditeur d'une ligne, en deux colonnes : à gauche la fiche du catalogue
 * (ce que la ligne mesure, son piège, où la trouver, ce que son absence dit),
 * à droite la saisie.
 *
 * **La fiche est à gauche parce qu'elle est la raison d'être de l'outil.**
 * Un questionnaire de 25 lignes sans contexte se remplit au jugé ; ce sont
 * le piège et la décision en jeu qui font qu'une ligne est renseignée
 * correctement plutôt que vite.
 *
 * **Les champs visibles dérivent du statut** via `entryFieldGroups`, une
 * fonction pure testée contre le validateur : un champ montré au mauvais
 * statut laisserait saisir une donnée que l'export refuserait ensuite.
 *
 * Étape 1.3a : statut, absence (cause, coût de réparation, cause système) et
 * accès. Étape 1.3b : la définition versionnée, la série d'observations, puis
 * le repère, la décision en jeu, l'exposition, la gouvernance et le pilotage.
 *
 * **Le contexte s'applique à tous les statuts**, y compris `absent` — c'est
 * même là qu'il porte le plus : une ligne que l'entreprise n'a pas, dont
 * personne n'est propriétaire et qui n'a jamais servi dans une décision est
 * le constat type de cet outil. Il est replié parce qu'il est facultatif,
 * jamais masqué parce qu'il serait hors sujet.
 */
export function RowEditor({
  row,
  entry,
  definition,
  defaultScope,
  today,
  onChange,
  onClose,
}: {
  row: AuditCatalogRow;
  entry: Entry | undefined;
  /** La définition que l'entrée référence déjà, résolue par l'appelant. */
  definition: MetricDefinition | undefined;
  /** Le périmètre de la mission — le défaut d'une définition neuve, jamais vide. */
  defaultScope: string;
  /** La date du jour, en ISO — passée plutôt que lue, pour que l'état de relance soit testable. */
  today: string;
  onChange: (entry: Entry, definition?: DefinitionDraft) => void;
  onClose: () => void;
}) {
  // `undefined` tant que l'auditeur ne s'est pas prononcé : un statut n'est
  // jamais défauté, et une ligne pas encore examinée compte comme « en
  // attente », pas comme absente (cf. `coverage.ts`).
  const [draft, setDraft] = useState<Entry | undefined>(entry);
  /**
   * Le brouillon de définition, seedé depuis celle en vigueur quand il y en a
   * une. Il n'écrase JAMAIS l'enregistrement : `upsertDefinition`, appelé par
   * l'atelier en enregistrant, compare le contenu et décide s'il y a une
   * version à frapper. Fermer cet écran sans rien changer ne frappe rien.
   */
  const [definitionDraft, setDefinitionDraft] = useState<DefinitionDraft>(() => seedDefinition(row.id, definition, defaultScope));
  const groups = draft ? entryFieldGroups(draft.status) : [];

  function setStatus(status: ValueStatus) {
    const base: Entry = draft ?? { metricId: row.id, status, observations: [] };
    // `normalizeEntry` pose la cause par défaut en passant à `absent` et la
    // retire en en sortant — sinon une cause d'absence survivrait à un
    // changement de statut et partirait telle quelle dans le fichier.
    setDraft(normalizeEntry({ ...base, status }));
  }

  function patch(next: Partial<Entry>) {
    if (!draft) return;
    setDraft({ ...draft, ...next });
  }

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <div>
          <MetaLabel size="xs" wide>
            {row.id} · {row.tier} · {row.pillar}
          </MetaLabel>
          <h2 className={styles.h2}>{row.name}</h2>
        </div>
        <Button compact variant="secondary" onClick={onClose} data-testid="close-row">
          Retour à la collecte
        </Button>
      </div>

      <div className={styles.rowEditor}>
        <Card elevation="panel" className={styles.catalogCard} data-testid="catalog-card">
          <MetaLabel size="xs" wide>
            La fiche
          </MetaLabel>
          <p>{row.definition}</p>
          {row.trap ? <FicheBlock label="Le piège" text={row.trap} /> : null}
          {row.where ? <FicheBlock label="Où le trouver" text={row.where} /> : null}
          {row.decision ? <FicheBlock label="La décision en jeu" text={row.decision} /> : null}
          {row.absence ? <FicheBlock label="Ce que son absence dit" text={row.absence} /> : null}
          {row.why ? <FicheBlock label="Pourquoi cette ligne pour ce profil" text={row.why} /> : null}
          <p className={styles.muted}>Coût de collecte : {row.cost}</p>
        </Card>

        <Card elevation="panel" className={styles.form} data-testid="entry-form">
          <Field
            label="Statut"
            htmlFor="status"
            hint={draft ? VALUE_STATUS_HINTS[draft.status] : "Rien n'est présélectionné : une ligne pas encore examinée est « en attente », jamais absente."}
          >
            <Select
              id="status"
              value={draft?.status ?? ("" as ValueStatus)}
              options={[
                ...(draft ? [] : [{ id: "" as ValueStatus, label: "— pas encore examinée —" }]),
                ...optionsFrom(selectableStatuses(VALUE_STATUSES), VALUE_STATUS_LABELS),
              ]}
              onChange={(status) => {
                if (status) setStatus(status);
              }}
            />
          </Field>

          {groups.includes("absence") ? (
            <div className={styles.fieldGroup} data-testid="absence-fields">
              <Field label="Cause de l'absence" htmlFor="absentCause" hint="Le défaut est « pas encore établi » — on ne devine jamais un type d'absence qu'on n'a pas vérifié.">
                <Select
                  id="absentCause"
                  value={draft?.absentCause ?? DEFAULT_ABSENT_CAUSE}
                  options={optionsFrom(ABSENT_CAUSES, ABSENT_CAUSE_LABELS)}
                  onChange={(absentCause: AbsentCause) => patch({ absentCause })}
                />
              </Field>

              <Field
                label="Coût de réparation"
                htmlFor="repairScale"
                hint="Requis. Une échelle fermée, jamais un nombre d'heures : le catalogue porte un palier, pas une estimation."
              >
                <Select
                  id="repairScale"
                  value={draft?.repairCost?.scale ?? "sprint"}
                  options={optionsFrom(REPAIR_SCALES, REPAIR_SCALE_LABELS)}
                  onChange={(scale: RepairScale) => patch({ repairCost: { ...draft?.repairCost, scale } })}
                />
              </Field>

              {/*
                `TextArea`'s `label` is an ACCESSIBLE NAME only — it renders
                nothing on screen, by design (R-19: the visible heading lives
                in a QuestionCard above it on the quiz). Here there is no such
                heading, so without a `Field` wrapper the operator gets an
                unexplained box. Found on a screenshot, not in review.
              */}
              <Field label="Ce que réparer veut dire concrètement" htmlFor="repairComment" hint="Facultatif, et la partie la plus utile en entretien : « quoi », pas « combien de temps ».">
                <TextArea
                  id="repairComment"
                  label="Ce que réparer veut dire concrètement"
                  value={draft?.repairCost?.comment ?? ""}
                  onChange={(comment) =>
                    patch({ repairCost: { scale: draft?.repairCost?.scale ?? "sprint", ...(comment ? { comment } : {}) } })
                  }
                  maxLength={400}
                />
              </Field>

              <Field label="Cause système" htmlFor="systemCause" hint="Liste fermée, aucun champ libre : un livrable ne nomme jamais une personne.">
                <Select
                  id="systemCause"
                  value={draft?.systemCause ?? "no-owner"}
                  options={optionsFrom(SYSTEM_CAUSES, SYSTEM_CAUSE_LABELS)}
                  onChange={(systemCause: SystemCause) => patch({ systemCause })}
                />
              </Field>
            </div>
          ) : null}

          {draft && groups.includes("value") ? (
            <div className={styles.fieldGroup} data-testid="value-fields">
              <DefinitionEditor draft={definitionDraft} currentRef={draft.definitionRef} onChange={setDefinitionDraft} />
              {/*
                Les observations ne sont PAS repliées : sur une ligne qui a une
                valeur, elles sont le travail. Seuls les axes optionnels de la
                définition le sont, parce qu'ils sont facultatifs.
              */}
              <MetaLabel size="xs" wide>
                Observations
              </MetaLabel>
              <ObservationList
                status={draft.status}
                observations={draft.observations}
                editor={valueEditorFor(row.valueShape)}
                definition={definitionDraft}
                onChange={(observations) => patch({ observations })}
              />
              <CriterionEditor criterion={draft.criterion} onChange={(criterion) => patch({ criterion })} />
            </div>
          ) : null}

          {draft ? (
            <Disclosure summary="Décision, exposition, gouvernance, pilotage" data-testid="context-disclosure">
              <ContextEditor entry={draft} defaultDecision={row.decision} today={today} onChange={patch} />
            </Disclosure>
          ) : null}

          {groups.includes("access") ? (
            <p className={styles.muted} data-testid="access-fields">
              Le niveau de mandat qui débloquerait cette ligne se saisit à l&apos;étape 1.3b. Une ligne non accessible est un fait sur mon
              accès, jamais sur eux.
            </p>
          ) : null}

          <Button
            onClick={() => {
              // Le brouillon de définition n'est transmis que quand le statut
              // en demande une : une ligne absente n'a pas de définition à
              // frapper, et en poser une du seul fait qu'on a ouvert l'écran
              // enregistrerait du vide dans la mission.
              if (draft) onChange(draft, groups.includes("value") ? definitionDraft : undefined);
            }}
            data-testid="save-row"
            {...(draft ? {} : { disabled: true })}
          >
            Enregistrer cette ligne
          </Button>
        </Card>
      </div>
    </section>
  );
}

/**
 * Le brouillon de départ. Depuis la définition en vigueur quand il y en a une
 * — sans elle, rouvrir l'écran et enregistrer frapperait une version dont le
 * seul contenu serait les champs vides du formulaire.
 */
function seedDefinition(metricId: string, definition: MetricDefinition | undefined, defaultScope: string): DefinitionDraft {
  if (definition) {
    const { version: _version, ...rest } = definition;
    return rest;
  }
  return { metricId, unit: "", numeratorPopulation: "", denominatorPopulation: "", scope: defaultScope };
}

function FicheBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className={styles.ficheBlock}>
      <MetaLabel size="xs">{label}</MetaLabel>
      <p>{text}</p>
    </div>
  );
}
