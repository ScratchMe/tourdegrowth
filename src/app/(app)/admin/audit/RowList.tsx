"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import type { AuditCatalogRow } from "@/content/audit-catalog";
import { applicableRows, type Entry, type Mission, type Pass } from "@/lib/audit/schema";
import { chaseState, groupForCollect, toChase, UNASSIGNED_GROUP } from "@/lib/audit/tracking";
import { CHASE_STATE_LABELS, VALUE_STATUS_LABELS } from "./labels";
import styles from "./page.module.css";

/**
 * La vue collecte, première moitié : les lignes applicables au profil, avec
 * leur statut, et le point d'entrée de l'éditeur.
 *
 * **Triées par palier décroissant** (T4 puis T3 …) plutôt que par pilier :
 * une ligne T4 demande un mandat et une ligne T3 une file d'analyste, donc
 * elles doivent partir le premier jour — les trier par thème mettrait le
 * travail le plus long en bas de page (AUDIT-PLAN.md §3.4/1.3).
 *
 * **Deux vues du même jeu de lignes**, parce qu'une collecte se mène de deux
 * façons : par coût (le palier, pour savoir par quoi commencer) et par
 * interlocuteur (pour préparer une réunion ou un export). Un groupement par
 * pilier serait la vue du livrable, pas celle du travail.
 *
 * **Les compteurs par palier sont des restes, pas des totaux** : « reste 1
 * ligne T4, 3 lignes T3 » est ce qui dit combien de temps il faut encore.
 * Décision 4 d'AUDIT-PLAN.md §3.3 : pas de table palier → heures, qui serait
 * une fausse précision tant qu'aucune mission réelle ne l'a mesurée.
 *
 * Une ligne **sans entrée** n'est ni documentée ni absente : elle est en
 * attente, et c'est ce que l'écran dit. Un statut n'est jamais défauté.
 */
const TIER_ORDER = ["T4", "T3", "T2", "T1", "T0"] as const;

export function RowList({
  mission,
  pass,
  today,
  onOpenRow,
}: {
  mission: Mission;
  pass: Pass;
  today: string;
  onOpenRow: (metricId: string) => void;
}) {
  const rows = applicableRows(mission.catalog, mission.header.profile.model);
  const byMetric = new Map<string, Entry>(pass.entries.map((e) => [e.metricId, e]));
  const sorted = [...rows].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  const nameOf = (metricId: string) => rows.find((row) => row.id === metricId)?.name ?? metricId;

  // « Reste » : une ligne sans entrée compte, une ligne renseignée non. C'est
  // ce qui répond à « combien de temps encore », pas « combien y en a-t-il ».
  const remaining = TIER_ORDER.map((tier) => ({
    tier,
    count: rows.filter((row) => row.tier === tier && !byMetric.has(row.id)).length,
  })).filter((entry) => entry.count > 0);

  const chase = toChase(pass.entries, today);
  const groups = groupForCollect(pass.entries).filter((group) => group.key !== UNASSIGNED_GROUP);

  return (
    <section className={styles.screen}>
      <h2 className={styles.h2}>Collecte</h2>
      <p className={styles.muted}>
        {rows.length} lignes applicables au profil, du palier le plus coûteux au moins coûteux. Les T4 et T3 demandent un mandat ou une file
        d&apos;analyste : ce sont celles qui doivent partir en premier.
      </p>

      {remaining.length ? (
        <p className={styles.muted} data-testid="tier-remaining">
          Reste {remaining.map(({ tier, count }) => `${count} ${count > 1 ? "lignes" : "ligne"} ${tier}`).join(", ")}.
        </p>
      ) : null}

      {chase.length ? (
        <Card elevation="panel" className={styles.placeholder} data-testid="chase-list">
          <MetaLabel size="xs" wide>
            À relancer
          </MetaLabel>
          <ul className={styles.errorList}>
            {chase.map((entry) => (
              <li key={entry.metricId}>
                {nameOf(entry.metricId)}
                {entry.tracking?.routedTo ? ` — ${entry.tracking.routedTo}` : ""}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {groups.length ? (
        <p className={styles.muted} data-testid="collect-groups">
          Par interlocuteur : {groups.map((group) => `${group.key} (${group.entries.length})`).join(" · ")}.
        </p>
      ) : null}

      <ul className={styles.rowList} data-testid="row-list">
        {sorted.map((row) => (
          <RowItem key={row.id} row={row} entry={byMetric.get(row.id)} today={today} onOpen={() => onOpenRow(row.id)} />
        ))}
      </ul>
    </section>
  );
}

function RowItem({ row, entry, today, onOpen }: { row: AuditCatalogRow; entry: Entry | undefined; today: string; onOpen: () => void }) {
  // L'état de relance n'est montré que quand il dit quelque chose : « pas
  // encore demandé » est le défaut de toutes les lignes et n'apprendrait rien.
  const state = entry ? chaseState(entry.tracking, today) : "not-requested";
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
            {state !== "not-requested" ? ` · ${CHASE_STATE_LABELS[state]}` : ""}
          </p>
        </div>
        <Button compact variant="secondary" onClick={onOpen} data-testid={`open-row-${row.id}`}>
          {entry ? "Modifier" : "Renseigner"}
        </Button>
      </Card>
    </li>
  );
}
