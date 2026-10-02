import { shapeOf } from "@/lib/engine/catalog-shape";
import type { MetricEntry, MetricId, Snapshot, YearMonth } from "@/lib/engine/types";
import { draftFromEntry, type SheetDraft } from "./sheet-draft";

/*
 * What a person typed in a sheet and has not saved yet, kept across the
 * sheet's remounts (CHANTIERS.md A15.12, 2026-10-01). The board remounts its
 * panel on a tab change and a sheet on a fold (`panelKey`, StageTabs), and
 * the typing went with it, without a word.
 *
 * In memory only: the device keeps what is saved, never a half-typed form. A
 * draft belongs to the entry it started from — saved elsewhere, its
 * `updatedAt` changes and the draft no longer applies — and to its month, so
 * a number not yet typed this month and the same number corrected in a past
 * month (A14 T2) keep two drafts. Everything goes
 * when the whole engine is replaced (an import) or erased (engine-store.ts).
 */
const drafts = new Map<string, SheetDraft>();

export function draftKey(id: MetricId, entry: MetricEntry | undefined, month: YearMonth): string {
  return `${month}:${id}@${entry?.updatedAt ?? "new"}`;
}

export function keptDraft(key: string): SheetDraft | undefined {
  return drafts.get(key);
}

export function keepDraft(key: string, draft: SheetDraft): void {
  drafts.set(key, draft);
}

export function dropDraft(key: string): void {
  drafts.delete(key);
}

export function dropAllDrafts(): void {
  drafts.clear();
}

/**
 * A number opened to ask for it — the board's next step, or « Enregistre et
 * continue » leading to one request (A18 T3.b): its screen opens on « Je le
 * demande », unless something typed there is kept already.
 */
export function seedAskDraft(snapshot: Snapshot, id: MetricId): void {
  const entry = snapshot.metrics[id];
  const key = draftKey(id, entry, snapshot.referenceMonth);
  if (!keptDraft(key)) keepDraft(key, { ...draftFromEntry(entry, shapeOf(id)), mode: "ask" });
}
