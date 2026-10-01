"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { Choices } from "@/components/core/Choices";
import { shapeOf } from "@/lib/engine/catalog-shape";
import { formatInterval, formatNumber } from "@/lib/engine/format";
import { mergeEngines, mergeRefusal, type MergeChange } from "@/lib/engine/merge";
import type { EngineStrings, ResolvedMetric } from "@/lib/engine/strings";
import { MAX_ENGINES, MAX_MONTHS, type EngineCalcContext, type EngineState, type Motion, type Snapshot } from "@/lib/engine/types";
import { coverage, motionCoverage } from "@/lib/engine/coverage";
import { parseEngineFile } from "@/lib/engine/io";
import { displayInterval, entryText } from "./display";
import { fill, formatDate, formatMonth, metricById } from "./text";
import { Field } from "@/components/core/Field";
import styles from "./Screens.module.css";

/** What a file does once read (§19.7): opened on an empty device, or one of the three choices beside an engine. */
export type ImportChoice = "add" | "replace" | "merge";

type Parsed = ReturnType<typeof parseEngineFile>;

/**
 * Opening a `.json` saved on another device (spec §7 E7). The file is read
 * in the browser (`File.text()`) — it never travels — and SHOWN before it
 * changes anything: which company, which month, how many numbers.
 *
 * Beside an engine on screen, three choices (§19.7, C32 Q13, A14 T5):
 * « Ajouter comme nouveau moteur », the default — nothing is lost or mixed —
 * greyed at `MAX_ENGINES`; « Remplacer {nom} », what v1 did; « Fusionner
 * dans {nom} », greyed with its reason when the two engines would not
 * measure the same thing, and listing every change it makes before the
 * button. Nothing is ever written silently.
 *
 * A file from a NEWER schema is refused outright (we cannot read what we
 * don't know); a file that is merely incomplete opens with its warnings
 * listed, the way the audit's import does — refusing a half-filled engine
 * would lose the half that is there.
 */
export function ImportPanel({
  strings,
  locale,
  metrics,
  device,
  onOpen,
  onCancel,
}: {
  strings: EngineStrings;
  locale: "en" | "fr";
  metrics: ResolvedMetric[];
  /** The engine on screen, its name, and whether the device has room for another; null on an empty device. */
  device: { state: EngineState; name: string; canAdd: boolean } | null;
  /** `choice` is null on an empty device: the file is simply opened. */
  onOpen: (state: EngineState, choice: ImportChoice | null) => void;
  onCancel: () => void;
}) {
  const inputId = useId();
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [picked, setPicked] = useState<ImportChoice | null>(null);

  async function read(file: File | undefined) {
    if (!file) return;
    // Each file is chosen for afresh: « Remplacer » picked for the one before is never carried to this one.
    setPicked(null);
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
  const refusal = state && device ? mergeRefusal(device.state, state) : null;
  // « Ajouter » by default (§19.7): the choice that loses nothing; then the merge, which only adds; never « Remplacer » unasked.
  const choice: ImportChoice | null = picked ?? (device?.canAdd ? "add" : refusal === null ? "merge" : null);
  const merged = state && device && choice === "merge" ? mergeEngines(device.state, state) : null;
  const apply = device ? (choice === "add" ? strings.io.addApply : choice === "merge" ? strings.io.mergeApply : strings.io.replace) : strings.workbench.importOpen;

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

      {state && device ? (
        <div data-testid="engine-import-choices">
          <Choices<ImportChoice>
            legend={strings.io.choiceLabel}
            size="sm"
            value={choice}
            onChange={setPicked}
            options={[
              { value: "add", label: strings.io.add, disabled: !device.canAdd, disabledNote: fill(strings.io.addFull, { max: MAX_ENGINES }) },
              { value: "replace", label: fill(strings.io.replaceNamed, { name: device.name }), note: fill(strings.io.replaceHint, { name: device.name }) },
              {
                value: "merge",
                label: fill(strings.io.merge, { name: device.name }),
                note: strings.io.mergeHint,
                disabled: refusal !== null,
                ...(refusal ? { disabledNote: fill(strings.io.mergeRefused[refusal], { max: MAX_MONTHS }) } : {}),
              },
            ]}
          />
        </div>
      ) : null}

      {merged?.kind === "ok" && device ? (
        <div className={styles.preview} data-testid="engine-import-merge">
          <p className={styles.tablePreviewTitle}>{strings.io.mergeTitle}</p>
          {merged.changes.length === 0 ? (
            <p className={styles.previewLine}>{fill(strings.io.mergeNothing, { name: device.name })}</p>
          ) : (
            <ul className={styles.tableRows}>
              {merged.changes.map((change, i) => (
                <li key={i} data-kind={change.kind}>
                  {changeLine(change, device.state, strings, metrics, locale)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className={styles.panelActions}>
        {state ? (
          <Button variant="secondary" onClick={() => onOpen(state, device ? choice : null)} disabled={device !== null && choice === null} data-testid="engine-import-open">
            {apply}
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

/**
 * One change of a merge, as the preview lists it (§19.7): the month, the
 * number, what it was and what it becomes — through the engine's own
 * formatter, so the preview and the board cannot word one value two ways.
 */
function changeLine(change: MergeChange, into: EngineState, strings: EngineStrings, metrics: ResolvedMetric[], locale: "en" | "fr"): string {
  const io = strings.io;
  const ctx: EngineCalcContext = { today: new Date(), locale };
  const currency = into.setup.currency;
  const month = formatMonth(change.month, locale);
  switch (change.kind) {
    case "month-added":
      return fill(io.monthAdded, { month });
    case "filled":
      return fill(io.filled, { month, name: metricById(metrics, change.id).name, after: entryText(change.after, shapeOf(change.id), currency, ctx, strings) });
    case "replaced":
      return fill(io.replaced, {
        month,
        name: metricById(metrics, change.id).name,
        before: entryText(change.before, shapeOf(change.id), currency, ctx, strings),
        after: entryText(change.after, shapeOf(change.id), currency, ctx, strings),
      });
    case "target-filled":
      return fill(io.targetFilled, {
        month,
        name: metricById(metrics, change.id).name,
        after: displayInterval({ lo: change.after, hi: change.after }, "solid", shapeOf(change.id), currency, ctx, strings),
      });
    case "count-filled":
      return fill(io.countFilled, { month, count: io.sharedCount[change.count], after: formatNumber(change.after, locale) });
    case "pipeline-filled":
      return fill(io.pipelineFilled, { month, after: formatInterval({ lo: change.after, hi: change.after }, "money", ctx, strings.units, { currency }) });
    case "closed":
      return fill(io.closed, { month, date: formatDate(change.closedAt, locale) });
  }
}
