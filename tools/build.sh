#!/usr/bin/env bash
# Build the game from src/ modules.
# Usage: tools/build.sh <ver> [--local]
#   -> out/<ver>/overdrive.html + out/<ver>/km.js   (the split deploy pair; same files deploy.sh takes)
#   -> out/<ver>/index.html                          (exactly what deploy.sh writes into games/mainhattan-overdrive/)
#   --local also writes ./overdrive.html (= the split page + src/test/*.js test-only modules, e.g. ?fast=1) and runs P.py's save() so local.html,
#           local_dbg.html and chk.mjs exist for smoke/tPlay; copies km.js next to them.
# Concatenation only: no minify, no rewrite. src/ORDER is the module order; every src/*.js|*.html must be listed.
set -euo pipefail
cd "$(dirname "$0")/.."
VER="${1:?usage: tools/build.sh <ver> [--local]}"; OUT="out/$VER"; mkdir -p "$OUT"
for f in src/*.js src/*.html; do grep -qx "$(basename "$f")" src/ORDER || { echo "BUILD FAIL: $f not in src/ORDER"; exit 1; }; done
( cd src && cat $(cat ORDER) ) > "$OUT/overdrive.html"
cp src/assets/km.js "$OUT/km.js"
# published tuning (TUNE drawer, docs/TUNE.md): the page fetches ./tune.json next to itself; deploy.sh copies it when present
[ -f src/assets/tune.json ] && cp src/assets/tune.json "$OUT/tune.json"
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
  cp "$OUT/km.js" km.js;[ -f "$OUT/tune.json" ] && cp "$OUT/tune.json" tune.json; python3 -c "exec(open('P.py').read());save()"; node --check chk.mjs || { echo "BUILD FAIL: local syntax"; exit 1; }; fi
echo "BUILD_OK $OUT  page $(wc -c <"$OUT/overdrive.html") B  km.js $(wc -c <"$OUT/km.js") B  index.html $(wc -c <"$OUT/index.html") B"
