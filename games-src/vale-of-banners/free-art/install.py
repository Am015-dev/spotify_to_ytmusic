#!/usr/bin/env python3
"""Copy the free-kit pictures into games/vale-of-banners/media/ by stem.
Never overwrites a file the owner delivered (any existing <stem>.webp/.png/.jpg) unless --force.
Usage: python3 install.py [--force] [--dry]"""
import os, sys, shutil, glob
here = os.path.dirname(os.path.abspath(__file__))
media = os.path.normpath(os.path.join(here, '..', '..', '..', 'games', 'vale-of-banners', 'media'))
force, dry = '--force' in sys.argv, '--dry' in sys.argv
os.makedirs(media, exist_ok=True)
n = skip = 0
for f in sorted(glob.glob(os.path.join(here, '*.webp'))):
    stem = os.path.basename(f)[:-5]
    have = [e for e in ('webp', 'png', 'jpg', 'jpeg') if os.path.exists(os.path.join(media, stem + '.' + e))]
    if have and not force:
        skip += 1; continue
    if not dry: shutil.copyfile(f, os.path.join(media, stem + '.webp'))
    n += 1
print(f'vale-of-banners: installed {n}, kept {skip} existing (owner or earlier art)')
