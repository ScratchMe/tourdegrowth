"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { TextArea } from "@/components/core/TextArea";
import { briefBudget } from "@/lib/audit/finding-draft";
import { canMarkHeadline, headlineCount, isPromotable } from "@/lib/audit/findings";
import { applicableRows, HEADLINE_CAP, type Brief, type Finding, type Mission, type Pass } from "@/lib/audit/schema";
import { Field } from "./_ui/Field";
import { GAP_LABELS } from "./labels";
import styles from "./page.module.css";

/**
 * L'écran des constats, et le bloc de tête.
 *
 * **Seules les lignes promouvables** (`isPromotable` : un repère ET une
 * décision en jeu) peuvent devenir un constat. Sans repère un nombre reste un
 * nombre et se range en annexe ; sans décision en jeu il est intéressant et
 * ne fait rien bouger. La liste montre donc les deux : ce qui est prêt, et
 * combien de lignes n'y sont pas — c'est cette seconde moitié qui dit ce
 * qu'il reste à faire avant de rédiger.
 *
 * **La rareté est structurelle, pas une consigne.** La bascule « à la une »
 * se grise d'elle-même au plafond (`canMarkHeadline`), et marquer une
 * seconde priorité démarque la première — l'écran le MONTRE (la première
 * cesse d'être marquée sous les yeux) plutôt que de l'expliquer dans une
 * phrase que personne ne lit.
 *
 * **Le bloc de tête a un budget de mots sur l'ENSEMBLE**, pas par champ : le
 * §4.1 du readout donne 400 mots au bloc entier. Ce qui dépasse est montré
 * comme ce qui basculera en annexe, jamais coupé — un texte tronqué en
 * silence dans un livrable est la pire des issues.
 */
export function FindingsView({
  mission,
  pass,
  onNewFinding,
  onOpenFinding,
  onToggleHeadline,
  onSetPriority,
  onBriefChange,
  onClose,
}: {
  mission: Mission;
  pass: Pass;
  onNewFinding: (metricIds: string[]) => void;
  onOpenFinding: (id: string) => void;
  onToggleHeadline: (id: string) => void;
  onSetPriority: (id: string) => void;
  onBriefChange: (brief: Brief) => void;
  onClose: () => void;
}) {
  const rows = applicableRows(mission.catalog, mission.header.profile.model);
  const nameOf = (metricId: string) => rows.find((row) => row.id === metricId)?.name ?? metricId;
  /**
   * Le dénominateur compte les lignes que l'auditeur a REELLEMENT traitées,
   * pas `pass.entries.length` : `newPass` sème d'office une entrée
   * `not-applicable` pour chaque ligne hors profil, et les inclure ferait
   * lire « 1 sur 15 renseignées » à quelqu'un qui n'en a rempli qu'une.
   */
  const applicableIds = new Set(rows.map((row) => row.id));
  const addressed = pass.entries.filter((entry) => applicableIds.has(entry.metricId));
  const promotable = addressed.filter(isPromotable);
  const referenced = new Set(pass.findings.flatMap((f) => f.refs.map((ref) => ref.metricId)));
  const marked = headlineCount(pass.findings);
  const budget = briefBudget(pass.brief);

  return (
    <section className={styles.screen} data-testid="findings-screen">
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Constats</h2>
        <Button compact variant="secondary" onClick={onClose} data-testid="close-findings">
          Retour
        </Button>
      </div>

      <p className={styles.muted}>
        Une ligne ne devient un constat qu&apos;avec un repère et une décision en jeu. {promotable.length} sur {addressed.length} lignes
        renseignées le sont aujourd&apos;hui.
      </p>

      <p className={styles.counters} data-testid="headline-count">
        {marked} sur {HEADLINE_CAP} à la une{pass.findings.some((f) => f.priority) ? " · une action prioritaire" : " · aucune action prioritaire"}
      </p>

      {pass.findings.length > 0 ? (
        <ul className={styles.rowList} data-testid="finding-list">
          {pass.findings.map((finding) => (
            <FindingRow
              key={finding.id}
              finding={finding}
              nameOf={nameOf}
              canHeadline={canMarkHeadline(pass.findings, finding.id)}
              onOpen={() => onOpenFinding(finding.id)}
              onToggleHeadline={() => onToggleHeadline(finding.id)}
              onSetPriority={() => onSetPriority(finding.id)}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.muted} data-testid="no-findings">
          Aucun constat pour l&apos;instant.
        </p>
      )}

      <div className={styles.restitutionGroup}>
        <MetaLabel size="xs" wide>
          Lignes promouvables
        </MetaLabel>
        {promotable.length === 0 ? (
          <p className={styles.muted} data-testid="none-promotable">
            Aucune ligne n&apos;a encore à la fois un repère et une décision en jeu.
          </p>
        ) : (
          <ul className={styles.rowList} data-testid="promotable-list">
            {promotable.map((entry) => (
              <li key={entry.metricId}>
                <Card elevation="panel" className={styles.rowItem} data-testid={`promotable-${entry.metricId}`}>
                  <div className={styles.rowMain}>
                    <p className={styles.rowName}>{nameOf(entry.metricId)}</p>
                    <p className={styles.rowStatus}>
                      {referenced.has(entry.metricId) ? "Déjà référencée par un constat" : "Prête à devenir un constat"}
                    </p>
                  </div>
                  <Button
                    compact
                    variant="secondary"
                    onClick={() => onNewFinding([entry.metricId])}
                    data-testid={`promote-${entry.metricId}`}
                  >
                    Nouveau constat
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card elevation="panel" className={styles.form} data-testid="brief-form">
        <MetaLabel size="xs" wide>
          Bloc de tête
        </MetaLabel>
        <p className={styles.muted}>Le constat principal, UNE action, la preuve. Jamais la méthode.</p>

        <Field label="Constat principal" htmlFor="brief-main">
          <TextArea
            id="brief-main"
            label="Constat principal"
            value={pass.brief.mainFinding}
            onChange={(mainFinding) => onBriefChange({ ...pass.brief, mainFinding })}
            maxLength={1200}
            data-testid="brief-main"
          />
        </Field>
        <Field label="Action prioritaire" htmlFor="brief-action">
          <TextArea
            id="brief-action"
            label="Action prioritaire"
            value={pass.brief.priorityAction}
            onChange={(priorityAction) => onBriefChange({ ...pass.brief, priorityAction })}
            maxLength={600}
            data-testid="brief-action"
          />
        </Field>
        <Field label="La preuve" htmlFor="brief-proof">
          <TextArea
            id="brief-proof"
            label="La preuve"
            value={pass.brief.proof}
            onChange={(proof) => onBriefChange({ ...pass.brief, proof })}
            maxLength={600}
            data-testid="brief-proof"
          />
        </Field>

        <p className={budget.over ? styles.quadrantAlert : styles.counters} data-testid="brief-budget">
          {budget.words} mots sur {budget.budget}
        </p>
        {budget.over ? (
          <div data-testid="brief-overflow">
            <p className={styles.muted}>
              Ce qui dépasse basculera en annexe — rien n&apos;est coupé, c&apos;est à toi de raccourcir :
            </p>
            <p className={styles.rowStatus}>{budget.overflow}</p>
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function FindingRow({
  finding,
  nameOf,
  canHeadline,
  onOpen,
  onToggleHeadline,
  onSetPriority,
}: {
  finding: Finding;
  nameOf: (metricId: string) => string;
  canHeadline: boolean;
  onOpen: () => void;
  onToggleHeadline: () => void;
  onSetPriority: () => void;
}) {
  return (
    <li>
      <Card elevation="panel" className={styles.rowItem} data-testid={`finding-${finding.id}`}>
        <div className={styles.rowMain}>
          <MetaLabel size="xs" wide tone={finding.priority ? "alert" : "muted"}>
            {finding.priority ? "Action prioritaire" : finding.headline ? "À la une" : GAP_LABELS[finding.gap].split(" — ")[0]}
          </MetaLabel>
          <p className={styles.rowName}>{finding.title || "Sans titre"}</p>
          <p className={styles.rowStatus} data-testid={`finding-refs-${finding.id}`}>
            {finding.refs.map((ref) => nameOf(ref.metricId)).join(" · ")}
          </p>
        </div>
        <div className={styles.viewSwitch}>
          <Button
            compact
            variant="secondary"
            onClick={onToggleHeadline}
            data-testid={`headline-${finding.id}`}
            // Grisée au plafond plutôt que masquée : l'auditeur doit voir
            // qu'il en a huit, pas chercher où le bouton est passé.
            {...(finding.headline || canHeadline ? {} : { disabled: true })}
          >
            {finding.headline ? "Retirer de la une" : "À la une"}
          </Button>
          <Button
            compact
            variant="secondary"
            onClick={onSetPriority}
            data-testid={`priority-${finding.id}`}
            {...(finding.priority ? { disabled: true } : {})}
          >
            Action prioritaire
          </Button>
          <Button compact variant="secondary" onClick={onOpen} data-testid={`open-finding-${finding.id}`}>
            Ouvrir
          </Button>
        </div>
      </Card>
    </li>
  );
}
