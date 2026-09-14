import type { Mission } from "./schema";

/**
 * storage.ts — les missions sur l'appareil, et rien d'autre nulle part.
 *
 * L'instrument n'a pas de serveur (AUDIT.md §5) : une mission vit dans le
 * `localStorage` du navigateur d'Antoine, et son fichier JSON exporté est la
 * seule copie durable. Firestore n'entre jamais dans l'histoire — les
 * chiffres sont ceux d'un employeur, et `content/legal.ts` promet qu'aucun
 * nom d'entreprise ne touche la base du side project.
 *
 * Une seule clé, un tableau de missions. Pas une clé par mission : la liste
 * se lit d'un coup à l'ouverture, et un `localStorage` à clés dynamiques est
 * précisément ce qui laisse des restes quand une purge se passe mal.
 *
 * DIFFÉRENCE ASSUMÉE AVEC `quiz/storage.ts` : là-bas, une écriture qui échoue
 * est avalée en silence (perdre des réponses coûte trois minutes, et la
 * session continue depuis l'état React). Ici, perdre la saisie coûte des
 * heures d'entretiens et de relances — donc `saveMission` RENVOIE son échec,
 * et l'écran doit le montrer. Une sauvegarde silencieusement perdue est le
 * pire résultat possible pour cet outil.
 */
const STORAGE_KEY = "tdg.audit.v1";

/** Ce que l'écran « missions » montre sans ouvrir le fichier entier. */
export interface DraftMeta {
  missionId: string;
  /** ISO, posé par `markExported` — jamais dérivé, jamais deviné. */
  lastExportedAt: string | null;
  /**
   * ISO de la dernière écriture sur l'appareil. Il n'existe que pour une
   * chose : pouvoir dire « modifications non exportées » SANS le deviner
   * (AUDIT-PLAN.md §3.2). Un avertissement qu'on ne peut pas justifier est
   * pire qu'aucun — celui-ci compare deux dates réelles.
   */
  lastSavedAt?: string;
}

const META_KEY = "tdg.audit.exports.v1";

export type SaveResult = { ok: true } | { ok: false; reason: "unavailable" | "quota" | "unknown"; message: string };

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Un navigateur qui refuse l'accès au stockage (mode privé verrouillé,
    // cookies tiers bloqués sur certains réglages) lève À L'ACCÈS, pas à
    // l'appel — d'où le try autour de la propriété elle-même.
    return null;
  }
}

/** Toutes les missions de cet appareil, les illisibles ignorées plutôt que fatales. */
export function loadMissions(): Mission[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMissionShape);
  } catch {
    return [];
  }
}

/**
 * Écrit une mission — remplace celle de même `id`, ajoute sinon. L'échec est
 * RENVOYÉ, jamais avalé (voir l'en-tête).
 */
export function saveMission(mission: Mission, at = new Date().toISOString()): SaveResult {
  const store = storage();
  if (!store) return { ok: false, reason: "unavailable", message: "Le stockage du navigateur n'est pas accessible." };
  const missions = loadMissions();
  const index = missions.findIndex((m) => m.id === mission.id);
  const next = index >= 0 ? missions.map((m, i) => (i === index ? mission : m)) : [...missions, mission];
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(next));
    touchMeta(store, mission.id, (meta) => ({ ...meta, lastSavedAt: at }));
    return { ok: true };
  } catch (err) {
    // `QuotaExceededError` est le cas qui compte : une mission à 25 lignes,
    // ses définitions et ses séries d'observations peut peser. L'écran doit
    // dire d'exporter le fichier AVANT de continuer à saisir.
    const quota = err instanceof DOMException && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return quota
      ? { ok: false, reason: "quota", message: "Le stockage du navigateur est plein : exporte le fichier de la mission avant de continuer." }
      : { ok: false, reason: "unknown", message: err instanceof Error ? err.message : "Écriture refusée par le navigateur." };
  }
}

/** Retire une mission de l'appareil. Le fichier exporté, lui, reste la copie durable. */
export function deleteMission(missionId: string): SaveResult {
  const store = storage();
  if (!store) return { ok: false, reason: "unavailable", message: "Le stockage du navigateur n'est pas accessible." };
  const next = loadMissions().filter((m) => m.id !== missionId);
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(next));
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "unknown", message: err instanceof Error ? err.message : "Écriture refusée par le navigateur." };
  }
}

/** La date du dernier export par mission — ce que l'écran « missions » affiche à côté de chacune. */
export function loadDraftMeta(): DraftMeta[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(META_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDraftMetaShape);
  } catch {
    return [];
  }
}

/** Posé au moment où le fichier part vraiment, `at` injecté pour rester testable. */
export function markExported(missionId: string, at: string): SaveResult {
  const store = storage();
  if (!store) return { ok: false, reason: "unavailable", message: "Le stockage du navigateur n'est pas accessible." };
  try {
    touchMeta(store, missionId, (meta) => ({ ...meta, lastExportedAt: at }));
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "unknown", message: err instanceof Error ? err.message : "Écriture refusée par le navigateur." };
  }
}

/**
 * Les deux dates d'une mission vivent dans la même entrée, donc une écriture
 * ne doit jamais écraser l'autre date. `markExported` posé après une
 * sauvegarde doit garder `lastSavedAt`, et l'inverse aussi — sans quoi
 * l'avertissement « non exportées » s'allume ou s'éteint tout seul.
 */
function touchMeta(store: Storage, missionId: string, update: (meta: DraftMeta) => DraftMeta): void {
  const metas = loadDraftMeta();
  const existing = metas.find((m) => m.missionId === missionId) ?? { missionId, lastExportedAt: null };
  const next = [...metas.filter((m) => m.missionId !== missionId), update(existing)];
  store.setItem(META_KEY, JSON.stringify(next));
}

/**
 * Vrai quand l'appareil porte des modifications plus récentes que le dernier
 * fichier emporté — y compris « jamais exportée », qui est le cas le plus
 * dangereux et pas une exception.
 */
export function hasUnexportedChanges(meta: DraftMeta | undefined): boolean {
  if (!meta?.lastSavedAt) return false;
  if (!meta.lastExportedAt) return true;
  return meta.lastSavedAt > meta.lastExportedAt;
}

/**
 * Contrôle de FORME seulement, pas de validité : `validateMission` est le
 * juge, et il tourne à l'ouverture d'une mission, pas à chaque lecture de la
 * liste. Ici on écarte uniquement ce qui n'a pas la tête d'une mission.
 */
function isMissionShape(value: unknown): value is Mission {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return typeof m.id === "string" && typeof m.createdAt === "string" && typeof m.header === "object" && m.header !== null && Array.isArray(m.passes);
}

function isDraftMetaShape(value: unknown): value is DraftMeta {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return typeof m.missionId === "string" && (m.lastExportedAt === null || typeof m.lastExportedAt === "string");
}
