import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * IndexNow — GROWTH-PLAN.md, vague 0, item 0.3.
 *
 * The protocol proves site ownership by serving `<key>.txt` from the root,
 * and `.github/workflows/indexnow.yml` reads that key from `public/` rather
 * than repeating it. Two files, one contract; this test is what keeps them
 * from drifting — a renamed key file, an empty one, or a second one would
 * each make the daily submission fail (or, worse, be silently ignored by the
 * receiving engines).
 */
const PUBLIC = join(process.cwd(), "public");
const WORKFLOW = join(process.cwd(), ".github/workflows/indexnow.yml");

const keyFiles = readdirSync(PUBLIC).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));

describe("the IndexNow key file", () => {
  it("exists exactly once under public/, named after a 32-hex key", () => {
    expect(keyFiles).toHaveLength(1);
  });

  it("contains exactly its own key — the protocol compares the two", () => {
    const [file] = keyFiles;
    const content = readFileSync(join(PUBLIC, file!), "utf8");
    expect(content).toBe(file!.replace(/\.txt$/, ""));
  });
});

describe("the IndexNow workflow", () => {
  const source = readFileSync(WORKFLOW, "utf8");

  it("submits to api.indexnow.org from the canonical www host, on a schedule and on demand", () => {
    expect(source).toContain("https://api.indexnow.org/indexnow");
    expect(source).toContain("SITE: https://www.tourdegrowth.com");
    expect(source).toMatch(/^\s+schedule:/m);
    expect(source).toMatch(/^\s+workflow_dispatch:/m);
  });

  it("reads the key from public/ instead of repeating it — one source of truth", () => {
    const [file] = keyFiles;
    expect(source).not.toContain(file!.replace(/\.txt$/, ""));
    expect(source).toMatch(/\[0-9a-f\]\{32\}\\\.txt/);
  });

  it("needs no secret and only reads the repository — an IndexNow key is public by design", () => {
    expect(source).not.toMatch(/secrets\./);
    expect(source).toMatch(/permissions:\s*\n\s+contents: read/);
  });

  it("pins its one third-party action to a commit SHA, like verify-live.yml", () => {
    const uses = [...source.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]!);
    expect(uses.length).toBeGreaterThan(0);
    for (const ref of uses) expect(ref).toMatch(/@[0-9a-f]{40}$/);
  });
});
