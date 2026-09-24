"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import type { EngineStrings } from "@/lib/engine/strings";
import { fill } from "./text";
import { Field } from "./_ui/Field";
import { TextField } from "./_ui/TextField";
import styles from "./Screens.module.css";

/**
 * "Erase everything" (spec §4.3, §7 E7) — a screen, not a modal, with the
 * audit's purge guard: retype the company's name, or ERASE / EFFACER when
 * there is none. A single click must never destroy the only copy of a
 * week's collection; retyping a word is the smallest act that cannot happen
 * by accident. Compared trimmed and case-sensitive, like the audit.
 */
export function EraseDialog({
  strings,
  companyLabel,
  onErase,
  onCancel,
}: {
  strings: EngineStrings;
  companyLabel: string | undefined;
  onErase: () => void;
  onCancel: () => void;
}) {
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const word = companyLabel?.trim() || strings.erase.fallbackWord;
  const matches = typed.trim() === word;

  return (
    <Card elevation="flat" className={styles.panel} data-testid="engine-erase">
      <h2 id="engine-erase-title" className={styles.panelTitle} tabIndex={-1}>
        {strings.erase.title}
      </h2>
      <p className={styles.lead}>{strings.erase.body}</p>
      <Field label={fill(strings.erase.confirmLabel, { word })} htmlFor={inputId}>
        <TextField id={inputId} value={typed} onChange={setTyped} />
      </Field>
      <div className={styles.panelActions}>
        <Button variant="secondary" onClick={onErase} disabled={!matches} data-testid="engine-erase-confirm">
          {strings.erase.confirm}
        </Button>
        <Button variant="quiet" onClick={onCancel} data-testid="engine-erase-cancel">
          {strings.io.cancel}
        </Button>
      </div>
    </Card>
  );
}
