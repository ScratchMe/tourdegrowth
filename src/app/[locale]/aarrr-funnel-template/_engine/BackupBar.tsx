import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import type { EngineStrings } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import { fill, formatDate } from "./text";
import styles from "./Screens.module.css";

/** Whether the device holds changes no file does yet (§4.3): never exported, or edited since. */
export function needsBackup(state: EngineState): boolean {
  return !state.lastExportedAt || state.lastExportedAt < state.updatedAt;
}

/**
 * The backup band (spec §4.3), up for as long as the device holds changes
 * no file does. Not dismissible: the engine lives in ONE browser, Safari
 * erases a site's data after seven days without a visit, and the only copy
 * that survives that is the `.json` the person downloads. A caveat, not an
 * alarm — dashed ink, no red (the red is for a diagnosis).
 */
export function BackupBar({
  state,
  strings,
  locale,
  onSave,
}: {
  state: EngineState;
  strings: EngineStrings;
  locale: "en" | "fr";
  onSave: () => void;
}) {
  if (!needsBackup(state)) return null;
  return (
    <Callout
      tone="caveat"
      data-testid="engine-backup"
      action={
        <Button variant="secondary" onClick={onSave} data-testid="engine-backup-save">
          {strings.actions.save}
        </Button>
      }
    >
      <p className={styles.backupText}>{strings.storage.backupWarning}</p>
      <p className={styles.backupMeta}>
        {state.lastExportedAt ? fill(strings.storage.lastExported, { date: formatDate(state.lastExportedAt, locale) }) : strings.storage.neverExported}
      </p>
    </Callout>
  );
}
