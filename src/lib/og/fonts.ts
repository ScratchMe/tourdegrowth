import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * The three families of DESIGN-BRIEF.md "Typography", as Satori wants them.
 *
 * `fetch(new URL(...))` is the pattern Next.js docs show for this, but plain
 * Node.js `fetch` doesn't support `file://` URLs ("not implemented yet") —
 * reading the bytes directly with `fs` works in every runtime this route
 * actually runs in (Node.js, not Edge).
 *
 * Two traps met on 2026-09-06, both of which had every share image — the
 * stencil score numeral of the result image included — silently rendering
 * in IBM Plex Mono, in production too:
 *
 * 1. **One literal `new URL("./fonts/x.ttf", import.meta.url)` per file.**
 *    The previous helper built the path from a template string
 *    (`./fonts/${file}`); Turbopack compiles that into a SINGLE static
 *    asset, so all five loads returned the same bytes. Never factor these
 *    five lines back into a loop.
 * 2. **Static instances, not variable fonts.** Satori (opentype.js under
 *    it) throws on a variable font (`fvar`/`gvar` tables) and the whole
 *    font list is dropped. Inter is therefore Inter 4.1's static
 *    `Inter-Medium` / `Inter-SemiBold` (`extras/ttf/`), subset to Latin with
 *    fonttools — not the variable file Google Fonts serves. All files are
 *    .ttf: Satori rejects woff2 ("Unsupported OpenType signature wOF2").
 * 3. **A subset must contain every code point an image draws.** Satori has
 *    no system fallback: a missing glyph renders as an empty box and nothing
 *    fails. The "№" of the landing bib tag shipped as tofu that way (the
 *    Plex Mono subset served by Google Fonts stops at Latin). The Plex Mono
 *    files are now cut with fonttools from the complete fonts of the
 *    `@ibm/plex-mono` npm package: Google's Latin range plus U+2116.
 *    `fonts.test.ts` checks the coverage of every string the images render.
 */
const FONT_FILES = {
  stardos: new URL("./fonts/stardos-stencil-700.ttf", import.meta.url),
  inter500: new URL("./fonts/inter-500.ttf", import.meta.url),
  inter600: new URL("./fonts/inter-600.ttf", import.meta.url),
  mono500: new URL("./fonts/ibm-plex-mono-500.ttf", import.meta.url),
  mono600: new URL("./fonts/ibm-plex-mono-600.ttf", import.meta.url),
};

type OgFonts = Awaited<ReturnType<typeof readOgFonts>>;
let fontsPromise: Promise<OgFonts> | null = null;

/**
 * REVIEW-02.md R2-19: the five files were re-read on EVERY image render —
 * per result page preview, per content-page preview, per crawler hit. They
 * never change while the process lives, so they are read once per instance
 * and the promise is shared; a failed read is not cached, so a transient
 * error can't poison every image until the next cold start.
 */
export function loadOgFonts(): Promise<OgFonts> {
  fontsPromise ??= readOgFonts().catch((err: unknown) => {
    fontsPromise = null;
    throw err;
  });
  return fontsPromise;
}

async function readOgFonts() {
  const load = (url: URL) => readFile(fileURLToPath(url));
  const [stardos, inter500, inter600, mono500, mono600] = await Promise.all([
    load(FONT_FILES.stardos),
    load(FONT_FILES.inter500),
    load(FONT_FILES.inter600),
    load(FONT_FILES.mono500),
    load(FONT_FILES.mono600),
  ]);
  return [
    { name: "Stardos Stencil", data: stardos, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: inter500, weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: inter600, weight: 600 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: mono500, weight: 500 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: mono600, weight: 600 as const, style: "normal" as const },
  ];
}
