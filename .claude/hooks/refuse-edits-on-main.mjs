#!/usr/bin/env node
/**
 * refuse-edits-on-main.mjs — Tour de Growth
 *
 * PreToolUse hook on Edit, Write, MultiEdit and NotebookEdit (registered in
 * `.claude/settings.json`): refuses to write into this repository while its
 * current branch is `main`.
 *
 * Why: convention 2 of CLAUDE.md — `git checkout -B <branch>` BEFORE editing,
 * never after (GITHUB.md §1.1). It was written after PR #50 (2026-09-06): a fix
 * committed on local `main` instead of the work branch, the branch pushed
 * stale, a PR with zero files, a green CI that tested an unchanged `main`, and
 * a fix that stayed missing for another half day. A rule a session can forget
 * is now a refusal it cannot miss.
 *
 * What it does not see, said plainly: a write made through Bash (`sed -i`, a
 * heredoc, a Python one-liner) is not an Edit or a Write, so it goes through.
 * The guard covers the ordinary way files change, not every way.
 *
 * Scope: only this repository. A file in another git repository (a clone in
 * the scratchpad, a workflow worktree under `.claude/worktrees/`, which has
 * its own branch) or outside any repository is let through: the rule is about
 * this checkout's `main`, nothing else.
 *
 * It fails OPEN: unreadable input, no git, not a repository — the edit goes
 * through. This guard prevents a mistake; it is not a security boundary, and a
 * hook that broke every edit on an unexpected error would cost more than the
 * mistake it prevents. Tested in `src/__tests__/refuse-edits-on-main.test.ts`.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PROTECTED_BRANCHES = new Set(["main", "master"]);

function git(directory, ...args) {
  return execFileSync("git", ["-C", directory, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

/** The closest directory of `file` that exists: a Write creates files, and their directories too. */
function closestExistingDirectory(file) {
  let directory = path.dirname(file);
  while (!fs.existsSync(directory)) {
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
  return directory;
}

function decide() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return 0;
  }
  const file = input?.tool_input?.file_path;
  if (typeof file !== "string" || file === "") return 0;

  const project = process.env.CLAUDE_PROJECT_DIR || input.cwd;
  if (typeof project !== "string" || project === "") return 0;
  const directory = closestExistingDirectory(path.resolve(input.cwd ?? project, file));
  if (directory === null) return 0;

  let branch;
  try {
    const fileRepository = fs.realpathSync(git(directory, "rev-parse", "--show-toplevel"));
    const projectRepository = fs.realpathSync(git(project, "rev-parse", "--show-toplevel"));
    if (fileRepository !== projectRepository) return 0;
    branch = git(directory, "branch", "--show-current");
  } catch {
    return 0;
  }
  if (!PROTECTED_BRANCHES.has(branch)) return 0;

  process.stderr.write(
    `Refused: this repository is on "${branch}", and edits are never made there. ` +
      "Switch to the work branch first — `git checkout -B <branch>` — then make the edit again. " +
      "Convention 2 of CLAUDE.md (GITHUB.md §1.1): an edit made on main is how PR #50 shipped empty.\n",
  );
  return 2;
}

process.exitCode = decide();
