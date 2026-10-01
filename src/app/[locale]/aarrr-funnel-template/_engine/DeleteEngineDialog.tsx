"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import type { EngineStrings } from "@/lib/engine/strings";
import { fill } from "./text";
import styles from "./Screens.module.css";

/**
 * « Supprimer ce moteur » (engine spec §19.1.5, A14 T5) — a screen, like
 * « Tout effacer », but for one engine: its file is offered FIRST, the
 * deletion second, and the other engines of the device are never touched.
 * No word to retype: the other engines stay, and the file is one click away
 * on the same screen — what « Tout effacer » guards against, losing the only
 * copy of everything, cannot happen here without passing that button.
 */
export function DeleteEngineDialog({
  name,
  strings,
  onSave,
  onDelete,
  onCancel,
}: {
  name: string;
  strings: EngineStrings;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const e = strings.engines;
  const [saved, setSaved] = useState(false);
  return (
    <Card elevation="flat" className={styles.panel} data-testid="engine-delete">
      <h2 id="engine-delete-title" className={styles.panelTitle} tabIndex={-1}>
        {fill(e.deleteTitle, { name })}
      </h2>
      <p className={styles.lead}>{e.deleteBody}</p>
      <div className={styles.panelActions}>
        <Button
          variant="secondary"
          onClick={() => {
            onSave();
            setSaved(true);
          }}
          data-testid="engine-delete-save"
        >
          {strings.actions.save}
        </Button>
        <Button variant="quiet" onClick={onDelete} data-testid="engine-delete-confirm">
          {e.deleteConfirm}
        </Button>
        <Button variant="quiet" onClick={onCancel} data-testid="engine-delete-cancel">
          {e.cancel}
        </Button>
      </div>
      {saved ? (
        <p className={styles.lead} role="status" data-testid="engine-delete-saved">
          {e.deleteSaved}
        </p>
      ) : null}
    </Card>
  );
}
