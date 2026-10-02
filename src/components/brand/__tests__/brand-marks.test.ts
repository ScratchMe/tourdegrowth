import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SPACE_PICTO, SPACES } from "../SpaceBand";
import { SPACE_PICTO_PARTS } from "../space-pictos";
import { STOPWATCH_STROKES, STOPWATCH_WEDGE_SHARE } from "../stopwatch-geometry";

/**
 * The stopwatch and the road book's pictograms are drawn once, as data
 * (`stopwatch-geometry.ts`, `space-pictos.ts`), and painted twice: by the
 * components in CSS, and by the share images in literal colours (T6.2). What
 * the data cannot carry is held here: the stroke widths the CSS paints with,
 * and the rule that no second copy of a drawing appears anywhere — the
 * result's image kept its own copy of the Tour's pictogram until T6.2.
 */

const SRC = path.join(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("the stopwatch's strokes", () => {
  const css = readFileSync(path.join(SRC, "components/brand/Stopwatch.module.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  /** The stroke width each class sets, read off the rule blocks (a block may name several classes). */
  const widths = new Map<string, number>();
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const width = /stroke-width:\s*([\d.]+)/.exec(body ?? "")?.[1];
    if (!width) continue;
    for (const cls of (selectors ?? "").matchAll(/\.([a-z]+)/g)) widths.set(cls[1] ?? "", Number(width));
  }

  it("are the ones the share image draws with", () => {
    expect(widths.get("button")).toBe(STOPWATCH_STROKES.button);
    expect(widths.get("hub")).toBe(STOPWATCH_STROKES.button);
    expect(widths.get("face")).toBe(STOPWATCH_STROKES.face);
    expect(widths.get("bezel")).toBe(STOPWATCH_STROKES.bezel);
    expect(widths.get("minor")).toBe(STOPWATCH_STROKES.minor);
    expect(widths.get("major")).toBe(STOPWATCH_STROKES.major);
    expect(widths.get("hand")).toBe(STOPWATCH_STROKES.hand);
  });

  it("the wedge is the accent at the share the image mixes it at", () => {
    const mix = /\.wedge\s*\{[^}]*color-mix\(in srgb, var\(--space-engine-accent\) (\d+)%, transparent\)/.exec(css);
    expect(Number(mix?.[1]) / 100).toBe(STOPWATCH_WEDGE_SHARE);
  });
});

describe("each drawing exists once", () => {
  const files = sourceFiles(SRC);
  const drawings = Object.values(SPACE_PICTO_PARTS).flatMap((parts) =>
    parts.flatMap((part) => (part.kind === "ring" ? [] : [part.d])),
  );

  it("reads a corpus that exists — otherwise this proves nothing", () => {
    expect(files.length).toBeGreaterThan(100);
    expect(drawings.length).toBeGreaterThan(8);
  });

  it("no source file spells a pictogram's path but space-pictos.ts", () => {
    for (const d of drawings) {
      const holders = files.filter((f) => readFileSync(f, "utf8").includes(d)).map((f) => path.relative(SRC, f));
      expect(holders, d).toEqual(["components/brand/space-pictos.ts"]);
    }
  });

  it("the band paints every part of its pictograms", () => {
    for (const space of SPACES) {
      const markup = renderToStaticMarkup(SPACE_PICTO[space] as never);
      for (const part of SPACE_PICTO_PARTS[space]) {
        if (part.kind === "ring") expect(markup).toContain(`<circle cx="${part.cx}" cy="${part.cy}" r="${part.r}"`);
        else expect(markup).toContain(`d="${part.d}"`);
      }
      expect(markup.match(/<(path|circle) /g)).toHaveLength(SPACE_PICTO_PARTS[space].length);
    }
  });
});
