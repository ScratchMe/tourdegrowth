import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * CLAUDE.md is loaded into EVERY Claude Code session. On 2026-09-27 it held 591,000 characters —
 * roughly 150,000 tokens per session, 93 % of it the project journal — for a warning Claude Code
 * raises from 40,000 characters on. The journal moved to JOURNAL.md, and this test keeps the
 * budget a rule rather than an intention: history goes to the end of JOURNAL.md, a tool's trap to
 * its tool file, and CLAUDE.md keeps only what must be known before acting.
 *
 * Non-vacuity, measured on 2026-09-27: appending the old journal back into CLAUDE.md fails the
 * budget test and nothing else.
 */

const ROOT = process.cwd();
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

/** The threshold of Claude Code's "Large CLAUDE.md will impact performance" warning. */
const BUDGET = 40_000;

describe("CLAUDE.md", () => {
  it(`stays under ${BUDGET.toLocaleString("en")} characters — history belongs in JOURNAL.md`, () => {
    const size = read("CLAUDE.md").length;
    expect(size, `CLAUDE.md is ${size} characters: move the history to the end of JOURNAL.md`).toBeLessThan(BUDGET);
  });

  it("points at the journal, which exists", () => {
    expect(read("CLAUDE.md")).toContain("`JOURNAL.md`");
    expect(read("JOURNAL.md").startsWith("# Journal de Tour de Growth\n")).toBe(true);
  });
});
