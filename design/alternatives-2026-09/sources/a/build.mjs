// Builds designs/a.js from work-a/a.src.js, embedding the share images (JPEG, 600px) if rendered.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const ALT = "/tmp/claude-0/-home-user-tourdegrowth/f226b817-9d1a-50c9-b188-2ce9f648f068/scratchpad/alt/";
let src = readFileSync(ALT + "work-a/a.src.js", "utf8");
for (const lang of ["fr", "en"]) {
  const f = ALT + `work-a/share-${lang}.jpg`;
  const data = existsSync(f) ? "data:image/jpeg;base64," + readFileSync(f).toString("base64") : "";
  src = src.replace(`__SHARE_${lang.toUpperCase()}__`, data);
}
writeFileSync(ALT + "designs/a.js", src);
console.log("a.js", Math.round(src.length / 1024), "KB");
