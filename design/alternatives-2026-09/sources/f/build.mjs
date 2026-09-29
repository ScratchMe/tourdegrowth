// Build direction F: expands macros in f.src.css / f.src.js / share-tpl.html into the deliverables.
//   ICON(name)        -> url(data:svg) pixel icon, black (use as mask-image)
//   FRAME(#hex)       -> 7x7 notched frame for border-image (slice 3)
//   DFRAME(#hex)      -> 18x18 notched dashed frame for border-image (slice 3, round)
//   PROFILE(#fill,#edge) -> stepped stage-profile terrain, 1200x64, repeat-x
//   GRID(#hex,alpha)  -> 24px pixel dot grid
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { svg, dataUri, MAPS } from "./icons.mjs";
const require = createRequire("/home/user/tourdegrowth/package.json");
const HERE = new URL(".", import.meta.url).pathname;
const ROOT = HERE + "../";
const enc = (s) => `url("data:image/svg+xml,${encodeURIComponent(s).replace(/%20/g, " ").replace(/%3D/g, "=").replace(/%3A/g, ":").replace(/%2F/g, "/").replace(/%22/g, "'").replace(/%2C/g, ",")}")`;
const frame = (c) => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" width="7" height="7" shape-rendering="crispEdges"><path fill="${c}" d="M3 0h1v3H3zM3 4h1v3H3zM0 3h3v1H0zM4 3h3v1H4z"/></svg>`);
const dframe = (c) => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" shape-rendering="crispEdges"><path fill="${c}" d="M3 0h6v3H3zM3 15h6v3H3zM0 3h3v6H0zM15 3h3v6h-3z"/></svg>`);
function profile(fill, edge) {
  // A stage profile, quantised to 8px steps: flat start, two climbs, a descent, a summit finish.
  const W = 1200, H = 64, step = 8;
  const pts = [4, 4, 5, 5, 6, 8, 10, 11, 11, 10, 8, 7, 7, 6, 6, 7, 9, 12, 14, 15, 15, 14, 12, 10, 9, 8, 8, 9, 9, 10, 11, 13, 16, 18, 20, 21, 22, 22, 21, 19, 16, 13, 11, 10, 9, 8, 7, 7, 6, 6, 5, 5, 6, 7, 8, 8, 7, 6, 5, 4, 4, 4, 5, 6, 8, 11, 13, 14, 14, 13, 11, 9, 8, 8, 9, 11, 14, 17, 20, 23, 25, 26, 26, 25, 23, 20, 16, 12, 9, 7, 6, 5, 5, 5, 4, 4, 4, 4, 4, 4];
  const colW = W / pts.length;
  let d = "", e = "";
  pts.forEach((p, i) => {
    const x = Math.round(i * colW), w = Math.round((i + 1) * colW) - x;
    const h = Math.round((p * 2.4) / step) * step / 2 + 4;
    d += `M${x} ${H - h}h${w}V${H}h-${w}z`;
    e += `M${x} ${H - h}h${w}v4h-${w}z`;
  });
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" preserveAspectRatio="none"><path fill="${fill}" d="${d}"/><path fill="${edge}" d="${e}"/></svg>`);
}
const grid = (c, a) => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" shape-rendering="crispEdges"><rect x="0" y="0" width="2" height="2" fill="${c}" fill-opacity="${a}"/></svg>`);
function expand(src) {
  return src
    .replace(/ICONC\((\w+),\s*(#[0-9a-fA-F]{6})\)/g, (_, n, c) => dataUri(n, c))
    .replace(/ICON\((\w+)\)/g, (_, n) => { if (!MAPS[n]) throw new Error("icon " + n); return dataUri(n, "#000"); })
    .replace(/DFRAME\((#[0-9a-fA-F]{6})\)/g, (_, c) => dframe(c))
    .replace(/FRAME\((#[0-9a-fA-F]{6})\)/g, (_, c) => frame(c))
    .replace(/PROFILE\((#[0-9a-fA-F]{6}),\s*(#[0-9a-fA-F]{6})\)/g, (_, f, e) => profile(f, e))
    .replace(/GRID\((#[0-9a-fA-F]{6}),\s*([\d.]+)\)/g, (_, c, a) => grid(c, a));
}
const mode = process.argv[2] ?? "all";
if (mode === "all" || mode === "css") {
  writeFileSync(ROOT + "designs/f.css", expand(readFileSync(HERE + "f.src.css", "utf8")));
  console.log("designs/f.css", readFileSync(ROOT + "designs/f.css").length);
}
if (mode === "all" || mode === "share") {
  const tpl = expand(readFileSync(HERE + "share-tpl.html", "utf8"));
  const T = JSON.parse(readFileSync(HERE + "share-copy.json", "utf8"));
  const ICONS = Object.fromEntries(Object.keys(MAPS).map((n) => [n, svg(n, "currentColor")]));
  for (const lang of ["fr", "en"]) {
    let html = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => T[lang][k] ?? T.icons?.[k] ?? `{{${k}}}`).replace(/\[\[(\w+)\]\]/g, (_, n) => ICONS[n]);
    writeFileSync(ROOT + `share/f-${lang}.html`, html);
  }
  console.log("share/f-{fr,en}.html");
}
if (mode === "all" || mode === "js") {
  const sharp = require("sharp");
  const ICONS = Object.fromEntries(Object.keys(MAPS).map((n) => [n, svg(n, "currentColor")]));
  const share = {};
  for (const lang of ["fr", "en"]) {
    const p = ROOT + `shots/f/share-${lang}.png`;
    if (existsSync(p)) share[lang] = "data:image/png;base64," + (await sharp(p).resize(800).png({ palette: true, quality: 90, colours: 128 }).toBuffer()).toString("base64");
  }
  const js = readFileSync(HERE + "f.src.js", "utf8").replace("/*ICONS*/{}", JSON.stringify(ICONS)).replace("/*SHARE*/{}", JSON.stringify(share));
  writeFileSync(ROOT + "designs/f.js", js);
  console.log("designs/f.js", js.length);
}
