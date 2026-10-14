#!/bin/bash
# qa-1: pack the QA kit (src/assets/qa/code.js, a string the page evals in its module scope) into <out>/models/qa.js
set -e; OUT="${1:?usage: tools/qa/pack.sh <outdir>}"; cd "$(dirname "$0")/../.."; mkdir -p "$OUT/models"
node --check src/assets/qa/code.js
{ printf 'window.__QAJ='; node -e "process.stdout.write(JSON.stringify(require('fs').readFileSync('src/assets/qa/code.js','utf8')))"; printf ';\n'; } > "$OUT/models/qa.js"
node --check "$OUT/models/qa.js"
