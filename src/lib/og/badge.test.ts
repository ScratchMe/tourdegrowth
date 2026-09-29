import { describe, expect, it } from "vitest";
import {
  BADGE_LABEL,
  BADGE_VERSION,
  badgeAlt,
  badgeMarkdown,
  badgePath,
  badgeToken,
  parseBadgeToken,
  renderBadgeSvg,
  textWidth,
} from "@/lib/og/badge";
import { OG_INK, OG_PAINT_WHITE, OG_RED_ACTION } from "@/lib/og/tokens";
import { SITE_URL } from "@/lib/site";

/*
 * The README badge (CHANTIERS.md A3.1, 2026-09-29). What matters: it says the
 * total and nothing more (the share image's own rule), it can never be more
 * than a picture, and its address turns over exactly when the drawing would.
 *
 * Non-vacuity (2026-09-29), one sabotage each, each failing its test alone:
 * dropping `textLength` fails « fits every run to its box »; hashing the
 * version alone (not the drawing) fails « the token follows the drawing »;
 * a link put in after the title fails « is only a picture »; the total's
 * guard removed fails « draws only a total the engine can produce ».
 */

const ID = "3f2b6a0e-9c1d-4e5f-8a7b-0c1d2e3f4a5b";

describe("renderBadgeSvg", () => {
  it("says the total and nothing more, in words a screen reader reads", () => {
    const svg = renderBadgeSvg(74);
    expect(svg).toContain(`aria-label="${BADGE_LABEL} · 74/100"`);
    expect(svg).toContain(`<title>${BADGE_LABEL} · 74/100</title>`);
    expect(svg).toContain(">74/100<");
    // Two runs of text, the brand and the score: no stage, no tone, no id.
    expect(svg.match(/<text /g)).toHaveLength(2);
    expect(svg).not.toContain(ID);
  });

  it("is only a picture: no script, no link, no external reference, no font file", () => {
    const svg = renderBadgeSvg(74);
    expect(svg).not.toMatch(/<script|<a |href=|xlink|@import|url\((?!#)|<foreignObject|<style|@font-face|on[a-z]+=/i);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
  });

  it("paints with the share image's tokens: white on ink, white on the red fill made for small white text", () => {
    const svg = renderBadgeSvg(74);
    expect(svg).toContain(`fill="${OG_INK}"`);
    expect(svg).toContain(`fill="${OG_RED_ACTION}"`);
    expect(svg).toContain(`fill="${OG_PAINT_WHITE}"`);
  });

  it("fits every run to its box, so a substitute font cannot overflow", () => {
    const svg = renderBadgeSvg(100);
    const lengths = [...svg.matchAll(/textLength="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(lengths).toEqual([Math.round(textWidth(BADGE_LABEL) * 10) / 10, Math.round(textWidth("100/100") * 10) / 10]);
    const width = Number(svg.match(/^<svg[^>]*width="([\d.]+)"/)![1]);
    expect(width).toBeCloseTo(lengths[0]! + lengths[1]! + 4 * 6, 0);
  });

  it("draws only a total the engine can produce: an integer from 0 to 100, never a string", () => {
    expect(() => renderBadgeSvg(0)).not.toThrow();
    expect(() => renderBadgeSvg(100)).not.toThrow();
    for (const bad of [-1, 101, 7.5, Number.NaN, '1"/><script>x</script>' as unknown as number]) {
      expect(() => renderBadgeSvg(bad), String(bad)).toThrow();
    }
  });

  it("counts a glyph it does not know as the widest letter, never as nothing", () => {
    expect(textWidth("é")).toBeGreaterThanOrEqual(textWidth("w"));
  });
});

describe("the badge's address", () => {
  it("the token follows the drawing: stable for one total, different for another", () => {
    expect(badgeToken(74)).toMatch(/^[a-f0-9]{12}$/);
    expect(badgeToken(74)).toBe(badgeToken(74));
    expect(badgeToken(74)).not.toBe(badgeToken(75));
    expect(BADGE_VERSION).toBeGreaterThanOrEqual(1);
  });

  it("is versioned under the result, and parses back", () => {
    const path = badgePath(ID, 74);
    expect(path).toBe(`/r/${ID}/badge/${badgeToken(74)}.svg`);
    expect(parseBadgeToken(`${badgeToken(74)}.svg`)).toBe(badgeToken(74));
    for (const bad of ["badge.svg", `${badgeToken(74)}.png`, `${badgeToken(74)}`, "../x.svg", "ABCDEF012345.svg"]) {
      expect(parseBadgeToken(bad), bad).toBeNull();
    }
  });

  it("the Markdown is the badge linking to the result, absolute, on the canonical domain", () => {
    expect(badgeMarkdown(ID, 74)).toBe(`[![${badgeAlt(74)}](${SITE_URL}${badgePath(ID, 74)})](${SITE_URL}/r/${ID})`);
  });
});
