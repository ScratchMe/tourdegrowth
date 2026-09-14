"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import type { AuditCatalogRow } from "@/content/audit-catalog";
import { applicableRows, type Entry, type Mission, type Pass } from "@/lib/audit/schema";
import { VALUE_STATUS_LABELS } from "./labels";
import styles from "./page.module.css";

/**
 * La vue collecte, première moitié : les lignes applicables au profil, avec
 * leur statut, et le point d'entrée de l'éditeur.
 *
 * **Triées par palier décroissant** (T4 puis T3 …) plutôt que par pilier :
 * une ligne T4 demande un mandat et une ligne T3 une file d'analyste, donc
 * elles doivent partir le premier jour — les trier par thème mettrait le
 * travail le plus long en bas de page (AUDIT-PLAN.md §3.4/1.3). Le groupement
 * par interlocuteur et par système source, les dates de relance et les
 * compteurs par palier arrivent à l'étape 1.3b.
 *
 * Une ligne **sans entrée** n'est ni documentée ni absente : elle est en
 * attente, et c'est ce que l'écran dit. Un statut n'est jamais défauté.
 */
const TIER_ORDER = ["T4", "T3", "T2", "T1", "T0"] as const;

export function RowList({ mission, pass, onOpenRow }: { mission: Mission; pass: Pass; onOpenRow: (metricId: string) => void }) {
  const rows = applicableRows(mission.catalog, mission.header.profile.model);
  const byMetric = new Map<string, Entry>(pass.entries.map((e) => [e.metricId, e]));
  const sorted = [...rows].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));

  return (
    <section className={styles.screen}>
      <h2 className={styles.h2}>Collecte</h2>
      <p className={styles.muted}>
        {rows.length} lignes applicables au profil, du palier le plus coûteux au moins coûteux. Les T4 et T3 demandent un mandat ou une file
        d&apos;analyste : ce sont celles qui doivent partir en premier.
      </p>

      <ul className={styles.rowList} data-testid="row-list">
        {sorted.map((row) => (
          <RowItem key={row.id} row={row} entry={byMetric.get(row.id)} onOpen={() => onOpenRow(row.id)} />
        ))}
      </ul>
    </section>
  );
}

function RowItem({ row, entry, onOpen }: { row: AuditCatalogRow; entry: Entry | undefined; onOpen: () => void }) {
  return (
    <li>
      <Card elevation="panel" className={styles.rowItem} data-testid={`row-${row.id}`}>
        <div className={styles.rowMain}>
          <MetaLabel size="xs" wide>
            {row.tier} · {row.pillar}
          </MetaLabel>
          <p className={styles.rowName}>{row.name}</p>
          <p className={styles.rowStatus} data-testid={`status-${row.id}`}>
            {entry ? VALUE_STATUS_LABELS[entry.status] : "En attente"}
          </p>
        </div>
        <Button compact variant="secondary" onClick={onOpen} data-testid={`open-row-${row.id}`}>
          {entry ? "Modifier" : "Renseigner"}
        </Button>
      </Card>
    </li>
  );
}
