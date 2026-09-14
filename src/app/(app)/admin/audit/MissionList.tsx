"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { computeCoverage, formatFraction } from "@/lib/audit/coverage";
import type { Mission } from "@/lib/audit/schema";
import type { DraftMeta } from "@/lib/audit/storage";
import { PROFILE_MODEL_LABELS } from "./labels";
import styles from "./page.module.css";

/**
 * L'écran d'accueil : les missions de CET appareil.
 *
 * « De cet appareil » est la phrase importante et elle est écrite à l'écran :
 * il n'y a pas de serveur (AUDIT.md §5), donc vider les données du site perd
 * tout ce qui n'a pas été exporté. La date du dernier export est affichée à
 * côté de chaque mission pour cette seule raison.
 */
export function MissionList({
  missions,
  meta,
  onOpen,
  onNew,
  onImport,
}: {
  missions: Mission[];
  meta: DraftMeta[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onImport: (file: File) => void;
}) {
  const exportedAt = new Map(meta.map((m) => [m.missionId, m.lastExportedAt]));

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Missions</h2>
        <div className={styles.screenActions}>
          <Button compact onClick={onNew} data-testid="new-mission">
            Nouvelle mission
          </Button>
          <label className={styles.importLabel}>
            <span>Importer un fichier</span>
            <input
              className={styles.fileInput}
              type="file"
              accept="application/json,.json"
              data-testid="import-file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                // Reset so re-choosing the same file fires `change` again —
                // a real case here: fix the file, pick it a second time.
                event.target.value = "";
                if (file) onImport(file);
              }}
            />
          </label>
        </div>
      </div>

      {missions.length === 0 ? (
        <Card elevation="panel" className={styles.empty}>
          <p>Aucune mission sur cet appareil.</p>
          <p className={styles.muted}>
            Les missions vivent dans ce navigateur et dans les fichiers que tu exportes — jamais sur un serveur. Vider les données du site
            efface celles qui n&apos;ont pas été exportées.
          </p>
        </Card>
      ) : (
        <ul className={styles.missionList} data-testid="mission-list">
          {missions.map((mission) => {
            const pass = mission.passes[mission.passes.length - 1];
            const coverage = pass ? computeCoverage(pass, mission) : null;
            const last = exportedAt.get(mission.id) ?? null;
            return (
              <li key={mission.id}>
                <Card elevation="panel" className={styles.missionRow}>
                  <div>
                    <p className={styles.missionRowTitle}>
                      {mission.header.company || "Mission purgée"}
                      {mission.purged ? <span className={styles.purgedBadge}>purgée</span> : null}
                    </p>
                    <MetaLabel size="xs">
                      {PROFILE_MODEL_LABELS[mission.header.profile.model]} · créée le {mission.createdAt.slice(0, 10)}
                    </MetaLabel>
                    <p className={styles.muted}>
                      {coverage ? `${formatFraction(coverage.documented, coverage.denominator)} documentées` : "Aucune passe"}
                      {" · "}
                      {last ? `exportée le ${last.slice(0, 10)}` : "jamais exportée"}
                    </p>
                  </div>
                  <Button compact variant="secondary" onClick={() => onOpen(mission.id)} data-testid="open-mission">
                    Ouvrir
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
