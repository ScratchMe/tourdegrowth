"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { buildRestitution, type RestitutionRow } from "@/lib/audit/restitution";
import { QUADRANTS } from "@/lib/audit/quadrants";
import type { Mission, Pass } from "@/lib/audit/schema";
import type { TourQuestionView } from "@/lib/audit/server";
import { AUDIT_PILLAR_LABELS, QUADRANT_LABELS } from "./labels";
import styles from "./page.module.css";

/**
 * La vue restitution — les mêmes lignes que la collecte, lues autrement.
 *
 * La collecte trie par coût et répond à « par quoi je commence ». Celle-ci
 * regroupe par étape AARRR et répond à « qu'est-ce que ça dit ». C'est cette
 * vue-là qui devient la structure du readout.
 *
 * **Les angles morts sont en tête, et restent aussi dans leur étape.** Les
 * sortir de leur pilier ferait perdre le fait qu'une étape en concentre
 * trois ; les laisser seulement dedans les noierait. C'est une mise en
 * avant, pas un déplacement — un test l'épingle dans les deux sens.
 *
 * **Rien ne s'invente quand le Tour est vide.** Un angle mort est un
 * croisement : sans réponse sur l'axe méthode, il n'y a rien à croiser, et
 * l'écran le dit plutôt que d'afficher une section vide qui se lirait
 * « aucun angle mort », ce qui serait faux.
 */
export function RestitutionView({
  mission,
  pass,
  questions,
  onOpenRow,
  onOpenTour,
  onClose,
}: {
  mission: Mission;
  pass: Pass;
  questions: readonly TourQuestionView[];
  onOpenRow: (metricId: string) => void;
  onOpenTour: () => void;
  onClose: () => void;
}) {
  const view = buildRestitution(mission, pass, questions);
  const tourAnswered = Object.keys(pass.tourAnswers).length;

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Restitution</h2>
        <Button compact variant="secondary" onClick={onClose} data-testid="close-restitution">
          Retour
        </Button>
      </div>
      <p className={styles.muted}>
        Les mêmes lignes, regroupées par étape et croisées avec le Tour : ce que l&apos;équipe déclare mesurer contre ce qu&apos;elle peut
        montrer.
      </p>

      <p className={styles.counters} data-testid="quadrant-counts">
        {QUADRANTS.filter((quadrant) => view.counts[quadrant] > 0).map((quadrant, index) => (
          <span key={quadrant}>
            {index > 0 ? " · " : ""}
            {QUADRANT_LABELS[quadrant]} : {view.counts[quadrant]}
          </span>
        ))}
      </p>

      {tourAnswered === 0 ? (
        <Card elevation="panel" className={styles.placeholder} data-testid="blind-spots-need-tour">
          <p className={styles.muted}>
            Aucun angle mort ne peut être établi tant que le Tour est vide : c&apos;est un croisement, il lui faut les deux axes.{" "}
          </p>
          <Button compact variant="secondary" onClick={onOpenTour} data-testid="open-tour-from-restitution">
            Remplir le Tour
          </Button>
        </Card>
      ) : view.blindSpots.length > 0 ? (
        <Card elevation="panel" tone="alert" className={styles.blindSpots} data-testid="blind-spots">
          <MetaLabel size="xs" wide tone="alert">
            Angles morts ({view.blindSpots.length})
          </MetaLabel>
          <p className={styles.muted}>
            L&apos;équipe déclare mesurer ces lignes, et rien ne les documente. C&apos;est l&apos;écart le plus rentable de
            l&apos;exercice : la maturité déclarée est haute, le système réel ne suit pas.
          </p>
          <ul className={styles.rowList}>
            {view.blindSpots.map((item) => (
              <li key={item.row.id}>
                <Button compact variant="secondary" onClick={() => onOpenRow(item.row.id)} data-testid={`blind-spot-${item.row.id}`}>
                  {item.row.name}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className={styles.muted} data-testid="no-blind-spots">
          Aucun angle mort sur les {tourAnswered} question{tourAnswered > 1 ? "s" : ""} du Tour déjà remplies.
        </p>
      )}

      {view.groups.map((group) => (
        <div key={group.pillar} className={styles.restitutionGroup} data-testid={`restitution-${group.pillar}`}>
          <MetaLabel size="xs" wide>
            {AUDIT_PILLAR_LABELS[group.pillar]}
          </MetaLabel>
          <ul className={styles.rowList}>
            {group.rows.map((item) => (
              <RestitutionItem key={item.row.id} item={item} onOpen={() => onOpenRow(item.row.id)} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function RestitutionItem({ item, onOpen }: { item: RestitutionRow; onOpen: () => void }) {
  return (
    <li>
      <Card elevation="panel" className={styles.rowItem} data-testid={`restitution-row-${item.row.id}`}>
        <div className={styles.rowMain}>
          <p className={styles.rowName}>{item.row.name}</p>
          <p
            className={item.quadrant === "blind-spot" ? styles.quadrantAlert : styles.rowStatus}
            data-testid={`quadrant-${item.row.id}`}
          >
            {QUADRANT_LABELS[item.quadrant]}
          </p>
        </div>
        <Button compact variant="secondary" onClick={onOpen} data-testid={`open-restitution-${item.row.id}`}>
          Ouvrir
        </Button>
      </Card>
    </li>
  );
}
