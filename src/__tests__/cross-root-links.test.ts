import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A static guard over the links that cross a root layout.
 *
 * Since REVIEW.md R-24 the content pages (`src/app/[locale]`) and the app
 * routes (`/quiz`, `/r/<id>`, `/deep-dive/<id>`) have separate root layouts,
 * so any link from one tree to the other is a full page load whatever the
 * element. A `next/link` there is not neutral: it prefetches the dynamic
 * target as soon as it scrolls into view and fetches it again on click,
 * before Next discovers from the route tree that it has to reload the
 * document anyway. Measured on the landing (2026-09-14): six renders of the
 * app function per page view, before anyone clicked — the single largest
 * item in the site's CPU bill at near-zero traffic.
 *
 * The rule: a link from the content tree to an app route is a bare `<a>`,
 * or a `<Button hard>`, which renders one. This test reads the source so
 * the next content page that adds a "Start your Tour" button gets a red
 * build rather than a warm-up of the app function on every view.
 */
const CONTENT_TREE = join(process.cwd(), "src", "app", "[locale]");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [full] : [];
  });
}

const FILES = walk(CONTENT_TREE).map((full) => ({
  path: relative(process.cwd(), full),
  source: readFileSync(full, "utf8"),
}));

/** Every JSX opening tag of a `Button` or `Link` whose href targets an app route, literal or template. */
const APP_HREF = /href=(?:"\/(?:quiz|r\/|deep-dive)|\{`\/(?:quiz|r\/|deep-dive))/;

function appLinkTags(source: string): { tag: string; element: string }[] {
  const out: { tag: string; element: string }[] = [];
  for (const m of source.matchAll(/<(Button|Link)\b([^>]*)>/gs)) {
    if (APP_HREF.test(m[2]!)) out.push({ tag: m[0], element: m[1]! });
  }
  return out;
}

describe("links from the content tree into the app tree (REVIEW.md R-24)", () => {
  const found = FILES.flatMap((f) => appLinkTags(f.source).map((t) => ({ ...t, path: f.path })));

  it("finds the links it is meant to police — a floor, so a regex drift cannot pass by matching nothing", () => {
    // Seven today: three on the landing (header CTA, hero CTA, sample link)
    // and the bottom CTA of the four prose pages.
    expect(found.length).toBeGreaterThanOrEqual(7);
  });

  it("every Button into the app tree is `hard`, and no next/link points there", () => {
    const offenders = found
      .filter((t) => t.element === "Link" || !/\bhard\b/.test(t.tag))
      .map((t) => `${t.path}: ${t.tag.replace(/\s+/g, " ")}`);
    expect(offenders).toEqual([]);
  });

  it("the landing's client island links to the last result and the retake with bare anchors", () => {
    const island = FILES.find((f) => f.path.endsWith("LastResult.tsx"));
    expect(island).toBeDefined();
    expect(island!.source).not.toMatch(/from ["']next\/link["']/);
    expect(island!.source).toMatch(/<a href=\{`\/r\/\$\{last\.id\}`\}/);
  });
});
