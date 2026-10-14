#!/bin/bash
# asset-1: pack the world-asset code (src/assets/as/code.js, as a string the page evals in its module scope) + part data into <out>/models/as.js
set -e; OUT="${1:?usage: tools/as/pack.sh <outdir>}"; cd "$(dirname "$0")/../.."; mkdir -p "$OUT/models"
node --check src/assets/as/code.js
{ printf 'window.__ASJ='; node -e "process.stdout.write(JSON.stringify(require('fs').readFileSync('src/assets/as/code.js','utf8')))"; printf ';\n'; cat src/assets/as/parts.js; } > "$OUT/models/as.js"
node --check "$OUT/models/as.js"
