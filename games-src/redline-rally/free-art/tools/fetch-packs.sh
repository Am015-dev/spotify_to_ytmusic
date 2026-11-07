#!/bin/sh
# Download the CC0 Kenney packs (opengameart.org mirror) into $PACKS (default ./packs) and render the vector sheets (needs Chromium + playwright).
set -e
P=${PACKS:-$(dirname "$0")/../packs}; mkdir -p "$P/r"; cd "$P"
for f in racing-pack kenney_ui-pack kenney_toonCharacters1 boardgamePack_v2; do
  [ -d $f ] || { curl -sSL -o $f.zip https://opengameart.org/sites/default/files/$f.zip; mkdir -p $f; unzip -qo $f.zip -d $f; }
done
echo "now run: node tools/render-vectors.js $P  (objects4.png, roads) and node tools/render-toons.js $P (after stripping filters, see compose.py)"
