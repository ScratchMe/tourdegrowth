import type { MetricEntry, MetricId } from "@/lib/engine/types";
import type { SheetDraft } from "./sheet-draft";

/*
 * What a person typed in a sheet and has not saved yet, kept across the
 * sheet's remounts (CHANTIERS.md A15.12, 2026-10-01). The board remounts its
 * panel on a tab change and a sheet on a fold (`panelKey`, StageTabs), and
 * the typing went with it, without a word.
 *
 * In memory only: the device keeps what is saved, never a half-typed form. A
 * draft belongs to the entry it started from — saved elsewhere, its
 * `updatedAt` changes and the draft no longer applies — and everything goes
 * when the whole engine is replaced (an import) or erased (engine-store.ts).
 */
const drafts = new Map<string, SheetDraft>();

export function draftKey(id: MetricId, entry: MetricEntry | undefined): string {
  return `${id}@${entry?.updatedAt ?? "new"}`;
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
