import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import LandingShareImage from "@/app/[locale]/opengraph-image";
import { PRIMITIVES } from "@/styles/tokens/tokens";

/**
 * The paper ground's lift on the share images is a LIFT (CHANTIERS.md A17,
 * NEXTJS.md §1.10).
 *
 * Satori blends a gradient stop written `transparent` through black: the
 * white halo of the landing's image (and of How it works, the glossary and
 * `/quiz`, which share its frame) ended on `transparent` and drew a grey band
 * across the top of the picture instead of a lighter one. Measured on
 * 2026-10-02: the ground fell to (204, 199, 188) under the subtitle, which
 * took the red accent, « cale-t-elle ? », to 2.76:1 — under the 3:1 its
 * display size needs — and the subtitle to 4.50:1. Nothing failed: the image
 * rendered, and only a look at it showed the smudge.
 *
 * Two guards: no share frame writes `transparent` in a gradient, and the
 * landing's image, rendered, is nowhere darker than its own paper in a band
 * no text crosses — the band where the grey showed.
 */

const SRC = path.join(process.cwd(), "src");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

/**
 * The pixels of a PNG as rows of RGB — enough for what Satori writes (8-bit,
 * truecolour with or without alpha, not interlaced), with node:zlib alone:
 * no image library is a dependency of this repository.
 */
function decodePng(png: Buffer): { width: number; height: number; rgb: (x: number, y: number) => [number, number, number] } {
  expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const [depth, colourType, , , interlace] = [png[24], png[25], png[26], png[27], png[28]];
  expect([depth, interlace]).toEqual([8, 0]);
  expect([2, 6]).toContain(colourType);
  const channels = colourType === 6 ? 4 : 3;
  const idat: Buffer[] = [];
  for (let at = 8; at < png.length; ) {
    const length = png.readUInt32BE(at);
    if (png.toString("latin1", at + 4, at + 8) === "IDAT") idat.push(png.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!;
    for (let i = 0; i < stride; i++) {
      const byte = raw[y * (stride + 1) + 1 + i]!;
      const a = i >= channels ? out[y * stride + i - channels]! : 0;
      const b = y > 0 ? out[(y - 1) * stride + i]! : 0;
      const c = i >= channels && y > 0 ? out[(y - 1) * stride + i - channels]! : 0;
      const p = a + b - c;
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const predictor = [0, a, b, (a + b) >> 1, paeth][filter]!;
      out[y * stride + i] = (byte + predictor) & 0xff;
    }
  }
  return {
    width,
    height,
    rgb: (x, y) => {
      const i = y * stride + x * channels;
      return [out[i]!, out[i + 1]!, out[i + 2]!];
    },
  };
}

/** Linear-light luminance (WCAG), the measure the contrast tests use. */
const luminance = (r: number, g: number, b: number) => {
  const lin = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

describe("the share images' ground lift", () => {
  it("no share frame ends a gradient on `transparent`", () => {
    // Every file that draws a share image: lib/og, and the routes that render one.
    const frames = [
      ...files(path.join(SRC, "lib/og")),
      ...files(path.join(SRC, "app")).filter((f) => /opengraph-image|\/share\//.test(f)),
    ];
    expect(frames.length).toBeGreaterThan(8);
    const offenders = frames.flatMap((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .filter((line) => /gradient\(/.test(line) && /\btransparent\b/.test(line))
        .map((line) => `${path.relative(SRC, f)}: ${line.trim()}`),
    );
    expect(offenders).toEqual([]);
  });

  it("the landing's image is nowhere darker than its paper, left of the text", async () => {
    const res = await LandingShareImage({ params: Promise.resolve({ locale: "fr" }) });
    const image = decodePng(Buffer.from(await res.arrayBuffer()));
    expect([image.width, image.height]).toEqual([1200, 630]);

    const hex = PRIMITIVES["paper-1"];
    const paper = luminance(...([1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]));
    // x 4–50: inside the 2px border, left of the 56px padding where text starts;
    // y outside the dashed road line (top 96, 8px).
    let darkest = Infinity;
    let seen = 0;
    for (let y = 4; y < image.height - 4; y++) {
      if (y >= 90 && y <= 110) continue;
      for (let x = 4; x < 50; x++) {
        darkest = Math.min(darkest, luminance(...image.rgb(x, y)));
        seen++;
      }
    }
    expect(seen).toBeGreaterThan(20000);
    // One step of 8-bit rounding below the paper at most.
    expect(darkest).toBeGreaterThanOrEqual(paper - 0.005);
  }, 30000);
});
