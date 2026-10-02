"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Disclosure } from "@/components/core/Disclosure";
import { Field } from "@/components/core/Field";
import { TextArea } from "@/components/core/TextArea";
import { motionShapes, shapeOf } from "@/lib/engine/catalog-shape";
import type { EngineStrings } from "@/lib/engine/strings";
import { tablePreview, type TablePreview, type TableRefusal, type TableRow } from "./csv";
import { entryText } from "./display";
import { fill, metricById } from "./text";
import type { EngineView } from "./view";
import styles from "./Screens.module.css";

/** A pasted table is a few thousand characters: the cap only says how much the box holds, never blocks. */
const PASTE_LIMIT = 20_000;

const REASON_KEY: Record<TableRefusal, keyof EngineStrings["table"]["reasons"]> = {
  unknown: "unknown",
  hidden: "hidden",
  duplicate: "duplicate",
  unreadable: "unreadable",
  incomplete: "incomplete",
  "denominator-zero": "denominatorZero",
  "num-gt-den": "numGtDen",
  negative: "negative",
  "percent-range": "percentRange",
  text: "text",
  sheet: "sheet",
  shared: "shared",
};

/**
 * « Saisie en tableau » (engine spec §19.6, C32 Q11, A14 T5), under « À aller
 * chercher »: the template to download, pre-filled with the month's found
 * numbers, and a box to paste it back. « Lire le tableau » shows every row —
 * new, changed with what it replaces, unchanged, refused with its reason —
 * and the numbers a shared count would move; nothing is written until
 * « Appliquer », which reads the box again against the month as it is then.
 */
export function TableEntry({
  view,
  onTemplate,
  onApply,
  open,
  onOpenChange,
  id,
}: {
  view: EngineView;
  onTemplate: () => void;
  onApply: (preview: TablePreview) => boolean;
  /** Controlled from the board: the menu's « Saisie en tableau » opens it (A18 T2.a). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
}) {
  const { strings, state, ctx } = view;
  const t = strings.table;
  const [text, setText] = useState("");
  const [read, setRead] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const preview = read === null ? null : tablePreview(read, state, motionShapes(state.setup.motions), view.metrics, strings, ctx.locale, new Date().toISOString());

  const nameOf = (id: string) => metricById(view.metrics, id as never).name;
  const valueOf = (row: Extract<TableRow, { entry: unknown }>, which: "entry" | "before") => {
    const entry = which === "entry" ? row.entry : row.before;
    return entry ? entryText(entry, shapeOf(row.id), state.setup.currency, ctx, strings) : "";
  };
  const rowText = (row: TableRow): string => {
    if (row.kind === "refused") {
      const reason = fill(t.reasons[REASON_KEY[row.reason]], { other: row.other ? nameOf(row.other) : "" });
      return fill(t.refused, { reason });
    }
    if (row.kind === "same") return t.same;
    if (row.kind === "new") return fill(t.new, { after: valueOf(row, "entry") });
    return fill(t.changed, { before: valueOf(row, "before"), after: valueOf(row, "entry") });
  };

  return (
    <Disclosure summary={t.title} open={open} onOpenChange={onOpenChange} id={id} data-testid="engine-table">
      <div className={styles.table}>
        <p className={styles.lead}>{t.intro}</p>
        <div>
          <Button variant="secondary" size="sm" onClick={onTemplate} data-testid="engine-table-template">
            {t.download}
          </Button>
        </div>
        <Field label={t.pasteLabel} hint={t.pasteHint}>
          {({ id, describedBy }) => (
            <TextArea
              id={id}
              aria-describedby={describedBy}
              value={text}
              onChange={(value) => {
                setText(value);
                setApplied(false);
              }}
              maxLength={PASTE_LIMIT}
              rows={6}
              spellCheck={false}
              data-testid="engine-table-paste"
            />
          )}
        </Field>
        <div>
          <Button variant="secondary" size="sm" onClick={() => setRead(text)} disabled={text.trim() === ""} data-testid="engine-table-read">
            {t.read}
          </Button>
        </div>

        {preview ? (
          <div className={styles.tablePreview} data-testid="engine-table-preview">
            <p className={styles.tablePreviewTitle}>{t.previewTitle}</p>
            {preview.rows.length > 0 || preview.following.length > 0 ? (
              <ul className={styles.tableRows}>
                {preview.rows.map((row) => (
                  <li key={row.line} data-kind={row.kind} data-testid={`engine-table-row-${row.line}`}>
                    <span className={styles.tableLine}>{fill(t.line, { line: row.line })}</span>{" "}
                    <strong>{row.id ? nameOf(row.id) : row.label}</strong> · {rowText(row)}
                  </li>
                ))}
                {preview.following.map((f) => (
                  <li key={`follow-${f.id}`} data-kind="following" data-testid={`engine-table-following-${f.id}`}>
                    {fill(t.following, {
                      name: nameOf(f.id),
                      before: entryText(f.before, shapeOf(f.id), state.setup.currency, ctx, strings),
                      after: entryText(f.after, shapeOf(f.id), state.setup.currency, ctx, strings),
                    })}
                  </li>
                ))}
              </ul>
            ) : null}
            {preview.empty > 0 ? <p className={styles.tableLine}>{preview.empty === 1 ? t.emptyOne : fill(t.empty, { n: preview.empty })}</p> : null}
            {preview.count === 0 ? <p className={styles.lead}>{t.nothing}</p> : null}
            <div className={styles.panelActions}>
              {/* Nothing to apply: « Aucun chiffre à appliquer » says so above, and no greyed « Appliquer 0 chiffres ». */}
              {preview.count > 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!onApply(preview)) return;
                    setRead(null);
                    setText("");
                    setApplied(true);
                  }}
                  data-testid="engine-table-apply"
                >
                  {preview.count === 1 ? t.applyOne : fill(t.apply, { n: preview.count })}
                </Button>
              ) : null}
              <Button variant="quiet" size="sm" onClick={() => setRead(null)} data-testid="engine-table-cancel">
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : null}
        {applied ? (
          <p className={styles.lead} role="status" data-testid="engine-table-applied">
            {t.applied}
          </p>
        ) : null}
      </div>
    </Disclosure>
  );
}
