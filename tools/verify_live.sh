#!/usr/bin/env bash
# Prove src/ builds the CURRENT live game byte for byte: tools/verify_live.sh [ver]
set -euo pipefail
cd "$(dirname "$0")/.."; V="${1:-check}"; BR=alex/brave-carson-rbpmlk; D=games/mainhattan-overdrive
git fetch -q origin "$BR"; tools/build.sh "$V" >/dev/null
for f in index.html km.js $([ -f "out/$V/models.js" ] && echo models.js) $([ -d "out/$V/models" ] && cd "out/$V" && ls models/*.js); do
  if git show "origin/$BR:$D/$f" | cmp - "out/$V/$f"; then echo "IDENTICAL $f $(git show "origin/$BR:$D/$f" | sha256sum | cut -c1-16)"; else echo "DIFFERS $f (src/ is not the live build)"; exit 1; fi
done
echo "LIVE_MATCH $(git rev-parse --short origin/$BR)"
