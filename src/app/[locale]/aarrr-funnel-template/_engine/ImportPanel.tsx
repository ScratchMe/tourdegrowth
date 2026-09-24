"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import type { EngineStrings } from "@/lib/engine/strings";
import type { EngineState } from "@/lib/engine/types";
import { coverage, parseEngineFile } from "./engine-api";
import { fill, formatMonth } from "./text";
import { Field } from "./_ui/Field";
import styles from "./Screens.module.css";
import ui from "./_ui/ui.module.css";

type Parsed = ReturnType<typeof parseEngineFile>;

/**
 * Opening a `.json` saved on another device (spec §7 E7). The file is read
 * in the browser (`File.text()`) — it never travels — and SHOWN before it
 * replaces anything: which company, which month, how many numbers. An
 * engine already on this device is replaced only on an explicit "Replace";
 * there is no merge in v1, and a silent overwrite would lose one side.
 *
 * A file from a NEWER schema is refused outright (we cannot read what we
 * don't know); a file that is merely incomplete opens with its warnings
 * listed, the way the audit's import does — refusing a half-filled engine
 * would lose the half that is there.
 */
export function ImportPanel({
  strings,
  locale,
  hasEngine,
  onOpen,
  onCancel,
}: {
  strings: EngineStrings;
  locale: "en" | "fr";
  hasEngine: boolean;
  onOpen: (state: EngineState) => void;
  onCancel: () => void;
}) {
  const inputId = useId();
  const [parsed, setParsed] = useState<Parsed | null>(null);

  async function read(file: File | undefined) {
    if (!file) return;
    let text: string;
    try {
      text = await file.text();
    } catch {
      setParsed({ state: null, errors: [], refusal: "unreadable" });
      return;
    }
    setParsed(parseEngineFile(text));
  }

  const state = parsed?.state ?? null;
  const snapshot = state?.snapshots[state.snapshots.length - 1];
  const cov = snapshot ? coverage(snapshot) : null;

  return (
    <Card elevation="flat" className={styles.panel} data-testid="engine-import">
      <h2 id="engine-import-title" className={styles.panelTitle} tabIndex={-1}>
        {strings.io.importTitle}
      </h2>
      <Field label={strings.actions.import} htmlFor={inputId}>
        <input
          id={inputId}
          className={[ui.control, styles.file].join(" ")}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void read(event.target.files?.[0])}
          data-testid="engine-import-file"
        />
      </Field>

      {parsed?.refusal ? (
        <p className={ui.error} role="alert" data-testid="engine-import-refused">
          {parsed.refusal === "unknown-version" ? strings.io.unknownVersion : strings.io.notEngine}
        </p>
      ) : null}

      {state && snapshot && cov ? (
        <div className={styles.preview} data-testid="engine-import-preview">
          <p className={styles.previewLine}>
            {fill(strings.io.importPreview, {
              company: state.setup.companyLabel || strings.workbench.noCompany,
              month: formatMonth(snapshot.referenceMonth, locale),
              n: cov.found,
              N: cov.denominator,
            })}
          </p>
          {parsed?.errors.length ? (
            <div className={styles.warnings}>
              <p>{fill(strings.io.warnings, { n: parsed.errors.length })}</p>
              {/* The validator's own lines: technical, but exact — the person can fix the file with them. */}
              <ul>
                {parsed.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.panelActions}>
        {state ? (
          <Button variant="secondary" onClick={() => onOpen(state)} data-testid="engine-import-open">
            {hasEngine ? strings.io.replace : strings.workbench.importOpen}
          </Button>
        ) : null}
        <Button variant="quiet" onClick={onCancel} data-testid="engine-import-cancel">
          {strings.io.cancel}
        </Button>
      </div>
    </Card>
  );
}
