#!/usr/bin/env node
/**
 * The four motion design films of Tour de Growth, from their one source
 * (`tour-de-growth-motion.html`, the page published as a claude.ai artifact)
 * to files: MP4s for the social networks, frames to check a moment, or a
 * standalone page to open in a browser. Lives in marketing/, outside the app:
 * nothing in src/ imports it, and a change here triggers no Vercel build.
 *
 *   node marketing/motion/films.mjs page
 *   node marketing/motion/films.mjs mp4    [--fmt h,s,v] [--film tour,diag,engine,game] [--lang fr]
 *   node marketing/motion/films.mjs frames --film engine --fmt v [--lang fr] --at 2.6,16.2,24.6
 *
 * Formats: h = 16:9 (1920×1080), s = 1:1 (1080×1080), v = 9:16 (1080×1920).
 * Everything lands in marketing/motion/out/, which git ignores.
 *
 * Needs the dev dependencies (Playwright's Chromium) and, for `mp4`, ffmpeg on
 * the PATH. One clock drives every animation and the sound is synthesised
 * offline from the same cues, so two exports show and sound the same film.
 * Not byte for byte: Chromium's offline audio differs at the eighth digit from
 * one launch to the next, and the encoders turn that into differences at their
 * own noise level (two exports of one film, 2026-10-03: PSNR 46 dB or more).
 * About six minutes per format for the four films; run one format per shell to
 * go faster.
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "out");
const args = process.argv.slice(2);
const mode = args[0];
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const FORMATS = {
  h: { width: 1920, height: 1080, scale: 1.5, name: "16x9" },
  s: { width: 1080, height: 1080, scale: 1.125, name: "1x1" },
  v: { width: 1080, height: 1920, scale: 1.5, name: "9x16" },
};
const FILMS = { tour: "1-le-tour", diag: "2-le-diagnostic", engine: "3-le-moteur", game: "4-le-cote-obscur" };
const FPS = 30;

/**
 * The artifact's file is a body: the viewer wraps it in a document. Off the viewer, this does.
 * Written to a temporary file then renamed: with one export per shell, a page
 * loaded while another process was rewriting it came out truncated.
 */
function standalonePage() {
  const body = readFileSync(join(ROOT, "tour-de-growth-motion.html"), "utf8");
  const page = join(OUT, "films.html");
  const draft = `${page}.${process.pid}.tmp`;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    draft,
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>${body}</body></html>`,
  );
  renameSync(draft, page);
  return page;
}

/** A page sized to one export format, with the page's own recording hooks (`window.__tdg`). */
async function openFilms(browser, fmt) {
  const { width, height } = FORMATS[fmt];
  const page = await (await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })).newPage();
  page.on("pageerror", (e) => console.error(`page error: ${e}`));
  await page.goto(`file://${standalonePage()}`);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function prepare(page, film, fmt, lang, scale) {
  await page.evaluate(
    ([f, m, l, s]) => {
      window.__tdg.setLang(l);
      window.__tdg.setFmt(m);
      window.__tdg.setFilm(f);
      window.__tdg.exportMode(s);
    },
    [film, fmt, lang, scale],
  );
  await page.waitForTimeout(300);
  return page.evaluate(() => window.__tdg.info());
}

async function exportMp4(fmts, films, lang) {
  const browser = await chromium.launch();
  for (const fmt of fmts) {
    const { width, height, scale, name } = FORMATS[fmt];
    const page = await openFilms(browser, fmt);
    for (const film of films) {
      const started = Date.now();
      const info = await prepare(page, film, fmt, lang, scale);
      const wav = join(OUT, `${film}-${fmt}-${lang}.wav`);
      writeFileSync(wav, Buffer.from(await page.evaluate(() => window.__tdg.wav()), "base64"));
      const mp4 = join(OUT, `tour-de-growth-${FILMS[film]}-${name}-${lang}.mp4`);
      // Loudness at -14 LUFS, true peak -1.5 dB: what the platforms normalise to.
      const ffmpeg = spawn(
        "ffmpeg",
        ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-i", wav,
          "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
          "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", mp4],
        { stdio: ["pipe", "inherit", "inherit"] },
      );
      const closed = new Promise((resolve) => ffmpeg.on("close", resolve));
      const frames = Math.round(info.dur * FPS);
      for (let i = 0; i < frames; i++) {
        await page.evaluate((t) => window.__tdg.frame(t), i / FPS);
        const jpeg = await page.screenshot({ type: "jpeg", quality: 92, clip: { x: 0, y: 0, width, height } });
        if (!ffmpeg.stdin.write(jpeg)) await new Promise((resolve) => ffmpeg.stdin.once("drain", resolve));
      }
      ffmpeg.stdin.end();
      const code = await closed;
      unlinkSync(wav);
      if (code !== 0) throw new Error(`ffmpeg exited with ${code} on ${mp4}`);
      console.log(`${mp4} · ${frames} images · ${Math.round((Date.now() - started) / 1000)} s`);
    }
  }
  await browser.close();
}

async function exportFrames(film, fmt, lang, times) {
  const browser = await chromium.launch();
  const page = await openFilms(browser, fmt);
  await prepare(page, film, fmt, lang, FORMATS[fmt].scale / 2);
  const dir = join(OUT, "frames");
  mkdirSync(dir, { recursive: true });
  for (const t of times) {
    await page.evaluate((s) => window.__tdg.frame(s), t);
    const file = join(dir, `${film}-${fmt}-${lang}-${String(t).replace(".", "_")}.png`);
    await page.locator("#screen").screenshot({ path: file });
    console.log(file);
  }
  await browser.close();
}

const list = (value, all) => (value ? value.split(",") : all);
if (mode === "page") {
  console.log(standalonePage());
} else if (mode === "mp4") {
  await exportMp4(list(option("fmt"), Object.keys(FORMATS)), list(option("film"), Object.keys(FILMS)), option("lang", "fr"));
} else if (mode === "frames") {
  const times = list(option("at"), []).map(Number);
  if (!times.length) throw new Error("frames needs --at, e.g. --at 2.6,16.2");
  await exportFrames(option("film", "tour"), option("fmt", "h"), option("lang", "fr"), times);
} else {
  console.error("Usage: node marketing/motion/films.mjs page | mp4 [--fmt h,s,v] [--film …] [--lang fr|en] | frames --film … --fmt … --at …");
  process.exit(1);
}
