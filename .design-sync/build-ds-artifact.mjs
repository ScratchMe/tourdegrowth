/*
 * Builds the Design System artifact's files (claude.ai/artifact/UYbV6SsEQP95kVFG7jr5Lq)
 * from the design-sync bundle, so the page Antoine opens shows every component in its
 * latest version (B16, 2026-10-04).
 *
 * Why it exists: on 2026-09-16 Claude Design moved this design system from its standalone
 * project (23b9671c-…, the one `/design-sync` writes to) into an Artifact of type "Design
 * System", converting the 34 components it had compiled by then. The page reads that
 * artifact's own files under `project/`, never the project's; every sync after that reached
 * the project alone, and the page stayed on September (B8). This script redoes, from today's
 * bundle, the conversion Claude Design did once — the same layout, the same aliasing:
 *
 *   components/<group>/<Name>/<Name>.html      → project/components/<Name>/preview.html
 *     (marker kept, `viewport="900x700"` → `width=900`; the frame-provided stylesheet,
 *     runtime and bundle tags dropped; `_preview/<Name>.js` inlined)
 *   components/<group>/<Name>/<Name>.prompt.md → project/components/<Name>/README.md
 *   components/<group>/<Name>/<Name>.d.ts      → project/components/<Name>/<Name>.d.ts
 *   components/<group>/<Name>/<Name>.jsx       → project/components/src/<group>/<Name>/<Name>.jsx
 *   _ds_bundle.js / _ds_bundle.css             → project/components/bundle.js / bundle.css
 *   _vendor/react.js (React 19.3, the product's) → project/components/lib/react.js
 *   the :root tokens of _ds_bundle.css         → project/tokens.json (the type's list grammar)
 *   README.md                                  → project/README.md
 *   and the index, project/design-system.json, read from the artifact and merged.
 *
 * Generated files (`manifest.json`, `tokens.css`, `api/`) are the page's: never written.
 * bundle.css keeps every :root declaration, and loads after tokens.css: the previews render
 * with the product's own values whatever the token tables show.
 *
 * Usage (from the repo root, after the converter has written ./ds-bundle):
 *   node .design-sync/build-ds-artifact.mjs --bundle ./ds-bundle --out <dir> \
 *     --index <the artifact's design-system.json, read just before> \
 *     --files <the artifact's file listing, one published path per line> \
 *     --ref <branch>@<sha> --by Antoine
 * It writes <dir>/project/… and <dir>/plan.json: { write: [paths], remove: [paths] }.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const bundle = arg("bundle", "./ds-bundle");
const out = arg("out");
const indexPath = arg("index");
const filesPath = arg("files");
const ref = arg("ref", "");
const by = arg("by", "Claude");
if (!out || !indexPath || !filesPath) {
  console.error("usage: --bundle <dir> --out <dir> --index <design-system.json> --files <listing> [--ref r] [--by name]");
  process.exit(2);
}

const written = [];
const write = (rel, content) => {
  const path = join(out, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  written.push(rel);
};
const read = (rel) => readFileSync(join(bundle, rel), "utf8");
const notes = [];

// --- components ----------------------------------------------------------------
const components = [];
for (const group of readdirSync(join(bundle, "components")).sort()) {
  for (const name of readdirSync(join(bundle, "components", group)).sort()) {
    const dir = `components/${group}/${name}`;
    if (!existsSync(join(bundle, dir, `${name}.html`))) continue;
    components.push({ group, name, dir });
  }
}

const FRAME_TAGS = [
  /^\s*<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/styles\.css">\n/m,
  /^\s*<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/_ds_bundle\.css">\n/m,
  /^\s*<script src="\.\.\/\.\.\/\.\.\/_vendor\/react\.js"><\/script>\n/m,
  /^\s*<script src="\.\.\/\.\.\/\.\.\/_vendor\/react-dom\.js"><\/script>\n/m,
  /^\s*<script src="\.\.\/\.\.\/\.\.\/_ds_bundle\.js"><\/script>\n/m,
];

for (const { group, name, dir } of components) {
  let html = read(`${dir}/${name}.html`);
  const lines = html.split("\n");
  const marker = lines[0].match(/^<!-- @dsCard group="([^"]+)"(?: viewport="(\d+)x(\d+)")? -->$/);
  if (!marker) throw new Error(`${name}: unexpected first line ${lines[0]}`);
  lines[0] = `<!-- @dsCard group="${marker[1]}"${marker[2] ? ` width=${marker[2]}` : ""} -->`;
  html = lines.join("\n");
  for (const tag of FRAME_TAGS) {
    if (!tag.test(html)) throw new Error(`${name}: frame tag not found: ${tag}`);
    html = html.replace(tag, "");
  }
  const previewTag = new RegExp(`^(\\s*)<script src="\\.\\./\\.\\./\\.\\./_preview/${name}\\.js"></script>$`, "m");
  const module = read(`_preview/${name}.js`);
  if (/<\/script/i.test(module)) throw new Error(`${name}: its preview module holds </script`);
  if (!previewTag.test(html)) throw new Error(`${name}: preview script tag not found`);
  html = html.replace(previewTag, (_m, indent) => `${indent}<script>${module}</script>`);
  write(`project/components/${name}/preview.html`, html);
  write(`project/components/${name}/README.md`, read(`${dir}/${name}.prompt.md`));
  write(`project/components/${name}/${name}.d.ts`, read(`${dir}/${name}.d.ts`));
  write(`project/components/src/${group}/${name}/${name}.jsx`, read(`${dir}/${name}.jsx`));
}

// --- bundle, stylesheet, runtime, readme -----------------------------------------
const js = read("_ds_bundle.js");
const css = read("_ds_bundle.css");
for (const [file, text, re] of [["_ds_bundle.js", js, /<\/script|<!--/i], ["_ds_bundle.css", css, /<\/style/i]]) {
  if (re.test(text)) throw new Error(`${file} holds a sequence that would end its inline element`);
}
write("project/components/bundle.js", js);
write("project/components/bundle.css", css);
write("project/components/lib/react.js", read("_vendor/react.js"));
write("project/components/lib/react-dom.js", read("_vendor/react-dom.js"));
write("project/README.md", read("README.md"));
// The migration's plain copies of the project's compiled files, kept current rather than stale.
write("project/docs/_ds_bundle.js", js);
write("project/docs/_ds_bundle.css", css);
write("project/docs/_ds_manifest.json", read("_ds_manifest.json"));
write("project/docs/_vendor/react.js", read("_vendor/react.js"));
write("project/docs/_vendor/react-dom.js", read("_vendor/react-dom.js"));
const reactVersion = (read("_vendor/react.js").match(/"(19\.\d+\.\d+)"/) ?? [])[1];
if (!reactVersion) throw new Error("no React version found in _vendor/react.js");

// --- tokens ----------------------------------------------------------------------
// The :root declarations, as build-manifest.mjs reads them (the manifest's token list).
const manifest = JSON.parse(read("_ds_manifest.json"));
const decls = new Map(manifest.tokens.map((t) => [t.name.slice(2), t.value.replace(/\s+/g, " ").trim()]));
const kindOf = new Map(manifest.tokens.map((t) => [t.name.slice(2), t.kind]));
const COLOR_FN = /^(#[0-9a-fA-F]{3,8}|(rgba?|hsla?|oklch|oklab|lab|lch|color)\([0-9.,%\s/a-z-]*\))$/;
const resolve = (value, depth = 0) => {
  if (depth > 16) return null;
  let failed = false;
  const v = value.replace(/var\(--([A-Za-z0-9_-]+)(?:,\s*([^()]*))?\)/g, (_m, n, fb) => {
    const d = decls.get(n) ?? fb;
    if (d === undefined) {
      failed = true;
      return "";
    }
    const r = resolve(d, depth + 1);
    if (r === null) failed = true;
    return r ?? "";
  });
  return failed ? null : v;
};
const dropped = [];
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;

const colors = [];
const colorNames = new Set([...kindOf].filter(([, k]) => k === "color").map(([n]) => n));
for (const [name, value] of decls) {
  if (kindOf.get(name) !== "color" || !NAME.test(name)) continue;
  const alias = value.match(/^var\(--([A-Za-z0-9_-]+)\)$/);
  if (alias && colorNames.has(alias[1])) colors.push({ name, value: `{${alias[1]}}` });
  else {
    const r = resolve(value);
    if (r && COLOR_FN.test(r.trim())) colors.push({ name, value: r.trim().toLowerCase() });
    else dropped.push(`${name}: ${value}`);
  }
}

const LENGTH = /^(-?\d*\.?\d+(px|rem|em|%)|0)$/;
const lengths = (names) => {
  const tokens = [];
  for (const name of names) {
    const r = resolve(decls.get(name));
    if (r && LENGTH.test(r.trim())) tokens.push({ name, value: r.trim() });
    else dropped.push(`${name}: ${decls.get(name)}`);
  }
  return tokens;
};
const byKind = (k) => [...kindOf].filter(([n, kind]) => kind === k && NAME.test(n)).map(([n]) => n);
const SPACING = /^(space|pad|gutter|gap|choice|form|select)-/;
const PRODUCT = /^(engine|money|game|phone|header|sticky|viz|ground|dist|slide)-/;
const spacingNames = byKind("spacing");
const spacing = lengths(spacingNames.filter((n) => SPACING.test(n)));
const productSizes = lengths(spacingNames.filter((n) => !SPACING.test(n) && PRODUCT.test(n)));
const sizes = lengths(spacingNames.filter((n) => !SPACING.test(n) && !PRODUCT.test(n)));
const radius = lengths(byKind("radius"));

const PLAIN = /^[A-Za-z0-9 #%(),./+_-]{1,200}$/;
const plain = (names) => {
  const tokens = [];
  for (const name of names) {
    const r = resolve(decls.get(name));
    const v = r?.trim();
    if (v && PLAIN.test(v) && !/\b(var|url|calc|clamp|color-mix)\(/.test(v)) tokens.push({ name, value: v });
    else dropped.push(`${name}: ${decls.get(name)}`);
  }
  return tokens;
};
const shadow = plain(byKind("shadow"));
const otherNames = byKind("other");
const TIMING = /^(dur|ease|stamp|flip)-|^(dur|ease)$/;
const timing = plain(otherNames.filter((n) => TIMING.test(n)));
const zIndex = plain(otherNames.filter((n) => /^z-/.test(n)));
const other = plain(otherNames.filter((n) => !TIMING.test(n) && !/^z-/.test(n)));

// Type: the three stacks, and every `font` shorthand as a style of its family's group.
const families = {};
for (const key of ["display", "ui", "mono"]) {
  const v = decls.get(`font-${key}`);
  if (v) families[key] = v;
}
const groupOf = { display: "Display", ui: "Text", mono: "Mono" };
const styles = { Display: [], Text: [], Mono: [] };
const fontNames = byKind("font").filter((n) => !/^font-(display|ui|mono)$/.test(n));
const ordered = [...fontNames.filter((n) => !/^slide-/.test(n)), ...fontNames.filter((n) => /^slide-/.test(n))];
let count = 0;
for (const name of ordered) {
  // A style that names another (`field-legend: var(--title-card)`) is that style.
  let raw = decls.get(name);
  for (let hop = 0, a; hop < 16 && (a = raw.match(/^var\(--([A-Za-z0-9_-]+)\)$/)) && decls.has(a[1]); hop++) raw = decls.get(a[1]);
  const fam = raw.match(/var\(--font-(display|ui|mono)\)\s*$/);
  const head = resolve(raw.replace(/var\(--font-(display|ui|mono)\)\s*$/, "").trim());
  const m = head?.match(/^(\d{3})\s+(-?\d*\.?\d+px)\s*\/\s*(\d*\.?\d+(?:px)?)$/);
  if (!fam || !m) {
    dropped.push(`${name}: ${raw}`);
    continue;
  }
  if (count >= 80) {
    dropped.push(`${name}: past the type's 80 styles`);
    continue;
  }
  count++;
  styles[groupOf[fam[1]]].push({ name, fontSize: m[2], lineHeight: m[3].endsWith("px") ? m[3] : Number(m[3]), fontWeight: Number(m[1]) });
}
const fontFiles = [
  { family: "Inter", file: "fonts/inter-variable.woff2", weight: "100 900", style: "normal" },
  { family: "IBM Plex Mono", file: "fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  { family: "IBM Plex Mono", file: "fonts/ibm-plex-mono-600.woff2", weight: "600", style: "normal" },
  { family: "Stardos Stencil", file: "fonts/stardos-stencil-700.woff2", weight: "700", style: "normal" },
];
for (const f of fontFiles) if (!existsSync(join(bundle, "fonts", f.file.slice("fonts/".length)))) throw new Error(`missing ${f.file}`);

const famKey = { Display: "display", Text: "ui", Mono: "mono" };
const tokensJson = {
  name: "Tour de Growth",
  version: 1,
  color: { themes: [{ id: "paper", name: "Paper" }], tokens: colors },
  type: {
    fonts: fontFiles,
    families,
    groups: Object.entries(styles)
      .filter(([, s]) => s.length)
      .map(([g, s]) => ({ name: g, family: famKey[g], styles: s })),
  },
  spacing: { note: "The spacing steps and paddings (space-*, pad-*, gutters).", tokens: spacing },
  radius: { tokens: radius },
  shadow: { note: "Hard offset shadows in ink: no blur in this system.", tokens: shadow },
  sizes: { note: "Component sizes: hit areas, field widths, borders, focus rings, type sizes.", tokens: sizes },
  productSizes: { note: "Sizes particular to the engine, the game and the deck.", tokens: productSizes },
  timing: { note: "Durations and easings.", tokens: timing },
  zIndex: { tokens: zIndex },
  other: { tokens: other },
  meta: { source: "github", repo: "ScratchMe/tourdegrowth", ref, package: "src/components", synced: new Date().toISOString().slice(0, 10) },
};
for (const [k, fam] of Object.entries(tokensJson)) {
  if (fam && fam.tokens && k !== "color" && fam.tokens.length > 60) throw new Error(`tokens.json: ${k} holds ${fam.tokens.length} tokens (cap 60)`);
}
write("project/tokens.json", JSON.stringify(tokensJson, null, 2) + "\n");

// --- the index -------------------------------------------------------------------
const index = JSON.parse(readFileSync(indexPath, "utf8"));
if (index.v !== 3 || index.layout !== "files" || !(index.createdOnFiles || index.convertedFrom)) throw new Error("the index is not a v3 files index");
index.libraries = [
  { file: "components/lib/react.js", global: "React", name: "react", version: reactVersion },
  { file: "components/lib/react-dom.js", global: "ReactDOM", name: "react-dom", version: reactVersion },
];
index.lastChange = {
  by,
  at: new Date().toISOString(),
  via: `Claude Code · /design-sync · ScratchMe/tourdegrowth${ref ? `@${ref}` : ""}`,
  note: `re-synced from the repository: ${components.length} components, tokens rebuilt from the bundle`,
};
write("project/design-system.json", JSON.stringify(index, null, 2) + "\n");

// --- the plan: what to send, what to remove ---------------------------------------
const remote = readFileSync(filesPath, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
const mine = new Set(written);
const GENERATED = /^project\/(api\/|manifest\.json$|tokens\.css$)/;
const ours = /^project\/(components\/|docs\/)/;
const remove = remote.filter((p) => ours.test(p) && !mine.has(p) && !GENERATED.test(p) && !/^project\/components\/Cover\//.test(p));
const write_ = written.filter((p) => p !== "project/design-system.json");
writeFileSync(join(out, "plan.json"), JSON.stringify({ write: write_, index: "project/design-system.json", remove, dropped, notes }, null, 2) + "\n");
console.log(
  `[ds-artifact] ${components.length} components, ${written.length} files (index last), ${remove.length} to remove; ` +
    `tokens: ${colors.length} colours, ${spacing.length}+${sizes.length}+${productSizes.length} lengths, ${radius.length} radii, ` +
    `${shadow.length} shadows, ${count} type styles, ${timing.length + zIndex.length + other.length} other; ${dropped.length} dropped -> ${out}`,
);
