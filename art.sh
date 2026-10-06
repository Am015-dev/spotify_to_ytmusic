#!/bin/bash
# Art build on top of the CURRENT live page body (base_live.html + km.js from alex/brave-carson-rbpmlk).
# ./art.sh [live-commit]   → overdrive.html (+ local pages) = live body + pART1-4 + pCAR1 (idempotent)
cd "$(dirname "$0")"; C=${1:-origin/live}; git fetch -q origin alex/brave-carson-rbpmlk:refs/remotes/origin/live 2>/dev/null
git show $C:games/mainhattan-overdrive/index.html | python3 -c "import sys;s=sys.stdin.read();j=s.find('>',s.find('<body'))+1;k=s.rfind('</body></html>');open('base_live.html','w').write(s[j:k])"
git show $C:games/mainhattan-overdrive/km.js > km.js; cp base_live.html overdrive.html
for p in pART1.py pART2.py pART3.py pART4.py pART5.py pART6.py pART7.py pART8.py pV87d.py; do python3 $p >/dev/null || { echo "FAIL $p"; exit 1; }; done
node --check chk.mjs && echo REAPPLY_OK
