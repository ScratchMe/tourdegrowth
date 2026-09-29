// Builds designs/e.js from work-e/e.src.js, embedding a half-size render of the
// share images (share/e-{fr,en}.html) so the result page previews the une.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const require = createRequire("/home/user/tourdegrowth/package.json");
const { chromium } = require("playwright");
const HERE = new URL("..", import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 0.6 });
await page.route("http://alt.local/**", (route) => {
  const rel = new URL(route.request().url()).pathname.replace(/^\/(__alt\/)?/, "");
  const file = join(HERE, rel);
  const type = rel.endsWith(".woff2") ? "font/woff2" : rel.endsWith(".css") ? "text/css" : rel.endsWith(".png") ? "image/png" : rel.endsWith(".svg") ? "image/svg+xml" : "text/html";
  return existsSync(file) ? route.fulfill({ path: file, contentType: type }) : route.fulfill({ status: 404, body: "" });
});
const out = {};
for (const lang of ["fr", "en"]) {
  await page.goto(`http://alt.local/share/e-${lang}.html`);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const buf = await page.screenshot({ type: "png" });
  out[lang] = "data:image/png;base64," + buf.toString("base64");
  console.log(lang, buf.length);
}
await browser.close();
const src = readFileSync(join(HERE, "work-e/e.src.js"), "utf8").replace("__SHARE_FR__", out.fr).replace("__SHARE_EN__", out.en);
writeFileSync(join(HERE, "designs/e.js"), src);
console.log("designs/e.js", src.length);
