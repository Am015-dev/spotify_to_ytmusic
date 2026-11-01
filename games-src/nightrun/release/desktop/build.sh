#!/usr/bin/env bash
# Build the desktop apps from the filtered game tree. Needs: node, npm, network for electron downloads. Output: release/dist/desktop/*.zip
#   bash games-src/nightrun/release/desktop/build.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REL="$HERE/.."; WORK="${WORK:-/tmp/nr-desktop}"
python3 "$REL/package.py" --no-build --stage-only
rm -rf "$WORK"; mkdir -p "$WORK/app" "$REL/dist/desktop"
cp "$HERE/main.js" "$HERE/package.json" "$WORK/app/"; cp -r "$REL/dist/stage" "$WORK/app/game"
cd "$WORK"; npm init -y >/dev/null; npm i --no-audit --no-fund electron @electron/packager >/dev/null
for P in linux-x64 win32-x64; do
  npx electron-packager app "Mainhattan-Nightrun" --platform="${P%-*}" --arch=x64 --out=out --overwrite --asar=false --prune=false >/dev/null
  D="out/Mainhattan-Nightrun-$P"
  printf 'Mainhattan Nightrun\n%s\nStart: %s\nF11 = full screen. No installer; delete the folder to remove it.\n' "$P" "$([ "$P" = win32-x64 ] && echo Mainhattan-Nightrun.exe || echo ./Mainhattan-Nightrun)" > "$D/README.txt"
  (cd out && zip -qr "$REL/dist/desktop/Mainhattan-Nightrun-$P.zip" "Mainhattan-Nightrun-$P")
done
ls -l "$REL/dist/desktop"
