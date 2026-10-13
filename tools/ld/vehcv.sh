#!/bin/bash
# tools/ld/vehcv.sh <set e.g. 6661-1> "<submodel>" [yaw]   -> ld/out/v<set>.json via mpdroot
s=$1; sub=$2; y=${3:-auto}; cd /home/user/spotify_to_ytmusic
python3 tools/ld/mpdroot.py ld/omr/$s.mpd "$sub" ld/omr/$s""c.mpd >/dev/null || exit 1
run(){ python3 tools/ld/ld2garage.py ld/omr/$s""c.mpd ld/out/v$s --yaw $1 > ld/out/v$s.log 2>&1; grep size ld/out/v$s.log | tail -1; }
if [ $y = auto ]; then l=$(run 2); w=$(echo "$l" | sed -E 's/.*size \[([0-9.]+), ([0-9.]+)\].*/\1 \2/'); set -- $w
  if python3 -c "import sys; sys.exit(0 if $1>$2 else 1)"; then l=$(run 3); y=3; else y=2; fi; else l=$(run $y); fi
echo "$s yaw $y $l"
