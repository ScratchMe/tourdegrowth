import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `vercel.json` delegates its Ignored Build Step to `scripts/vercel-ignore.sh`.
 * Vercel's contract (VERCEL.md §1.6): exit 0 SKIPS the build, exit 1 or
 * greater BUILDS it. Two failure modes this file exists to prevent:
 *
 * - an invalid `vercel.json` fails EVERY deployment, production included;
 * - a skip rule that is one character too broad silently turns a code merge
 *   into a no-op deploy — a fix that never reaches production.
 *
 * So the script is not checked by pattern: it is RUN, against real git
 * repositories built in a temp directory, one scenario per rule.
 */

const ROOT = process.cwd();
const SCRIPT = join(ROOT, "scripts", "vercel-ignore.sh");

describe("vercel.json", () => {
  it("is valid JSON whose ignoreCommand runs the script and nothing else", () => {
    const config = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8")) as Record<string, unknown>;
    expect(Object.keys(config).sort()).toEqual(["$schema", "ignoreCommand"]);
    expect(config.ignoreCommand).toBe("sh scripts/vercel-ignore.sh");
  });
});

// ─── The script, run for real ────────────────────────────────────────────────

const repos: string[] = [];
afterEach(() => {
  for (const dir of repos.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@example.com",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@example.com",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
};

function git(dir: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: dir, env: GIT_ENV, encoding: "utf8" }).trim();
}

/** A repo with one base commit containing code and docs. Returns its path. */
function repo(): string {
  const dir = mkdtempSync(join(tmpdir(), "tdg-ignore-"));
  repos.push(dir);
  git(dir, "init", "-q", "-b", "main");
  write(dir, "src/app/page.tsx", "export default 1;\n");
  write(dir, "README.md", "# base\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "base");
  return dir;
}

function write(dir: string, path: string, content: string): void {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), content);
}

/** Writes the files, commits them, returns the new HEAD sha. */
function commit(dir: string, files: Record<string, string>): string {
  for (const [path, content] of Object.entries(files)) write(dir, path, content);
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "change");
  return git(dir, "rev-parse", "HEAD");
}

function run(dir: string, env: Record<string, string>): number {
  const result = spawnSync("sh", [SCRIPT], {
    cwd: dir,
    env: { ...GIT_ENV, VERCEL_ENV: "", VERCEL_GIT_PREVIOUS_SHA: "", ...env },
    encoding: "utf8",
  });
  return result.status ?? -1;
}

const PROD = { VERCEL_ENV: "production" };
const SKIP = 0;

describe("scripts/vercel-ignore.sh", () => {
  it("skips every non-production build, whatever changed", () => {
    const dir = repo();
    commit(dir, { "src/app/page.tsx": "export default 2;\n" });
    expect(run(dir, { VERCEL_ENV: "preview" })).toBe(SKIP);
    expect(run(dir, { VERCEL_ENV: "" })).toBe(SKIP);
  });

  it("builds a production merge that touches code", () => {
    const dir = repo();
    commit(dir, { "src/app/page.tsx": "export default 2;\n" });
    expect(run(dir, PROD)).not.toBe(SKIP);
  });

  it.each([
    ["root Markdown", { "CLAUDE.md": "journal\n" }],
    ["LICENSE", { LICENSE: "AGPL\n" }],
    ["a workflow", { ".github/workflows/ci.yml": "on: push\n" }],
    ["marketing", { "marketing/launch/show-hn.md": "text\n" }],
    ["design", { "design/game/proto.html": "<p>x</p>\n" }],
    [".design-sync", { ".design-sync/NOTES.md": "notes\n" }],
    ["live probes", { "scripts/live/gemini.live.ts": "export {};\n" }],
    ["several doc-only kinds at once", { "VERCEL.md": "v\n", "design/x.md": "d\n", ".github/dependabot.yml": "x\n" }],
  ])("skips a production merge that only touches %s", (_label, files) => {
    const dir = repo();
    commit(dir, files);
    expect(run(dir, PROD)).toBe(SKIP);
  });

  it("builds as soon as ONE file outside the list changed", () => {
    const dir = repo();
    commit(dir, { "CLAUDE.md": "journal\n", "src/app/page.tsx": "export default 2;\n" });
    expect(run(dir, PROD)).not.toBe(SKIP);
  });

  it.each([
    ["Markdown below the root (could be imported)", { "src/content/notes.md": "x\n" }],
    ["vercel.json", { "vercel.json": "{}\n" }],
    ["the ignore script itself", { "scripts/vercel-ignore.sh": "exit 1\n" }],
    ["another script", { "scripts/utm-link.mjs": "x\n" }],
    ["a dotfile at the root", { ".env.local.example": "X=1\n" }],
  ])("builds when %s changes", (_label, files) => {
    const dir = repo();
    commit(dir, files);
    expect(run(dir, PROD)).not.toBe(SKIP);
  });

  it("builds a rename that moves code OUT of the build (both sides count)", () => {
    const dir = repo();
    mkdirSync(join(dir, "design"));
    git(dir, "mv", "src/app/page.tsx", "design/page.tsx");
    git(dir, "commit", "-q", "-m", "move");
    expect(run(dir, PROD)).not.toBe(SKIP);
  });

  it("diffs from the last successful deployment, not from HEAD^", () => {
    // A code merge whose build failed, then a docs-only merge: HEAD^..HEAD is
    // docs-only, but the code since the last successful deploy must ship.
    const dir = repo();
    const lastDeployed = git(dir, "rev-parse", "HEAD");
    commit(dir, { "src/app/page.tsx": "export default 2;\n" });
    commit(dir, { "CLAUDE.md": "journal\n" });
    expect(run(dir, { ...PROD, VERCEL_GIT_PREVIOUS_SHA: lastDeployed })).not.toBe(SKIP);
    // Without the variable it falls back to HEAD^ — and would skip, which is
    // exactly why the variable comes first.
    expect(run(dir, PROD)).toBe(SKIP);
  });

  it("skips from the last successful deployment when everything since is docs", () => {
    const dir = repo();
    const lastDeployed = git(dir, "rev-parse", "HEAD");
    commit(dir, { "CLAUDE.md": "a\n" });
    commit(dir, { "marketing/kit.md": "b\n" });
    expect(run(dir, { ...PROD, VERCEL_GIT_PREVIOUS_SHA: lastDeployed })).toBe(SKIP);
  });

  it("builds when the previous deployment is not in the (shallow) clone", () => {
    const dir = repo();
    commit(dir, { "CLAUDE.md": "journal\n" });
    const unknown = "0123456789abcdef0123456789abcdef01234567";
    expect(run(dir, { ...PROD, VERCEL_GIT_PREVIOUS_SHA: unknown })).not.toBe(SKIP);
  });

  it("builds when there is no parent to diff against", () => {
    const dir = repo(); // a single commit: HEAD^ does not exist
    expect(run(dir, PROD)).not.toBe(SKIP);
  });

  it("builds a redeploy of the same commit (empty diff is a doubt)", () => {
    const dir = repo();
    commit(dir, { "CLAUDE.md": "journal\n" });
    const head = git(dir, "rev-parse", "HEAD");
    expect(run(dir, { ...PROD, VERCEL_GIT_PREVIOUS_SHA: head })).not.toBe(SKIP);
  });

  // The skip decision is "grep selected nothing outside the list". Reading only
  // grep's OUTPUT made a broken grep (exit 2 on an I/O error, 127 when missing)
  // look exactly like that: empty output, so a code merge was skipped. A fake
  // `grep` first on PATH stands in for the broken one; git stays the real one.
  it.each([
    ["errors (exit 2)", 2],
    ["is missing (exit 127)", 127],
  ])("builds a code merge when grep %s", (_label, code) => {
    const dir = repo();
    commit(dir, { "src/app/page.tsx": "export default 2;\n" });
    const bin = mkdtempSync(join(tmpdir(), "tdg-ignore-bin-"));
    repos.push(bin);
    writeFileSync(join(bin, "grep"), `#!/bin/sh\nexit ${code}\n`, { mode: 0o755 });
    expect(run(dir, { ...PROD, PATH: `${bin}:${process.env.PATH ?? ""}` })).not.toBe(SKIP);
  });

  it("builds when run outside a git repository", () => {
    const dir = mkdtempSync(join(tmpdir(), "tdg-ignore-nogit-"));
    repos.push(dir);
    expect(run(dir, PROD)).not.toBe(SKIP);
  });
});
