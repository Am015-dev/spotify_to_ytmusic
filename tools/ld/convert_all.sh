#!/usr/bin/env bash
# tools/ld/convert_all.sh : the three proof models, LDraw OMR -> ld/out/*.json -> src/98ld0_data.js (then tools/build.sh, tools/ld/ldRT.js, tools/ld/ldAB.js)
set -euo pipefail; cd "$(dirname "$0")/../.."
python3 tools/ld/ld2garage.py ld/omr/76897-1.mpd ld/out/audi --drop pilot --yaw 2
python3 tools/ld/ld2garage.py ld/omr/4641-1.mpd ld/out/boat --yaw 3
python3 tools/ld/ld2garage.py ld/omr/1490-1.mpd ld/out/bank --only buildning
python3 tools/ld/ld2src.py audi=ld/out/audi.json boat=ld/out/boat.json bank=ld/out/bank.json
# v89t+: one model per extra data module (src/98ld<N>_data.js, each ≤ 200 KB, listed in src/ORDER after 98ld0_data.js)
python3 tools/ld/ld2garage.py ld/omr/75895-1.mpd ld/out/porsche --drop driver,cone --yaw 2
python3 tools/ld/ld2src.py --out src/98ld1_data.js porsche=ld/out/porsche.json
python3 tools/ld/ld2garage.py ld/omr/4643-1.mpd ld/out/pboat --only boat --yaw 2
python3 tools/ld/ld2src.py --out src/98ld2_data.js pboat=ld/out/pboat.json
