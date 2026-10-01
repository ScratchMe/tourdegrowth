/**
 * A download that never touches the network: a Blob URL on an anchor IN the
 * document (a detached one doesn't download everywhere), revoked later so a
 * slow start isn't cut. The engine's files — the `.json`, the table's
 * template, the reminders' `.ics` (A14 T5, T6) — all leave this way.
 */
export function download(text: string, fileName: string, type = "application/json"): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** The engine's page as a reminder links back to it: no query, no fragment — nothing the person typed. */
export function enginePageUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}
