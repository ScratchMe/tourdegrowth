import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * One set of form controls (design system extension 04, CHANTIERS.md A10.d).
 *
 * Three features had each rebuilt their own fields — the growth engine's
 * `_engine/_ui/`, the audit's `admin/audit/_ui/`, the slide builder's local
 * `Field` and `.control` — and they drifted apart: three focus rings (one of
 * them red), a « coming soon » reason at 1.91:1, a number box that read
 * « 26 000 » as nothing. All three are gone; this keeps a fourth from
 * growing: a native `<input>` or `<select>` is written in
 * `src/components/core/` and nowhere else.
 *
 * Two inputs stay where they are, by type, and only these: the browser's
 * file button (engine and audit import) and the what-if slider. The return
 * sets conditions for porting both (a secondary Button over a hidden file
 * input; a slider always beside a NumberField holding the same value), and
 * that port is outside A10.
 *
 * Non-vacuity (2026-09-30): run before the two `_ui/` folders were deleted,
 * it failed on each of their inputs and selects.
 */
const ALLOWED_INPUT_TYPES = new Set(["file", "range"]);
const COMMENTS = /\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|(?<![:"'])\/\/[^\n]*/g;

function sources(): { file: string; code: string }[] {
  const root = join(process.cwd(), "src");
  return globSync(`${root}/**/*.tsx`)
    .filter((f) => !f.includes("/components/core/") && !f.includes("__tests__"))
    .map((f) => ({ file: f.replace(process.cwd() + "/", ""), code: readFileSync(f, "utf8").replace(COMMENTS, "") }));
}

/** Each `<input …>` / `<select …>` JSX opening tag, attributes included. */
function tags(code: string, name: "input" | "select"): string[] {
  const out: string[] = [];
  const open = new RegExp(`<${name}\\b`, "g");
  for (const m of code.matchAll(open)) {
    let depth = 0;
    let i = m.index! + name.length + 1;
    for (; i < code.length; i += 1) {
      const c = code[i];
      if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
      else if (c === ">" && depth === 0) break;
    }
    out.push(code.slice(m.index!, i + 1));
  }
  return out;
}

describe("form controls live in src/components/core", () => {
  it("reads a corpus that actually exists, and would see an input", () => {
    const all = sources();
    expect(all.length).toBeGreaterThan(150);
    // The allowed ones are found: the scan reaches the engine and the audit.
    const files = all.filter(({ code }) => tags(code, "input").length > 0).map(({ file }) => file);
    expect(files.some((f) => f.includes("aarrr-funnel-template"))).toBe(true);
    expect(files.some((f) => f.includes("admin/audit"))).toBe(true);
  });

  it("writes no <select> and no <input> by hand outside core, a file button and the slider aside", () => {
    const offending: string[] = [];
    for (const { file, code } of sources()) {
      for (const tag of tags(code, "select")) offending.push(`${file}: ${tag.slice(0, 60)}`);
      for (const tag of tags(code, "input")) {
        const type = /\btype="([^"]+)"/.exec(tag)?.[1];
        if (!type || !ALLOWED_INPUT_TYPES.has(type)) offending.push(`${file}: ${tag.replace(/\s+/g, " ").slice(0, 80)}`);
      }
    }
    expect(offending, `use Field, TextField, NumberField, Select, DateField, Choices or Checkbox from src/components/core:\n${offending.join("\n")}`).toEqual([]);
  });
});
