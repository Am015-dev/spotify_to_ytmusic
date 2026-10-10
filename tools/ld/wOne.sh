#!/usr/bin/env bash
# tools/ld/wOne.sh <set> <city fra|ath> <r m> <angle deg> "<ld2garage opts>" [shot yaw] : build-5 world prop, one model end to end:
# LDraw OMR ld/omr/<set>-1.mpd -> ld/out/w<set> -> src/98ld_w_<set>.js (+ placement) -> local build -> docs/shots/mdlw/w<set>.png
set -euo pipefail; cd "$(dirname "$0")/../.."
S=$1; C=$2; R=$3; A=$4; O=${5:-}; Y=${6:-0}
python3 tools/ld/ld2garage.py ld/omr/$S-1.mpd ld/out/w$S $O | tail -1
python3 tools/ld/ld2src.py --out src/98ld_w_$S.js w$S=ld/out/w$S.json
printf '// placement (build-5): %s, nearest free lot off the road, %s m from the city start at %s°; cull 900 m\nLDW_P.push({model:%s,city:%s,r:%s,a:%s,cd:900});LDW_reg();\n' "$C" "$R" "$A" "'w$S'" "'$C'" "$R" "$A" >> src/98ld_w_$S.js
grep -qx "98ld_w_$S.js" src/MODELS || echo "98ld_w_$S.js" >> src/MODELS
tools/build.sh wdev --local | tail -1; git checkout -q docs/MODULES.md 2>/dev/null || true
mkdir -p docs/shots/mdlw; node tools/ld/wShot.js "http://127.0.0.1:8766/local_dbg.html?fast=1" w$S docs/shots/mdlw/w$S.png $Y
ls -la src/98ld_w_$S.js | awk '{print "SIZE",$5}'
