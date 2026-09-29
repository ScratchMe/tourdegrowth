import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { badgeAlt, badgeMarkdown, badgePath } from "@/lib/og/badge";
import { BadgeSnippet } from "../BadgeSnippet";

/*
 * The owner's README badge block (CHANTIERS.md A3.1). A real result page
 * needs Firestore, which neither CI nor the e2e suite has (CLAUDE.md, « Les
 * e2e de composition ne passent que par la branche échantillon »), so the
 * rule « the owner's only, never on the sample » is held here, on the
 * source, the way game-entry-wiring.test.ts holds the game card; the block
 * itself is rendered to markup.
 *
 * Non-vacuity (2026-09-29): dropping `isOwner &&` from the condition in
 * ResultView.tsx fails « shown to the owner only »; passing `badge` in the
 * sample branch of page.tsx fails « never on the sample ».
 */

const ID = "3f2b6a0e-9c1d-4e5f-8a7b-0c1d2e3f4a5b";
const DIR = join(process.cwd(), "src", "app", "(app)", "r", "[id]");

describe("BadgeSnippet markup", () => {
  const html = renderToStaticMarkup(
    createElement(BadgeSnippet, {
      src: badgePath(ID, 74),
      alt: badgeAlt(74),
      markdown: badgeMarkdown(ID, 74),
      caption: "In a README",
      lead: "A badge that links back to this result.",
      copyLabel: "Copy the Markdown",
      copiedLabel: "Markdown copied",
    }),
  );

  it("shows the badge itself, with the brand and the total as its alt", () => {
    expect(html).toContain(`src="${badgePath(ID, 74)}"`);
    expect(html).toContain(`alt="${badgeAlt(74)}"`);
  });

  it("puts the Markdown where it can be selected by hand, and a button that copies it", () => {
    const code = html.match(/<code data-testid="badge-markdown">([^<]*)<\/code>/)?.[1];
    // React escapes the brackets' neighbours it must; the line is the same text.
    expect(code?.replace(/&amp;/g, "&")).toBe(badgeMarkdown(ID, 74));
    expect(html).toMatch(/<button[^>]*data-testid="badge-copy"[^>]*>Copy the Markdown<\/button>/);
  });
});

describe("the block's wiring", () => {
  const view = readFileSync(join(DIR, "ResultView.tsx"), "utf8");
  const page = readFileSync(join(DIR, "page.tsx"), "utf8");

  it("is shown to the owner only", () => {
    expect(view).toMatch(/\{isOwner && badge \? \(\s*<BadgeSnippet/);
    expect(view.match(/<BadgeSnippet\b/g)).toHaveLength(1);
  });

  it("is never offered on the sample: only the real result's branch passes a badge", () => {
    const sample = page.slice(page.indexOf('if (id === "sample") {\n    // Same locale-resolution'), page.indexOf("const submission = await loadSubmission(id);"));
    expect(sample.length).toBeGreaterThan(200);
    expect(sample).not.toMatch(/\bbadge=/);
    expect(page.match(/\bbadge=\{\{ src: badgePath\(submission\.id, submission\.total\)/g)).toHaveLength(1);
  });
});
