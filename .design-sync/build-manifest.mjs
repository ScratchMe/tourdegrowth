/*
 * Writes `_ds_manifest.json`, the index the Claude Design project builds its
 * Design System pane from: which cards exist, in which group, at which size,
 * and the token list the design agent reads.
 *
 * Claude Design is meant to compile this file itself (the "self-check" that
 * the `_ds_needs_recompile` sentinel asks for). It did once, for the
 * 2026-09-11 upload, and never again: six uploads later the project still
 * held that index — 34 components, 34 cards, `--radius-tag: 4px` — and the
 * pane kept showing the September cards while every file under them was
 * current. Found on 2026-10-01 because Antoine could not see the kilometre
 * marker. A public report describes the same thing (nothing triggers the
 * compile for files written through `DesignSync`; the workaround is to write
 * the manifest). So the sync writes it, and this script is how.
 *
 *   node .design-sync/build-manifest.mjs [--bundle ./ds-bundle] [--out <file>]
 *
 * Cards: with `--bundle`, read from each card's own first line
 * (`<!-- @dsCard group="…" viewport="…" -->`), the marker the pane indexes.
 * Without it, derived from `config.json` the way the converter derives them:
 * the group is the component's folder under `src/components/`, and
 * `viewport="900x700"` goes with `cardMode: "column"`. Checked on 2026-10-01
 * against all 90 live cards: no exception.
 *
 * Tokens: every custom property declared at the top level of a rule whose
 * selector list contains `:root`, in `globals.css` and the token files it
 * `@import`s, in cascade order — what esbuild inlines into `_ds_bundle.css`.
 * `:root, [data-world="paper"]` counts (it is the paper world's base);
 * `[data-world="night"]` and `@media` overrides do not.
 *
 * Fonts: the `@font-face` rules of `fonts/brand-fonts.css`, which the
 * converter publishes as `fonts/fonts.css`.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const bundleDir = opt("--bundle");
const out = opt("--out") ?? (bundleDir ? join(bundleDir, "_ds_manifest.json") : "_ds_manifest.json");

const cfg = JSON.parse(readFileSync(".design-sync/config.json", "utf8"));
const pinned = Object.entries(cfg.componentSrcMap ?? {})
  .filter(([, src]) => src)
  .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const groupOf = (src) => src.split("/")[2];

// --- components and cards ----------------------------------------------------
const components = pinned.map(([name, src]) => ({
  name,
  sourcePath: `components/${groupOf(src)}/${name}/${name}.jsx`,
}));

const MARK = /^<!-- @dsCard group="([a-z]+)"(?: viewport="(\d+x\d+)")? -->$/;
const cards = pinned
  .map(([name, src]) => {
    const path = `components/${groupOf(src)}/${name}/${name}.html`;
    if (bundleDir) {
      const file = join(bundleDir, path);
      if (!existsSync(file)) throw new Error(`[manifest] no card for ${name}: ${file}`);
      const first = readFileSync(file, "utf8").split("\n")[0];
      const m = MARK.exec(first);
      if (!m) throw new Error(`[manifest] ${path} does not start with a @dsCard marker: ${first}`);
      return m[2] ? { path, group: m[1], viewport: m[2] } : { path, group: m[1] };
    }
    const column = cfg.overrides?.[name]?.cardMode === "column";
    return column ? { path, group: groupOf(src), viewport: "900x700" } : { path, group: groupOf(src) };
  })
  .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

// --- tokens --------------------------------------------------------------------
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function rootDecls(css) {
  css = stripComments(css);
  const found = [];
  let i = 0;
  let selStart = 0;
  while (i < css.length) {
    if (css[i] === "{") {
      const selector = css.slice(selStart, i).split(";").pop();
      let j = i + 1;
      let depth = 1;
      while (j < css.length && depth) {
        if (css[j] === "{") depth++;
        else if (css[j] === "}") depth--;
        j++;
      }
      const body = css.slice(i + 1, j - 1);
      if (selector.split(",").map((s) => s.trim()).includes(":root")) {
        for (const m of body.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([\s\S]*?);/g)) found.push([m[1], m[2].trim()]);
      }
      i = j;
      selStart = j;
      continue;
    }
    if (css[i] === ";") selStart = i + 1; // end of an @import statement
    i++;
  }
  return found;
}

const globals = readFileSync("src/app/globals.css", "utf8");
const order = [
  ...[...globals.matchAll(/@import\s+"\.\.\/styles\/tokens\/([a-z-]+\.css)"/g)].map((m) => `src/styles/tokens/${m[1]}`),
  "src/app/globals.css",
];
const decls = new Map();
for (const file of order) {
  for (const [name, value] of rootDecls(readFileSync(file, "utf8"))) {
    decls.delete(name); // a later :root wins, and takes the later position
    decls.set(name, value);
  }
}

const COLOR = /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\([^()]*\)|transparent|currentColor|white|black)$/;
const LEN = String.raw`-?\d*\.?\d+(px|em|rem|%|vh|vw|ch|dvh|svh)?`;
const LENGTHS = new RegExp(String.raw`^(${LEN}|auto)(\s+(${LEN}|auto))*$`);
const VAR = /^var\((--[A-Za-z0-9_-]+)\)$/;

function kind(name, seen = []) {
  const v = decls.get(name).split(/\s+/).filter(Boolean).join(" ");
  if (name.includes("radius")) return "radius";
  if (name.includes("shadow")) return "shadow";
  if (name.startsWith("--font-")) return "font";
  const ref = VAR.exec(v);
  if (ref && decls.has(ref[1]) && !seen.includes(ref[1])) return kind(ref[1], [...seen, name]);
  if (COLOR.test(v)) return "color";
  if (v.includes("var(--font-")) return "font"; // shorthand: weight size/line family
  if (v.startsWith("calc(") || LENGTHS.test(v)) {
    // unitless numbers (line-heights, ratios, opacities) are not spacing
    return /(px|em|rem|%|vh|vw|ch)\b/.test(v) ? "spacing" : "other";
  }
  return "other";
}

const tokens = [...decls].map(([name, value]) => ({ name, value, kind: kind(name), definedIn: "_ds_bundle.css" }));

// --- fonts ---------------------------------------------------------------------
const fontsCss = stripComments(readFileSync(".design-sync/fonts/brand-fonts.css", "utf8"));
const fonts = [...fontsCss.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => {
  const prop = (p) => new RegExp(String.raw`${p}\s*:\s*([^;]+);`).exec(body)?.[1].trim();
  return {
    family: prop("font-family").replace(/^"|"$/g, ""),
    weight: prop("font-weight"),
    style: prop("font-style"),
    cssPath: "fonts/fonts.css",
    files: [...body.matchAll(/url\("\.\/([^"]+)"\)/g)].map((m) => `fonts/${m[1]}`),
  };
});
const brandFonts = [...new Set(fonts.map((f) => f.family))].map((family) => ({
  family,
  status: "ok",
  tokens: tokens.filter((t) => t.name.startsWith("--font-") && t.value.startsWith(`"${family}"`)).map((t) => t.name),
  path: "fonts/fonts.css",
}));

// --- write -----------------------------------------------------------------------
const manifest = {
  namespace: cfg.globalName,
  components,
  startingPoints: [],
  cards,
  templates: [],
  hasThumbnailHtml: false,
  globalCssPaths: ["fonts/fonts.css", "_ds_bundle.css", "styles.css"],
  tokens,
  themes: [],
  fonts,
  brandFonts,
  source: "design-sync-cli",
};
if (dirname(out) !== "." && !existsSync(dirname(out))) throw new Error(`[manifest] no directory for ${out}`);
writeFileSync(out, JSON.stringify(manifest));
const groups = [...new Set(cards.map((c) => c.group))].length;
console.log(
  `[manifest] ${components.length} components, ${cards.length} cards in ${groups} groups ` +
    `(${bundleDir ? "read from the bundle" : "derived from config.json"}), ${tokens.length} tokens, ` +
    `${fonts.length} font faces -> ${out}`,
);
