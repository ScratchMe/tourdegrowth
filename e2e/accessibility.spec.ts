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
 *
 * Runs twice: in the default project at 1280 and in the `mobile` project at
 * 390 × 844 (playwright.config.ts, ds-critique M-7). The phone width has its
 * own type sizes and restacked layouts, so "zero known contrast gap" has to
 * hold there too — at 1280 alone every `max-width: 760px` rule went unchecked.
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
  // GROWTH-PLAN.md 2.3 — la seule page du site dont la structure est un
  // tableau comparatif sans `<table>` : l'ordre des titres (h1, h2, h3 sous
  // le h2 « En un coup d'oeil ») est exactement ce qu'axe sait vérifier.
  ["framework comparison (fr)", "/fr/aarrr-vs-rarra"],
];

interface ContrastData {
  fgColor?: string;
  bgColor?: string;
  contrastRatio?: number;
}

/**
 * The logotype, and only the logotype. WCAG 1.4.3 exempts "text that is part
 * of a logo or brand name" from contrast minimums, and the wordmark's red
 * GROWTH is exactly that: 3.56:1 on the page ground, which passes as large
 * text at the 19px desktop size and not at the 15px mobile one. Matched on
 * the element's own markup (its text and tag), never on its colour pair —
 * `--paint-red` on `--paper-1` in small body text is precisely the mistake
 * R-22 exists to catch, and a colour-pair exception would wave it through.
 */
function isLogotype(html: string): boolean {
  return /^<span[^>]*>GROWTH<\/span>$/.test(html.trim());
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

    // The page ground is a gradient (`--ground-lift`), and axe cannot compute
    // contrast over a gradient: it files every such node under "incomplete",
    // never under "violations". Measured on 2026-09-24, that was ~20 text
    // nodes per page — the header nav, the hero, every prose paragraph that
    // sits directly on the page — so the "no known gap" promise below never
    // covered them at all. Flattening the ground to its base colour
    // (`--surface-page`) lets axe measure them. The lifts move that ground by
    // a few percent at most, so this can overstate a ratio slightly at the
    // single darkest point; it is still a measurement where there was none.
    await page.addStyleTag({ content: "body { background-image: none !important; }" });

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const unexpected: string[] = [];
    for (const violation of violations) {
      if (violation.impact !== "serious" && violation.impact !== "critical") continue;

      for (const node of violation.nodes) {
        const data = node.any[0]?.data as ContrastData | undefined;
        if (violation.id === "color-contrast" && (isKnownGap(data) || isLogotype(node.html))) continue;
        unexpected.push(
          `${violation.id} (${violation.impact}) on \`${node.target.join(" ")}\` — ${violation.help}`,
        );
      }
    }

    expect(unexpected).toEqual([]);
  });
}
