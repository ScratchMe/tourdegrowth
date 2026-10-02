"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import type { MetricId, RoleId } from "@/lib/engine/types";
import { calendarFile, requestReminderDay } from "@/lib/engine/ics";
import { buildRequest } from "@/lib/engine/request";
import { download, enginePageUrl } from "./download";
import { trackEngine } from "./engine-events";
import { fill, metricById } from "./text";
import type { EngineView } from "./view";
import { Field } from "@/components/core/Field";
import styles from "./Sheet.module.css";

/**
 * "Copy the request" (§6.13): the message to send to Finance, Data or
 * Product, built from the catalogue's "what to pull" lines — never a value,
 * the person is asking because they don't have one.
 *
 * The clipboard is the ONLY way the text leaves: no mail link, no share
 * sheet, nothing that would put a definition the person typed into a URL
 * (D16). When the browser refuses the clipboard (an old Safari, an iframe,
 * a denied permission) the message is shown in a read-only box to select by
 * hand — the request still counts as made, because the person now has it.
 *
 * `onCopied` marks the numbers `requested` (or stamps `remindedAt` for a
 * follow-up): the copy IS the act of asking, so there is no separate save.
 *
 * Once asked, « Me le rappeler » (§19.9, A14 T6) downloads a calendar file
 * for the day the board will say « à relancer »: the role and the numbers'
 * names from the catalogue, never a value, never the company.
 */
export function RequestCopy({
  role,
  ids,
  label,
  view,
  onCopied,
  variant = "secondary",
}: {
  role: RoleId;
  ids: MetricId[];
  label: string;
  view: EngineView;
  onCopied: () => void;
  variant?: "primary" | "secondary" | "quiet";
}) {
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);
  // The numbers asked, kept from the copy: copying marks them requested, which empties `ids`.
  const [asked, setAsked] = useState<MetricId[]>([]);
  const fallbackId = useId();

  function remind() {
    const r = view.strings.reminders;
    const roleName = view.strings.role[role];
    const day = requestReminderDay(new Date());
    const title = asked.length === 1 ? fill(r.requestTitleOne, { role: roleName }) : fill(r.requestTitle, { role: roleName, n: asked.length });
    const list = asked.map((id) => metricById(view.metrics, id).name).join("\n");
    const file = calendarFile({
      uid: `${globalThis.crypto.randomUUID()}@tourdegrowth.com`,
      stamp: new Date(),
      day,
      title,
      // The list, then the page's address — also in URL, which not every calendar shows (§19.9).
      description: `${fill(asked.length === 1 ? r.requestDescriptionOne : r.requestDescription, { role: roleName, list })}\n\n${enginePageUrl()}`,
      url: enginePageUrl(),
    });
    const date = `${day.year}-${String(day.month).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
    download(file, fill(r.fileName, { date }), "text/calendar;charset=utf-8");
    trackEngine({ name: "engine_exported", detail: "ics" });
  }

  async function copy() {
    const text = buildRequest(role, ids, view.strings, view.metrics, view.state, view.ctx);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = false;
    }
    setOutcome({ ok, text });
    setAsked(ids);
    trackEngine({ name: "engine_request_copied" });
    onCopied();
  }

  // With nothing left to ask, the button goes but the outcome stays: copying
  // marks the numbers requested, which empties this very list — and a
  // fallback text that vanished at the moment it was needed would be no
  // fallback at all.
  if (ids.length === 0 && !outcome) return null;
  return (
    <div className={styles.request}>
      {ids.length ? (
        <Button variant={variant} onClick={() => void copy()} data-testid="engine-request-copy">
          {label}
        </Button>
      ) : null}
      {outcome && asked.length > 0 ? (
        <Button variant="quiet" onClick={remind} data-testid="engine-request-remind">
          {view.strings.reminders.request}
        </Button>
      ) : null}
      {/* Always in the DOM so the confirmation is announced when it appears. */}
      <p className={styles.requestStatus} role="status" aria-live="polite">
        {outcome?.ok ? view.strings.request.copied : ""}
      </p>
      {outcome && !outcome.ok ? (
        // Not a TextArea: nothing is typed here, so no limit and no count —
        // only the text to select and copy by hand.
        <Field size="sm" id={fallbackId} label={view.strings.request.copy} hint={view.strings.workbench.copyFailed}>
          {({ id: textId, describedBy }) => (
            <textarea
              id={textId}
              className={styles.requestFallback}
              readOnly
              rows={7}
              value={outcome.text}
              aria-describedby={describedBy}
              onFocus={(event) => event.currentTarget.select()}
              data-testid="engine-request-fallback"
            />
          )}
        </Field>
      ) : null}
    </div>
  );
}
