"use client";

import { computeCoverage, formatFraction } from "@/lib/audit/coverage";
import { deliverableVocabulary } from "@/lib/audit/findings";
import type { Mission, Pass } from "@/lib/audit/schema";
import { Button } from "@/components/core/Button";
import styles from "./page.module.css";

/**
 * La barre présente sur tous les écrans d'une mission ouverte.
 *
 * Les compteurs sont TOUJOURS des fractions (`formatFraction`) : « 8 sur 25 »
 * et jamais « 32 % ». Un pourcentage sur 25 lignes donne une précision que
 * l'échantillon ne porte pas, et c'est la forme dans laquelle ce chiffre
 * s'imprime dans le livrable (AUDIT.md §4).
 *
 * Le titre est celui que le livrable prendrait AUJOURD'HUI
 * (`deliverableVocabulary`), donc le titre d'escalade apparaît de lui-même
 * dès que la couverture passe sous le tiers — l'auditeur voit le coût de
 * l'absence pendant qu'il collecte, pas au moment d'écrire.
 */
export function MissionBar({
  mission,
  pass,
  onExport,
  onExportPurged,
  onClose,
}: {
  mission: Mission;
  pass: Pass | undefined;
  onExport: () => void;
  onExportPurged: () => void;
  onClose: () => void;
}) {
  const coverage = pass ? computeCoverage(pass, mission) : null;
  // `weakestStage` sert au titre d'escalade ; tant que rien n'est scoré, la
  // formule reste vraie sans nommer d'étape (le quadrant arrive en 1.4).
  const vocabulary = coverage ? deliverableVocabulary(mission.header.mandate, coverage, "cette étape") : null;

  return (
    <div className={styles.missionBar}>
      <div className={styles.missionBarMain}>
        <p className={styles.missionCompany}>{mission.header.company || "Mission purgée"}</p>
        {coverage ? (
          <p className={styles.counters} data-testid="coverage-counters">
            <span>{formatFraction(coverage.documented, coverage.denominator)} documentées</span>
            <span> · l&apos;entreprise n&apos;en a pas {formatFraction(coverage.companyLacks, coverage.denominator)}</span>
            <span> · sans accès {formatFraction(coverage.noAccess, coverage.denominator)}</span>
            <span> · en attente {formatFraction(coverage.pending, coverage.denominator)}</span>
          </p>
        ) : null}
        {vocabulary ? (
          <p className={styles.deliverableTitle} data-testid="deliverable-title">
            {vocabulary.escalationTitle ?? vocabulary.documentTitle}
          </p>
        ) : null}
      </div>
      <div className={styles.missionBarActions}>
        <Button compact variant="secondary" onClick={onExport} data-testid="export-mission">
          Exporter
        </Button>
        <Button compact variant="secondary" onClick={onExportPurged} data-testid="export-purged">
          Exporter une copie purgée
        </Button>
        <Button compact variant="secondary" onClick={onClose} data-testid="close-mission">
          Fermer
        </Button>
      </div>
    </div>
  );
}
