// Builds site/: WebP captures, header crops of the three spaces, and the notes as HTML fragments (site/data.js).
import { createRequire } from "node:module";
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const require = createRequire("/home/user/tourdegrowth/package.json");
const sharp = require("sharp");
const HERE = new URL(".", import.meta.url).pathname;
const OUT = join(HERE, "site");
const DESIGNS = ["current", "i", "a", "b", "h", "e", "f"];

function md(src) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  const lines = src.split("\n");
  let html = "", list = null, table = null;
  const close = () => { if (list) { html += `</${list}>`; list = null; } if (table) { html += "</tbody></table></div>"; table = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\|/.test(line)) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      if (!table) { close(); html += `<div class="tbl"><table><thead><tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>`; table = true; continue; }
      html += `<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`; continue;
    }
    if (table && !/^\|/.test(line)) close();
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { close(); const lvl = Math.min(4, m[1].length + 1); html += `<h${lvl}>${inline(m[2])}</h${lvl}>`; continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) { if (list !== "ul") { close(); html += "<ul>"; list = "ul"; } html += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { if (list !== "ol") { close(); html += "<ol>"; list = "ol"; } html += `<li>${inline(m[1])}</li>`; continue; }
    if (!line.trim()) { close(); continue; }
    close(); html += `<p>${inline(line)}</p>`;
  }
  close();
  return html;
}

const data = { designs: {} };
for (const d of DESIGNS) {
  const dir = join(HERE, "shots", d);
  if (!existsSync(dir)) continue;
  mkdirSync(join(OUT, "img", d), { recursive: true });
  const shots = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) {
    const name = f.replace(/\.png$/, "");
    const img = sharp(join(dir, f));
    const meta = await img.metadata();
    await img.webp({ quality: 78 }).toFile(join(OUT, "img", d, `${name}.webp`));
    shots[name] = { w: meta.width, h: meta.height };
  }
  // The header of each space, desktop, for the « three spaces » row.
  for (const s of ["landing", "engine", "game"]) {
    const src = join(dir, `${s}-d.png`);
    if (!existsSync(src)) continue;
    await sharp(src).extract({ left: 0, top: 0, width: 1280, height: 300 }).webp({ quality: 80 }).toFile(join(OUT, "img", d, `head-${s}.webp`));
  }
  const notes = existsSync(join(HERE, "notes", `${d}.md`)) ? md(readFileSync(join(HERE, "notes", `${d}.md`), "utf8")) : "";
  data.designs[d] = { shots, notes };
}
// Today's share image, from the product itself.
mkdirSync(join(OUT, "img", "current"), { recursive: true });
for (const l of ["fr", "en"]) {
  const src = join(HERE, `share-current-${l}.png`);
  if (existsSync(src)) { await sharp(src).webp({ quality: 85 }).toFile(join(OUT, "img", "current", `share-${l}.webp`)); data.designs.current.shots[`share-${l}`] = { w: 1200, h: 630 }; }
}
writeFileSync(join(OUT, "data.js"), `window.DATA=${JSON.stringify(data)};`);
console.log(Object.fromEntries(Object.entries(data.designs).map(([k, v]) => [k, Object.keys(v.shots).length])));
