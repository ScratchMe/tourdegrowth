import type { Entry, Tracking } from "./schema";

/**
 * tracking.ts — où en est une demande, et laquelle relancer.
 *
 * `Tracking` est explicitement du **pilotage** : il sert à savoir quoi
 * relancer et ne s'imprime JAMAIS dans un constat (AUDIT.md §3). Ce module
 * est donc une pure dérivation pour la vue collecte — jamais pour le
 * livrable.
 *
 * L'horloge repart à la **relance**, pas à la demande : « demandé il y a dix
 * jours, relancé hier » et « demandé il y a dix jours, jamais relancé » sont
 * deux situations différentes, et seule la seconde appelle une action de
 * l'auditeur. Confondre les deux ferait remonter en tête une ligne dont on
 * vient de s'occuper.
 */
export const CHASE_STATES = ["not-requested", "waiting", "overdue", "received"] as const;
export type ChaseState = (typeof CHASE_STATES)[number];

/**
 * Sept jours. Pas une norme : un diagnostic se mène en jours, et une demande
 * sans réponse au bout d'une semaine est un fait sur l'accès — ce que
 * `not-accessible` finit par dire. La valeur est ici, en clair, pour qu'une
 * mission plus lente la change en un endroit.
 */
export const OVERDUE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Jours entiers écoulés entre deux dates ISO, ou `null` si l'une est absente ou illisible. */
export function daysBetween(fromISO: string | undefined, toISO: string): number | null {
  if (!fromISO) return null;
  const from = Date.parse(fromISO);
  const to = Date.parse(toISO);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.floor((to - from) / DAY_MS);
}

export function chaseState(tracking: Tracking | undefined, todayISO: string): ChaseState {
  if (tracking?.receivedOn) return "received";
  if (!tracking?.requestedOn) return "not-requested";
  // L'horloge repart à la dernière relance quand il y en a eu une.
  const since = daysBetween(tracking.chasedOn ?? tracking.requestedOn, todayISO);
  // Une date illisible ou dans le futur n'invente pas un retard : sans
  // certitude, la ligne reste « en attente » plutôt que d'être remontée en
  // tête d'une liste d'actions.
  if (since === null || since < 0) return "waiting";
  return since >= OVERDUE_DAYS ? "overdue" : "waiting";
}

/**
 * Les lignes à relancer, la plus ancienne d'abord. Une ligne reçue ou jamais
 * demandée n'y est pas : c'est une liste d'actions, pas un inventaire.
 */
export function toChase(entries: readonly Entry[], todayISO: string): Entry[] {
  return entries
    .filter((entry) => chaseState(entry.tracking, todayISO) === "overdue")
    .sort((a, b) => {
      const left = daysBetween(a.tracking?.chasedOn ?? a.tracking?.requestedOn, todayISO) ?? 0;
      const right = daysBetween(b.tracking?.chasedOn ?? b.tracking?.requestedOn, todayISO) ?? 0;
      return right - left;
    });
}

/**
 * Le groupement de la vue collecte : par interlocuteur quand il est
 * renseigné, par système source sinon, et « non attribué » en dernier.
 *
 * Deux clés parce que c'est ainsi qu'une collecte se mène réellement : on
 * prépare une réunion (« tout ce que je dois demander au DAF ») ou un export
 * (« tout ce qui sort de Stripe »). Un groupement par pilier serait la vue du
 * livrable, pas celle du travail.
 */
export const UNASSIGNED_GROUP = "";

export function groupKey(entry: Entry): string {
  const routed = entry.tracking?.routedTo?.trim();
  if (routed) return routed;
  const system = entry.observations.find((observation) => observation.sourceSystem?.trim())?.sourceSystem?.trim();
  return system ?? UNASSIGNED_GROUP;
}

export interface CollectGroup {
  key: string;
  entries: Entry[];
}

export function groupForCollect(entries: readonly Entry[]): CollectGroup[] {
  const byKey = new Map<string, Entry[]>();
  for (const entry of entries) {
    const key = groupKey(entry);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(entry);
    else byKey.set(key, [entry]);
  }
  return [...byKey.entries()]
    .map(([key, grouped]) => ({ key, entries: grouped }))
    // Les groupes nommés d'abord, par ordre alphabétique ; « non attribué »
    // ferme la marche — c'est le tas dans lequel on pioche, pas une réunion.
    .sort((a, b) => {
      if (a.key === UNASSIGNED_GROUP) return 1;
      if (b.key === UNASSIGNED_GROUP) return -1;
      return a.key.localeCompare(b.key, "fr");
    });
}
