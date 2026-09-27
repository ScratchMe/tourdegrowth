import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, test } from "vitest";

/**
 * `.claude/hooks/refuse-edits-on-main.mjs`, run for real: each case builds git repositories in a
 * temporary directory and pipes the exact JSON Claude Code sends a PreToolUse hook. Convention 2 of
 * CLAUDE.md is what it enforces — no edit while this checkout is on `main` — and the cases below
 * pin both halves: what it must refuse, and what it must let through (another repository, a
 * worktree, a file outside any repository, input it cannot read).
 *
 * Non-vacuity, measured on 2026-09-27 by breaking the hook three ways (restored byte for byte after
 * each), the tests that failed in brackets and no other:
 *   - an empty set of protected branches: 3 (the three refusals);
 *   - no "same repository" check: 1 (the clone in the scratchpad);
 *   - no "same repository" check AND the branch read from the project instead of the file's own
 *     directory: 2 (the clone, the worktree). Removing only one of those two leaves the worktree
 *     case green — the worktree is held by both mechanisms at once, which is why its test only
 *     falls when both go.
 */

const ROOT = process.cwd();
const HOOK = path.join(ROOT, ".claude", "hooks", "refuse-edits-on-main.mjs");

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@example.com",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@example.com",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
};

const temporaries: string[] = [];
afterAll(() => temporaries.forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })));

function git(directory: string, ...args: string[]) {
  return execFileSync("git", args, { cwd: directory, env: GIT_ENV, encoding: "utf8" }).trim();
}

/** A repository with one commit on `main`, and `src/page.ts` in it. */
function repository(): string {
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "tdg-hook-")));
  temporaries.push(directory);
  git(directory, "init", "-q", "-b", "main");
  fs.mkdirSync(path.join(directory, "src"));
  fs.writeFileSync(path.join(directory, "src/page.ts"), "export default 1;\n");
  git(directory, "add", "-A");
  git(directory, "commit", "-q", "-m", "base");
  return directory;
}

/** Runs the hook as Claude Code would: the tool call as JSON on stdin, the project in the env. */
function hook(project: string, input: unknown) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
    env: { ...GIT_ENV, CLAUDE_PROJECT_DIR: project },
  });
  return { code: r.status, stderr: r.stderr };
}

const edit = (project: string, file: string, tool = "Edit") => ({
  hook_event_name: "PreToolUse",
  cwd: project,
  tool_name: tool,
  tool_input: { file_path: file },
});

describe("refuses an edit while this repository is on main", () => {
  test("an Edit of an existing file", () => {
    const project = repository();
    const r = hook(project, edit(project, path.join(project, "src/page.ts")));

    expect(r.code).toBe(2);
    expect(r.stderr).toContain('on "main"');
    expect(r.stderr).toContain("git checkout -B");
  });

  test("a Write that creates a file in a directory that does not exist yet", () => {
    const project = repository();
    expect(hook(project, edit(project, path.join(project, "src/new/deep/file.ts"), "Write")).code).toBe(2);
  });

  test("a relative path, resolved against the session's directory", () => {
    const project = repository();
    expect(hook(project, edit(project, "src/page.ts", "MultiEdit")).code).toBe(2);
  });
});

describe("lets an edit through", () => {
  test("on a work branch", () => {
    const project = repository();
    git(project, "checkout", "-q", "-b", "claude/work");
    expect(hook(project, edit(project, path.join(project, "src/page.ts"))).code).toBe(0);
  });

  test("in another repository that is itself on main — a clone in the scratchpad", () => {
    const project = repository();
    const other = repository();
    expect(hook(project, edit(project, path.join(other, "src/page.ts"))).code).toBe(0);
  });

  test("in a worktree of this repository, which has its own branch", () => {
    const project = repository();
    const worktree = path.join(project, ".claude/worktrees/agent");
    git(project, "worktree", "add", "-q", "-b", "agent/branch", worktree);
    expect(hook(project, edit(project, path.join(worktree, "src/page.ts"))).code).toBe(0);
  });

  test("outside any repository", () => {
    const project = repository();
    const outside = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "tdg-hook-outside-")));
    temporaries.push(outside);
    expect(hook(project, edit(project, path.join(outside, "notes.md"), "Write")).code).toBe(0);
  });

  test.each<[string, unknown]>([
    ["a tool call without a file path", { tool_name: "Bash", tool_input: { command: "ls" } }],
    ["input that is not JSON", "not json"],
  ])("when given %s — the guard fails open", (_, input) => {
    const project = repository();
    expect(hook(project, input).code).toBe(0);
  });
});

describe(".claude/settings.json", () => {
  test("registers the hook on every tool that writes a file, and nothing else", () => {
    const settings = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude/settings.json"), "utf8")) as {
      hooks: { PreToolUse: { matcher: string; hooks: { type: string; command: string }[] }[] };
    };
    expect(Object.keys(settings)).toEqual(["hooks"]);
    expect(Object.keys(settings.hooks)).toEqual(["PreToolUse"]);
    const [entry] = settings.hooks.PreToolUse;
    expect(entry?.matcher.split("|").sort()).toEqual(["Edit", "MultiEdit", "NotebookEdit", "Write"]);
    expect(entry?.hooks).toEqual([
      { type: "command", command: 'node "${CLAUDE_PROJECT_DIR}/.claude/hooks/refuse-edits-on-main.mjs"' },
    ]);
    expect(fs.existsSync(HOOK)).toBe(true);
  });
});
