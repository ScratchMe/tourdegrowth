import { readFileSync } from "node:fs";
import { join } from "node:path";
import { globSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * French guillemets belong in French strings, and nowhere else.
 *
 * Found by looking at `/en/aarrr-vs-rarra`, not by reading code: the English
 * copy quoted a phrase as « always start with retention ». The rest of the
 * English corpus uses straight double quotes ("negative churn", "nights
 * booked", "ARPU"), so a page rendered its quotations in a punctuation the
 * site does not otherwise use — six phrases across two files, both of them
 * drafts I had written myself.
 *
 * Nothing in the type system can see this: `Translatable` is two strings, and
 * both were valid. A scan is the only thing that catches it, and it costs a
 * millisecond.
 *
 * The scan is on the SOURCE rather than on a rendered page on purpose: a
 * single page proves nothing about the other forty-nine, and the defect is in
 * the copy, not in the rendering.
 */
const ROOTS = ["src/content", "src/lib/i18n"];

/** `en: "…"` including escaped quotes, which the corpus uses to quote phrases. */
const EN_STRING = /\ben: "((?:[^"\\]|\\.)*)"/g;

function sourceFiles(): string[] {
  return ROOTS.flatMap((root) =>
    globSync(`${join(process.cwd(), root)}/**/*.ts`).filter((f) => !f.includes("__tests__")),
  );
}

describe("copy typography", () => {
  it("scans a corpus that actually exists — otherwise this test proves nothing", () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(10);
    const withEnglish = files.filter((f) => EN_STRING.test(readFileSync(f, "utf8")));
    expect(withEnglish.length).toBeGreaterThan(5);
  });

  it("no English string uses French guillemets", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(EN_STRING)) {
        if (match[1]!.includes("«") || match[1]!.includes("»")) {
          offenders.push(`${file.replace(process.cwd() + "/", "")}: ${match[1]!.slice(0, 80)}`);
        }
      }
    }
    expect(offenders, `use straight double quotes in English copy:\n${offenders.join("\n")}`).toEqual([]);
  });
});

/**
 * French high punctuation — copy review v1, change nº4 (2026-09-24).
 *
 * French sets a space before `; : ! ?` and `»`, and after `«`. With a plain
 * space the browser is free to break the line THERE, and it did: 111 breaks
 * measured across the French pages at 360, 390 and 1280 px, including the H1
 * of `/fr/growth-audit-checklist` (« Checklist d'audit growth / : les 15
 * points ») and quiz questions ending on a lone « ? ». The fix is at the
 * SOURCE — U+00A0 in the string itself, as the digit groups got on
 * 2026-09-14 — rather than a rewrite at render time, so every surface that
 * never passes through `tc()` (the share image, JSON-LD, metadata) gets it
 * too. U+00A0 rather than the narrow U+202F: it is in every font this site
 * ships, OG subsets included.
 *
 * Unlike the guillemet scan above, this one reads the modules' VALUES, not
 * their text: French strings are written as `fr: "…"`, `t(en, fr)`, `t(fr,
 * en)`, `p(fr, en)` and template literals, and no single regex sees them all.
 * Any object carrying both an `fr` and an `en` key is a translatable; its
 * `fr` side, and everything under it, is French. `audit-catalog.ts` is French
 * only (the audit instrument has no English), so all of it is.
 */
const FRENCH_ONLY_MODULES = ["src/content/audit-catalog.ts"];

/** A plain space before high punctuation, or after an opening guillemet. */
const PLAIN_SPACE_PUNCTUATION = / [;:!?»]|« /;

function collectStrings(value: unknown, french: boolean, out: string[], seen: WeakSet<object>): void {
  if (typeof value === "string") {
    if (french) out.push(value);
    return;
  }
  if (typeof value !== "object" || value === null || seen.has(value)) return;
  seen.add(value);
  const record = value as Record<string, unknown>;
  const translatable = "fr" in record && "en" in record;
  for (const [key, child] of Object.entries(record)) {
    const childIsFrench = translatable ? (key === "fr" ? true : key === "en" ? false : french) : french;
    collectStrings(child, childIsFrench, out, seen);
  }
}

async function frenchStrings(): Promise<{ file: string; text: string }[]> {
  const found: { file: string; text: string }[] = [];
  for (const file of sourceFiles()) {
    const relative = file.replace(process.cwd() + "/", "");
    const exports = (await import(file)) as Record<string, unknown>;
    const out: string[] = [];
    collectStrings(exports, FRENCH_ONLY_MODULES.includes(relative), out, new WeakSet());
    for (const text of out) found.push({ file: relative, text });
  }
  return found;
}

describe("French typography", () => {
  it("reads a French corpus that actually exists — otherwise the checks below prove nothing", async () => {
    const strings = await frenchStrings();
    expect(strings.length).toBeGreaterThan(1000);
    expect(new Set(strings.map((s) => s.file)).size).toBeGreaterThan(15);
    // The growth engine's two modules carry more French than any other page
    // (engine spec §12, P3): a scan that stopped reaching them would pass on them.
    for (const file of ["src/content/engine-catalog.ts", "src/content/engine-copy.ts"])
      expect(strings.filter((s) => s.file === file).length, file).toBeGreaterThan(150);
    // The walk must tell the two languages apart, or it would flag English.
    expect(strings.some((s) => s.text === "Où ta croissance")).toBe(true);
    expect(strings.some((s) => s.text === "Where does")).toBe(false);
  });

  it("has a no-break space, never a plain one, before ; : ! ? » and after «", async () => {
    const offenders = (await frenchStrings())
      .filter(({ text }) => PLAIN_SPACE_PUNCTUATION.test(text))
      .map(({ file, text }) => {
        const at = text.search(PLAIN_SPACE_PUNCTUATION);
        return `${file}: …${text.slice(Math.max(0, at - 30), at + 10)}…`;
      });
    expect(offenders, `use U+00A0 in French copy:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("writes an ellipsis as one character, not three dots", async () => {
    const offenders = (await frenchStrings()).filter(({ text }) => text.includes("...")).map(({ file, text }) => `${file}: ${text.slice(0, 80)}`);
    expect(offenders, `use … in French copy:\n${offenders.join("\n")}`).toEqual([]);
  });
});

/**
 * The audit instrument writes its copy inline, in its screens (hints, labels,
 * a confirmation) — none of it in `src/content`, so the scans above never
 * read it, and its guillemets carried plain spaces: « euro » wrapped as
 * "« euro" / "»," at 390px (design sync, 2026-09-30, CHANTIERS.md A9.1). The
 * audit is French only, so every string in it is French.
 *
 * Read from the source with the comments taken out: a guillemet never appears
 * in code, so it is checked everywhere; high punctuation only inside
 * double-quoted literals, since `a ? b : c` is code. Text between JSX tags is
 * not read for high punctuation — no regex tells it from code.
 *
 * Non-vacuity (2026-09-30): the plain spaces put back in one hint of
 * `DefinitionEditor.tsx` fail both checks.
 */
const AUDIT_ROOT = "src/app/(app)/admin/audit";
const COMMENTS = /\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|(?<!:)\/\/[^\n]*/g;
const DOUBLE_QUOTED = /"((?:[^"\\\n]|\\.)*)"/g;

function auditSources(): { file: string; code: string }[] {
  return globSync(`${join(process.cwd(), AUDIT_ROOT)}/**/*.{ts,tsx}`)
    .filter((f) => !f.includes("__tests__"))
    .map((f) => ({ file: f.replace(process.cwd() + "/", ""), code: readFileSync(f, "utf8").replace(COMMENTS, "") }));
}

describe("the audit instrument's French", () => {
  it("reads a corpus that actually exists", () => {
    const sources = auditSources();
    expect(sources.length).toBeGreaterThan(10);
    const quoted = sources.reduce((n, { code }) => n + (code.match(/«/g)?.length ?? 0), 0);
    expect(quoted).toBeGreaterThan(20);
  });

  it("has a no-break space inside « », never a plain one", () => {
    const offenders = auditSources().flatMap(({ file, code }) =>
      [...code.matchAll(/« | »/g)].map((m) => `${file}: …${code.slice(Math.max(0, m.index! - 30), m.index! + 10)}…`),
    );
    expect(offenders, `use U+00A0 in the audit's copy:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("has a no-break space before ; : ! ? in its strings", () => {
    const offenders = auditSources().flatMap(({ file, code }) =>
      [...code.matchAll(DOUBLE_QUOTED)].filter((m) => / [;:!?]/.test(m[1]!)).map((m) => `${file}: ${m[1]!.slice(0, 80)}`),
    );
    expect(offenders, `use U+00A0 in the audit's copy:\n${offenders.join("\n")}`).toEqual([]);
  });
});
