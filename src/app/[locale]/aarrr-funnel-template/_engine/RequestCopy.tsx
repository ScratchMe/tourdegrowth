"use client";

import { useId, useState } from "react";
import { Button } from "@/components/core/Button";
import type { MetricId, RoleId } from "@/lib/engine/types";
import { buildRequest } from "@/lib/engine/request";
import { trackEngine } from "./engine-events";
import type { EngineView } from "./view";
import { Field } from "./_ui/Field";
import styles from "./Sheet.module.css";
import ui from "./_ui/ui.module.css";

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
  const fallbackId = useId();

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
      {/* Always in the DOM so the confirmation is announced when it appears. */}
      <p className={styles.requestStatus} role="status" aria-live="polite">
        {outcome?.ok ? view.strings.request.copied : ""}
      </p>
      {outcome && !outcome.ok ? (
        <Field label={view.strings.request.copy} hint={view.strings.workbench.copyFailed} htmlFor={fallbackId}>
          <textarea
            id={fallbackId}
            className={[ui.control, styles.requestFallback].join(" ")}
            readOnly
            rows={7}
            value={outcome.text}
            aria-describedby={`${fallbackId}-hint`}
            onFocus={(event) => event.currentTarget.select()}
            data-testid="engine-request-fallback"
          />
        </Field>
      ) : null}
    </div>
  );
}
