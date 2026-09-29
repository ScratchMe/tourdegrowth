import { SLIDE_HEIGHT, SLIDE_WIDTH } from "./SlideFrame";

/**
 * Slide → PNG, in the browser — engine spec §10.2.
 *
 * `html-to-image` is reached ONLY through the dynamic `import()` below, on
 * the first click of an export button: it lands in its own chunk, fetched
 * then and never with the page (§10.3). A static `import … from
 * "html-to-image"` anywhere in `src/` fails `engine-boundary.test.ts` (rule 4).
 *
 * What goes over the network while it works: same-origin GETs of the page's
 * own font files, which it reads to embed them in the image. Nothing the user
 * typed is in any request — the canary spec (`e2e/engine-deck.spec.ts`)
 * records every request of an export and checks exactly that.
 */

export interface PngOptions {
  /** 3840×2160 instead of 1920×1080 — for a projector, or a slide pasted into a 4K deck. */
  hd: boolean;
}

/**
 * Renders one slide node to a PNG blob at its real size.
 *
 * The node must be the 1920×1080 slide itself, never its scaled thumbnail
 * wrapper: the scale is on the PARENT (§10.2), so the node's own computed
 * size is the projector size and `width`/`height` below only confirm it.
 * `pixelRatio` is set explicitly — left out, html-to-image uses the screen's
 * `devicePixelRatio`, and the same button would give a 1920 image on one
 * laptop and a 3840 one on the next.
 */
export async function renderSlidePng(node: HTMLElement, { hd }: PngOptions): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  // A slide drawn before its webfonts arrive is drawn in the fallback face,
  // and an image does not re-render when the font lands.
  await document.fonts.ready;
  const options = {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    pixelRatio: hd ? 2 : 1,
    cacheBust: false,
  };
  // The first render is thrown away: Safari's first pass can come out
  // without the embedded fonts (a known html-to-image behaviour, spec R7);
  // the second is the one that ships.
  await toBlob(node, options);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error("html-to-image returned no image");
  return blob;
}

/**
 * Hands a blob to the browser as a download. The link is attached to the
 * document before the click — a detached anchor does not download
 * everywhere (the audit instrument learned it on 2026-09-14) — and the URL
 * is revoked later, not in the same tick, so a download that has not started
 * yet is not cut off.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** The "Copy image" button exists only where the browser can put an image on the clipboard (§7 E5). */
export function canCopyImage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  );
}

/** Puts a PNG on the clipboard, ready to paste into the user's own deck. */
export async function copyPng(blob: Blob): Promise<void> {
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
