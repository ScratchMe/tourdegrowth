import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DERIVED } from "@/styles/tokens/tokens";

/**
 * Design system extension 04 (CHANTIERS.md A10): the rules the three local
 * copies of a form field broke, held for every sheet that draws a control.
 *
 * 1. One focus ring. The engine ringed its fields in ink, the audit and the
 *    slide builder in red (`--focus-ring-invert`) — red given a fourth
 *    meaning, « you are here », beside the primary action, a diagnosis and
 *    advice. Every control now rings with `--field-focus-ring`, which IS the
 *    system's `--focus-ring`.
 * 2. No opacity to draw a state. `--state-disabled-opacity` on a « coming
 *    soon » option put its reason at 1.91:1, and CI passed it: the contrast
 *    tests measure colours, not an element's opacity. A disabled control is
 *    drawn with tokens that pass; `opacity: 1` (undoing a browser's own
 *    fading) is the one value allowed.
 *
 * Only core draws a control since A10.d (2026-09-30): the engine's and the
 * audit's copies are deleted, and `form-controls-source.test.ts` keeps a
 * hand-written `<input>` or `<select>` from growing back anywhere else.
 *
 * Non-vacuity (2026-09-30): Select's ring put back on `--focus-ring-invert`
 * fails the first test on that line; the `.control:focus-visible` rule taken
 * out of Field's sheet fails the second; `opacity: 0.45` put back on a
 * disabled choice fails the last. `border-radius: var(--radius-field)` put
 * back on Checkbox's `.row` fails the rule test (checked when it was written,
 * on the design sync of 2026-09-30).
 */

const SRC = join(process.cwd(), "src");
const FORM_SHEETS = [
  "components/core/Field.module.css",
  "components/core/NumberField.module.css",
  "components/core/Select.module.css",
  "components/core/DateField.module.css",
  "components/core/Choices.module.css",
  "components/core/Checkbox.module.css",
  "components/core/FormSummary.module.css",
  "components/core/TextArea.module.css",
];

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const sheets = FORM_SHEETS.map((file) => ({ file, css: strip(readFileSync(join(SRC, file), "utf8")) }));

describe("one focus ring on every form control", () => {
  it("rings every control with --field-focus-ring, never a colour of its own", () => {
    const rings: string[] = [];
    const offending: string[] = [];
    for (const { file, css } of sheets) {
      for (const m of css.matchAll(/(?<![-\w])outline\s*:\s*([^;}]+)/g)) {
        const value = m[1]!.trim();
        if (value === "none") continue;
        rings.push(file);
        if (!/var\(--field-focus-ring\)/.test(value)) offending.push(`${file}: outline: ${value}`);
      }
      if (/--focus-ring-invert/.test(css)) offending.push(`${file}: reads --focus-ring-invert`);
    }
    // Field's box, Select, Choices, Checkbox, TextArea and FormSummary each draw one.
    expect(rings.length).toBeGreaterThanOrEqual(6);
    expect(offending).toEqual([]);
  });

  it("an input drawn inside Field's box rings the box, never itself as well", () => {
    // Measured on the built page (2026-09-30): the global :focus-visible rule
    // weighs what `.control` weighs and comes later, so the input drew a second
    // ring under the box's edge. Two classes' weight takes it back.
    const field = sheets.find(({ file }) => file.endsWith("Field.module.css"))!.css;
    expect(field).toMatch(/\.box:focus-within\s*\{[^}]*outline:\s*var\(--focus-width\) solid var\(--field-focus-ring\)/);
    expect(field).toMatch(/\.control:focus-visible\s*\{\s*outline:\s*none;\s*\}/);
  });

  it("--field-focus-ring is the system's ring, not a second one", () => {
    expect(DERIVED["field-focus-ring"]).toBe("var(--focus-ring)");
  });
});

describe("a list split by a rule keeps its rule straight", () => {
  it("never rounds a row that draws the rule between rows", () => {
    // Seen on the design sync of 2026-09-30: Checkbox's rows carried
    // `--radius-field`, and the dashed rule `.row + .row` draws on their top
    // edge curled down at both ends, in every list of boxes in the product.
    // The radius drew nothing else (no fill, no outline on the row).
    const offending: string[] = [];
    for (const { file, css } of sheets) {
      for (const m of css.matchAll(/\.([\w-]+)\s*\+\s*\.\1\s*\{[^}]*border-top\s*:/g)) {
        const own = new RegExp(`(^|[},\\s])\\.${m[1]}\\s*\\{([^}]*)\\}`, "g");
        for (const block of css.matchAll(own)) {
          if (/border-radius\s*:/.test(block[2]!)) offending.push(`${file}: .${m[1]} is rounded and draws a rule`);
        }
      }
    }
    expect(offending).toEqual([]);
  });
});

describe("no opacity to draw a state on a form control", () => {
  it("draws disabled and « not yet » with tokens that pass, never by fading", () => {
    const offending: string[] = [];
    for (const { file, css } of sheets) {
      for (const m of css.matchAll(/(?<![-\w])opacity\s*:\s*([^;}]+)/g)) {
        if (m[1]!.trim() !== "1") offending.push(`${file}: opacity: ${m[1]!.trim()}`);
      }
      if (/--state-disabled-opacity/.test(css)) offending.push(`${file}: reads --state-disabled-opacity`);
    }
    expect(offending).toEqual([]);
  });
});
