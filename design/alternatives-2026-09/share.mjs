// Renders share/<id>-fr.html and share/<id>-en.html at 1200×630 into shots/<id>/share-<lang>.png.
import { createRequire } from "node:module";
import { join } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
const require = createRequire("/home/user/tourdegrowth/package.json");
const { chromium } = require("playwright");
const HERE = new URL(".", import.meta.url).pathname;
const id = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.route("http://alt.local/**", (route) => {
  const rel = new URL(route.request().url()).pathname.replace(/^\/(__alt\/)?/, "");
  const file = join(HERE, rel);
  const type = rel.endsWith(".woff2") ? "font/woff2" : rel.endsWith(".css") ? "text/css" : rel.endsWith(".png") ? "image/png" : rel.endsWith(".svg") ? "image/svg+xml" : "text/html";
  return existsSync(file) ? route.fulfill({ path: file, contentType: type }) : route.fulfill({ status: 404, body: "" });
});
mkdirSync(join(HERE, "shots", id), { recursive: true });
for (const lang of ["fr", "en"]) {
  const file = `share/${id}-${lang}.html`;
  if (!existsSync(join(HERE, file))) { console.log("missing", file); continue; }
  await page.goto(`http://alt.local/${file}`);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: join(HERE, "shots", id, `share-${lang}.png`) });
  console.log("ok", id, lang);
}
await browser.close();
