#!/usr/bin/env bash
# Decrypt a "Pull private stats (encrypted)" run — the session side of
# .github/workflows/stats.yml.
#
#   1. age-keygen -o "$SCRATCH/stats.key"        # once per session, never committed
#      (its "Public key:" line is the workflow's `recipient` input)
#   2. trigger the workflow, then save the job log to a file
#   3. scripts/stats-decrypt.sh "$SCRATCH/stats.key" "$LOG" "$OUT_DIR"
#
# The log carries the armored ciphertext between age's own BEGIN/END lines,
# usually with a timestamp prefix on every line (the GitHub API's log
# format); both are stripped here.
set -euo pipefail
key="${1:?private key file}"; log="${2:?job log file}"; out="${3:-.}"
mkdir -p "$out"
sed -n '/-----BEGIN AGE ENCRYPTED FILE-----/,/-----END AGE ENCRYPTED FILE-----/p' "$log" \
  | sed -E 's/^[^-]*(-----(BEGIN|END) AGE ENCRYPTED FILE-----)$/\1/; s/^[0-9T:.Z-]+ //' \
  | age -d -i "$key" \
  | tar xzf - -C "$out"
ls -1 "$out"
