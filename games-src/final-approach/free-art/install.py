#!/usr/bin/env python3
"""Copy the free-library pictures into games/final-approach/media/ by stem.
Never overwrites a file the owner delivered (any existing <stem>.webp/.png/.jpg) unless --force.
Usage: python3 install.py [--force] [--dry] [--art]"""
import os, sys, shutil, glob
here = os.path.dirname(os.path.abspath(__file__))
media = os.path.normpath(os.path.join(here, '..', '..', '..', 'games', 'final-approach', 'media'))
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
print('final-approach: installed %d, kept %d existing (owner or earlier art)' % (n, skip))
if '--art' in sys.argv:
    # build.py inlines these from art/<name>.png (else art/<name>.webp). Writes a png only where none exists (an owner png is never replaced).
    from PIL import Image
    artdir = os.path.normpath(os.path.join(here, '..', 'art'))
    for stem in ('dice',):
        src = os.path.join(here, stem + '.webp'); dst = os.path.join(artdir, stem + '.png')
        if os.path.exists(src) and (force or not os.path.exists(dst)):
            if not dry: Image.open(src).convert('RGBA').save(dst)
            print('art/' + stem + '.png written' if not dry else 'dry: art/' + stem + '.png')

