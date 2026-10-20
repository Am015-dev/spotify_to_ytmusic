#!/bin/sh
# rebuild: re-inject ph.css into head.html then build
cd "$(dirname "$0")"
python3 - <<'PY'
h=open('head.html').read();c=open('ph.css').read()
i=h.index('/* ===== phone layout');j=h.index('</style>',i)
open('head.html','w').write(h[:i]+c+h[j:])
PY
python3 build.py
