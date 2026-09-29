import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const families = [
  "Saira+Extra+Condensed:wght@600;700;800",
  "Anton",
  "JetBrains+Mono:wght@400;500;700;800",
  "Big+Shoulders+Stencil:wght@700;800;900",
  "Big+Shoulders:wght@600;800;900",
  "Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400",
  "Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,300;1,6..72,400",
  "Libre+Franklin:wght@500;600;700;800;900",
  "Pixelify+Sans:wght@400;500;600;700",
  "Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800",
  "Inter+Tight:wght@500;600;700;800;900",
  "Space+Grotesk:wght@500;600;700",
  "Stardos+Stencil:wght@400;700",
  "Inter:wght@400;500;600;700;800",
  "IBM+Plex+Mono:wght@400;500;600;700",
];
let out = "";
for (const f of families) {
  const css = execFileSync("curl", ["-sS", "-A", UA, `https://fonts.googleapis.com/css2?family=${f}&display=block`]).toString();
  if (!css.includes("@font-face")) { console.error("FAIL", f, css.slice(0, 200)); continue; }
  // keep latin + latin-ext subsets only
  const blocks = css.split(/(?=\/\* )/);
  for (const b of blocks) {
    const m = b.match(/^\/\* ([a-z-]+) \*\//);
    if (!m || !["latin", "latin-ext"].includes(m[1])) continue;
    out += b.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (_, url) => {
      const name = url.split("/").slice(-3).join("_").replace(/[^A-Za-z0-9_.-]/g, "");
      if (!existsSync(`fonts/${name}`)) execFileSync("curl", ["-sS", "-o", `fonts/${name}`, url]);
      return `url(/__alt/fonts/${name})`;
    });
  }
  console.log("ok", f);
}
writeFileSync("fonts.css", out);
