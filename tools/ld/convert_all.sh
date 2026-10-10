#!/usr/bin/env bash
# tools/ld/convert_all.sh : the three proof models, LDraw OMR -> ld/out/*.json -> src/98ld0_data.js (then tools/build.sh, tools/ld/ldRT.js, tools/ld/ldAB.js)
set -euo pipefail; cd "$(dirname "$0")/../.."
python3 tools/ld/ld2garage.py ld/omr/76897-1.mpd ld/out/audi --drop pilot --yaw 2
python3 tools/ld/ld2garage.py ld/omr/4641-1.mpd ld/out/boat --yaw 3
python3 tools/ld/ld2garage.py ld/omr/1490-1.mpd ld/out/bank --only buildning
python3 tools/ld/ld2src.py audi=ld/out/audi.json boat=ld/out/boat.json bank=ld/out/bank.json
