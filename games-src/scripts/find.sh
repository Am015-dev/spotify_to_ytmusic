#!/bin/sh
# find.sh <symbol|text> [game]   Locate code without reading big files.
#   DEF  lines: where a function/object is defined, and which definition wins (the last in build order).
#   hit  lines: text matches, only inside the game's real source files (never built html, x.js or the joined ui.js),
#               each with the enclosing top-level function.
# game = slug or folder (thornbound, munch, ...). Default: every game's own files.
#   find.sh --maps    list every MODULES.md path (regenerates them first)
#   find.sh --refresh regenerate the maps
# Then read only that line range:  sed -n '120,170p' <file>   (or the Read tool with offset/limit).
HERE=$(cd "$(dirname "$0")" && pwd)
case "$1" in
  ""|-h|--help) sed -n '2,10p' "$0"; exit 0;;
  --maps) python3 "$HERE/modmap.py" >/dev/null && python3 "$HERE/modmap.py" --paths; exit 0;;
  --refresh) exec python3 "$HERE/modmap.py";;
esac
exec python3 "$HERE/modmap.py" --find "$@"
