import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every third-party action in every workflow is pinned by a full commit SHA,
 * with the tag it stands for in a trailing comment — the hygiene pass that
 * followed the repository going public (2026-09-24). A tag like `@v7` can be
 * moved by whoever controls the action's repository; a SHA cannot. The
 * workflows holding secrets were pinned from day one; `ci.yml` was not, and
 * nothing said it should be. Dependabot keeps SHA pins current and updates
 * the comment with them.
 */
const DIR = join(process.cwd(), ".github", "workflows");
const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f));

describe("GitHub Actions workflows", () => {
  it("are found (a guard that reads nothing proves nothing)", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  it.each(files)("%s pins every action by commit SHA", (file) => {
    const uses = readFileSync(join(DIR, file), "utf8")
      .split("\n")
      .map((line) => line.match(/^\s*(?:-\s*)?uses:\s*(\S+)(.*)$/))
      .filter((m): m is RegExpMatchArray => m !== null);
    expect(uses.length).toBeGreaterThan(0);
    for (const [, ref = "", rest = ""] of uses) {
      // Local actions (./path) have nothing to pin.
      if (ref.startsWith("./")) continue;
      expect(ref, `${file}: ${ref}`).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/);
      expect(rest, `${file}: ${ref} needs a "# vX" comment`).toMatch(/#\s*v\d/);
    }
  });
});
