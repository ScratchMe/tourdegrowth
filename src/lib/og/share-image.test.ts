import { describe, expect, it } from "vitest";
import {
  LEGACY_SHARE_TOKEN,
  matchShareToken,
  parseShareToken,
  sampleShareImageModel,
  SHARE_IMAGE_VERSION,
  shareImageModel,
  shareImagePath,
  shareImageSrc,
  shareImageStrings,
  shareImageToken,
  type ShareImageModel,
} from "@/lib/og/share-image";
import { PILLARS } from "@/lib/scoring/pillars";
import type { Submission } from "@/lib/submissions/types";
import { SAMPLE_RESULT } from "@/lib/submissions/sample";

/**
 * The version token of the result's share image (2026-09-14). The CDN caches
 * each address as immutable, so the one property that matters is that the
 * token changes whenever the picture would — and only then.
 */
const base: ShareImageModel = sampleShareImageModel();

describe("shareImageToken", () => {
  it("is twelve hex characters and stable for the same model", () => {
    expect(shareImageToken(base)).toMatch(/^[a-f0-9]{12}$/);
    expect(shareImageToken(base)).toBe(shareImageToken({ ...base }));
  });

  it("changes with every input the frame draws", () => {
    const variants: ShareImageModel[] = [
      { ...base, total: base.total + 1 },
      { ...base, bottleneck: { pillar: "acquisition", score: 2 } },
      { ...base, bottleneck: null },
      { ...base, nextMove: base.nextMove + "." },
      { ...base, locale: "fr" },
      { ...base, roast: true },
      { ...base, deepDive: true },
    ];
    const tokens = new Set(variants.map(shareImageToken));
    expect(tokens.size).toBe(variants.length);
    expect(tokens.has(shareImageToken(base))).toBe(false);
  });

  it("hashes the resolved copy too, so a wording change turns the address over without a version bump", () => {
    // The strings are part of the hash input by construction; this pins that
    // they are the frame's, in the model's locale.
    const en = shareImageStrings(base);
    const fr = shareImageStrings({ ...base, locale: "fr" });
    expect(en.whereDoesYours).not.toBe(fr.whereDoesYours);
    expect(en.bottleneckLabel).toMatch(/^[A-Z]+ · \d+\/20$/);
    expect(shareImageStrings({ ...base, bottleneck: null }).bottleneckLabel).toBeNull();
    expect(SHARE_IMAGE_VERSION).toBeGreaterThanOrEqual(1);
  });
});

describe("addresses", () => {
  it("builds /r/<id>/share/<token>.png, and the src helper mints the token", () => {
    expect(shareImagePath("sample", "abcdef012345")).toBe("/r/sample/share/abcdef012345.png");
    expect(shareImageSrc("sample", base)).toBe(shareImagePath("sample", shareImageToken(base)));
  });

  it("parses a token segment: twelve hex or the legacy token, always .png", () => {
    expect(parseShareToken("abcdef012345.png")).toBe("abcdef012345");
    expect(parseShareToken(`${LEGACY_SHARE_TOKEN}.png`)).toBe(LEGACY_SHARE_TOKEN);
    for (const bad of ["abcdef012345", "abcdef012345.jpg", "ABCDEF012345.png", "abcdef01234.png", "nope.png", "legacy", ""]) {
      expect(parseShareToken(bad), bad).toBeNull();
    }
    // The legacy token can never equal a real one, so it is never immutable.
    expect(LEGACY_SHARE_TOKEN).not.toMatch(/^[a-f0-9]{12}$/);
  });
});

describe("shareImageModel", () => {
  const submission = {
    id: "3f1c2a7e-9b4d-4e21-a8c6-000000000000",
    createdAt: "2026-09-14T10:00:00.000Z",
    locale: "fr",
    tone: "roast",
    answers: Object.fromEntries(
      PILLARS.flatMap((p, i) => [1, 2, 3].map((n) => [`${p.slice(0, 3)}-${n}`, i === 2 ? 0 : 2])),
    ),
    pillars: PILLARS.map((pillar, i) => ({ pillar, score: i === 2 ? 0 : 20, rawPoints: i === 2 ? 0 : 60 })),
    total: 80,
    weakestPillar: "retention",
    refId: null,
    segment: null,
    ownerTokenHash: null,
    deepDive: null,
  } as unknown as Submission;

  it("reads the author's locale and tone, names the bottleneck, and never carries raw points", () => {
    const model = shareImageModel(submission);
    expect(model).toMatchObject({ total: 80, locale: "fr", roast: true, deepDive: false });
    expect(model.bottleneck).toEqual({ pillar: "retention", score: 0 });
    expect(model.nextMove.length).toBeGreaterThan(0);
    expect(JSON.stringify(model)).not.toContain("rawPoints");
  });

  it("the sample model is the fixed English sample, never enriched", () => {
    expect(sampleShareImageModel()).toMatchObject({ total: SAMPLE_RESULT.total, locale: "en", roast: false, deepDive: false });
  });

  // Copy review v1, DS critique L-5: the picture shown IN the page follows
  // the reader; the one declared to crawlers keeps the author's language.
  it("can be drawn in the reader's language, action included, on its own address", () => {
    const author = shareImageModel(submission);
    const reader = shareImageModel(submission, "en");
    expect(reader.locale).toBe("en");
    expect(reader.nextMove).not.toBe(author.nextMove);
    expect({ ...reader, locale: author.locale, nextMove: author.nextMove }).toEqual(author);
    expect(shareImageToken(reader)).not.toBe(shareImageToken(author));
    expect(sampleShareImageModel("fr")).toMatchObject({ locale: "fr", total: SAMPLE_RESULT.total });
    expect(sampleShareImageModel("fr").nextMove).not.toBe(sampleShareImageModel().nextMove);
  });
});

describe("matchShareToken", () => {
  const build = (locale: "en" | "fr") => sampleShareImageModel(locale);

  it("reads the language off the token: each locale's current token finds that locale's model", () => {
    for (const locale of ["en", "fr"] as const) {
      expect(matchShareToken(shareImageToken(build(locale)), build)).toEqual(build(locale));
    }
  });

  it("finds nothing for a token that is no language's current picture", () => {
    expect(matchShareToken(LEGACY_SHARE_TOKEN, build)).toBeNull();
    expect(matchShareToken("000000000000", build)).toBeNull();
    expect(matchShareToken(shareImageToken({ ...build("fr"), deepDive: true }), build)).toBeNull();
  });
});
