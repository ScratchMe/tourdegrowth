import { readdirSync, readFileSync } from "node:fs";
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

/**
 * JOURNAL.md is the CURRENT volume of the journal; older entries live in docs/journal/ (2026-10-01,
 * at 834,000 characters: too big for GitHub to render, and for a session to open without paying
 * for it). Same reasoning as the budget above: the archive rule is a test, not an intention.
 *
 * Non-vacuity, measured on 2026-10-01: putting the archived volumes back into JOURNAL.md fails the
 * first test; deleting a volume, or adding one the table does not name, fails the second.
 */
const JOURNAL_BUDGET = 200_000;
const VOLUMES = "docs/journal";

describe("JOURNAL.md and its volumes", () => {
  it(`keeps the current volume under ${JOURNAL_BUDGET.toLocaleString("en")} characters`, () => {
    const size = read("JOURNAL.md").length;
    expect(
      size,
      `JOURNAL.md is ${size} characters: move its oldest entries, whole and unrewritten, into a new volume in ${VOLUMES}/ and add its row to the table`,
    ).toBeLessThan(JOURNAL_BUDGET);
  });

  it("lists exactly the volumes that exist, each titled as part of the journal", () => {
    const onDisk = readdirSync(join(ROOT, VOLUMES)).filter((f) => f.endsWith(".md")).sort();
    const linked = [...read("JOURNAL.md").matchAll(/\]\(docs\/journal\/([^)]+\.md)\)/g)].map((m) => m[1]).sort();
    expect(onDisk.length).toBeGreaterThan(0);
    expect(linked).toEqual(onDisk);
    for (const file of onDisk) {
      expect(read(`${VOLUMES}/${file}`).startsWith("# Journal de Tour de Growth — "), file).toBe(true);
    }
  });
});
