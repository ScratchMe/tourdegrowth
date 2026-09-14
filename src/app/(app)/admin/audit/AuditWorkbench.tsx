"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { definitionFor, missingDefinitionFields, upsertDefinition, type DefinitionDraft } from "@/lib/audit/definitions";
import { fileNameFor, parseMissionFile, serializeMission } from "@/lib/audit/io";
import { purgeMission } from "@/lib/audit/purge";
import {
  catalogRow,
  newMission,
  newPass,
  type Brief,
  type EmbeddedCatalog,
  type Entry,
  type Finding,
  type Mission,
  type Pass,
} from "@/lib/audit/schema";
import { draftOf, emptyDraft, type FindingDraft } from "@/lib/audit/finding-draft";
import { canMarkHeadline, setPriority } from "@/lib/audit/findings";
import { tourScore } from "@/lib/audit/quadrants";
import type { TourQuestionView } from "@/lib/audit/server";
import { buildTourEntry, TOUR_METRIC_ID } from "@/lib/audit/tour-entry";
import type { AnswerIndex } from "@/lib/scoring/compute";
import { deleteMission, loadDraftMeta, loadMissions, markExported, saveMission, type DraftMeta, type SaveResult } from "@/lib/audit/storage";
import { ImportPanel, type PendingImport } from "./ImportPanel";
import { AUDIT_PILLAR_LABELS } from "./labels";
import { MissionBar } from "./MissionBar";
import { MissionList } from "./MissionList";
import { FindingEditor } from "./FindingEditor";
import { FindingsView } from "./FindingsView";
import { RestitutionView } from "./RestitutionView";
import { RowEditor } from "./RowEditor";
import { RowList } from "./RowList";
import { TourScreen } from "./TourScreen";
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
  | { kind: "row"; id: string; metricId: string }
  | { kind: "tour"; id: string }
  | { kind: "restitution"; id: string }
  | { kind: "findings"; id: string }
  | { kind: "finding"; id: string; draft: FindingDraft };

export function AuditWorkbench({
  catalog,
  questions,
  today,
}: {
  catalog: EmbeddedCatalog;
  questions: TourQuestionView[];
  today: string;
}) {
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
  /**
   * Ce que la dernière action a fait de non évident — aujourd'hui : une
   * nouvelle version de définition frappée. Une définition est immuable, donc
   * la modifier ne remplace rien : le dire est la seule façon que l'auditeur
   * ne croie pas avoir corrigé l'ancienne.
   *
   * Il ne survit pas à un changement d'écran (`goTo`) : un avis qui reste
   * affiché pendant qu'on navigue finit par décrire une action qu'on ne se
   * rappelle plus avoir faite.
   */
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // `localStorage` n'existe pas côté serveur, donc semer ces états au
    // premier rendu garantirait un mismatch d'hydratation (leçon de l'étape
    // 4, et le même arbitrage que `/quiz`, `/r/[id]` et `/deep-dive/[id]`).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMissions(loadMissions());
    setMeta(loadDraftMeta());
    setLoaded(true);
  }, []);

  /** Change d'écran et efface l'avis de la dernière action. */
  function goTo(next: View) {
    setNotice(null);
    setView(next);
  }

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

  const current = "id" in view ? missions.find((m) => m.id === view.id) : undefined;
  const currentPass = current?.passes[current.passes.length - 1];
  /**
   * L'étape que le titre d'escalade nomme — seulement quand le Tour est
   * complet. C'est le seul endroit du produit où ce classement a un sens :
   * il départage à égalité par l'ordre canonique AARRR (SPEC.md §6), donc
   * l'appliquer à un Tour partiel désignerait une étape par un artefact
   * d'ordre plutôt que par une mesure.
   */
  const weakest = currentPass ? tourScore(currentPass, questions)?.weakestPillar : undefined;
  const weakestStage = weakest ? `l'étape ${AUDIT_PILLAR_LABELS[weakest]}` : undefined;

  /**
   * Enregistre une ligne et, quand son statut en demande une, la définition
   * qui va avec. `upsertDefinition` décide seul s'il y a une version à
   * frapper : identique au contenu déjà posé → même référence.
   *
   * Une définition INCOMPLÈTE n'est pas enregistrée et ne retire pas la
   * référence existante — l'entrée part alors telle quelle et l'export la
   * signale, ce qui est le comportement voulu (un fichier qui dit ce qui
   * reste à faire).
   */
  function saveRow(mission: Mission, entry: Entry, definition?: DefinitionDraft): boolean {
    if (!definition || missingDefinitionFields(definition).length > 0) {
      setNotice(null);
      return saveEntry(mission, entry);
    }
    const { mission: next, ref, bumped } = upsertDefinition(mission, definition);
    setNotice(
      bumped
        ? `Définition ${ref} frappée. La version précédente reste dans la mission : les observations qui la référencent gardent leur sens.`
        : null,
    );
    return saveEntry(next, { ...entry, definitionRef: ref });
  }

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

  /**
   * Pose une réponse du Tour et, quand la quinzième arrive, écrit `m19`.
   *
   * L'entrée `m19` n'est jamais saisie : elle est PRODUITE par l'audit, donc
   * elle se pose ici ou nulle part. Sa définition part avec elle
   * (`buildTourEntry`) parce que le validateur exige d'une ligne mesurée une
   * définition enregistrée — sans ça, l'export refuserait précisément la
   * ligne que l'outil produit le mieux.
   *
   * Une passe partielle n'écrit rien d'autre que la réponse : un score
   * intermédiaire ferait entrer dans la couverture une ligne dont le chiffre
   * changera encore, ce que « documenté » ne doit jamais vouloir dire.
   *
   * Tout est enregistré en UNE écriture, jamais deux : une réponse posée
   * sans son `m19` (ou l'inverse) sur un quota plein laisserait la mission
   * dans un état que rien ne rattrape.
   */
  function answerTour(mission: Mission, questionId: string, index: AnswerIndex): boolean {
    const last = mission.passes[mission.passes.length - 1];
    if (!last) return false;
    const nextPass: Pass = { ...last, tourAnswers: { ...last.tourAnswers, [questionId]: index } };

    let next: Mission = { ...mission, passes: [...mission.passes.slice(0, -1), nextPass] };
    const existing = last.entries.find((e) => e.metricId === TOUR_METRIC_ID);
    const built = buildTourEntry(nextPass.tourAnswers, questions, mission.header.scope, today, existing);

    if (built) {
      // `upsertDefinition` et non `registerDefinition` : la définition du
      // Tour porte le périmètre de la mission, donc son contenu peut changer
      // si ce périmètre change un jour. La règle d'immuabilité est la même
      // que pour toute autre ligne — frapper `@2`, jamais éditer `@1` — et
      // c'est exactement ce que `saveRow` fait déjà pour la saisie manuelle.
      const { version: _version, ...draft } = built.definition;
      const upserted = upsertDefinition(next, draft);
      next = upserted.mission;
      const entry: Entry = { ...built.entry, definitionRef: upserted.ref };
      const entries = nextPass.entries.some((e) => e.metricId === entry.metricId)
        ? nextPass.entries.map((e) => (e.metricId === entry.metricId ? entry : e))
        : [...nextPass.entries, entry];
      next = { ...next, passes: [...next.passes.slice(0, -1), { ...nextPass, entries }] };
    }
    return persist(next, missions.map((m) => (m.id === next.id ? next : m)));
  }

  /** Écrit la dernière passe modifiée par `change`, et persiste. */
  function savePass(mission: Mission, change: (pass: Pass) => Pass): boolean {
    const last = mission.passes[mission.passes.length - 1];
    if (!last) return false;
    const next: Mission = { ...mission, passes: [...mission.passes.slice(0, -1), change(last)] };
    return persist(next, missions.map((m) => (m.id === next.id ? next : m)));
  }

  /**
   * Enregistre un constat — remplace celui de même id, ou l'ajoute.
   *
   * Un constat neuf arrive avec `headline: false` et `priority: false` : les
   * deux marques se posent depuis la LISTE, où l'on voit combien il y en a
   * déjà. Les offrir dans le formulaire ferait marquer sans voir le plafond.
   */
  function saveFinding(mission: Mission, finding: Finding): boolean {
    return savePass(mission, (pass) => ({
      ...pass,
      findings: pass.findings.some((f) => f.id === finding.id)
        ? pass.findings.map((f) => (f.id === finding.id ? finding : f))
        : [...pass.findings, finding],
    }));
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

      {notice ? (
        <Card elevation="panel" className={styles.placeholder} data-testid="notice">
          <p className={styles.muted}>{notice}</p>
        </Card>
      ) : null}

      {view.kind === "list" ? (
        <MissionList
          missions={missions}
          meta={meta}
          onOpen={(id) => goTo({ kind: "mission", id })}
          onNew={() => goTo({ kind: "new" })}
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
            weakestStage={weakestStage}
            onExport={() => exportMission(current)}
            // Non destructif : la mission de travail reste intacte. C'est ce
            // qui produit un exemple montrable (décision 3 du §3.3).
            onExportPurged={() => download(purgeMission(current))}
            onClose={() => goTo({ kind: "list" })}
          />
          <Card elevation="panel" className={styles.viewSwitch}>
            <Button compact variant="secondary" onClick={() => goTo({ kind: "tour", id: current.id })} data-testid="open-tour">
              Le Tour ({Object.keys(currentPass?.tourAnswers ?? {}).length} / {questions.length})
            </Button>
            <Button compact variant="secondary" onClick={() => goTo({ kind: "restitution", id: current.id })} data-testid="open-restitution">
              Restitution
            </Button>
            <Button compact variant="secondary" onClick={() => goTo({ kind: "findings", id: current.id })} data-testid="open-findings">
              Constats ({currentPass?.findings.length ?? 0})
            </Button>
          </Card>
          {currentPass ? (
            <RowList mission={current} pass={currentPass} today={today} onOpenRow={(metricId) => goTo({ kind: "row", id: current.id, metricId })} />
          ) : null}
          <Card elevation="panel" className={styles.placeholder}>
            <Button compact variant="secondary" onClick={() => goTo({ kind: "purge", id: current.id })} data-testid="open-purge">
              Purger et retirer de cet appareil
            </Button>
          </Card>
        </>
      ) : null}

      {view.kind === "row" && current && currentPass ? (
        (() => {
          const row = catalogRow(current.catalog, view.metricId);
          if (!row) return null;
          const entry = currentPass.entries.find((e) => e.metricId === view.metricId);
          return (
            <RowEditor
              row={row}
              entry={entry}
              definition={definitionFor(current, entry?.definitionRef)}
              defaultScope={current.header.scope}
              today={today}
              onChange={(next, definition) => {
                // `setView` et non `goTo` : c'est le seul retour d'écran qui
                // doit CONSERVER l'avis, puisque c'est lui qui vient de le
                // poser. Les autres navigations l'effacent.
                if (saveRow(current, next, definition)) setView({ kind: "mission", id: current.id });
              }}
              onClose={() => goTo({ kind: "mission", id: current.id })}
            />
          );
        })()
      ) : null}

      {view.kind === "tour" && current && currentPass ? (
        <TourScreen
          questions={questions}
          pass={currentPass}
          onAnswer={(questionId, index) => answerTour(current, questionId, index)}
          onClose={() => goTo({ kind: "mission", id: current.id })}
        />
      ) : null}

      {view.kind === "restitution" && current && currentPass ? (
        <RestitutionView
          mission={current}
          pass={currentPass}
          questions={questions}
          onOpenRow={(metricId) => goTo({ kind: "row", id: current.id, metricId })}
          onOpenTour={() => goTo({ kind: "tour", id: current.id })}
          onClose={() => goTo({ kind: "mission", id: current.id })}
        />
      ) : null}

      {view.kind === "findings" && current && currentPass ? (
        <FindingsView
          mission={current}
          pass={currentPass}
          onNewFinding={(metricIds) => goTo({ kind: "finding", id: current.id, draft: emptyDraft(crypto.randomUUID(), metricIds) })}
          onOpenFinding={(id) => {
            const finding = currentPass.findings.find((f) => f.id === id);
            if (finding) goTo({ kind: "finding", id: current.id, draft: draftOf(finding) });
          }}
          onToggleHeadline={(id) =>
            savePass(current, (pass) => ({
              ...pass,
              findings: pass.findings.map((f) => {
                if (f.id !== id) return f;
                // Retirer de la une retire aussi la priorité : une action
                // prioritaire qui ne serait pas à la une n'a pas de sens, et
                // le validateur la compterait quand même comme priorité.
                if (f.headline) return { ...f, headline: false, priority: false };
                // Le plafond est déjà tenu par le bouton désactivé, qui est
                // la seule couche qu'un test d'écran peut atteindre (un
                // bouton désactivé ne dispatche pas). Cette garde-ci couvre
                // le chemin non-UI : un import, un fichier écrit à la main,
                // ou un futur raccourci clavier. Elle est redondante par
                // construction, et c'est voulu — le validateur refuserait un
                // neuvième à l'export, et une erreur découverte là est une
                // heure de travail perdue.
                return canMarkHeadline(pass.findings, id) ? { ...f, headline: true } : f;
              }),
            }))
          }
          onSetPriority={(id) => savePass(current, (pass) => ({ ...pass, findings: setPriority(pass.findings, id) }))}
          onBriefChange={(brief: Brief) => savePass(current, (pass) => ({ ...pass, brief }))}
          onClose={() => goTo({ kind: "mission", id: current.id })}
        />
      ) : null}

      {view.kind === "finding" && current ? (
        <FindingEditor
          draft={view.draft}
          rowNames={new Map(current.catalog.rows.map((row) => [row.id, row.name]))}
          onSave={(finding) => {
            if (saveFinding(current, finding)) setView({ kind: "findings", id: current.id });
          }}
          onClose={() => goTo({ kind: "findings", id: current.id })}
        />
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
