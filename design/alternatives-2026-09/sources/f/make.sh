#!/bin/sh
# Full rebuild of direction F: css, share html, share png, js (embeds share png).
set -e
cd "$(dirname "$0")"
node build.mjs css >/dev/null && node build.mjs share >/dev/null
(cd .. && node share.mjs f >/dev/null)
node build.mjs js >/dev/null
echo built
