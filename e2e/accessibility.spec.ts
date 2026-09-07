import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./helpers";

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
 * Contrast pairs the suite tolerates. EMPTY since REVIEW.md R-22: the three
 * design-system pairs that failed when this gate was first switched on
 * (primary button label 4.42:1, faint credit line 2.80:1, red link 3.57:1)
 * were fixed at the token level, so every colour-contrast violation now
 * turns this red.
 *
 * The mechanism stays, deliberately. If a future brand decision reintroduces
 * a known gap, list it here BY COLOUR PAIR (stable) rather than by CSS-module
 * selector (a build hash), so that a NEW failure still fails while the
 * accepted one remains visible in the code instead of behind a disabled rule.
 */
const KNOWN_CONTRAST_GAPS: { fg: string; bg: string; what: string }[] = [];

const PAGES: [name: string, path: string][] = [
  ["landing", "/en"],
  ["landing (fr)", "/fr"],
  ["questionnaire", "/quiz"],
  ["sample result", "/r/sample"],
  ["how it works", "/en/how-it-works"],
  ["glossary term", "/fr/glossary/viral-coefficient"],
  ["privacy policy", "/en/privacy"],
  // Added with design system extension 01, which turned this into a real
  // screen (DetourCard) rather than the framework's bare error document.
  ["not found", "/nonsense"],
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
