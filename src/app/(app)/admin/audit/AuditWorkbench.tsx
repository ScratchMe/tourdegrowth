"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { fileNameFor, parseMissionFile, serializeMission } from "@/lib/audit/io";
import { purgeMission } from "@/lib/audit/purge";
import { catalogRow, newMission, newPass, type EmbeddedCatalog, type Entry, type Mission, type Pass } from "@/lib/audit/schema";
import { deleteMission, loadDraftMeta, loadMissions, markExported, saveMission, type DraftMeta, type SaveResult } from "@/lib/audit/storage";
import { ImportPanel, type PendingImport } from "./ImportPanel";
import { MissionBar } from "./MissionBar";
import { MissionList } from "./MissionList";
import { RowEditor } from "./RowEditor";
import { RowList } from "./RowList";
import { NewMissionForm } from "./NewMissionForm";
import styles from "./page.module.css";
import { TextInput } from "./_ui/TextInput";

/**
 * AuditWorkbench — l'îlot client de `/admin/audit`.
 *
 * Il reçoit le catalogue du jour en props et ne lit AUCUN module de
 * `content/` : `src/__tests__/audit-boundary.test.ts` marche ses imports et
 * échoue si un chemin de valeur y mène, à n'importe quelle profondeur. Le
 * Server Component résout, le client reçoit.
 *
 * Tout l'état vit ici plutôt qu'en URL. Une mission est un fichier sur
 * l'appareil, pas une ressource adressable : lui donner une URL promettrait
 * un lien partageable qui n'existe pas, et un id de mission dans une barre
 * d'adresse est une fuite de plus à surveiller.
 *
 * Lecture de `localStorage` APRÈS montage (`useEffect`), jamais dans l'état
 * initial — le serveur ne voit pas le stockage, donc semer l'état initial
 * garantirait un mismatch d'hydratation (leçon de l'étape 4).
 */
type View =
  | { kind: "list" }
  | { kind: "new" }
  | { kind: "mission"; id: string }
  | { kind: "import"; pending: PendingImport }
  | { kind: "purge"; id: string }
  | { kind: "row"; id: string; metricId: string };

export function AuditWorkbench({ catalog, today }: { catalog: EmbeddedCatalog; today: string }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [meta, setMeta] = useState<DraftMeta[]>([]);
  const [view, setView] = useState<View>({ kind: "list" });
  const [loaded, setLoaded] = useState(false);
  /**
   * Une écriture qui échoue est MONTRÉE (voir `lib/audit/storage.ts`) :
   * perdre la saisie d'un diagnostic coûte des heures d'entretiens, pas les
   * trois minutes d'un questionnaire.
   */
  const [writeError, setWriteError] = useState<string | null>(null);

  useEffect(() => {
    // `localStorage` n'existe pas côté serveur, donc semer ces états au
    // premier rendu garantirait un mismatch d'hydratation (leçon de l'étape
    // 4, et le même arbitrage que `/quiz`, `/r/[id]` et `/deep-dive/[id]`).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMissions(loadMissions());
    setMeta(loadDraftMeta());
    setLoaded(true);
  }, []);

  function persist(mission: Mission, next?: Mission[]): boolean {
    const result: SaveResult = saveMission(mission);
    if (!result.ok) {
      setWriteError(result.message);
      return false;
    }
    setWriteError(null);
    setMissions(next ?? loadMissions());
    setMeta(loadDraftMeta());
    return true;
  }

  function download(mission: Mission) {
    const blob = new Blob([serializeMission(mission)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileNameFor(mission);
    // Dans le document, et révoqué plus tard : un anchor détaché ne déclenche
    // pas le téléchargement sur tous les navigateurs, et révoquer l'URL dans
    // la même pile peut couper un téléchargement qui n'a pas encore démarré.
    // C'est le seul chemin par lequel le travail d'Antoine quitte l'appareil.
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function exportMission(mission: Mission) {
    download(mission);
    // La date d'export est posée au moment où le fichier part vraiment —
    // jamais dérivée, jamais devinée. C'est ce que la liste affiche pour
    // dire lesquelles ne survivraient pas à un vidage des données du site.
    const result = markExported(mission.id, new Date().toISOString());
    if (!result.ok) setWriteError(result.message);
    else setMeta(loadDraftMeta());
  }

  const current =
    view.kind === "mission" || view.kind === "purge" || view.kind === "row" ? missions.find((m) => m.id === view.id) : undefined;
  const currentPass = current?.passes[current.passes.length - 1];

  /**
   * Écrit une entrée dans la DERNIÈRE passe, en remplaçant celle de même
   * `metricId` s'il y en a une. Une mission est une série de passes
   * (AUDIT.md §3) : saisir modifie toujours la passe en cours, jamais une
   * passe close — l'écran de seconde passe est en phase 2.
   */
  function saveEntry(mission: Mission, entry: Entry): boolean {
    const last = mission.passes[mission.passes.length - 1];
    if (!last) return false;
    const entries = last.entries.some((e) => e.metricId === entry.metricId)
      ? last.entries.map((e) => (e.metricId === entry.metricId ? entry : e))
      : [...last.entries, entry];
    const nextPass: Pass = { ...last, entries };
    const next: Mission = { ...mission, passes: [...mission.passes.slice(0, -1), nextPass] };
    return persist(next, missions.map((m) => (m.id === next.id ? next : m)));
  }

  // Avant montage, rien : le HTML du serveur et le premier rendu client sont
  // identiques, et la liste apparaît juste après (motif de `/quiz`).
  if (!loaded) return null;

  return (
    <div className={styles.workbench}>
      {writeError ? (
        <Card elevation="panel" className={styles.writeError} role="alert" data-testid="write-error">
          <p className={styles.alert}>{writeError}</p>
        </Card>
      ) : null}

      {view.kind === "list" ? (
        <MissionList
          missions={missions}
          meta={meta}
          onOpen={(id) => setView({ kind: "mission", id })}
          onNew={() => setView({ kind: "new" })}
          onImport={(file) => {
            void file.text().then((text) => {
              const result = parseMissionFile(text);
              const existing = result.mission ? missions.find((m) => m.id === result.mission!.id) : undefined;
              setView({
                kind: "import",
                pending: {
                  fileName: file.name,
                  result,
                  collides: existing !== undefined,
                  purgedOverFull: existing !== undefined && result.mission?.purged === true && existing.purged !== true,
                },
              });
            });
          }}
        />
      ) : null}

      {view.kind === "new" ? (
        <NewMissionForm
          today={today}
          onCancel={() => setView({ kind: "list" })}
          onCreate={(header, passDate) => {
            const id = crypto.randomUUID();
            const created = newMission({ id, createdAt: new Date().toISOString(), header, catalog });
            const withPass: Mission = { ...created, passes: [newPass(created, { id: crypto.randomUUID(), date: passDate })] };
            if (persist(withPass, [...missions, withPass])) setView({ kind: "mission", id });
          }}
        />
      ) : null}

      {view.kind === "import" ? (
        <ImportPanel
          pending={view.pending}
          currentCatalogVersion={catalog.version}
          onCancel={() => setView({ kind: "list" })}
          onConfirm={(mission, mode) => {
            const incoming = mode === "keep-both" ? { ...mission, id: crypto.randomUUID() } : mission;
            const next = missions.some((m) => m.id === incoming.id)
              ? missions.map((m) => (m.id === incoming.id ? incoming : m))
              : [...missions, incoming];
            if (persist(incoming, next)) setView({ kind: "mission", id: incoming.id });
          }}
        />
      ) : null}

      {view.kind === "mission" && current ? (
        <>
          <MissionBar
            mission={current}
            pass={currentPass}
            meta={meta.find((m) => m.missionId === current.id)}
            onExport={() => exportMission(current)}
            // Non destructif : la mission de travail reste intacte. C'est ce
            // qui produit un exemple montrable (décision 3 du §3.3).
            onExportPurged={() => download(purgeMission(current))}
            onClose={() => setView({ kind: "list" })}
          />
          {currentPass ? (
            <RowList mission={current} pass={currentPass} onOpenRow={(metricId) => setView({ kind: "row", id: current.id, metricId })} />
          ) : null}
          <Card elevation="panel" className={styles.placeholder}>
            <Button compact variant="secondary" onClick={() => setView({ kind: "purge", id: current.id })} data-testid="open-purge">
              Purger et retirer de cet appareil
            </Button>
          </Card>
        </>
      ) : null}

      {view.kind === "row" && current && currentPass ? (
        (() => {
          const row = catalogRow(current.catalog, view.metricId);
          if (!row) return null;
          return (
            <RowEditor
              row={row}
              entry={currentPass.entries.find((e) => e.metricId === view.metricId)}
              onChange={(entry) => {
                if (saveEntry(current, entry)) setView({ kind: "mission", id: current.id });
              }}
              onClose={() => setView({ kind: "mission", id: current.id })}
            />
          );
        })()
      ) : null}

      {view.kind === "purge" && current ? (
        <PurgeConfirm
          mission={current}
          onCancel={() => setView({ kind: "mission", id: current.id })}
          onConfirm={() => {
            const result = deleteMission(current.id);
            if (!result.ok) {
              setWriteError(result.message);
              return;
            }
            setMissions(loadMissions());
            setView({ kind: "list" });
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * La purge destructive — fin de mission, ou obligation de NDA. Elle demande
 * de retaper le nom de l'entreprise, comme la suppression d'un dépôt GitHub :
 * c'est la seule action de l'outil qui détruit du travail, et la seule que ce
 * geste-là protège utilement.
 */
function PurgeConfirm({ mission, onCancel, onConfirm }: { mission: Mission; onCancel: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState("");
  // Une mission déjà purgée n'a plus de nom d'entreprise à retaper : sans ce
  // repli, elle ne pourrait JAMAIS être retirée de l'appareil (le bouton
  // resterait désactivé pour toujours). C'est le cas d'un exemple purgé
  // importé pour être montré, puis dont on veut se débarrasser.
  const expected = mission.header.company || "PURGER";
  const matches = typed.trim() === expected;

  return (
    <section className={styles.screen}>
      <Card elevation="panel" className={styles.form}>
        <h2 className={styles.h2}>Purger et retirer de cet appareil</h2>
        <p>
          Cette mission sera retirée de ce navigateur. Le fichier que tu as exporté, lui, reste — c&apos;est la seule copie qui survivra.
        </p>
        <p className={styles.muted}>
          Retape <strong>{expected}</strong> pour confirmer.
        </p>
        <TextInput id="purge-confirm" value={typed} onChange={setTyped} autoFocus />
        <div className={styles.screenActions}>
          <Button compact variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          <Button compact onClick={onConfirm} data-testid="confirm-purge" {...(matches ? {} : { disabled: true })}>
            Purger
          </Button>
        </div>
      </Card>
    </section>
  );
}
