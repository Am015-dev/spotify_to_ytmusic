#!/usr/bin/env bash
# Build the game from src/ modules.
# Usage: tools/build.sh <ver> [--local]
#   -> out/<ver>/overdrive.html + out/<ver>/km.js + out/<ver>/models.js  (the split deploy set; deploy.sh copies all three)
#   -> out/<ver>/index.html                          (exactly what deploy.sh writes into games/mainhattan-overdrive/)
#   --local also writes ./overdrive.html (= the split page + src/test/*.js test-only modules, e.g. ?fast=1) and runs P.py's save() so local.html,
#           local_dbg.html and chk.mjs exist for smoke/tPlay; copies km.js next to them.
# Concatenation only: no minify, no rewrite. src/ORDER is the module order; every src/*.js|*.html must be listed.
set -euo pipefail
cd "$(dirname "$0")/.."
VER="${1:?usage: tools/build.sh <ver> [--local]}"; OUT="out/$VER"; mkdir -p "$OUT"
for f in src/*.js src/*.html; do grep -qx "$(basename "$f")" src/ORDER src/MODELS || { echo "BUILD FAIL: $f not in src/ORDER or src/MODELS"; exit 1; }; done
python3 tools/modmap.py || echo "WARN: modmap failed (docs/MODULES.md not refreshed)"   # keep docs/MODULES.md in step with src/
( cd src && cat $(cat ORDER) ) > "$OUT/overdrive.html"
cp src/assets/km.js "$OUT/km.js"
# LDraw model data (src/MODELS, 98ld_stub.js): out/<ver>/models.js, each module wrapped for 98ld_run.js; loaded like km.js, NOT in the page
{ echo "// models.js: LDraw model data for overdrive.html (built by tools/build.sh from src/MODELS; run by 98ld_run.js). LDraw files: CCAL 2.0, authors in each block."
  for f in $(cat src/MODELS); do echo "(window.__LDQ=window.__LDQ||[]).push(function(LD_MESH,LD_MODELS,GB_PC,G13_ID,GAR_SETS,GAR_set,LD_br,LDW_P,LDW_reg){// $f"; cat "src/$f"; echo "});"; done; } > "$OUT/models.js"
node --check "$OUT/models.js" || { echo "BUILD FAIL: models.js syntax"; exit 1; }
# published tuning (TUNE drawer, docs/TUNE.md): the page fetches ./tune.json next to itself; deploy.sh copies it when present
[ -f src/assets/tune.json ] && cp src/assets/tune.json "$OUT/tune.json"
# music tracks (98m_music.js streams music/<name>.mp3 next to the page; deploy.sh copies out/<ver>/music/)
if ls src/assets/music/*.mp3 >/dev/null 2>&1; then mkdir -p "$OUT/music"; cp src/assets/music/*.mp3 "$OUT/music/"; fi
# every name in MUS_FILES (98m_music.js) must ship, so the page never requests a missing track (no 404s)
for n in $(grep -o "^const MUS_FILES=\[[^]]*\]" src/98m_music.js | grep -o "'[a-z_0-9]*'" | tr -d "'"); do [ -f "src/assets/music/$n.mp3" ] || { echo "BUILD FAIL: MUS_FILES lists $n but src/assets/music/$n.mp3 is missing"; exit 1; }; done
# live page shell (head) + body + tail: identical to what tools/deploy.sh writes
cat src/assets/shell_head.html > "$OUT/index.html"; cat "$OUT/overdrive.html" >> "$OUT/index.html"; printf '</body></html>' >> "$OUT/index.html"
grep -q 'ALL_OPEN=true' "$OUT/overdrive.html" || { echo "BUILD FAIL: ALL_OPEN=true missing"; exit 1; }
grep -q 'by Alex' "$OUT/overdrive.html" || { echo "BUILD FAIL: credits missing"; exit 1; }
python3 - "$OUT/overdrive.html" <<'PY'
import re,sys;s=open(sys.argv[1],encoding='utf8').read();m=re.search(r'<script type="module">(.*?)</script>',s,re.S);open('/tmp/_od_chk.mjs','w').write(m.group(1))
PY
node --check /tmp/_od_chk.mjs || { echo "BUILD FAIL: syntax"; exit 1; }
if [ "${2:-}" = "--local" ]; then   # dev pages: the deploy page + test-only modules (src/test/*.js, inert without their URL flag) before 99_api.js
  ( cd src && for f in $(cat ORDER); do [ "$f" = 99_api.js ] && cat test/*.js 2>/dev/null; cat "$f"; done ) > overdrive.html
  cp "$OUT/km.js" km.js;cp "$OUT/models.js" models.js;[ -f "$OUT/tune.json" ] && cp "$OUT/tune.json" tune.json;[ -d "$OUT/music" ] && mkdir -p music && cp "$OUT"/music/*.mp3 music/; python3 -c "exec(open('P.py').read());save()"; node --check chk.mjs || { echo "BUILD FAIL: local syntax"; exit 1; }; fi
echo "BUILD_OK $OUT  page $(wc -c <"$OUT/overdrive.html") B  km.js $(wc -c <"$OUT/km.js") B  models.js $(wc -c <"$OUT/models.js") B  index.html $(wc -c <"$OUT/index.html") B"
