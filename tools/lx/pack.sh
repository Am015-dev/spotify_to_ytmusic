#!/bin/bash
# life-1: pack the LIFE code (src/assets/lx/code.js, as a string the page evals in its module scope) into <out>/models/lx.js
set -e; OUT="${1:?usage: tools/lx/pack.sh <outdir>}"; cd "$(dirname "$0")/../.."; mkdir -p "$OUT/models"
node --check src/assets/lx/code.js
{ printf 'window.__LXJ='; node -e "process.stdout.write(JSON.stringify(require('fs').readFileSync('src/assets/lx/code.js','utf8')))"; printf ';\n'; } > "$OUT/models/lx.js"
node --check "$OUT/models/lx.js"
