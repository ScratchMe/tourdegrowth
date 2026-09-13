#!/usr/bin/env node
/**
 * kit-screenshots.mjs — Tour de Growth
 *
 * Regenerates `marketing/assets/` — the screenshots and share images the
 * submission kit (`marketing/kit.md`) references. Not part of the app.
 *
 * Run against a LOCAL production build, never `next dev` (hydration and
 * fonts differ) and, from the session sandbox, never the live site (Chromium
 * does not get through the outbound proxy there — curl does, Chromium does
 * not; the tunnel closes mid-exchange):
 *
 *   npm run build
 *   NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub npx next start -p 3000 &
 *   node scripts/kit-screenshots.mjs            # SITE=http://localhost:3000 by default
 *
 * What it captures (2× device pixels, then palette-encoded with sharp so a
 * 22-file kit stays under 3 MB): the landing, the first question, the tone
 * selector (15 answers seeded in localStorage, the segment screen skipped
 * with its own Continue button), the sample result — each in EN and FR,
 * desktop 1280 and mobile 390 — the landing preview card in both tones, and
 * the three Open Graph images read from the pages' own `og:image` tags.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SITE = (process.env.SITE ?? "http://localhost:3000").replace(/\/$/, "");
const HOST = new URL(SITE).hostname;
const OUT = "marketing/assets";
mkdirSync(OUT, { recursive: true });

const QUESTION_IDS = ["acq-1", "acq-2", "acq-3", "act-1", "act-2", "act-3", "ret-1", "ret-2", "ret-3", "ref-1", "ref-2", "ref-3", "rev-1", "rev-2", "rev-3"];
const SEEDED_ANSWERS = Object.fromEntries(QUESTION_IDS.map((id, i) => [id, i % 3]));
const SIZES = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } };

const browser = await chromium.launch();

async function contextFor(locale, size) {
  const ctx = await browser.newContext({
    viewport: SIZES[size],
    deviceScaleFactor: 2,
    locale: locale === "fr" ? "fr-FR" : "en-US",
  });
  await ctx.addCookies([{ name: "tdg_locale", value: locale, domain: HOST, path: "/" }]);
  return ctx;
}

async function capture(name, path, { locale, size, seedAnswers = false, before }) {
  const ctx = await contextFor(locale, size);
  const page = await ctx.newPage();
  if (seedAnswers) {
    await page.addInitScript((answers) => {
      try {
        localStorage.setItem("tdg.quiz.answers.v1", JSON.stringify(answers));
      } catch {
        /* private mode: the capture then shows question 1, which is visible in the file name */
      }
    }, SEEDED_ANSWERS);
  }
  await page.goto(`${SITE}${path}`, { waitUntil: "networkidle" });
  if (before) await before(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await ctx.close();
  console.log("captured", name);
}

for (const locale of ["en", "fr"]) {
  for (const size of ["desktop", "mobile"]) {
    await capture(`01-landing-${locale}-${size}`, `/${locale}`, { locale, size });
    await capture(`02-question-${locale}-${size}`, "/quiz", { locale, size });
    await capture(`04-result-${locale}-${size}`, "/r/sample", { locale, size });
  }
}
for (const [locale, size] of [["en", "desktop"], ["fr", "desktop"], ["en", "mobile"]]) {
  await capture(`03-tone-${locale}-${size}`, "/quiz", {
    locale,
    size,
    seedAnswers: true,
    before: async (page) => {
      // With 15 answers stored, /quiz resumes on the segment screen (R2-26); its Continue leads to the tone selector.
      await page.getByRole("button", { name: /continue|continuer/i }).click();
    },
  });
}

// The landing preview card alone, neutral then roast — the only canonical roast visual today.
for (const locale of ["en", "fr"]) {
  const ctx = await contextFor(locale, "desktop");
  const page = await ctx.newPage();
  await page.goto(`${SITE}/${locale}`, { waitUntil: "networkidle" });
  const card = page.getByTestId("preview-card");
  await card.screenshot({ path: `${OUT}/05-preview-card-neutral-${locale}.png` });
  await card.getByRole("button", { name: /roast/i }).click();
  await page.waitForTimeout(500);
  await card.screenshot({ path: `${OUT}/05-preview-card-roast-${locale}.png` });
  await ctx.close();
  console.log("captured preview card", locale);
}

// Open Graph images, from the pages' own og:image tags — rewritten onto SITE so a
// local build serves them (the tag carries the absolute production URL).
for (const path of ["/en", "/fr", "/r/sample"]) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${SITE}${path}`, { waitUntil: "domcontentloaded" });
  const url = await page.getAttribute('meta[property="og:image"]', "content");
  if (!url) throw new Error(`no og:image on ${path}`);
  const res = await page.request.get(url.replace(/^https?:\/\/[^/]+/, SITE));
  const file = `${OUT}/og${path.replace(/\//g, "-")}.png`;
  writeFileSync(file, await res.body());
  await ctx.close();
  console.log("saved", file);
}
await browser.close();

// Palette PNG: ~3× smaller, no visible loss on flat UI. sharp ships with Next.
let before = 0;
let after = 0;
for (const f of readdirSync(OUT).filter((n) => n.endsWith(".png"))) {
  const p = `${OUT}/${f}`;
  before += statSync(p).size;
  await sharp(p).png({ palette: true, quality: 85, compressionLevel: 9, effort: 8 }).toFile(`${p}.tmp`);
  renameSync(`${p}.tmp`, p);
  after += statSync(p).size;
}
console.log(`assets: ${(before / 1e6).toFixed(2)} MB → ${(after / 1e6).toFixed(2)} MB`);
