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
