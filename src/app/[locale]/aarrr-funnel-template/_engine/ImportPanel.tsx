"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import type { EngineStrings } from "@/lib/engine/strings";
import type { EngineState, Motion, Snapshot } from "@/lib/engine/types";
import { coverage, motionCoverage } from "@/lib/engine/coverage";
import { parseEngineFile } from "@/lib/engine/io";
import { fill, formatMonth } from "./text";
import { Field } from "@/components/core/Field";
import styles from "./Screens.module.css";

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
      {/* The file button stays the browser's for now: extension 04 wants it a
          secondary Button over a hidden input, a later port (CHANTIERS.md A10). */}
      <Field id={inputId} label={strings.actions.import}>
        {({ id: fileId, describedBy }) => (
          <input
            id={fileId}
            className={styles.file}
            type="file"
            accept="application/json,.json"
            aria-describedby={describedBy}
            onChange={(event) => void read(event.target.files?.[0])}
            data-testid="engine-import-file"
          />
        )}
      </Field>

      {parsed?.refusal ? (
        <p className={styles.error} role="alert" data-testid="engine-import-refused">
          {parsed.refusal === "unknown-version"
            ? strings.io.unknownVersion
            : parsed.refusal === "unsupported-setup"
              ? strings.io.unsupportedSetup
              : strings.io.notEngine}
        </p>
      ) : null}

      {state && snapshot && cov ? (
        <div className={styles.preview} data-testid="engine-import-preview">
          <p className={styles.previewLine}>
            {previewLine(state, snapshot, strings, locale) ??
              fill(strings.io.importPreview, {
                company: state.setup.companyLabel || strings.workbench.noCompany,
                month: formatMonth(snapshot.referenceMonth, locale),
                n: cov.found,
                N: cov.denominator,
              })}
          </p>
          {/* A v1 file was migrated on the way in (§18.3.2): said once, so nobody wonders what « updated » did to their numbers. */}
          {parsed?.migratedFrom === 1 ? (
            <p className={styles.previewLine} data-testid="engine-import-migrated">
              {strings.io.migrated}
            </p>
          ) : null}
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

/**
 * A file that holds sales-assisted numbers (§18.1.2): the count per motion,
 * a motion unticked but kept said as « (masqué) » — « Mon produit · août
 * 2026 · libre-service 11 sur 17 · assisté 10 sur 15 (masqué) ». null for a
 * self-serve-only file, which keeps the v1 line.
 */
function previewLine(state: EngineState, snapshot: Snapshot, strings: EngineStrings, locale: "en" | "fr"): string | null {
  const hasSlgData = Object.keys(snapshot.metrics).some((id) => id.startsWith("slg.") || id.startsWith("link."));
  if (!state.setup.motions.slg && !hasSlgData) return null;
  const counts = (["plg", "slg"] as const satisfies readonly Motion[])
    .map((m) => {
      const cov = motionCoverage(snapshot, m);
      const shown = state.setup.motions[m];
      // A motion neither ticked nor holding a number says nothing worth a line.
      if (!shown && cov.found + cov.approximate + cov.missing + cov.requested === 0) return null;
      return fill(shown ? strings.hybrid.motionCount : strings.hybrid.motionCountHidden, {
        motion: strings.hybrid.motionAdjective[m],
        n: cov.found,
        N: cov.denominator,
      });
    })
    .filter((x): x is string => x !== null);
  return fill(strings.io.importPreviewMotions, {
    company: state.setup.companyLabel || strings.workbench.noCompany,
    month: formatMonth(snapshot.referenceMonth, locale),
    counts: counts.join(" · "),
  });
}
