"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import type { ParseResult } from "@/lib/audit/io";
import type { Mission } from "@/lib/audit/schema";
import { PROFILE_MODEL_LABELS } from "./labels";
import styles from "./page.module.css";

export interface PendingImport {
  fileName: string;
  result: ParseResult;
  /** True when a mission with the same id is already on this device. */
  collides: boolean;
}

/**
 * L'écran de confirmation d'un import. Il montre ce qu'il a LU avant
 * d'écrire quoi que ce soit — en-tête, version de catalogue embarquée, et la
 * liste des erreurs du validateur s'il y en a.
 *
 * L'import est tolérant, le readout est strict (décision 2 du §3.3) : une
 * mission en cours est *souvent* invalide (une ligne passée en « mesuré »
 * dont l'observation n'est pas encore saisie), et refuser de rouvrir son
 * propre brouillon serait le piège. Les erreurs sont donc une liste de choses
 * à finir, pas un refus.
 *
 * La seule chose qu'on refuse vraiment est un fichier qu'on ne sait pas lire
 * (`result.mission === null` : forme inconnue ou version de schéma future).
 */
export function ImportPanel({
  pending,
  currentCatalogVersion,
  onCancel,
  onConfirm,
}: {
  pending: PendingImport;
  currentCatalogVersion: string;
  onCancel: () => void;
  onConfirm: (mission: Mission, mode: "replace" | "keep-both") => void;
}) {
  const [mode, setMode] = useState<"replace" | "keep-both">("replace");
  const mission = pending.result.mission;
  const errors = pending.result.ok ? [] : pending.result.errors;

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Importer une mission</h2>
        <Button compact variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>

      <Card elevation="panel" className={styles.form}>
        <MetaLabel size="xs" wide>
          {pending.fileName}
        </MetaLabel>

        {mission === null ? (
          <div data-testid="import-unreadable">
            <p className={styles.alert}>Ce fichier n&apos;a pas pu être lu.</p>
            <ul className={styles.errorList}>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div data-testid="import-preview">
              <p className={styles.missionRowTitle}>{mission.header.company || "Mission purgée"}</p>
              <p className={styles.muted}>
                {PROFILE_MODEL_LABELS[mission.header.profile.model]} · {mission.passes.length} passe
                {mission.passes.length > 1 ? "s" : ""} · créée le {mission.createdAt.slice(0, 10)}
              </p>
              <p className={styles.muted}>
                Catalogue embarqué <code>{mission.catalog.version}</code>
                {mission.catalog.version === currentCatalogVersion ? null : (
                  <>
                    {" "}
                    — version courante <code>{currentCatalogVersion}</code>. L&apos;outil ne migre jamais seul : la mission garde le sien.
                  </>
                )}
              </p>
            </div>

            {errors.length > 0 ? (
              <div data-testid="import-errors">
                <p className={styles.muted}>
                  {errors.length} chose{errors.length > 1 ? "s" : ""} à finir — une mission en cours est normalement dans cet état.
                </p>
                <ul className={styles.errorList}>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {pending.collides ? (
              <div className={styles.checkboxRow} data-testid="import-collision">
                <p className={styles.alert}>Une mission de même identifiant est déjà sur cet appareil.</p>
                <Button compact variant={mode === "replace" ? "primary" : "secondary"} onClick={() => setMode("replace")}>
                  Remplacer
                </Button>
                <Button compact variant={mode === "keep-both" ? "primary" : "secondary"} onClick={() => setMode("keep-both")}>
                  Garder les deux
                </Button>
              </div>
            ) : null}

            <Button onClick={() => onConfirm(mission, mode)} data-testid="confirm-import">
              Importer
            </Button>
          </>
        )}
      </Card>
    </section>
  );
}
