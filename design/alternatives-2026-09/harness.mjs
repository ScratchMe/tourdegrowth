// Mockup harness: the real production build, with one design direction laid over it.
// Usage: node harness.mjs <mode> [designs...]   mode = dump | shoot
import { createRequire } from "node:module";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const require = createRequire("/home/user/tourdegrowth/package.json");
const { chromium } = require("playwright");

export const BASE = process.env.ALT_BASE ?? "http://localhost:3300";
const HERE = new URL(".", import.meta.url).pathname;
const EXAMPLE = JSON.parse(readFileSync(join(HERE, "example-state.json"), "utf8"));

export const SCREENS = [
  { id: "landing", url: "/fr", full: true },
  { id: "landing-en", url: "/en", full: true },
  { id: "quiz", url: "/quiz?lang=fr", full: false },
  { id: "result", url: "/r/sample?lang=fr", full: true },
  { id: "result-en", url: "/r/sample?lang=en", full: true },
  { id: "engine", url: "/fr/aarrr-funnel-template", full: false, engine: true, tall: 1.6 },
  { id: "game", url: "/fr/game", full: true },
];
export const VIEWPORTS = [
  { id: "d", width: 1280, height: 860 },
  { id: "m", width: 390, height: 844 },
];

function spaceOf(path) {
  if (path.includes("aarrr-funnel-template")) return "moteur";
  if (path.includes("/game")) return "jeu";
  return "tour";
}

export async function openContext(browser, vp) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await context.route("**/__alt/fonts/**", (route) => route.fulfill({ path: join(HERE, "fonts", route.request().url().split("/").pop()), contentType: "font/woff2" }));
  const auth = "Basic " + Buffer.from("admin:e2e-admin").toString("base64");
  const res = await context.request.post(`${BASE}/admin/preview?engine=on`, { headers: { Authorization: auth }, maxRedirects: 0 });
  if (res.status() !== 303) throw new Error(`preview: ${res.status()}`);
  return context;
}

export async function show(page, screen, design) {
  if (screen.engine) {
    await page.goto(BASE + screen.url);
    await page.evaluate((v) => localStorage.setItem("tdg.engine.v1", JSON.stringify({ schemaVersion: 1, state: v })), EXAMPLE);
  }
  await page.goto(BASE + screen.url, { waitUntil: "networkidle" });
  // Readable aliases for the hashed CSS Module classes: `ScoreDisplay-module__h4sh__suffix` also gets `ScoreDisplay--suffix`.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("[class]")) for (const c of [...el.classList]) {
      const m = c.match(/^(.+?)-module__[A-Za-z0-9_-]+?__(.+)$/);
      if (m) el.classList.add(`${m[1]}--${m[2]}`);
    }
  });
  // Full-page captures paint a `fixed` ground one window tall, a seam no reader sees: let it span the page instead.
  await page.addStyleTag({ content: "html{height:auto!important}body{background-attachment:scroll!important}" });
  if (design && design !== "current") {
    const css = readFileSync(join(HERE, "fonts.css"), "utf8") + "\n" + readFileSync(join(HERE, "designs", `${design}.css`), "utf8");
    await page.evaluate(({ d, s }) => { document.documentElement.dataset.alt = d; document.documentElement.dataset.space = s; }, { d: design, s: spaceOf(screen.url) });
    await page.addStyleTag({ content: css });
    const js = join(HERE, "designs", `${design}.js`);
    if (existsSync(js)) await page.evaluate(readFileSync(js, "utf8"));
  }
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(150);
}

async function dump() {
  const browser = await chromium.launch();
  const context = await openContext(browser, VIEWPORTS[0]);
  const page = await context.newPage();
  const out = {};
  for (const screen of SCREENS) {
    await show(page, screen, null);
    out[screen.id] = await page.evaluate(() => {
      const mods = new Map();
      for (const el of document.querySelectorAll("[class]")) for (const c of el.classList) {
        const m = c.match(/^(.+?)-module__[A-Za-z0-9_-]+?__(.+)$/);
        if (m) { const k = m[1]; if (!mods.has(k)) mods.set(k, new Set()); mods.get(k).add(m[2]); }
      }
      return { mods: Object.fromEntries([...mods].map(([k, v]) => [k, [...v]])), testids: [...new Set([...document.querySelectorAll("[data-testid]")].map((e) => e.dataset.testid))].slice(0, 80) };
    });
  }
  writeFileSync(join(HERE, "dom-dump.json"), JSON.stringify(out, null, 1));
  await browser.close();
}

async function shoot(designs) {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await openContext(browser, vp);
    const page = await context.newPage();
    for (const design of designs) {
      mkdirSync(join(HERE, "shots", design), { recursive: true });
      for (const screen of SCREENS) {
        if (vp.id === "m" && screen.id.endsWith("-en") && process.env.ALT_SKIP_EN_M) continue;
        await show(page, screen, design);
        const path = join(HERE, "shots", design, `${screen.id}-${vp.id}.png`);
        if (screen.full) await page.screenshot({ path, fullPage: true });
        else await page.screenshot({ path, clip: { x: 0, y: 0, width: vp.width, height: Math.round(vp.height * (screen.tall ?? 1)) }, fullPage: true });
        console.log(design, screen.id, vp.id);
      }
    }
    await context.close();
  }
  await browser.close();
}

const [mode, ...rest] = process.argv[1]?.endsWith("harness.mjs") ? process.argv.slice(2) : [];
if (mode === "dump") await dump();
if (mode === "shoot") await shoot(rest.length ? rest : ["current"]);
