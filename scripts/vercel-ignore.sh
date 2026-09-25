#!/bin/sh
# Vercel "Ignored Build Step" — run by `vercel.json#ignoreCommand`.
#
# Vercel's contract, verified at the source (VERCEL.md §1.6): exit 0 SKIPS
# the build, exit 1 or greater BUILDS it. So every path through this script
# that is not a positive, verified "nothing here reaches the build" must end
# in a non-zero exit — including crashes, a missing git binary or a commit
# the shallow clone does not have. A deployment skipped by mistake means a
# fix never reaches production, which is far worse than the ~43 MB of
# Functions Storage this script exists to save.
#
# Two rules:
#   1. Only production builds. Previews were never used on this project
#      (the check is a local production build, then CI) — 2026-09-07.
#   2. A production merge that only touches files the build never reads is
#      skipped: root-level Markdown, LICENSE, .github/, marketing/, design/,
#      .design-sync/, scripts/live/. The list was verified against the build
#      on 2026-09-15; nothing under src/ imports marketing/ or design/.
#      Root-level `*.md` only — never `**/*.md`: a Markdown file inside src/
#      could one day be imported.

[ "$VERCEL_ENV" = "production" ] || exit 0

# The base is the last SUCCESSFUL deployment, not HEAD^. With HEAD^, a code
# merge whose build failed followed by a docs-only merge would look like
# "nothing to deploy", and the failed merge's code would never ship.
# VERCEL_GIT_PREVIOUS_SHA is sometimes empty: only then fall back to HEAD^.
# When it is set but absent from the shallow clone (depth 10), build.
base="$VERCEL_GIT_PREVIOUS_SHA"
if [ -z "$base" ]; then
  base="HEAD^"
fi
git cat-file -e "$base^{commit}" 2>/dev/null || exit 1

# --no-renames lists both sides of a rename: moving src/x.ts to design/x.ts
# removes code from the build and must build.
files=$(git diff --no-renames --name-only "$base" HEAD) || exit 1

# An empty diff (a redeploy of the same commit) is a doubt: build.
[ -n "$files" ] || exit 1

# Any path outside the build-irrelevant list means "build".
#
# Decide on grep's EXIT STATUS, not only on its output: a grep that fails (2
# on an error, 127 when missing) prints nothing, which reads exactly like
# "every path is on the list" and would skip a code merge. grep exits 1 only
# when it selected no line — the one status that means "skip". The status of
# `var=$(pipeline)` is the pipeline's, i.e. grep's (no pipefail needed: grep
# is last). The output check below stays as a second line of defence.
outside=$(printf '%s\n' "$files" | grep -Ev '^([^/]+\.md|LICENSE|\.github/.+|marketing/.+|design/.+|\.design-sync/.+|scripts/live/.+)$')
grep_status=$?
[ "$grep_status" -eq 1 ] || exit 1
[ -n "$outside" ] && exit 1

echo "Ignored build step: only build-irrelevant files changed since $base."
exit 0
