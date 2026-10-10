#!/usr/bin/env bash
# tools/find.sh <symbol|text>  -> file:line for a symbol or text, in src/ only (never index.html / out/ / km.js).
# Text hits are case-insensitive, max 8 per file. Declarations (function/const/let/var/class NAME, window.NAME=) are printed first, then other matches (max 40, line cut to 110 chars).
# Skips the huge one-line data files for text hits (they only match as a declaration).
set -uo pipefail
cd "$(dirname "$0")/.."
Q="${1:?usage: tools/find.sh <symbol|text> [file-substring]}"
F="${2:-}"
FILES=$(ls src/*.js src/test/*.js src/*.html 2>/dev/null | grep -- "$F" || true)
[ -n "$FILES" ] || { echo "no src file name contains '$F'"; exit 1; }
E=$(printf '%s' "$Q" | sed 's/[][\.*^$/+?(){}|]/\\&/g')
echo "== declarations of $Q"
grep -nE "^(export )?(async )?(function\*? +|class +|(const|let|var) +)[^;]*\b$E\b|^window\.$E *=" $FILES /dev/null 2>/dev/null \
  | grep -E "^[^:]+:[0-9]+:(export |async )*(function|class|const|let|var|window)" \
  | awk -F: '{l=substr($0,length($1)+length($2)+3); print $1":"$2": "substr(l,1,110)}' | head -20
echo "== other matches"
grep -niF -- "$Q" $FILES /dev/null 2>/dev/null \
  | awk -F: '{l=substr($0,length($1)+length($2)+3); if(length(l)<2000) if(++n[$1]<=8)print $1":"$2": "substr(l,1,110)}' | head -40
