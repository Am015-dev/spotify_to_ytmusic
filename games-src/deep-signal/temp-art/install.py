#!/usr/bin/env python3
"""Copies the temporary CC BY icons (credits in ../ASSETS.md) into games/deep-signal/media/ so the slots show them, without
overwriting any finished picture already there. Run before build-all.py --deploy deep-signal.   python3 games-src/deep-signal/temp-art/install.py"""
import pathlib, shutil
D = pathlib.Path(__file__).resolve().parent; M = D.parents[2] / 'games' / 'deep-signal' / 'media'; M.mkdir(parents=True, exist_ok=True)
n = 0
for f in sorted(D.glob('*.webp')):
    if not (M / f.name).exists(): shutil.copy(f, M / f.name); n += 1
print('installed', n, 'temporary pictures into', M)
