#!/bin/bash
# life-1: pack the LIFE code (src/assets/lx/code.js, as a string the page evals in its module scope) into <out>/models/lx.js
set -e; OUT="${1:?usage: tools/lx/pack.sh <outdir>}"; cd "$(dirname "$0")/../.."; mkdir -p "$OUT/models"
node --check src/assets/lx/code.js; [ -f src/assets/lx/ld.js ] && node --check src/assets/lx/ld.js
# life-2: the LDraw set data (optional; without it the landmarks are the stand-ins) (src/assets/lx/ld.js: LD_MESH/LD_MODELS) goes first, then LDW_reg() registers its parts, then the LIFE code
{ printf 'window.__LXJ='; node -e "const f=require('fs'),r=n=>f.existsSync('src/assets/lx/'+n)?f.readFileSync('src/assets/lx/'+n,'utf8'):'';process.stdout.write(JSON.stringify(r('ld.js')+'\ntry{LDW_reg()}catch(e){}\n'+r('code.js')))"; printf ';\n'; } > "$OUT/models/lx.js"
node --check "$OUT/models/lx.js"
