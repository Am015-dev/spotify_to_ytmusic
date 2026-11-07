#!/bin/sh
# Fetch the CC0 KayKit Medieval Hexagon Pack + three.js + game-icons (badges) into $PACKS, then render.
# usage: PACKS=/tmp/p sh tools/fetch-packs.sh ; node tools/render-glyphs.js $PACKS ; python3 tools/specs.py $PACKS/specs.json ; node tools/render.js $PACKS/specs.json $PACKS/out ; python3 compose.py
set -e
P=${PACKS:-/tmp/claude-0/p}; mkdir -p "$P"; cd "$P"
[ -d kk-hex ] || git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0.git kk-hex
[ -d gi ] || git clone --depth 1 https://github.com/game-icons/icons.git gi
[ -d three ] || { mkdir three; curl -sL https://registry.npmjs.org/three/-/three-0.160.0.tgz | tar xz -C three; }
T=$(dirname "$0"); ln -sfn "$P/three/package" "$T/web/three"; ln -sfn "$P/kk-hex/addons/kaykit_medieval_hexagon_pack/Assets/gltf" "$T/web/kk"
echo "packs ready in $P (web/three and web/kk are local symlinks, never commit them)"
