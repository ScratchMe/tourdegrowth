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
  const restore = inlineSvgStyles(node);
  try {
    // The first render is thrown away: Safari's first pass can come out
    // without the embedded fonts (a known html-to-image behaviour, spec R7);
    // the second is the one that ships.
    await toBlob(node, options);
    const blob = await toBlob(node, options);
    if (!blob) throw new Error("html-to-image returned no image");
    return blob;
  } finally {
    restore();
  }
}

/** What an SVG child takes from its classes, written inline for the export (`inlineSvgStyles`). */
export const SVG_EXPORT_PROPERTIES = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "paint-order",
  "opacity",
  "visibility",
  "display",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant-numeric",
  "letter-spacing",
  "word-spacing",
  "dominant-baseline",
  "vector-effect",
  "shape-rendering",
] as const;

/**
 * html-to-image copies an `<svg>` whole, with `cloneNode(true)`, and never walks its children: they reach the image
 * with their attributes only, outside the page's stylesheets. A chart styled by classes (`MrrCurve`, `PaybackChart`,
 * A20.d T4) came out with no lines, its curve filled black and its labels in the default face (A21.9). Each child's
 * computed style is written inline for the time of the export — the same values, so the screen does not move — and
 * the attribute put back after.
 */
export function inlineSvgStyles(root: HTMLElement): () => void {
  const touched: { el: SVGElement; style: string | null }[] = [];
  for (const svg of Array.from(root.querySelectorAll("svg"))) {
    for (const el of Array.from(svg.querySelectorAll<SVGElement>("*"))) {
      const computed = getComputedStyle(el);
      touched.push({ el, style: el.getAttribute("style") });
      for (const property of SVG_EXPORT_PROPERTIES) {
        const value = computed.getPropertyValue(property);
        if (value) el.style.setProperty(property, value);
      }
    }
  }
  return () => {
    for (const { el, style } of touched) {
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    }
  };
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
