#!/usr/bin/env bash
# One-command deploy of a split build to the live game (owner pre-approved every deploy).
# Usage: DEPLOY_TRAILER="Co-Authored-By: ...\nClaude-Session: ..." bash tools/deploy.sh <outdir with overdrive.html+km.js(+models.js)> "<commit message>"
set -euo pipefail
OUT=$(cd "$1" && pwd); MSG="$2"; BR=alex/brave-carson-rbpmlk; D=games/mainhattan-overdrive
URL=https://am015-dev.github.io/spotify_to_ytmusic/mainhattan-overdrive/
[ -f "$OUT/overdrive.html" ] && [ -f "$OUT/km.js" ] || { echo "need $OUT/overdrive.html and km.js"; exit 1; }
! grep -q 'src="models.js"' "$OUT/overdrive.html" || [ -f "$OUT/models.js" ] || { echo "need $OUT/models.js (the page loads it; since v89v)"; exit 1; }
grep -q 'ALL_OPEN=true' "$OUT/overdrive.html" || { echo "ALL_OPEN=true missing"; exit 1; }
grep -q 'by Alex' "$OUT/overdrive.html" || { echo "credits missing"; exit 1; }
W=$(mktemp -d); git clone -q --depth 1 -b "$BR" "$(git remote get-url origin)" "$W"
python3 - "$W/$D/index.html" "$OUT/overdrive.html" <<'PY'
import sys
p,b=sys.argv[1],sys.argv[2]
s=open(p,encoding='utf8').read(); j=s.find('>',s.find('<body'))+1
open(p,'w',encoding='utf8').write(s[:j]+open(b,encoding='utf8').read()+'</body></html>')
PY
cp "$OUT/km.js" "$W/$D/km.js"
[ -f "$OUT/models.js" ] && cp "$OUT/models.js" "$W/$D/models.js"   # LDraw model data (since v89v, src/MODELS)
[ -f "$OUT/tune.json" ] && cp "$OUT/tune.json" "$W/$D/tune.json"   # published TUNE values (docs/TUNE.md), optional
cd "$W"; git add "$D"
git commit -q -m "$MSG" -m "$(printf "%b" "${DEPLOY_TRAILER:-}")"
git push -q origin "HEAD:$BR"; echo "pushed $(git rev-parse --short HEAD)"
for i in $(seq 1 30); do curl -s "$URL?x=$RANDOM" | cmp -s - "$W/$D/index.html" && { echo "LIVE"; exit 0; }; sleep 10; done
echo "pushed but not yet served after 5 min (Pages lag); check $URL"
