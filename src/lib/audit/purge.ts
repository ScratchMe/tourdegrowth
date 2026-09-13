import type { Entry, Finding, Mission, Observation, Pass } from "./schema";

/**
 * purge.ts — séparer les valeurs de la structure.
 *
 * Le fichier de mission vit sur l'appareil d'Antoine, et c'est le même
 * problème juridique que la base du side project : un MRR consolidé d'une
 * société détenue par un fonds est de l'information non publique, et un NDA
 * ne distingue pas un serveur d'un disque. La conséquence est une décision
 * de conception, pas de prudence : les absolus doivent pouvoir sortir d'un
 * fichier en laissant intact ce qui est réutilisable et montrable — les
 * statuts, les causes, les coûts de réparation, les définitions et les
 * écarts de convention.
 *
 * Ce que la purge retire : le nom de l'entreprise, le périmètre, toute
 * valeur d'observation, toute exposition chiffrée, toute prose (constats,
 * bloc de tête, décision en jeu, action négociée), les systèmes sources
 * nommés et le routage. Ce qu'elle garde : tout ce qui est un vocabulaire
 * fermé ou une définition. Les compteurs et le diff entre passes donnent le
 * même résultat avant et après — un test le vérifie.
 *
 * `canonicalDeviation` est gardé : c'est « l'écart » que la séparabilité
 * existe pour préserver. Il est rédigé, donc il PEUT contenir un absolu ; la
 * règle d'écriture (AUDIT.md §5) est d'y décrire une convention, jamais un
 * chiffre, et le readout purgé l'affiche tel quel.
 */
export function purgeMission(mission: Mission): Mission {
  return {
    ...mission,
    purged: true,
    header: { ...mission.header, company: "", scope: "" },
    passes: mission.passes.map(purgePass),
  };
}

function purgePass(pass: Pass): Pass {
  return {
    ...pass,
    ...(pass.label !== undefined ? { label: "" } : {}),
    entries: pass.entries.map(purgeEntry),
    findings: pass.findings.map(purgeFinding),
    brief: { mainFinding: "", priorityAction: "", proof: "" },
  };
}

function purgeEntry(entry: Entry): Entry {
  const { exposure: _exposure, decisionAtStake: _decision, tracking: _tracking, ...kept } = entry;
  return {
    ...kept,
    observations: entry.observations.map(purgeObservation),
    ...(entry.criterion ? { criterion: { ...entry.criterion, justification: entry.criterion.justification ? "" : undefined } } : {}),
  };
}

function purgeObservation(observation: Observation): Observation {
  const { sourceSystem: _system, ...kept } = observation;
  return { ...kept, value: null };
}

function purgeFinding(finding: Finding): Finding {
  const { agreedAction: _agreed, ...kept } = finding;
  return {
    ...kept,
    title: "",
    criteria: "",
    condition: "",
    consequence: "",
    correctiveAction: "",
    ledger: { problem: "", evidence: "", hypothesis: "", decision: "", expected: "" },
  };
}
