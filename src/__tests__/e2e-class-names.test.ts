import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { moduleClass, moduleClassRe } from "../../e2e/module-class";

/**
 * A static guard over how the end-to-end specs name a CSS-module class.
 *
 * Next 16.4.0 shortened the class names Turbopack writes in production
 * (vercel/next.js#97944, `[hash]_[local]`): `Button-module__G1PnAW__quiet`
 * became `G1PnAW_quiet`. Fifty-one specs read the old shape, with
 * `[class*="Button-module__"]`, `[class*='__value']` or `toHaveClass(/__secondary/)`,
 * and all fifty-one went red together, 112 of 112 green the build before. A
 * tool's naming is not a contract of ours (the release notes list it among the
 * « Misc Changes »), so a spec asks for the LOCAL name, the one the stylesheet
 * gives, through `moduleClass` and `moduleClassRe` (`e2e/module-class.ts`),
 * and no other file knows how that name is written.
 *
 * The rules below are the shapes that broke, and the ones next to them (an
 * attribute selector with another operator, a name tested by hand in an
 * `evaluate`). `e2e/module-class.ts` is the only file allowed to hold them: it
 * is the one place that says how a local name becomes a selector.
 *
 * Non-vacuity (2026-10-27), one sabotage at a time, the file put back after
 * each, of 18 tests: `[class*='__value']` back in a spec fails exactly 1 (the
 * second rule); `Button-module__` alone, 1 (the first), and the old `QUIET`
 * selector whole, 2 (the first and the second); `toHaveClass(/__secondary/)`
 * and `toHaveClass(/_secondary/)`, 1 each (the third); `[class$='__tick']`,
 * `[class~="tick"]` and `[class="x"]`, 1 each (the second);
 * `li.className.includes("alert")`, 1 (the fourth). In `module-class.ts`, a
 * selector without the space that ends a token (so `valueLarge` matches)
 * fails 3 cases, the same for the regular expression without its end of
 * token, and the identifier check removed fails 1. The old selectors are
 * also run through the rules in the table of the third test, so a regex
 * that drifts into matching nothing cannot pass.
 */

const ROOT = process.cwd();
const E2E = join(ROOT, "e2e");
/** The helper, exempt: it is where the attribute selectors on `class` live. */
const HELPER = join(E2E, "module-class.ts");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.[cm]?[jt]sx?$/.test(name) ? [full] : [];
  });
}

const ALL = walk(E2E).map((full) => ({ full, path: relative(ROOT, full), source: readFileSync(full, "utf8") }));
const SPECS = ALL.filter((f) => f.full !== HELPER);

interface Rule {
  name: string;
  pattern: RegExp;
}

const RULES: Rule[] = [
  { name: "a module prefix (`-module__`)", pattern: /-module__/ },
  // `class*=`, `class$=`, `class^=`, and the ones nobody wrote yet (`class~=`, `class|=`, an exact `[class=…]`), spaces allowed.
  { name: "an attribute selector on `class` (`class*=`, `class$=`, `class^=`…)", pattern: /class\s*[*$^~|]=|\[\s*class\s*=/ },
  // A regular expression, or a string, with an underscore in it: `/__secondary/`, `/_secondary/`, `"x_secondary"`.
  { name: "`toHaveClass` with a pattern that holds an underscore, the tool's separator", pattern: /toHaveClass\(\s*(?:\/[^/\n]*|["'`][^"'`\n]*)_/ },
  // What an `evaluate` writes when it tests a name by hand: `String(el.className).includes("alert")`.
  { name: "a test of a name read from `className` or `classList`", pattern: /\b(?:className|classList)\b.*\.(?:includes|contains|match|startsWith|endsWith|indexOf|some|find|test)\(/ },
];

/** The lines of `source` that break `rule`, as `file:line: text`. */
function findings(path: string, source: string, rule: Rule): string[] {
  return source
    .split("\n")
    .flatMap((line, i) => (rule.pattern.test(line) ? [`${path}:${i + 1}: ${line.trim().slice(0, 120)}`] : []));
}

describe("e2e specs and the shape of a CSS-module class name", () => {
  it("reads the specs it polices, and the helper that is exempt from the rules", () => {
    // 109 specs and 6 other files today: a floor, so a moved folder cannot pass by scanning nothing.
    expect(SPECS.length).toBeGreaterThanOrEqual(100);
    expect(ALL.some((f) => f.full === HELPER)).toBe(true);
  });

  it.each(RULES)("no file but the helper contains $name", (rule) => {
    const offenders = SPECS.flatMap((f) => findings(f.path, f.source, rule));
    expect(offenders, "name the class by its local name: moduleClass(\"value\"), moduleClassRe(\"secondary\")").toEqual([]);
  });

  it("the rules catch the old selectors they were written for, and let the new ones through", () => {
    const caught = [
      `locator("[class*='__value']")`,
      `locator("[class$='__tick']")`,
      `locator('a[class^="Wordmark"]')`,
      `const QUIET = '[class*="Button-module__"][class*="__quiet"]';`,
      `await expect(retake).toHaveClass(/__secondary/);`,
      `await expect(charge(page)).not.toHaveClass(/__over\\b/);`,
      `await expect(retake).toHaveClass(/_secondary/);`,
      `await expect(retake).toHaveClass("G1PnAW_secondary");`,
      `locator("[class~='tick']")`,
      `locator('[ class *= "tick" ]')`,
      `locator('[class="x"]')`,
      `alert: String(li.className).includes("alert"),`,
      `const hot = el.classList.contains("alert");`,
    ];
    const letThrough = [
      `locator(moduleClass("value"))`,
      `await expect(retake).toHaveClass(moduleClassRe("secondary"));`,
      `await expect(status).toHaveClass(/tdg-visually-hidden/);`,
      `page.locator('[data-testid="stage-scores"] > li')`,
      `getAttribute("class")`,
      `await expect(status).toHaveClass("tdg-visually-hidden");`,
      `offenders.push(\`\${el.className || el.tagName.toLowerCase()} (\${lines.length} lines)\`);`,
      `const hot = el.matches(selector);`,
    ];
    for (const line of caught) {
      expect(RULES.some((rule) => findings("x.ts", line, rule).length > 0), line).toBe(true);
    }
    for (const line of letThrough) {
      expect(RULES.flatMap((rule) => findings("x.ts", line, rule)), line).toEqual([]);
    }
  });

  it("the helper holds the attribute selectors, so its exemption is real and the second rule has something to find", () => {
    const helper = ALL.find((f) => f.full === HELPER)!;
    expect(findings(helper.path, helper.source, RULES[1]!).length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * What the browser does with `:is([class$="_x"], [class*="_x "])`, spelled out:
 * the attribute ends with the token, or contains it followed by another class.
 * The real proof is the suite, run on a build of each shape; this pins the
 * string `moduleClass` returns.
 */
function selectorMatches(selector: string, classAttribute: string): boolean {
  const ends = /\[class\$="([^"]+)"\]/.exec(selector)?.[1];
  const inside = /\[class\*="([^"]+)"\]/.exec(selector)?.[1];
  if (ends === undefined || inside === undefined) throw new Error(`not a moduleClass selector: ${selector}`);
  return classAttribute.endsWith(ends) || classAttribute.includes(inside);
}

describe("moduleClass and moduleClassRe", () => {
  const CASES: { local: string; classAttribute: string; matches: boolean; why: string }[] = [
    { local: "quiet", classAttribute: "Button-module__G1PnAW__quiet", matches: true, why: "the old shape, last token" },
    { local: "quiet", classAttribute: "G1PnAW_quiet", matches: true, why: "the new shape, last token" },
    { local: "button", classAttribute: "Button-module__G1PnAW__button Button-module__G1PnAW__sm Button-module__G1PnAW__quiet", matches: true, why: "the old shape, first of three" },
    { local: "sm", classAttribute: "_7gCfHq_button _7gCfHq_sm _7gCfHq_quiet", matches: true, why: "the new shape, in the middle, and a hash that starts with an underscore" },
    { local: "secondary", classAttribute: "_7gCfHq_button _7gCfHq_md _7gCfHq_secondary", matches: true, why: "the new shape, last of three" },
    { local: "value", classAttribute: "Tile-module__x1y2z3__valueLarge", matches: false, why: "a longer local name that starts with it" },
    { local: "value", classAttribute: "MoneyBlock_figureValue", matches: false, why: "a longer local name that ends with it, in another case" },
    { local: "value", classAttribute: "x1y2z3_values", matches: false, why: "a plural" },
    { local: "figure", classAttribute: "a1b2c3_figureRow a1b2c3_figureValue", matches: false, why: "two longer names, neither of them the token" },
    { local: "quiet", classAttribute: "quiet", matches: false, why: "a global class with no module part is not a module class" },
  ];

  it.each(CASES)("$local in « $classAttribute » is $matches: $why", ({ local, classAttribute, matches }) => {
    expect(selectorMatches(moduleClass(local), classAttribute)).toBe(matches);
    expect(moduleClassRe(local).test(classAttribute)).toBe(matches);
  });

  it("refuses anything that is not a local class name, which would be spliced into a selector", () => {
    for (const bad of ["", "a b", 'a"]', "a-b", "1a", "a_b", "a.b"]) {
      expect(() => moduleClass(bad), bad).toThrow(/not a local class name/);
      expect(() => moduleClassRe(bad), bad).toThrow(/not a local class name/);
    }
  });
});
