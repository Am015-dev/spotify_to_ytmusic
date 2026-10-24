#!/usr/bin/env bash
# Shallow-clone the LEGO Racers study repos at the pinned SHAs into ref/racers/ (git-ignored). Pins: docs/wiki/sources/racers.md
# Usage: bash tools/racers_fetch.sh [name ...]   (default: racers racers-portable warp.parts Lego-Racers-Mod). Then grep ref/racers/<name>.
set -euo pipefail
cd "$(dirname "$0")/.."
declare -A URL=([racers]=isledecomp/racers [racers-portable]=isledecomp/racers-portable [warp.parts]=isledecomp/warp.parts [Lego-Racers-Mod]=Laupetin/Lego-Racers-Mod)
declare -A SHA=([racers]=5bb9f133b5e14d5d060ea7f8d3897ec52ef382f2 [racers-portable]=9f9d72b7df813a1b42a94e3dcf32435134d6c9ed [warp.parts]=6994d32b7f8b7a716978b832a5cb03452ea5d660 [Lego-Racers-Mod]=b0959faaeb6cf47acd33e58183edd3484ee6242b)
mkdir -p ref/racers
for n in "${@:-racers racers-portable warp.parts Lego-Racers-Mod}"; do for m in $n; do
  d=ref/racers/$m; [ -d "$d/.git" ] && { echo "have $m"; continue; }
  git init -q "$d"; git -C "$d" remote add origin "https://github.com/${URL[$m]}"
  git -C "$d" fetch -q --depth 1 origin "${SHA[$m]}" && git -C "$d" checkout -q FETCH_HEAD && echo "ok $m @ ${SHA[$m]:0:7}"
done; done
