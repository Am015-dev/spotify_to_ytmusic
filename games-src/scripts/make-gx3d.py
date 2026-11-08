#!/usr/bin/env python3
"""Builds games/<slug>/models/gx3d.js = three.min.js + shell/gx-glb.js + shell/gx-glb-view.js (the lazy 3D-model viewer that
gx-glb-boot.js loads). Needs `npm install` in games-src. Usage: python3 games-src/scripts/make-gx3d.py doorkick-dungeon hollowbough ..."""
import os, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
S = os.path.join(R, 'games-src')
parts = [os.path.join(S, 'node_modules/three/build/three.min.js'), os.path.join(S, 'shell/gx-glb.js'), os.path.join(S, 'shell/gx-glb-view.js')]
txt = '\n;\n'.join(open(p, encoding='utf-8').read() for p in parts) + '\n'
for slug in sys.argv[1:]:
    d = os.path.join(R, 'games', slug, 'models')
    if not os.path.isdir(d): sys.exit('no models dir: ' + d)
    open(os.path.join(d, 'gx3d.js'), 'w', encoding='utf-8').write(txt); print(slug, len(txt) // 1024, 'KB')
