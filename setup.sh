#!/bin/bash
# One-time setup in a fresh session: three.js for local pages + static server on :8766 serving this folder.
cd "$(dirname "$0")"
[ -d node_modules/three ] || npm i --no-save --no-package-lock three@0.164.1 >/dev/null 2>&1 || echo "npm install three failed"
curl -s -o /dev/null http://127.0.0.1:8766/ || (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)
./reapply.sh && echo "SETUP_OK  page: http://127.0.0.1:8766/local_dbg.html"
