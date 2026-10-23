#!/usr/bin/env bash
# Build the game from src/ modules.
# Usage: tools/build.sh <ver> [--local] [--preview]
#   --preview builds into out/<ver>-preview/ with OD_PREVIEW=true (src/10_core.js): every default-OFF feature flag resolved through OD_FLAG is ON (an explicit ?name=0 still wins); prints the list. Nothing is published by it (rule 11: the coordinator publishes the Beta-preview).
#   -> out/<ver>/overdrive.html + out/<ver>/km.js + out/<ver>/models.js  (the split deploy set; deploy.sh copies all three)
#   -> out/<ver>/index.html                          (exactly what deploy.sh writes into games/mainhattan-overdrive/)
#   --local also writes ./overdrive.html (= the split page + src/test/*.js test-only modules, e.g. ?fast=1) and runs P.py's save() so local.html,
#           local_dbg.html and chk.mjs exist for smoke/tPlay; copies km.js next to them.
# Concatenation only: no minify, no rewrite. src/ORDER is the module order; every src/*.js|*.html must be listed.
set -euo pipefail
cd "$(dirname "$0")/.."
VER="${1:?usage: tools/build.sh <ver> [--local] [--preview]}"; PREVIEW=0; LOCAL=0; for a in "${@:2}"; do [ "$a" = --preview ] && PREVIEW=1; [ "$a" = --local ] && LOCAL=1; done
OUT="out/$VER"; [ $PREVIEW = 1 ] && OUT="out/$VER-preview"; mkdir -p "$OUT"
for f in src/*.js src/*.html; do grep -qx "$(basename "$f")" src/ORDER src/MODELS || { echo "BUILD FAIL: $f not in src/ORDER or src/MODELS"; exit 1; }; done
python3 tools/modmap.py || echo "WARN: modmap failed (docs/MODULES.md not refreshed)"   # keep docs/MODULES.md in step with src/
# lazy code chunks (src/LAZY, split-1): modules that are still in ORDER (dev tools keep working) but are NOT in the page; packed to out/<ver>/xc/<name>.js, evaluated after drivable (src/10z_lazy.js)
XC_ORDER=$(grep -vxF -f <(sed 's/:.*//;/^#/d;/^$/d;s/+/\n/g' src/LAZY 2>/dev/null; echo __none__) src/ORDER)
rm -rf "$OUT/xc"; XCV=$(node tools/lazy/pack.js "$OUT") || { echo "BUILD FAIL: lazy chunks"; exit 1; }
for f in "$OUT"/xc/*.js; do [ -e "$f" ] && { node --check "$f" || { echo "BUILD FAIL: $f syntax"; exit 1; }; }; done
( cd src && node ../tools/strip.js $XC_ORDER ) | XCV="$XCV" python3 tools/lazy/inject.py > "$OUT/overdrive.html"   # deploy page: own-line comments stripped (tools/strip.js, AST-identical); --local dev page below stays unstripped
cp src/assets/km.js "$OUT/km.js"
# LDraw model data (src/MODELS): out/<ver>/models.js = small index (presets, placements, chunk table; v89z) + out/<ver>/models/<id>.js, one chunk per model, loaded on demand
python3 tools/ld/mkmodels.py "$OUT" || { echo "BUILD FAIL: models"; exit 1; }
for f in "$OUT"/models/*.js; do node --check "$f" || { echo "BUILD FAIL: $f syntax"; exit 1; }; done
node --check "$OUT/models.js" || { echo "BUILD FAIL: models.js syntax"; exit 1; }
bash tools/as/pack.sh "$OUT" || { echo "BUILD FAIL: models/as.js (asset-1 world assets)"; exit 1; }   # asset-1 trees/bushes, loaded only with ?asset=1
bash tools/lx/pack.sh "$OUT" || { echo "BUILD FAIL: models/lx.js (life-1 LIFE)"; exit 1; }   # life-1 LIFE (on by default, ?life=0 off)
bash tools/xf/pack.sh "$OUT" || { echo "BUILD FAIL: models/xf.js (xform-1 auto transform)"; exit 1; }   # xform-1 auto transform + body tilt (on by default, ?xf=0 off)
bash tools/qa/pack.sh "$OUT" || { echo "BUILD FAIL: models/qa.js (qa-1 kit)"; exit 1; }   # qa-1 invariants + bug report, lazy chunk
# published tuning (TUNE drawer, docs/TUNE.md): the page fetches ./tune.json next to itself; deploy.sh copies it when present
[ -f src/assets/tune.json ] && cp src/assets/tune.json "$OUT/tune.json"
# music tracks (98m_music.js streams music/<name>.mp3 next to the page; deploy.sh copies out/<ver>/music/)
if ls src/assets/music/*.mp3 >/dev/null 2>&1; then mkdir -p "$OUT/music"; cp src/assets/music/*.mp3 "$OUT/music/"; fi
# every name in MUS_FILES (98m_music.js) must ship, so the page never requests a missing track (no 404s)
for n in $(grep -o "^const MUS_FILES=\[[^]]*\]" src/98m_music.js | grep -o "'[a-z_0-9]*'" | tr -d "'"); do [ -f "src/assets/music/$n.mp3" ] || { echo "BUILD FAIL: MUS_FILES lists $n but src/assets/music/$n.mp3 is missing"; exit 1; }; done
# live page shell (head) + body + tail: identical to what tools/deploy.sh writes
cat src/assets/shell_head.html > "$OUT/index.html"; cat "$OUT/overdrive.html" >> "$OUT/index.html"; printf '</body></html>' >> "$OUT/index.html"
if [ $PREVIEW = 1 ]; then   # OD_PREVIEW=true in the page (and in every lazy chunk that carries the constant)
  for f in "$OUT/overdrive.html" "$OUT/index.html" "$OUT"/xc/*.js; do [ -e "$f" ] && sed -i 's/^const OD_PREVIEW=false;/const OD_PREVIEW=true;/' "$f"; done
  grep -q '^const OD_PREVIEW=true;' "$OUT/overdrive.html" || { echo "BUILD FAIL: OD_PREVIEW not flipped"; exit 1; }
  echo "PREVIEW flags forced ON: $(grep -ohE "OD_FLAG\('[a-zA-Z0-9_.]+'\)" src/*.js | sed -E "s/OD_FLAG\('(.*)'\)/\1/" | sort -u | tr '\n' ' ')"
fi
grep -q 'ALL_OPEN=true' "$OUT/overdrive.html" || { echo "BUILD FAIL: ALL_OPEN=true missing"; exit 1; }
grep -q 'by Alex' "$OUT/overdrive.html" || { echo "BUILD FAIL: credits missing"; exit 1; }
python3 - "$OUT/overdrive.html" <<'PY'
import re,sys;s=open(sys.argv[1],encoding='utf8').read();m=re.search(r'<script type="module">(.*?)</script>',s,re.S);open('/tmp/_od_chk.mjs','w').write(m.group(1))
PY
node --check /tmp/_od_chk.mjs || { echo "BUILD FAIL: syntax"; exit 1; }
if [ $LOCAL = 1 ]; then   # dev pages: the deploy page + test-only modules (src/test/*.js, inert without their URL flag) before 99_api.js
  ( cd src && for f in $XC_ORDER; do [ "$f" = 99_api.js ] && cat test/*.js 2>/dev/null; cat "$f"; done ) | XCV="$XCV" python3 tools/lazy/inject.py > overdrive.html
  rm -rf xc; [ -d "$OUT/xc" ] && cp -r "$OUT/xc" xc
  cp "$OUT/km.js" km.js;cp "$OUT/models.js" models.js;rm -rf models;cp -r "$OUT/models" models;[ -f "$OUT/tune.json" ] && cp "$OUT/tune.json" tune.json;[ -d "$OUT/music" ] && mkdir -p music && cp "$OUT"/music/*.mp3 music/; python3 -c "exec(open('P.py' if __import__('os').path.exists('P.py') else 'attic/P.py').read());save()"; node --check chk.mjs || { echo "BUILD FAIL: local syntax"; exit 1; }; fi
# garage-cars (22 Oct): every file the Beta artifact must carry, one path per line (the coordinator publishes from this list; a missing models/<car>.js = a dead garage car).
# Checks that every chunk models.js / the page can request exists in $OUT.
python3 - "$OUT" <<'PY' || { echo "BUILD FAIL: PUBLISH_FILES"; exit 1; }
import os,re,sys
o=sys.argv[1];F=sorted(os.path.relpath(os.path.join(d,f),o) for d,_,fs in os.walk(o) for f in fs if f not in('overdrive.html','PUBLISH_FILES.txt'))
need=set(re.findall(r'"(models/[\w.-]+\.js)\?',open(os.path.join(o,'models.js'),encoding='utf8').read()))|{'models/%s.js'%k for k in('as','lx','xf','qa')}|{'km.js','models.js','index.html'}
miss=sorted(n for n in need if n not in F)
if miss:print('PUBLISH_FILES missing: '+' '.join(miss));sys.exit(1)
open(os.path.join(o,'PUBLISH_FILES.txt'),'w').write('\n'.join(F)+'\n');print('PUBLISH_FILES_OK %d files (%d model chunks)'%(len(F),sum(f.startswith('models/') for f in F)))
PY
echo "BUILD_OK $OUT  page $(wc -c <"$OUT/overdrive.html") B  km.js $(wc -c <"$OUT/km.js") B  models.js $(wc -c <"$OUT/models.js") B  models/ $(cat "$OUT"/models/*.js | wc -c) B  xc/ $(cat "$OUT"/xc/*.js 2>/dev/null | wc -c) B  index.html $(wc -c <"$OUT/index.html") B"
