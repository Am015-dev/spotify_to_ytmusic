#!/bin/bash
# Rebuild from the live base: ./reapply.sh p1.py p2.py ...  (each patch: exec(open('P.py').read()); R(old,new,n); save())
cd "$(dirname "$0")"; cp base.html overdrive.html
for p in "$@"; do python3 $p || exit 1; done
[ $# -eq 0 ] && python3 -c "exec(open('P.py').read());save()"
node --check chk.mjs && echo REAPPLY_OK
