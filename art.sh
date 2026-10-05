#!/bin/bash
# Art build: v85b (base85.html) + art patches in order. ./art.sh pART1.py pART2.py ...
cd "$(dirname "$0")"; [ -f base85.html ] || git show 1fc58dd:overdrive.html > base85.html; cp base85.html overdrive.html
for p in "$@"; do python3 $p || exit 1; done
[ $# -eq 0 ] && python3 -c "exec(open('P.py').read());save()"
node --check chk.mjs && echo REAPPLY_OK
