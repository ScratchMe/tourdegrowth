import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * An automated accessibility floor, not a substitute for the real work:
 * REVIEW.md R-19 lists what axe structurally cannot see (focus lost between
 * questions, no live region on the counter, a popover that never moves
 * focus). This catches the regression class axe IS good at — contrast, names,
 * roles, landmarks — on the screens everyone sees.
 *
 * Scoped to serious/critical impact so the gate stays meaningful rather than
 * becoming a wall of advisories nobody triages.
 */

/**
 * Contrast pairs that already fail today, every one of them a design-system
 * token choice rather than a page-level mistake. They are listed here — by
 * colour pair, which is stable, rather than by CSS-module selector, which is
 * a build hash — so that a NEW contrast failure still turns this red while
 * the known ones stay visible in the code instead of being hidden behind a
 * disabled rule.
 *
 * All three are tracked as REVIEW.md R-22, and fixing them means changing
 * brand colours, which is Antoine's call, not a silent edit here.
 */
const KNOWN_CONTRAST_GAPS: { fg: string; bg: string; what: string }[] = [
  // --action-primary-text on --action-primary-bg: 4.41:1, needs 4.5:1. The
  // product's primary button, so this one is on every screen.
  { fg: "#fbf9f2", bg: "#d2402c", what: "primary button label on road-paint red" },
  // --text-faint on --surface-card: 2.8:1. The deliberately quiet "Built by"
  // credit line (SPEC-ADDENDUM-02.md §2.1) — quiet went too far.
  { fg: "#99968f", bg: "#fbf9f2", what: "faint credit line on card paper" },
  // --text-link on --surface-page: 3.56:1 at 11.5px. The design system already
  // ships --paint-red-deep for exactly this ("red text on light grounds").
  { fg: "#d2402c", bg: "#e7e1d2", what: "red link in the disclaimer on page ground" },
];

const PAGES: [name: string, path: string][] = [
  ["landing", "/"],
  ["questionnaire", "/quiz"],
  ["sample result", "/r/sample"],
  ["how it works", "/how-it-works"],
  ["glossary term", "/glossary/viral-coefficient"],
];

interface ContrastData {
  fgColor?: string;
  bgColor?: string;
  contrastRatio?: number;
}

function isKnownGap(data: ContrastData | undefined): boolean {
  if (!data?.fgColor || !data?.bgColor) return false;
  return KNOWN_CONTRAST_GAPS.some(
    (gap) => gap.fg === data.fgColor?.toLowerCase() && gap.bg === data.bgColor?.toLowerCase(),
  );
}

for (const [name, path] of PAGES) {
  test(`${name} has no unknown serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(path);
    // The quiz renders nothing until it has read localStorage (a deliberate
    // hydration choice), so wait for real content before scanning.
    await page.locator("main").waitFor();

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const unexpected: string[] = [];
    for (const violation of violations) {
      if (violation.impact !== "serious" && violation.impact !== "critical") continue;

      for (const node of violation.nodes) {
        const data = node.any[0]?.data as ContrastData | undefined;
        if (violation.id === "color-contrast" && isKnownGap(data)) continue;
        unexpected.push(
          `${violation.id} (${violation.impact}) on \`${node.target.join(" ")}\` — ${violation.help}`,
        );
      }
    }

    expect(unexpected).toEqual([]);
  });
}
