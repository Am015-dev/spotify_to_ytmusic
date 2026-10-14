#!/bin/bash
# xform-1: pack the XF code (src/assets/xf/code.js, as a string the page evals in its module scope) into <out>/models/xf.js
set -e; OUT="${1:?usage: tools/xf/pack.sh <outdir>}"; cd "$(dirname "$0")/../.."; mkdir -p "$OUT/models"
node --check src/assets/xf/code.js
{ printf 'window.__XFJ='; node -e "process.stdout.write(JSON.stringify(require('fs').readFileSync('src/assets/xf/code.js','utf8')))"; printf ';\n'; } > "$OUT/models/xf.js"
node --check "$OUT/models/xf.js"
