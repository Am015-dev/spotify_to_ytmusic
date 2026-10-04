#!/bin/bash
# One-time setup in a fresh session: three.js for local pages + static server on :8766 serving this folder.
cd "$(dirname "$0")"
# three.js r164 is vendored in node_modules/three (no npm needed)
curl -s -o /dev/null http://127.0.0.1:8766/ || (setsid nohup python3 -m http.server 8766 >/dev/null 2>&1 &)
./reapply.sh && echo "SETUP_OK  page: http://127.0.0.1:8766/local_dbg.html"
