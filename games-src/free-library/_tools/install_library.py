#!/usr/bin/env python3
"""install_library.py SLUG [--dry]
Copies games-src/free-library/SLUG/<stem>.webp over games-src/<dir>/free-art/<stem>.webp for every real (non-FALLBACK) slot,
appends the library credits to free-art/CREDITS.md once, then runs free-art/install.py --force so games/SLUG/media/ gets the art.
Slots marked FALLBACK in _MAP.tsv keep their existing art."""
import sys, os, glob, shutil, subprocess, re
slug = sys.argv[1]; dry = '--dry' in sys.argv
# Owner rule (8 Nov 2026): never replace, overwrite or unwire the owner's own art. These games have owner art (assets-inbox/).
OWNER_GAMES = {'cauldron-fair','crown-city-smash','doorkick-dungeon','final-approach','hollowbough','kaiten-kitchen','lantern-dive',
               'nebula-aces','rampart-and-vine','sands-of-qamar','shipwreck-isle','short-fuse','sunglaze','thornbound','tidewake','mainhattan-nightrun'}
if slug in OWNER_GAMES or os.path.isdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'assets-inbox', slug)):
    sys.exit(f'REFUSED: {slug} has owner art in assets-inbox/; free art may not be installed there')
root = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
lib = os.path.join(root, 'free-library', slug)
fa = [p for p in glob.glob(os.path.join(root, '**', 'free-art'), recursive=True) if p.split(os.sep)[-2] == slug or f'{os.sep}{slug}{os.sep}' in p][0] if False else None
for p in glob.glob(os.path.join(root, '**', 'free-art'), recursive=True):
    if os.path.exists(os.path.join(p, 'install.py')) and os.path.basename(os.path.dirname(p)) == slug:
        fa = p
if not fa:
    for p in glob.glob(os.path.join(root, '**', 'free-art'), recursive=True):
        if slug in open(os.path.join(p, 'install.py')).read() if os.path.exists(os.path.join(p, 'install.py')) else False: fa = p
assert fa, 'no free-art dir for ' + slug
fb = set()
for line in open(os.path.join(lib, '_MAP.tsv'), encoding='utf-8'):
    if 'FALLBACK' in line: fb.add(line.split('\t')[0])
n = skip = 0
for f in sorted(glob.glob(os.path.join(lib, '*.webp'))):
    stem = os.path.basename(f)[:-5]
    if stem.startswith('_'): continue
    if stem in fb: skip += 1; continue
    if not dry: shutil.copyfile(f, os.path.join(fa, stem + '.webp'))
    n += 1
cred = os.path.join(fa, 'CREDITS.md'); mark = '## Temporary free library (W410)'
if not dry and os.path.exists(os.path.join(lib, '_CREDITS.md')):
    old = open(cred, encoding='utf-8').read() if os.path.exists(cred) else ''
    if mark not in old:
        body = open(os.path.join(lib, '_CREDITS.md'), encoding='utf-8').read()
        open(cred, 'a', encoding='utf-8').write(f'\n{mark}\n\nReplaces the earlier flat art until the final images exist. Per-slot sources: games-src/free-library/{slug}/_MAP.tsv\n\n' + re.sub(r'^# .*\n', '', body))
if not dry: subprocess.run([sys.executable, os.path.join(fa, 'install.py'), '--force'], check=True)
print(f'{slug}: {n} slots replaced, {skip} FALLBACK kept, free-art={os.path.relpath(fa, root)}')
